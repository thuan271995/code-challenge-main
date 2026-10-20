// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import * as quote from '../model/quote';
import { tokenPricesOptions } from '../model/useTokenPrices';
import SwapForm from './SwapForm';
const tokens = [
  { currency: 'ETH', price: 2000, date: '2023-08-29T00:00:00Z' },
  { currency: 'USDC', price: 1, date: '2023-08-29T00:00:00Z' },
];
function renderForm(data: typeof tokens | null = tokens) {
  const client = new QueryClient({ defaultOptions: { queries: { retryDelay: 0, gcTime: 0 } } });
  if (data) client.setQueryData(tokenPricesOptions.queryKey, data);
  const view = render(
    <QueryClientProvider client={client}>
      <SwapForm />
    </QueryClientProvider>,
  );
  return { ...view, client };
}
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it('calculates only on submit and clears the result without recalculating when edited', async () => {
  const calculate = vi.spyOn(quote, 'calculateQuote');
  const user = userEvent.setup();
  renderForm();
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—');
  await user.clear(screen.getByLabelText('You pay'));
  await user.type(screen.getByLabelText('You pay'), '2');
  expect(calculate).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—');
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('4000');
  expect(screen.getByText('1 ETH ≈ 2000 USDC')).toBeTruthy();
  expect(screen.getAllByText('$4,000.00')).toHaveLength(2);
  const calls = calculate.mock.calls.length;
  await user.type(screen.getByLabelText('You pay'), '3');
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—');
  expect(calculate).toHaveBeenCalledTimes(calls);
});
it('validates input without computing a quote and supports Enter submission', async () => {
  const user = userEvent.setup();
  renderForm();
  await user.clear(screen.getByLabelText('You pay'));
  await user.type(screen.getByLabelText('You pay'), '-1');
  await user.tab();
  expect(screen.getByRole('alert').textContent).toContain('Use up to');
  expect(screen.getByRole('button', { name: 'Calculate swap' }).hasAttribute('disabled')).toBe(
    true,
  );
  await user.clear(screen.getByLabelText('You pay'));
  await user.type(screen.getByLabelText('You pay'), '3{Enter}');
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('6000');
});
it('invalidates the result when the pair changes and requires another click', async () => {
  const user = userEvent.setup();
  renderForm();
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  await user.click(screen.getByRole('button', { name: 'Reverse currencies' }));
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—');
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('0.0005');
});
it('reports a dust amount only after calculation is requested', async () => {
  const user = userEvent.setup();
  renderForm();
  await user.click(screen.getByRole('button', { name: 'Reverse currencies' }));
  await user.clear(screen.getByLabelText('You pay'));
  await user.type(screen.getByLabelText('You pay'), '0.00000001');
  expect(screen.queryByRole('alert')).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  expect(screen.getByRole('alert').textContent).toContain('too small');
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—');
});
it('drops a result if cached server prices change independently', async () => {
  const user = userEvent.setup();
  const { client } = renderForm();
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  await act(async () => {
    client.setQueryData(tokenPricesOptions.queryKey, [{ ...tokens[0], price: 3000 }, tokens[1]]);
  });
  await waitFor(() =>
    expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—'),
  );
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('3000');
});
it('refreshes prices, clears old output and does not auto-calculate the new rate', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ ...tokens[0], price: 4000 }, tokens[1]],
    }),
  );
  const user = userEvent.setup();
  renderForm();
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  await user.click(screen.getByRole('button', { name: 'Refresh market prices' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Calculate swap' }).hasAttribute('disabled')).toBe(
      false,
    ),
  );
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—');
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('4000');
});
it('recovers from failed fetching with Retry', async () => {
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new Error('Offline'))
    .mockRejectedValueOnce(new Error('Offline'))
    .mockResolvedValue({ ok: true, json: async () => tokens });
  vi.stubGlobal('fetch', fetchMock);
  const user = userEvent.setup();
  renderForm(null);
  expect((await screen.findByRole('alert')).textContent).toContain('Offline');
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Calculate swap' }).hasAttribute('disabled')).toBe(
      false,
    ),
  );
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('—');
});
it('explains when there are too few currencies for a pair', () => {
  renderForm([tokens[0]]);
  expect(screen.getByRole('alert').textContent).toContain('at least two');
  expect(screen.getByRole('button', { name: 'Calculate swap' }).hasAttribute('disabled')).toBe(
    true,
  );
});

it('shows both source timestamps and uses real fallback tokens', () => {
  renderForm([
    { currency: 'BTC', price: 50000, date: '2023-08-29T01:02:03Z' },
    { currency: 'SOL', price: 20, date: '2023-08-30T04:05:06Z' },
  ]);
  expect(screen.getByRole('button', { name: 'Choose send token: BTC' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Choose receive token: SOL' })).toBeTruthy();
  expect(screen.getByText('BTC: 29 Aug 2023, 01:02:03 UTC')).toBeTruthy();
  expect(screen.getByText('SOL: 30 Aug 2023, 04:05:06 UTC')).toBeTruthy();
});

it('does not show an invented receive token when only one token exists', () => {
  renderForm([tokens[0]]);
  expect(
    screen.getByRole('button', { name: 'Choose receive token: none' }).hasAttribute('disabled'),
  ).toBe(true);
});

it('shows a tiny nonzero rate clearly when a larger amount can still be converted', async () => {
  const user = userEvent.setup();
  renderForm([{ ...tokens[0], price: 0.000000001 }, tokens[1]]);
  await user.clear(screen.getByLabelText('You pay'));
  await user.type(screen.getByLabelText('You pay'), '100');
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  expect(screen.getByText('1 ETH < 0.00000001 USDC')).toBeTruthy();
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('0.0000001');
});
