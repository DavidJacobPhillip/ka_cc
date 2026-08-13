(() => {
  const elements = document.querySelectorAll('.cycle-word');
  if (!elements.length) return;

  // Leaves each element showing its first (pre-rendered) word statically,
  // no animation, no blinking cursor (also disabled via CSS).
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const TYPE_SPEED = 70;
  const DELETE_SPEED = 40;
  const HOLD_DURATION = 1600;

  elements.forEach((el) => {
    const words = (el.dataset.words || '')
      .split(',')
      .map((word) => word.trim())
      .filter(Boolean);
    const target = el.querySelector('.cycle-word__text');
    if (words.length < 2 || !target) return;

    let index = 0;
    // The first word is already fully typed in the markup (SSR/no-JS
    // fallback), so the loop starts by deleting it rather than typing.
    let char = words[0].length;

    const step = (phase) => {
      if (phase === 'deleting') {
        char -= 1;
        target.textContent = words[index].slice(0, char);

        if (char === 0) {
          index = (index + 1) % words.length;
          setTimeout(() => step('typing'), TYPE_SPEED);
        } else {
          setTimeout(() => step('deleting'), DELETE_SPEED);
        }
      } else {
        char += 1;
        target.textContent = words[index].slice(0, char);

        if (char === words[index].length) {
          setTimeout(() => step('deleting'), HOLD_DURATION);
        } else {
          setTimeout(() => step('typing'), TYPE_SPEED);
        }
      }
    };

    setTimeout(() => step('deleting'), HOLD_DURATION);
  });
})();
