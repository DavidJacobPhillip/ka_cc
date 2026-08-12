(() => {
  const logo = document.querySelector('[id^="Hero-"] .hero-logo-lockup');
  const hero = document.querySelector('[id^="Hero-"]');
  if (!logo || !hero) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const scrollRange = hero.offsetHeight || window.innerHeight;
    const progress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);
    const distance = window.innerWidth * 1.2;
    // Same speed/formula as hero-heading-scroll.js, negated - the logo
    // slides left off-screen while the heading slides right.
    logo.style.transform = `translateX(${-progress * distance}px)`;
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
