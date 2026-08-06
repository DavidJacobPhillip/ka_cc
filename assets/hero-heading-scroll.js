(() => {
  const heading = document.querySelector('[id^="Hero-"] .text-block.h1');
  const hero = document.querySelector('[id^="Hero-"]');
  if (!heading || !hero) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const scrollRange = hero.offsetHeight || window.innerHeight;
    const progress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);
    const distance = window.innerWidth * 1.2;
    heading.style.transform = `translateX(${progress * distance}px)`;
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
