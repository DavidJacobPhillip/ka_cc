(() => {
  const img = document.querySelector('[id^="Hero-"] .hero-logo-lockup__image');
  const hero = document.querySelector('[id^="Hero-"]');
  const header = document.querySelector('#header-component');
  if (!img || !hero || !header) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const desktopQuery = window.matchMedia('(min-width: 750px)');
  const DOCK_HEIGHT = 40;
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

    const wrapper = img.parentElement;
    wrapper.style.width = '';
    wrapper.style.height = '';
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
