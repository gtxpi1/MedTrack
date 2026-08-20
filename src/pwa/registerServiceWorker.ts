/**
 * PWA Service Worker Registration Helper
 */
export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[MedTrack PWA] ServiceWorker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.warn('[MedTrack PWA] ServiceWorker registration failed:', error);
        });
    });
  }
}
