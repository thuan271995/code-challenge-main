// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';

import TokenPicker from './TokenPicker';
const tokens = [
  { currency: 'ETH', price: 2000, date: '2023-08-29' },
  { currency: 'USDC', price: 1, date: '2023-08-29' },
  { currency: 'WBTC', price: 50000, date: '2023-08-29' },
];
const descriptors = ['showModal', 'close'].map(
  (key) => [key, Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, key)] as const,
);
beforeAll(() => {
  // jsdom does not emulate native modal focus trapping. Real browser QA covers it.
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = true;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.open = false;
    },
  });
});
afterAll(() => {
  for (const [key, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, key, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, key);
  }
});
afterEach(cleanup);
function mount() {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  return {
    ...render(
      <TokenPicker
        tokens={tokens}
        selected="ETH"
        excluded="USDC"
        onSelect={onSelect}
        onClose={onClose}
      />,
    ),
    onSelect,
    onClose,
  };
}
it('focuses search, prevents the other selected token and filters case-insensitively', async () => {
  const user = userEvent.setup();
  const { onSelect, onClose } = mount();
  expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Search tokens' }));
  expect(screen.getByRole('button', { name: /^USDC,/ }).hasAttribute('disabled')).toBe(true);
  await user.type(screen.getByRole('textbox'), '  wBtC  ');
  await waitFor(() => expect(screen.queryByRole('button', { name: /^ETH,/ })).toBeNull());
  await user.click(screen.getByRole('button', { name: /^WBTC,/ }));
  expect(onSelect).toHaveBeenCalledWith('WBTC');
  expect(onClose).toHaveBeenCalledTimes(1);
});
it('provides a no-result state', async () => {
  const user = userEvent.setup();
  mount();
  await user.type(screen.getByRole('textbox'), 'unknown');
  expect(await screen.findByText('No tokens found. Try a different symbol.')).toBeTruthy();
});
it('handles native cancel and restores focus when unmounted', () => {
  const opener = document.createElement('button');
  document.body.append(opener);
  opener.focus();
  const { onClose, unmount } = mount();
  fireEvent(screen.getByRole('dialog'), new Event('cancel', { bubbles: false, cancelable: true }));
  expect(onClose).toHaveBeenCalledTimes(1);
  unmount();
  expect(document.activeElement).toBe(opener);
  opener.remove();
});
it('does not dismiss on dialog padding; users can close explicitly', async () => {
  const user = userEvent.setup();
  const { onClose } = mount();
  fireEvent.click(screen.getByRole('dialog'));
  expect(onClose).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Close token selector' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('shows small positive prices without rounding them to zero', () => {
  render(
    <TokenPicker
      tokens={[
        { currency: 'SMALL', price: 0.000001, date: '2023-08-29' },
        { currency: 'LIMIT', price: 0.0001, date: '2023-08-29' },
      ]}
      selected=""
      excluded=""
      onSelect={vi.fn()}
      onClose={vi.fn()}
    />,
  );
  expect(screen.getByText('< $0.0001')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'SMALL, token, price < $0.0001' })).toBeTruthy();
  expect(screen.getByText('$0.0001')).toBeTruthy();
});
