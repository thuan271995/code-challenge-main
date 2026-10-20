export type Token = { currency: string; price: number; date: string };
export async function fetchPrices(signal?: AbortSignal): Promise<Token[]> {
  const response = await fetch('https://interview.switcheo.com/prices.json', {
    signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(12_000)]),
  });
  if (!response.ok) throw new Error('Prices are unavailable. Please try again.');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Price data has the wrong format.');
  const latest = new Map<string, Token>();
  for (const item of data) {
    if (
      typeof item?.currency !== 'string' ||
      !/^[A-Za-z0-9.-]{1,20}$/.test(item.currency) ||
      typeof item.price !== 'number' ||
      !Number.isFinite(item.price) ||
      item.price <= 0 ||
      typeof item.date !== 'string' ||
      !Number.isFinite(Date.parse(item.date))
    )
      continue;
    const previous = latest.get(item.currency);
    if (!previous || Date.parse(item.date) > Date.parse(previous.date))
      latest.set(item.currency, item);
  }
  if (!latest.size) throw new Error('No valid token prices were found.');
  return [...latest.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}
