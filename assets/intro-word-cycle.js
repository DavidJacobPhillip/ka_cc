(() => {
  // Targets the "connections"/"chai" links in the intro/"connections"
  // section's heading. Word lists and cursor markup are built here in
  // JS rather than stored as class/data-* attributes on the block's own
  // text setting - that field is a sanitized rich-text field and
  // Shopify's validator rejects non-standard attributes on it (confirmed
  // via a failed deploy: "Attribute 'class=...' is not permitted on tag
  // '<a>'"). Attributes/elements added here after the page loads aren't
  // subject to that check, so the stored HTML stays plain
  // (<a href>...</a>) and this script layers the animation on top.
  const links = document.querySelectorAll('[id$="__intro"] .text-block.h2 a');
  if (!links.length) return;

  // Placeholder word lists (index-matched to link order: connections,
  // then chai) - edit here to change them.
  const WORD_LISTS = [
    ['connections', 'memories', 'moments'],
    ['chai', 'tea', 'masala chai'],
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TYPE_SPEED = 70;
  const DELETE_SPEED = 40;
  const HOLD_DURATION = 1600;

  links.forEach((link, i) => {
    const words = WORD_LISTS[i];
    if (!words || words.length < 2) return;

    const originalWord = link.textContent;
    link.textContent = '';
    link.setAttribute('aria-label', originalWord);

    const textEl = document.createElement('span');
    textEl.setAttribute('aria-hidden', 'true');
    textEl.textContent = originalWord;
    link.appendChild(textEl);

    // Leaves the link showing its original static word, no cursor, no
    // animation.
    if (reduceMotion) return;

    const cursorEl = document.createElement('span');
    cursorEl.className = 'cycle-word__cursor';
    cursorEl.setAttribute('aria-hidden', 'true');
    cursorEl.textContent = '|';
    link.appendChild(cursorEl);

    let index = 0;
    // words[0] is expected to match originalWord exactly (it does, by
    // construction, above) so the first phase can start deleting the
    // already-displayed text directly.
    let char = originalWord.length;

    const step = (phase) => {
      if (phase === 'deleting') {
        char -= 1;
        textEl.textContent = words[index].slice(0, char);

        if (char === 0) {
          index = (index + 1) % words.length;
          setTimeout(() => step('typing'), TYPE_SPEED);
        } else {
          setTimeout(() => step('deleting'), DELETE_SPEED);
        }
      } else {
        char += 1;
        textEl.textContent = words[index].slice(0, char);

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
