import Decimal from 'decimal.js';

// Inputs allow 20 significant amount digits. JSON prices may span the finite
// number range, so retain guard digits across multiplication/division before
// rounding the final output. BigInt regression tests provide an independent oracle.
const Money = Decimal.clone({ precision: 700, rounding: Decimal.ROUND_DOWN });
export const OUTPUT_DECIMALS = 8;
export function validateAmount(value: string): string | null {
  if (!value) return 'Enter an amount.';
  if (!/^\d{1,12}(\.\d{0,8})?$/.test(value)) return 'Use up to 12 digits and 8 decimal places.';
  if (new Money(value).lte(0)) return 'Enter an amount above zero.';
  return null;
}
export function calculateQuote(amount: string, fromPrice: number, toPrice: number): string {
  if (
    validateAmount(amount) ||
    !Number.isFinite(fromPrice) ||
    !Number.isFinite(toPrice) ||
    fromPrice <= 0 ||
    toPrice <= 0
  )
    return '0';
  return new Money(amount)
    .mul(fromPrice)
    .div(toPrice)
    .toDecimalPlaces(OUTPUT_DECIMALS, Money.ROUND_DOWN)
    .toFixed();
}
export function calculateUsdValue(amount: string, price: number): string {
  const [whole, fraction] = new Money(amount).mul(price).toFixed(2, Money.ROUND_HALF_UP).split('.');
  return `$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
}

export function formatTokenPrice(price: number): string {
  if (price > 0 && price < 0.0001) return '< $0.0001';
  return `$${price.toLocaleString('en-US', { maximumFractionDigits: 4 })}`;
}

export function formatRate(fromPrice: number, toPrice: number): string {
  const rate = new Money(fromPrice).div(toPrice);
  if (rate.lt('0.00000001')) return '< 0.00000001';
  return rate.toDecimalPlaces(8, Money.ROUND_DOWN).toFixed();
}

export function formatPriceDate(date: string): string {
  return (
    new Date(date).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
      hour12: false,
    }) + ' UTC'
  );
}
