/*
  The hero clip, fetched only where it earns its weight.

  sections/hero.liquid ships the <video> with its source parked in
  data-kcc-src and no autoplay attribute, so nothing is downloaded until this
  file promotes it. The poster image is already on the page and already
  responsive, so a visitor who never gets the clip still sees the pour.

  It stays parked on a narrow screen (the clip is ~11MB, which is the whole
  page budget on a phone), when the visitor has asked for reduced motion, and
  when the browser reports a metered or slow connection or Data Saver.
*/
(() => {
  const WIDE = '(min-width: 750px)';

  const wanted = () => {
    if (!window.matchMedia(WIDE).matches) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    const net = navigator.connection;
    if (net) {
      if (net.saveData) return false;
      if (/(^|-)2g$/.test(net.effectiveType || '')) return false;
    }
    return true;
  };

  const promote = (video) => {
    if (video.dataset.kccLoaded) return;
    const sources = video.querySelectorAll('source[data-kcc-src]');
    if (!sources.length) return;
    video.dataset.kccLoaded = 'true';
    sources.forEach((source) => {
      source.src = source.dataset.kccSrc;
      source.removeAttribute('data-kcc-src');
    });
    video.preload = 'auto';
    video.muted = true;
    video.load();
    const played = video.play();
    if (played && typeof played.catch === 'function') played.catch(() => {});
  };

  const start = () => {
    const videos = document.querySelectorAll('video[data-kcc-video]');
    if (!videos.length || !wanted()) return;
    videos.forEach(promote);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  // A window dragged wider, or rotated, is a new answer to the same question.
  window.matchMedia(WIDE).addEventListener?.('change', start);
})();
