(() => {
  // #ka-rail (layout/theme.liquid) needs to start below the hero's real
  // rendered bottom edge, not a fixed guess from the top of #MainContent -
  // the hero is viewport-height-based and any fixed offset small enough to
  // look like a gap gets swallowed entirely inside the hero's own height,
  // producing no visible separation at all. Measures the hero's actual
  // height (same measure-don't-guess approach as hero-heading-fit.js) and
  // exposes it as --hero-height for the rail's CSS to build its top inset
  // from.
  const hero = document.querySelector('[id^="Hero-"]');
  if (!hero) return;

  const update = () => {
    document.documentElement.style.setProperty('--hero-height', `${hero.offsetHeight}px`);
  };

  update();
  window.addEventListener('resize', update);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(update);
  }
})();
