// Portfolio — Youness Bakas : menus, filtres et fiches des projets, sans dépendance.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrée du hero
  const hero = document.querySelector('.hero');
  document.querySelectorAll('.hero-intro > *').forEach((el, i) => el.style.setProperty('--i', i));
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-loaded')));

  // Menu du hero sur téléphone
  const heroNav = document.querySelector('.hero-nav');
  const menuBtn = heroNav && heroNav.querySelector('.menu-btn');
  if (menuBtn) {
    const setOpen = (open) => {
      heroNav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', open);
    };
    menuBtn.addEventListener('click', () => setOpen(!heroNav.classList.contains('is-open')));
    heroNav.querySelectorAll('ul a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && heroNav.classList.contains('is-open')) { setOpen(false); menuBtn.focus(); }
    });
    document.addEventListener('click', (e) => { if (!heroNav.contains(e.target)) setOpen(false); });
  }

  // Menu fixe : caché en haut de page et en descendant, visible quand on remonte
  const bar = document.getElementById('topbar');
  if (bar) {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const pastHero = y > hero.offsetHeight * 0.8;
        if (!pastHero || y > lastY + 4) bar.classList.remove('is-shown');
        else if (y < lastY - 4) bar.classList.add('is-shown');
        lastY = y;
        ticking = false;
      });
    }, { passive: true });

    // La section en cours est soulignée dans le menu
    const barLinks = Array.from(bar.querySelectorAll('.topbar-nav a'));
    if ('IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          barLinks.forEach((a) => {
            if (a.getAttribute('href') === '#' + entry.target.id) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      barLinks.forEach((a) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) spy.observe(target);
      });
    }
  }

  // Apparitions : délai échelonné à l'intérieur de chaque section
  document.querySelectorAll('section').forEach((scope) => {
    scope.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
  });
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  // Filtres des projets
  const filterBtns = Array.from(document.querySelectorAll('.filters button'));
  const cards = Array.from(document.querySelectorAll('.card'));
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.filter;
      filterBtns.forEach((b) => b.setAttribute('aria-pressed', b === btn));
      cards.forEach((card) => { card.hidden = kind !== 'all' && card.dataset.kind !== kind; });
    });
  });

  // Fiches des projets
  document.querySelectorAll('[data-open]').forEach((btn) => {
    const sheet = document.getElementById(btn.dataset.open);
    if (!sheet || typeof sheet.showModal !== 'function') return;
    btn.addEventListener('click', () => sheet.showModal());
  });
  document.querySelectorAll('.sheet').forEach((sheet) => {
    sheet.querySelectorAll('.close, [data-close]').forEach((el) => el.addEventListener('click', () => sheet.close()));
    // Un clic sur le fond sombre ferme la fiche
    sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  });
})();
