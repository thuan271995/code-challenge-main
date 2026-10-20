import { memo, useState } from 'react';

import styles from './TokenIcon.module.scss';
function TokenImage({ symbol }: { symbol: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    symbol.slice(0, 1)
  ) : (
    <img
      src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${encodeURIComponent(symbol)}.svg`}
      alt=""
      width="32"
      height="32"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
export const TokenIcon = memo(function TokenIcon({
  symbol,
  size = 'medium',
}: {
  symbol: string;
  size?: 'small' | 'medium';
}) {
  return (
    <span
      aria-hidden="true"
      className={[styles.icon, size === 'small' ? styles.small : ''].join(' ')}
    >
      <TokenImage key={symbol} symbol={symbol} />
    </span>
  );
});
