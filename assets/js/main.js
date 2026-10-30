// Portfolio — Youness Bakas : animations légères, sans dépendance.
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hero = document.querySelector('.hero');

  // Entrée du hero
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      hero.classList.add('is-loaded');
      setTimeout(() => hero.querySelector('.hero-photo').classList.add('is-in'), 250);
      hero.querySelectorAll('.reveal').forEach((el, i) => {
        el.style.setProperty('--i', i + 4);
        el.classList.add('is-in');
      });
    });
  });

  // Délais échelonnés pour les groupes
  document.querySelectorAll('.reveal-group').forEach((group) => {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
  });

  // Apparition au scroll
  const targets = document.querySelectorAll('main .reveal, .reveal-group, main .shutter');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('is-in'));
  }

  // Navigation : fond après le hero, se cache en descendant
  const nav = document.querySelector('.nav');
  const band = document.querySelector('.band-track');
  const photo = document.querySelector('.hero-photo img');
  let lastY = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;

    if (!reduce) {
      // Bandeau de mots qui glisse avec le scroll
      const rect = band.parentElement.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      band.style.transform = 'translate3d(' + (-progress * 30) + '%, 0, 0)';
      // Léger parallaxe sur le portrait
      if (y < window.innerHeight) photo.style.translate = '0 ' + (y * 0.08) + 'px';
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();
})();
