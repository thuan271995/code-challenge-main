import { ArrowDownUp, Globe2, Zap } from 'lucide-react';

import styles from './Intro.module.scss';

export function Intro() {
  return (
    <section className={styles.intro}>
      <span className={styles.introTag}>
        <span /> SIMPLE STEPS. MORE CHOICES.
      </span>
      <h1 className={styles.title}>
        Your tokens.
        <br />
        New <span>possibilities.</span>
      </h1>
      <p className={styles.introDescription}>
        Choose two tokens, enter an amount, and check the result. See the rate before you decide.
      </p>
      <div className={styles.benefits}>
        <span>
          <Zap size={16} /> Easy to use
        </span>
        <span>
          <Globe2 size={16} /> One place. More tokens.
        </span>
      </div>
      <div className={styles.orbitArt} aria-hidden="true">
        <div className={styles.orbitRing} />
        <div className={[styles.orbitRing, styles.ringTwo].join(' ')} />
        <div className={styles.orbitCenter}>
          <ArrowDownUp size={40} />
        </div>
        <span className={[styles.floatingToken, styles.eth].join(' ')}>Ξ</span>
        <span className={[styles.floatingToken, styles.dollar].join(' ')}>$</span>
        <span className={[styles.floatingToken, styles.bitcoin].join(' ')}>₿</span>
        <span className={styles.artLabel}>
          Simple to use.
          <br />
          <strong>More tokens to choose.</strong>
        </span>
        <span className={styles.artSpark}>✳</span>
      </div>
    </section>
  );
}
