import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './utils/ThemeContext';
import './index.css';

// Prevent unhandled promise rejection popups for harmless Vite HMR WebSocket closes
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message?.includes('WebSocket') ||
        event.reason.toString?.().includes('WebSocket') ||
        event.reason === 'WebSocket closed without opened.')
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('WebSocket') ||
      event.error?.message?.includes('WebSocket')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);

