import { Layers3 } from 'lucide-react';

import { SwapForm } from '@/features/swap';

import styles from './App.module.scss';
import { HowItWorks } from './layout/HowItWorks';
import { Intro } from './layout/Intro';
import { SiteFooter } from './layout/SiteFooter';
import { SiteHeader } from './layout/SiteHeader';

export default function App() {
  return (
    <>
      <a href="#main" className={styles.skipLink}>
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <div className={styles.workspace}>
          <Intro />
          <div id="swap">
            <SwapForm />
            <p className={styles.belowCard}>
              <Layers3 size={14} />
              Reference prices. Clear conversion.
            </p>
          </div>
        </div>
        <HowItWorks />
      </main>
      <SiteFooter />
    </>
  );
}
