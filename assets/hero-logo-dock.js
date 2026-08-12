(() => {
  const img = document.querySelector('[id^="Hero-"] .hero-logo-lockup__image');
  const hero = document.querySelector('[id^="Hero-"]');
  // The visible brown bar itself, not the outer #header-component box -
  // docking against the row directly keeps the vertical centering math
  // tied to the actual bar height rather than whatever #header-component's
  // own box happens to measure.
  const header = document.querySelector('#header-component .header__row--top');
  if (!img || !hero || !header) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const desktopQuery = window.matchMedia('(min-width: 750px)');
  const DOCK_HEIGHT = 52;
  const dockInset = () => window.innerWidth * 0.04; // matches the hero content's own 4vw left inset

  let active = false;
  let ticking = false;
  let dockedTransform = null;

  const update = () => {
    ticking = false;
    if (!active || !dockedTransform) return;
    const progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    const { dx, dy, scale } = dockedTransform;
    const s = 1 + (scale - 1) * progress;
    img.style.transform = `translate(${dx * progress}px, ${dy * progress}px) scale(${s})`;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  const activate = () => {
    if (active) return;
    active = true;

    const startRect = img.getBoundingClientRect();

    // Freeze the wrapper's footprint so pulling the image out of flow
    // doesn't shift the heading below it.
    const wrapper = img.parentElement;
    wrapper.style.width = `${startRect.width}px`;
    wrapper.style.height = `${startRect.height}px`;

    img.style.position = 'fixed';
    img.style.top = `${startRect.top}px`;
    img.style.left = `${startRect.left}px`;
    img.style.width = `${startRect.width}px`;
    img.style.height = `${startRect.height}px`;
    img.style.margin = '0';
    img.style.transformOrigin = 'top left';
    img.style.willChange = 'transform';
    img.style.zIndex = '1000';

    // .hero__content-wrapper (an ancestor of img) sets its own z-index
    // (position: relative + z-index != auto), which makes it establish a
    // stacking context. Even at position: fixed with z-index: 1000, img
    // stays trapped inside that context - its z-index only gets compared
    // against siblings within .hero__content-wrapper, not against the
    // header (a completely different part of the page, at a higher
    // stacking level). The whole trapped box loses that comparison, so
    // the "docked" logo rendered behind the header and disappeared once
    // they overlapped. Moving img to be the last child of <body> escapes
    // that trap entirely - as a top-level sibling of header-group/main/
    // footer-group, it now stacks on its own merits (both DOM order and
    // z-index: 1000) instead of inheriting a low-priority ancestor's
    // context.
    document.body.appendChild(img);

    const headerRect = header.getBoundingClientRect();
    const dockLeft = headerRect.left + dockInset();
    const dockTop = headerRect.top + (headerRect.height - DOCK_HEIGHT) / 2;

    dockedTransform = {
      dx: dockLeft - startRect.left,
      dy: dockTop - startRect.top,
      scale: DOCK_HEIGHT / startRect.height,
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
  };

  const deactivate = () => {
    if (!active) return;
    active = false;
    dockedTransform = null;
    window.removeEventListener('scroll', onScroll);

    const wrapper = img.parentElement;

    img.style.position = '';
    img.style.top = '';
    img.style.left = '';
    img.style.width = '';
    img.style.height = '';
    img.style.margin = '';
    img.style.transformOrigin = '';
    img.style.willChange = '';
    img.style.zIndex = '';
    img.style.transform = '';

    // Move img back into its original wrapper (it was reparented to
    // <body> in activate()) so it returns to normal document flow.
    if (wrapper && wrapper !== document.body) {
      wrapper.style.width = '';
      wrapper.style.height = '';
      wrapper.appendChild(img);
    }
  };

  const handleModeChange = () => {
    if (desktopQuery.matches) {
      activate();
    } else {
      deactivate();
    }
  };

  const handleResize = () => {
    if (active) {
      deactivate();
      activate();
    }
  };

  handleModeChange();
  desktopQuery.addEventListener('change', handleModeChange);
  window.addEventListener('resize', handleResize);
})();
