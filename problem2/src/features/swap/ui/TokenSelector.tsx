import { type ComponentProps, lazy, Suspense } from 'react';

import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import type TokenPicker from './TokenPicker';
import styles from './TokenSelector.module.scss';
const LazyTokenPicker = lazy(() => import('./TokenPicker'));

export function TokenSelector(props: ComponentProps<typeof TokenPicker>) {
  return (
    <ErrorBoundary
      fallback={
        <div className={styles.feedback} role="alert">
          <p>
            The token list could not load. You can still use the form. Reload the page to try again.
          </p>
          <button type="button" onClick={props.onClose}>
            Close selector
          </button>
        </div>
      }
    >
      <Suspense
        fallback={
          <p className={styles.feedback} role="status">
            Opening token selector…
          </p>
        }
      >
        <LazyTokenPicker {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}
