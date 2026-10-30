// Portfolio — Youness Bakas : scène, apparitions et vérificateur ISO 6346, sans dépendance.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrée du hero
  const hero = document.querySelector('.hero');
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-loaded')));

  // Apparitions : délai échelonné à l'intérieur de chaque section
  document.querySelectorAll('section, header').forEach((scope) => {
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

  // La scène : la photo fixe suit la section lue
  const shots = document.querySelectorAll('.stage-img');
  const captions = document.querySelectorAll('.stage-caption span');
  let current = 'portrait';

  function show(name) {
    if (!name || name === current) return;
    current = name;
    shots.forEach((img) => {
      const on = img.dataset.shot === name;
      if (on && img.loading === 'lazy') img.loading = 'eager';
      img.classList.toggle('is-on', on);
    });
    captions.forEach((c) => c.classList.toggle('is-on', c.dataset.for === name));
  }

  const chapters = document.querySelectorAll('.column [data-shot]:not(.row)');
  let openRow = document.querySelector('.row[open]');
  if ('IntersectionObserver' in window) {
    const so = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Dans les projets, la photo suit la ligne ouverte
        if (el.id === 'projets' && openRow) show(openRow.dataset.shot);
        else show(el.dataset.shot);
      });
    }, { rootMargin: '-50% 0px -50% 0px' });
    chapters.forEach((el) => so.observe(el));
  }

  // Projets : survol, focus ou ouverture d'une ligne
  document.querySelectorAll('.row').forEach((row) => {
    const pick = () => show(row.dataset.shot);
    row.addEventListener('mouseenter', pick);
    row.addEventListener('focusin', pick);
    row.addEventListener('toggle', () => {
      if (row.open) { openRow = row; pick(); }
    });
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

    const cat = code[3];
    const catNote = 'UJZ'.includes(cat) ? '' : ' La 4e lettre devrait être U, J ou Z.';
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
