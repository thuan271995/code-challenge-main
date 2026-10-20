import { Check, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { TokenIcon } from '@/shared/ui/TokenIcon';

import type { Token } from '../api/prices';
import { formatTokenPrice } from '../model/quote';
import styles from './TokenPicker.module.scss';

export default function TokenPicker({
  tokens,
  selected,
  excluded,
  onSelect,
  onClose,
}: {
  tokens: Token[];
  selected: string;
  excluded: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search);
  const filtered = useMemo(
    () =>
      tokens.filter((token) => token.currency.toLowerCase().includes(query.trim().toLowerCase())),
    [tokens, query],
  );
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element?.showModal();
    searchInput.current?.focus();
    return () => {
      element?.close();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={styles.tokenDialog}
      aria-labelledby="picker-title"
      onCancel={onClose}
    >
      <div className={styles.dialogHeading}>
        <h2 id="picker-title">Select a token</h2>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onClose}
          aria-label="Close token selector"
        >
          <X size={20} />
        </button>
      </div>
      <label className={styles.search}>
        <Search size={18} />
        <input
          ref={searchInput}
          placeholder="Search by symbol"
          aria-label="Search tokens"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>
      <p className={styles.eyebrow}>AVAILABLE TOKENS · {filtered.length}</p>
      <div className={styles.tokenList}>
        {filtered.map((token) => (
          <button
            type="button"
            aria-label={`${token.currency}, ${token.currency === excluded ? 'selected in other field' : token.currency === selected ? 'selected' : 'token'}, price ${formatTokenPrice(token.price)}`}
            key={token.currency}
            disabled={token.currency === excluded}
            className={styles.tokenRow}
            onClick={() => {
              onSelect(token.currency);
              onClose();
            }}
          >
            <TokenIcon symbol={token.currency} />
            <span>
              {token.currency}
              <small>{token.currency === excluded ? 'Selected in other field' : 'Token'}</small>
            </span>
            <span className={styles.tokenPrice}>{formatTokenPrice(token.price)}</span>
            {selected === token.currency && <Check size={16} />}
          </button>
        ))}
        {!filtered.length && (
          <p className={styles.empty}>No tokens found. Try a different symbol.</p>
        )}
      </div>
    </dialog>
  );
}
