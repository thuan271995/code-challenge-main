import './shared/styles/global.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/App';
import { AppProviders } from './app/providers';

const root = document.getElementById('root');
if (!root) throw new Error('Application root was not found.');
createRoot(root).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
