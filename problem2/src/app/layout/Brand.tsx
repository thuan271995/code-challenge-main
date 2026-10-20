import styles from './Brand.module.scss';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="#main"
      aria-label="Orbit home"
      className={[styles.brand, compact ? styles.compact : ''].join(' ')}
    >
      {!compact && <span className={styles.brandMark}>o</span>}orbit
      <span className={styles.brandDot}>.</span>
    </a>
  );
}
