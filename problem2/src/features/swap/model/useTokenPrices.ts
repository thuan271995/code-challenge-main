import { queryOptions, useQuery } from '@tanstack/react-query';

import { fetchPrices, type Token } from '../api/prices';
const EMPTY_TOKENS: Token[] = [];
export const tokenPricesOptions = queryOptions({
  queryKey: ['token-prices'],
  queryFn: ({ signal }) => fetchPrices(signal),
  staleTime: 60_000,
  gcTime: 300_000,
  retry: 1,
  refetchOnWindowFocus: false,
});
export function useTokenPrices() {
  const query = useQuery(tokenPricesOptions);
  return { ...query, tokens: query.data ?? EMPTY_TOKENS };
}
