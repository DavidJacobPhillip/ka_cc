/*
  The entrance for the parts of a section: heading, then text, then picture,
  each rising a little as the section comes into view.

  Two things keep it honest. The hidden starting state is written against
  `html.kcc-reveal`, a class set by an inline script in the head, so a page
  whose JavaScript never arrives shows all of its content rather than none of
  it. And a reader who asks for reduced motion is given every element at once,
  with no travel, which is the state this file starts from anyway.
*/
(() => {
  const SELECTOR = '[data-kcc-rise]';
  const STEP = 70; // ms between siblings - enough to read as a sequence, not a queue
  const MAX_DELAY = 420;

  const show = (el) => el.classList.add('is-in');

  const start = () => {
    const items = Array.from(document.querySelectorAll(SELECTOR));
    if (!items.length) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      items.forEach(show);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      items.forEach(show);
      return;
    }

    // The stagger is counted within the section, so each one starts its own
    // sequence rather than inheriting the position of everything above it.
    const groups = new Map();
    items.forEach((el) => {
      const group = el.closest('.shopify-section') || document.body;
      const index = groups.get(group) || 0;
      groups.set(group, index + 1);
      el.style.setProperty('--kcc-rise-delay', Math.min(index * STEP, MAX_DELAY) + 'ms');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 }
    );

    items.forEach((el) => {
      // Anything already on screen at load gets its entrance immediately; the
      // observer would otherwise hold the first screen until a scroll.
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.92) {
        show(el);
      } else {
        observer.observe(el);
      }
    });

    reduced.addEventListener?.('change', (event) => {
      if (event.matches) items.forEach(show);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
