import { ChevronDown } from 'lucide-react';
import { useId } from 'react';

import { TokenIcon } from '@/shared/ui/TokenIcon';

import styles from './AmountField.module.scss';

type BaseProps = {
  label: string;
  symbol: string;
  disabled: boolean;
  onChooseToken: () => void;
  usdValue?: string;
};
type Props = BaseProps &
  (
    | {
        mode: 'input';
        value: string;
        error: string | null;
        onChange: (value: string) => void;
        onBlur: () => void;
      }
    | { mode: 'output'; value: string | null }
  );
export function AmountField(props: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className={[styles.amountBox, props.mode === 'output' ? styles.receive : ''].join(' ')}>
      <div className={styles.fieldHeading}>
        <label htmlFor={id}>{props.label}</label>
        <span>{props.mode === 'input' ? 'Send amount' : 'Calculated amount'}</span>
      </div>
      <div className={styles.amountRow}>
        {props.mode === 'input' ? (
          <input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            maxLength={21}
            value={props.value}
            aria-invalid={!!props.error}
            aria-describedby={props.error ? errorId : undefined}
            onBlur={props.onBlur}
            onChange={(event) => props.onChange(event.target.value)}
          />
        ) : (
          <output
            id={id}
            className={props.value !== null ? styles.result : undefined}
            aria-label="Estimated amount to receive"
            title={props.value ?? undefined}
          >
            {props.value ?? '—'}
          </output>
        )}
        <button
          type="button"
          className={styles.tokenButton}
          disabled={props.disabled}
          onClick={props.onChooseToken}
          aria-label={`Choose ${props.mode === 'input' ? 'send' : 'receive'} token: ${props.symbol || 'none'}`}
        >
          {props.symbol && <TokenIcon symbol={props.symbol} size="small" />}
          {props.symbol || 'No token'}
          <ChevronDown size={16} />
        </button>
      </div>
      <div className={styles.fieldFooter}>
        <span>{props.usdValue ?? '—'}</span>
        <span>USD value</span>
      </div>
      {props.mode === 'input' && props.error && (
        <p id={errorId} className={styles.error} role="alert">
          {props.error}
        </p>
      )}
    </div>
  );
}
