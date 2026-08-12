(() => {
  const row = document.querySelector('#header-component .header__row--top');
  const hero = document.querySelector('[id^="Hero-"]');
  if (!row || !hero) return;

  // Brand terracotta (scheme-3 background, config/settings_data.json) as
  // separate channels so alpha can be interpolated directly.
  const SOLID_RGB = '205, 100, 63';

  // Small badge on the left of the nav row that fades in alongside the
  // background going solid - replaces the earlier FLIP-style docking
  // animation (hero-logo-dock.js, removed) with something simpler: no
  // measuring/morphing, just an opacity tied to the same progress this
  // script already computes for the background. Desktop-only (checked
  // once, not on resize - the header's mobile layout uses a 5-column
  // grid with fixed 44px "bookend" slots for the hamburger icon, with
  // no room for an extra badge without redesigning that layout).
  // left: var(--page-margin), matching the same variable
  // sections/header.liquid itself uses for the header's real left/right
  // content inset, instead of a hardcoded value that could drift out of
  // sync with it. Height is a clamp() so it scales with viewport width
  // instead of staying one fixed size at every screen size.
  const isDesktop = window.matchMedia('(min-width: 750px)').matches;
  let navLogo = null;
  if (isDesktop) {
    navLogo = document.createElement('img');
    navLogo.src = window.KCC_NAV_LOGO_SRC || '';
    navLogo.alt = '';
    navLogo.setAttribute('aria-hidden', 'true');
    navLogo.style.cssText =
      'position:absolute;left:var(--page-margin);top:50%;height:clamp(2.5rem, 5vw, 4rem);' +
      'width:auto;transform:translateY(-50%);opacity:0;pointer-events:none;';
    row.appendChild(navLogo);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    row.style.backgroundColor = `rgb(${SOLID_RGB})`;
    if (navLogo) navLogo.style.opacity = '1';
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
    if (navLogo) navLogo.style.opacity = String(progress);
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
