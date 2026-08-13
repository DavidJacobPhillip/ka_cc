(() => {
  const heading = document.querySelector('[id^="Hero-"] .text-block.h1 > *');
  const wrapper = document.querySelector('[id^="Hero-"] .hero__content-wrapper');
  if (!heading || !wrapper) return;

  const MOBILE_BREAKPOINT = 750;
  const SAFETY_MARGIN = 0.97;

  const fit = () => {
    if (window.innerWidth >= MOBILE_BREAKPOINT) {
      // Reset to the CSS-defined size for desktop, in case a mobile-fit
      // value from a previous narrower width is still applied inline.
      heading.style.fontSize = '';
      return;
    }

    // Reset before measuring so the measurement is always against the
    // CSS clamp() baseline, not a previous fit computed at another width.
    heading.style.fontSize = '';

    const available = wrapper.getBoundingClientRect().width;
    const actual = heading.getBoundingClientRect().width;
    const baseSize = parseFloat(getComputedStyle(heading).fontSize);

    if (!actual || !baseSize) return;

    // Scale the current (CSS-baseline) font-size by exactly the ratio
    // needed to make the real rendered text width match the real
    // available width - measured directly rather than estimated from
    // assumed character widths, which is what kept being wrong here.
    heading.style.fontSize = `${(baseSize * available * SAFETY_MARGIN) / actual}px`;
  };

  fit();
  window.addEventListener('resize', fit);

  // Web fonts load with font-display:swap (snippets/theme-styles-
  // variables.liquid) - if the heading is still showing its fallback
  // font when fit() first runs, the measured ratio is based on the
  // wrong glyph widths. Re-measure once the real font is confirmed in.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fit);
  }
})();
