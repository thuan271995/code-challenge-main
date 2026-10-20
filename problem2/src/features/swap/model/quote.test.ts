import { describe, expect, it } from 'vitest';

import { calculateQuote, validateAmount } from './quote';
describe('amount validation', () => {
  it.each(['', '0', '-1', 'Infinity', '1e4', '1.123456789', '1234567890123', 'hello'])(
    'rejects %s',
    (value) => expect(validateAmount(value)).not.toBeNull(),
  );
  it.each(['1', '0.00000001', '123456789012.12345678', '1.'])('accepts %s', (value) =>
    expect(validateAmount(value)).toBeNull(),
  );
});
describe('quotes', () => {
  it('converts using decimal arithmetic', () =>
    expect(calculateQuote('0.1', 0.2, 0.1)).toBe('0.2'));
  it('rounds down at eight decimal places', () =>
    expect(calculateQuote('1', 1, 3)).toBe('0.33333333'));
  it('handles invalid input', () => expect(calculateQuote('bad', 1, 2)).toBe('0'));
  it('handles unavailable rates', () => expect(calculateQuote('1', 1, 0)).toBe('0'));
});

it('preserves 8 decimal places for a large valid amount, verified with integer arithmetic', () => {
  const scaled =
    (99999999999912345678n * 16459337373737374n * 1000000n) / (10000000000000n * 989832n);
  const digits = scaled.toString();
  const expected = `${digits.slice(0, -8)}.${digits.slice(-8)}`;
  expect(calculateQuote('999999999999.12345678', 1645.9337373737374, 0.989832)).toBe(expected);
});
it.each([NaN, Infinity, -Infinity, 0, -1])('rejects invalid rates %s', (price) => {
  expect(calculateQuote('1', price, 1)).toBe('0');
  expect(calculateQuote('1', 1, price)).toBe('0');
});
