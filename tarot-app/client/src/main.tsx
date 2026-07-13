import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeI18n } from './i18n';
import './index.css';

// Register Service Worker for PWA offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration failed silently — app still works without offline support
    });
  });
}

async function bootstrap() {
  await initializeI18n();
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void bootstrap();
