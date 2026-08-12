(() => {
  const strip = document.querySelector('[id^="Hero-"] .hero-icon-strip');
  const hero = document.querySelector('[id^="Hero-"]');
  if (!strip || !hero) return;

  // Staggered reveal - each icon starts at opacity:0 in the block's own
  // <style>; toggling this class lets their per-icon transition-delay
  // cascade them in one after another instead of all at once. Held back
  // until scrolling actually starts (progress > 0 below), not on load.
  let revealed = false;
  const revealOnce = () => {
    if (revealed) return;
    revealed = true;
    strip.classList.add('is-visible');
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealOnce();
    return;
  }

  let ticking = false;

  const update = () => {
    ticking = false;
    const scrollRange = hero.offsetHeight || window.innerHeight;
    const progress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);
    if (progress > 0) revealOnce();
    const distance = window.innerWidth * 1.2;
    // Same speed/formula as hero-heading-scroll.js and hero-logo-scroll.js -
    // the strip is attached to the heading, so it rides along with both.
    strip.style.transform = `translateX(${progress * distance}px)`;
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
