import { useState } from 'react';

import { calculateQuote, calculateUsdValue, formatRate, validateAmount } from './quote';
import { useTokenPrices } from './useTokenPrices';

type Conversion = {
  amount: string;
  from: string;
  to: string;
  output: string;
  fromPrice: number;
  toPrice: number;
  fromDate: string;
  toDate: string;
  rate: string;
  sendUsd: string;
  receiveUsd: string;
};
export function useSwapForm() {
  const prices = useTokenPrices();
  const [from, setFrom] = useState('ETH');
  const [to, setTo] = useState('USDC');
  const [amount, setAmount] = useState('1');
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState<Conversion | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const source = prices.tokens.find((token) => token.currency === from) ?? prices.tokens[0];
  const target =
    prices.tokens.find((token) => token.currency === to && token.currency !== source?.currency) ??
    prices.tokens.find((token) => token.currency !== source?.currency);
  // Server data can change independently of the form. Never show a result for
  // a different price snapshot, even if another query consumer refreshed it.
  const conversion =
    result &&
    source &&
    target &&
    result.amount === amount &&
    result.from === source.currency &&
    result.to === target.currency &&
    result.fromPrice === source.price &&
    result.toPrice === target.price &&
    result.fromDate === source.date &&
    result.toDate === target.date
      ? result
      : null;
  const validation = validateAmount(amount);
  function clearResult() {
    setResult(null);
    setCalculationError(null);
  }
  function updateAmount(value: string) {
    setAmount(value);
    clearResult();
  }
  function selectToken(side: 'from' | 'to', symbol: string) {
    if (side === 'from') setFrom(symbol);
    else setTo(symbol);
    clearResult();
  }
  function reversePair() {
    if (!source || !target) return;
    setFrom(target.currency);
    setTo(source.currency);
    clearResult();
  }
  function refreshPrices() {
    clearResult();
    void prices.refetch();
  }
  function calculate() {
    setTouched(true);
    clearResult();
    if (validation || !source || !target || prices.isFetching || prices.isError) return;
    const output = calculateQuote(amount, source.price, target.price);
    if (output === '0') {
      setCalculationError('Amount too small. You need to receive at least 0.00000001 tokens.');
      return;
    }
    setResult({
      amount,
      from: source.currency,
      to: target.currency,
      output,
      fromPrice: source.price,
      toPrice: target.price,
      fromDate: source.date,
      toDate: target.date,
      rate: formatRate(source.price, target.price),
      sendUsd: calculateUsdValue(amount, source.price),
      receiveUsd: calculateUsdValue(output, target.price),
    });
  }
  return {
    prices,
    amount,
    source,
    target,
    conversion,
    calculationError,
    amountError: touched ? validation : null,
    disabled: !!validation || !source || !target || prices.isFetching || prices.isError,
    updateAmount,
    selectToken,
    reversePair,
    refreshPrices,
    calculate,
    touchAmount: () => setTouched(true),
  };
}
