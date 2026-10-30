// Portfolio — Youness Bakas : menus, filtres et fiches des projets, vérificateur ISO 6346, sans dépendance.
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

  // Vérificateur de matricule (norme ISO 6346)
  const form = document.getElementById('check');
  if (!form) return;
  const input = form.querySelector('input');
  const boxes = form.querySelector('.check-boxes');
  const result = form.querySelector('.check-result');

  // Valeurs des lettres : de 10 à 38, en sautant les multiples de 11
  const values = {};
  let v = 10;
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (v % 11 === 0) v++;
    values[ch] = v++;
  }

  function check() {
    const code = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    boxes.innerHTML = '';

    if (!/^[A-Z]{4}\d{7}$/.test(code)) {
      result.innerHTML = code.length
        ? 'Format attendu&nbsp;: 4 lettres puis 7 chiffres, par exemple CSQU3054383.'
        : 'Tapez un matricule de 11 caractères.';
      return;
    }

    let sum = 0;
    const parts = [];
    for (let i = 0; i < 10; i++) {
      const ch = code[i];
      const val = /\d/.test(ch) ? Number(ch) : values[ch];
      sum += val * Math.pow(2, i);
      parts.push([ch, val]);
    }
    const expected = (sum % 11) % 10;
    const given = Number(code[10]);
    const ok = expected === given;

    parts.forEach(([ch, val], i) => {
      const li = document.createElement('li');
      li.style.setProperty('--i', i);
      li.innerHTML = '<b>' + ch + '</b><small>' + val + '</small>';
      boxes.appendChild(li);
    });
    const last = document.createElement('li');
    last.className = 'is-digit' + (ok ? '' : ' is-wrong');
    last.style.setProperty('--i', 10);
    last.innerHTML = '<b>' + given + '</b><small>' + (ok ? 'ok' : expected) + '</small>';
    boxes.appendChild(last);

    const catNote = 'UJZ'.includes(code[3]) ? '' : ' La 4e lettre devrait être U, J ou Z.';
    result.innerHTML = ok
      ? '<strong>Matricule valide.</strong> Somme pondérée ' + sum + ', reste ' + (sum % 11) + '&nbsp;: le chiffre de contrôle est bien ' + expected + '.' + catNote
      : '<strong>Matricule invalide.</strong> Le chiffre de contrôle devrait être ' + expected + ', pas ' + given + '.' + catNote;
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); check(); });
  input.addEventListener('input', () => {
    const code = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length >= 11 || code.length === 0) check();
  });
  check();
})();
