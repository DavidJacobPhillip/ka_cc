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

  // TEMP DEBUG - remove once the docking bug is diagnosed. On-screen
  // readout of the live numbers instead of guessing blind.
  const debugEl = document.createElement('div');
  debugEl.style.cssText =
    'position:fixed;bottom:0;left:0;z-index:99999;background:rgba(0,0,0,0.85);color:#0f0;' +
    'font:11px/1.4 monospace;padding:8px;white-space:pre;pointer-events:none;';
  document.body.appendChild(debugEl);

  const update = () => {
    ticking = false;
    if (!active || !dockedTransform) return;
    const progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    const { dx, dy, scale, startTop, startLeft, headerTop, headerLeft, headerHeight } = dockedTransform;
    const s = 1 + (scale - 1) * progress;
    const tx = dx * progress;
    const ty = dy * progress;
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;

    debugEl.textContent =
      `scrollY: ${window.scrollY.toFixed(0)}  hero.offsetHeight: ${hero.offsetHeight}  progress: ${progress.toFixed(3)}\n` +
      `startRect: top=${startTop.toFixed(1)} left=${startLeft.toFixed(1)}\n` +
      `headerRect: top=${headerTop.toFixed(1)} left=${headerLeft.toFixed(1)} height=${headerHeight.toFixed(1)}\n` +
      `dockedTransform: dx=${dx.toFixed(1)} dy=${dy.toFixed(1)} scale=${scale.toFixed(3)}\n` +
      `applied: translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(3)})\n` +
      `img computed rect now: ${JSON.stringify(img.getBoundingClientRect())}`;
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
      startTop: startRect.top,
      startLeft: startRect.left,
      headerTop: headerRect.top,
      headerLeft: headerRect.left,
      headerHeight: headerRect.height,
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
