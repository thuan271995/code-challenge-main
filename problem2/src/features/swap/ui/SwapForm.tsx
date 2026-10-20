import { ArrowDownUp, ArrowRight, Info, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { formatPriceDate } from '../model/quote';
import { useSwapForm } from '../model/useSwapForm';
import { AmountField } from './AmountField';
import styles from './SwapForm.module.scss';
import { TokenSelector } from './TokenSelector';

export default function SwapForm() {
  const swap = useSwapForm();
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const { prices, conversion } = swap;
  return (
    <section className={styles.swapCard} aria-labelledby="swap-title">
      <div className={styles.cardHeading}>
        <div>
          <h2 id="swap-title">Swap tokens</h2>
          <p>Choose your pair. Calculate when you're ready.</p>
        </div>
        <span className={styles.cardSymbol}>
          <ArrowDownUp size={20} />
        </span>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          swap.calculate();
        }}
        noValidate
      >
        <AmountField
          mode="input"
          label="You pay"
          symbol={swap.source?.currency ?? ''}
          value={swap.amount}
          error={swap.amountError}
          onChange={swap.updateAmount}
          onBlur={swap.touchAmount}
          usdValue={conversion?.sendUsd}
          disabled={!swap.source || prices.isError}
          onChooseToken={() => setPicker('from')}
        />
        <div className={styles.directionWrap}>
          <button
            type="button"
            className={styles.direction}
            aria-label="Reverse currencies"
            disabled={!swap.source || !swap.target}
            onClick={swap.reversePair}
          >
            <ArrowDownUp size={19} />
          </button>
        </div>
        <AmountField
          mode="output"
          label="You receive"
          symbol={swap.target?.currency ?? ''}
          value={conversion?.output ?? null}
          usdValue={conversion?.receiveUsd}
          disabled={!swap.target || prices.isError}
          onChooseToken={() => setPicker('to')}
        />
        {swap.calculationError && (
          <p className={styles.error} role="alert">
            {swap.calculationError}
          </p>
        )}
        <div className={styles.rateLine}>
          <Info size={15} />
          <span>
            {prices.isPending
              ? 'Loading prices…'
              : conversion
                ? `1 ${conversion.from} ${conversion.rate.startsWith('<') ? '' : '≈ '}${conversion.rate} ${conversion.to}`
                : 'Press Calculate swap to see the conversion.'}
          </span>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="Refresh market prices"
            disabled={prices.isFetching}
            onClick={swap.refreshPrices}
          >
            <RefreshCw size={16} className={prices.isFetching ? styles.spin : undefined} />
          </button>
        </div>
        {swap.source && swap.target && (
          <div className={styles.priceDate}>
            <p>Source prices, not live market prices.</p>
            <p>
              {swap.source.currency}: {formatPriceDate(swap.source.date)}
            </p>
            <p>
              {swap.target.currency}: {formatPriceDate(swap.target.date)}
            </p>
          </div>
        )}
        {prices.isError && (
          <div className={styles.error} role="alert">
            {prices.error.message}{' '}
            <button type="button" onClick={swap.refreshPrices}>
              Retry
            </button>
          </div>
        )}
        {!prices.isPending && !prices.isError && prices.tokens.length < 2 && (
          <p className={styles.error} role="alert">
            We need prices for at least two tokens. Please try again later.
          </p>
        )}
        <button className={styles.primaryButton} type="submit" disabled={swap.disabled}>
          {prices.isPending ? 'Loading prices…' : 'Calculate swap'}
          <ArrowRight size={19} />
        </button>
        <p className={styles.safeNote}>
          <ShieldCheck size={14} />
          This is an estimate. No tokens are sent.
        </p>
      </form>
      <div className={styles.cardBottom}>
        <span>
          <i />
          {prices.isError
            ? 'Prices unavailable'
            : prices.isPending
              ? 'Loading price data'
              : 'Price data loaded'}
        </span>
        <span>Powered by Switcheo</span>
      </div>
      {picker && (
        <TokenSelector
          tokens={prices.tokens}
          selected={
            picker === 'from' ? (swap.source?.currency ?? '') : (swap.target?.currency ?? '')
          }
          excluded={
            picker === 'from' ? (swap.target?.currency ?? '') : (swap.source?.currency ?? '')
          }
          onClose={() => setPicker(null)}
          onSelect={(symbol) => swap.selectToken(picker, symbol)}
        />
      )}
    </section>
  );
}
