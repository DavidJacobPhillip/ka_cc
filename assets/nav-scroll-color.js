(() => {
  const row = document.querySelector('#header-component .header__row--top');
  const hero = document.querySelector('[id^="Hero-"]');
  if (!row || !hero) return;

  // Brand terracotta (scheme-3 background, config/settings_data.json) as
  // separate channels so alpha can be interpolated directly.
  const SOLID_RGB = '205, 100, 63';

  // Small badge that fades in alongside the background going solid -
  // replaces the earlier FLIP-style docking animation (hero-logo-dock.js,
  // removed) with something simpler: no measuring/morphing, just an
  // opacity tied to the same progress this script already computes for
  // the background. Appended into .header__columns (the actual grid
  // container - .header__row--top just wraps it) so it can participate
  // in that grid directly; positioning/sizing per breakpoint lives in
  // theme.liquid's .nav-logo-badge rules (desktop: absolute on the left
  // edge; mobile: grid-area: center, the same slot the theme's own
  // hidden .header-logo would occupy, since that's otherwise empty
  // space in the mobile header's bookend layout). This script only
  // handles opacity.
  const columns = row.querySelector('.header__columns') || row;
  const navLogo = document.createElement('img');
  navLogo.className = 'nav-logo-badge';
  navLogo.src = window.KCC_NAV_LOGO_SRC || '';
  navLogo.alt = '';
  navLogo.setAttribute('aria-hidden', 'true');
  columns.appendChild(navLogo);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    row.style.backgroundColor = `rgb(${SOLID_RGB})`;
    navLogo.style.opacity = '1';
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
    navLogo.style.opacity = String(progress);
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
