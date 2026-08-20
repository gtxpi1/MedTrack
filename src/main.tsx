import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { registerServiceWorker } from './pwa/registerServiceWorker';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Initialize PWA Service Worker in production/browser environments
registerServiceWorker();
