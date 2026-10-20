import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchPrices } from './prices';
afterEach(() => vi.unstubAllGlobals());
describe('price adapter', () => {
  it('deduplicates by latest timestamp and rejects invalid prices', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          { currency: 'ETH', price: 2, date: '2023-08-28T00:00:00Z' },
          { currency: 'ETH', price: 3, date: '2023-08-29T00:00:00Z' },
          { currency: 'BAD', price: -1, date: '2023-08-29T00:00:00Z' },
          { currency: 'ZERO', price: 0, date: '2023-08-29T00:00:00Z' },
          { currency: 'UNKNOWN', price: 1, date: 'bad' },
        ],
      }),
    );
    expect(await fetchPrices()).toEqual([
      { currency: 'ETH', price: 3, date: '2023-08-29T00:00:00Z' },
    ]);
  });
  it('surfaces network status errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchPrices()).rejects.toThrow('unavailable');
  });
  it('rejects malformed payloads', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    await expect(fetchPrices()).rejects.toThrow('format');
  });
  it('forwards abort signal', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchPrices(controller.signal)).rejects.toThrow('Aborted');
    expect(fetchMock).toHaveBeenCalledWith(expect.any(String), { signal: expect.any(AbortSignal) });
    controller.abort();
    expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
  });
});
