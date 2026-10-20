import { ArrowUpRight } from 'lucide-react';

import { Brand } from './Brand';
import styles from './SiteHeader.module.scss';

export function SiteHeader() {
  return (
    <header className={styles.siteHeader}>
      <Brand />
      <nav className={styles.navigation} aria-label="Main navigation">
        <a className={styles.active} href="#swap">
          Swap
        </a>
        <a href="#how-it-works">
          How it works <ArrowUpRight size={14} />
        </a>
      </nav>
      <span className={styles.network}>
        <span /> Multi-token preview
      </span>
    </header>
  );
}
