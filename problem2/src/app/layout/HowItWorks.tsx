import { MoveUpRight } from 'lucide-react';

import styles from './HowItWorks.module.scss';

export function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.howSection}>
      <div className={styles.howHeading}>
        <span className={styles.eyebrow}>HOW IT WORKS</span>
        <h2>Get started in three steps.</h2>
      </div>
      <div className={styles.steps}>
        {[
          {
            title: 'Choose your pair',
            text: 'Pick the token you have and the token you want.',
          },
          {
            title: 'Set your amount',
            text: 'Enter the amount you would like to convert.',
          },
          {
            title: 'Calculate your swap',
            text: 'Press Calculate swap to see the conversion result.',
          },
        ].map((step, index) => (
          <article key={step.title}>
            <span className={styles.stepNumber}>0{index + 1}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
            <MoveUpRight size={18} />
          </article>
        ))}
      </div>
    </section>
  );
}
