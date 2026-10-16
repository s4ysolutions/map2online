import 'ol/ol.css';
import 'scalajs:main.js';

// offline support: only in production builds (dev reloads would fight it)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
}
