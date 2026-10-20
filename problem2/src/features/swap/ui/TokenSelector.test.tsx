// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';

import { tokenPricesOptions } from '../model/useTokenPrices';
import SwapForm from './SwapForm';
vi.mock('./TokenPicker', () => {
  throw new Error('Chunk download failed');
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
it('keeps the form and entered amount usable after lazy selector failure', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const user = userEvent.setup();
  const client = new QueryClient();
  client.setQueryData(tokenPricesOptions.queryKey, [
    { currency: 'ETH', price: 2000, date: '2023-08-29' },
    { currency: 'USDC', price: 1, date: '2023-08-29' },
  ]);
  render(
    <QueryClientProvider client={client}>
      <SwapForm />
    </QueryClientProvider>,
  );
  await user.clear(screen.getByLabelText('You pay'));
  await user.type(screen.getByLabelText('You pay'), '2');
  await user.click(screen.getByRole('button', { name: 'Choose send token: ETH' }));
  expect((await screen.findByRole('alert')).textContent).toContain('token list could not load');
  await user.click(screen.getByRole('button', { name: 'Close selector' }));
  expect((screen.getByLabelText('You pay') as HTMLInputElement).value).toBe('2');
  await user.click(screen.getByRole('button', { name: 'Calculate swap' }));
  expect(screen.getByLabelText('Estimated amount to receive').textContent).toBe('4000');
});
