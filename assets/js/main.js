// Portfolio — Youness Bakas : apparitions, index des projets et vérificateur ISO 6346, sans dépendance.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrée du hero
  const hero = document.querySelector('.hero');
  document.querySelectorAll('.band > *').forEach((el, i) => el.style.setProperty('--i', i));
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-loaded')));

  // Le portrait glisse lentement avec le scroll
  const photo = document.querySelector('.hero-photo');
  if (!reduce && photo) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight * 1.2) photo.style.translate = '0 ' + (y * 0.12) + 'px';
        ticking = false;
      });
    }, { passive: true });
  }

  // Menu fixe : caché en haut de page et en descendant, visible quand on remonte
  const bar = document.getElementById('topbar');
  if (bar) {
    let lastY = window.scrollY;
    let barTicking = false;
    window.addEventListener('scroll', () => {
      if (barTicking) return;
      barTicking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const pastHero = y > hero.offsetHeight * 0.8;
        if (!pastHero || y > lastY + 4) bar.classList.remove('is-shown');
        else if (y < lastY - 4) bar.classList.add('is-shown');
        lastY = y;
        barTicking = false;
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

  // Index des projets : clic, flèches du clavier, ou survol qui s'attarde
  const tabs = Array.from(document.querySelectorAll('.index-row'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
    });
    panels.forEach((p) => p.classList.toggle('is-on', p.id === tab.getAttribute('aria-controls')));
    if (focus) tab.focus();
  }

  if (tabs.length) {
    select(tabs[0]);
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      let hoverTimer;
      tab.addEventListener('mouseenter', () => { hoverTimer = setTimeout(() => select(tab), 180); });
      tab.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      tab.addEventListener('keydown', (e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home') { e.preventDefault(); select(tabs[0], true); }
        else if (e.key === 'End') { e.preventDefault(); select(tabs[tabs.length - 1], true); }
        else if (step) { e.preventDefault(); select(tabs[(i + step + tabs.length) % tabs.length], true); }
      });
    });
  }

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
