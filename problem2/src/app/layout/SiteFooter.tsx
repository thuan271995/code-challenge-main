import { Brand } from './Brand';
import styles from './SiteFooter.module.scss';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Brand compact />
      <span>A better way to move.</span>
      <span>Interview demo · No real swaps</span>
    </footer>
  );
}
