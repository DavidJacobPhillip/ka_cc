(() => {
  const row = document.querySelector('#header-component .header__row--top');
  const hero = document.querySelector('[id^="Hero-"]');
  if (!row || !hero) return;

  // Brand terracotta (scheme-3 background, config/settings_data.json) as
  // separate channels so alpha can be interpolated directly.
  const SOLID_RGB = '205, 100, 63';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    row.style.backgroundColor = `rgb(${SOLID_RGB})`;
    return;
  }

  // FADE_START/FADE_END mark where the ramp begins and finishes, as a
  // fraction of the hero's own height - transparent before FADE_START,
  // fully solid from FADE_END onward.
  const FADE_START = 0.6;
  const FADE_END = 0.9;

  let ticking = false;

  const update = () => {
    ticking = false;
    const rawProgress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    const progress = Math.min(Math.max((rawProgress - FADE_START) / (FADE_END - FADE_START), 0), 1);
    row.style.backgroundColor = `rgba(${SOLID_RGB}, ${progress})`;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
