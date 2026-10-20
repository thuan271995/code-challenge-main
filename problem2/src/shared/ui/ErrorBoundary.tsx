import { Component, type ReactNode } from 'react';

import styles from './ErrorBoundary.module.scss';
type Props = { children: ReactNode; fallback?: ReactNode };
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      this.props.fallback ?? (
        <div className={styles.fatal} role="alert">
          <h1>Something went wrong.</h1>
          <p>Reload the page to start again.</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      )
    );
  }
}
