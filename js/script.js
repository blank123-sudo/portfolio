(() => {
  'use strict';

  // ====== EDIT THESE ======
  const CONFIG = {
    email: 'teodoricojr.23@gmail.com',
    roles: ['responsive WordPress sites', 'custom themes and plugins', 'fast, SEO-friendly pages', 'clean user experiences']
  };
  // ========================

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  $('#year').textContent = new Date().getFullYear();

  /* Split hero name into animated letters */
  const nameEl = $('#heroName');
  const nameText = nameEl.textContent;
  nameEl.setAttribute('aria-label', nameText);
  nameEl.textContent = '';
  let charIndex = 0;
  nameText.split(' ').forEach(word => {
    const w = document.createElement('span');
    w.className = 'word';
    w.setAttribute('aria-hidden', 'true');
    [...word].forEach(ch => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.animationDelay = `${0.15 + charIndex++ * 0.045}s`;
      w.appendChild(span);
    });
    nameEl.appendChild(w);
  });

  /* Typing effect */
  const typed = $('#typed');
  let r = 0, c = 0, deleting = false;
  (function type() {
    const word = CONFIG.roles[r];
    typed.textContent = word.slice(0, c);
    if (!deleting && c === word.length) { deleting = true; return setTimeout(type, 1600); }
    if (deleting && c === 0) { deleting = false; r = (r + 1) % CONFIG.roles.length; }
    c += deleting ? -1 : 1;
    setTimeout(type, deleting ? 35 : 75);
  })();

  /* Navigation: appears as soon as the page starts scrolling, hides at the very top */
  const nav = $('#nav');
  const hero = $('#home');
  const toggleNav = () => nav.classList.toggle('is-visible', scrollY > 10);
  addEventListener('scroll', toggleNav, { passive: true });
  toggleNav();

  /* Active link highlight */
  const links = $$('.nav__links a');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main .section').forEach(s => spy.observe(s));

  /* Skill cards: earlier cards shrink and dim as the next card slides over them */
  const cards = $$('.stack-card');
  const inners = cards.map(c => $('.stack-card__inner', c));
  const stackObserver = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); stackObserver.unobserve(en.target); }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => stackObserver.observe(c));

  const stackHead = $('#stackHead');
  const stackEl = $('#skillStack');
  function measureStack() {
    const headTop = parseFloat(getComputedStyle(stackHead).top) || 0;
    stackEl.style.setProperty('--stack-top', `${Math.round(headTop + stackHead.offsetHeight + 12)}px`);
  }
  measureStack();
  addEventListener('resize', measureStack);

  function updateStack() {
    if (reduceMotion) return;
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const h = inners[i].offsetHeight;
      const stuckTop = parseFloat(getComputedStyle(card).top) || 190;
      const nextStuck = parseFloat(getComputedStyle(next).top) || stuckTop + 28;
      const start = stuckTop + h;
      const p = Math.min(1, Math.max(0, (start - next.getBoundingClientRect().top) / (start - nextStuck)));
      inners[i].style.setProperty('--s', (1 - p * 0.05).toFixed(4));
      inners[i].style.setProperty('--b', (1 - p * 0.35).toFixed(3));
    });
  }
  addEventListener('scroll', updateStack, { passive: true });
  addEventListener('resize', updateStack);
  updateStack();

  /* Experience: scrolling drives the timeline line and the selected topic */
  const xpTrack = $('#xpTrack');
  const xp = $('#xp');
  const xpPin = $('#xpPin');
  let lastAuto = -1;
  function updateTimeline() {
    const r = xpTrack.getBoundingClientRect();
    const stickyTop = parseFloat(getComputedStyle(xpPin).top) || 0;
    const range = Math.max(1, r.height - xpPin.offsetHeight);
    const p = Math.min(1, Math.max(0, (stickyTop - r.top) / range));
    xp.style.setProperty('--p', p.toFixed(3));
    xp.classList.toggle('is-active', r.top < innerHeight * 0.6);
    const count = tabs.length;
    const idx = Math.min(count - 1, Math.floor(p * count));
    if (idx !== lastAuto) { lastAuto = idx; selectTab(tabs[idx]); }
  }

  /* Experience: tabs (click or arrow keys) */
  const tabs = $$('.tab');
  function selectTab(tab) {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const panel = $('#' + t.getAttribute('aria-controls'));
      panel.classList.toggle('is-active', on);
      panel.hidden = !on;
    });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', e => {
      const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus(); selectTab(next);
    });
  });

  addEventListener('scroll', updateTimeline, { passive: true });
  addEventListener('resize', updateTimeline);
  updateTimeline();

  /* Education: flip card and count-up number */
  const flip = $('#flipCard');
  flip.addEventListener('click', () => {
    const on = flip.getAttribute('aria-pressed') === 'true';
    flip.setAttribute('aria-pressed', String(!on));
  });
  const counter = $('[data-count]');
  const countObs = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    countObs.disconnect();
    const target = +counter.dataset.count;
    if (reduceMotion) { counter.textContent = target; return; }
    const t0 = performance.now(), dur = 2000;
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      counter.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }, { threshold: 0.4 });
  countObs.observe(counter);

  /* Scroll progress bar */
  const bar = $('#progress');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Reveal on scroll */
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const el = en.target;
        el.classList.add('is-in');
        revealer.unobserve(el);
        // Once the reveal is finished, drop the stagger delay so hover effects respond instantly
        setTimeout(() => { el.style.transitionDelay = ''; el.classList.add('is-ready'); }, 1100);
      }
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 0.08}s`;
    revealer.observe(el);
  });

  /* Hero particle network that reacts to the pointer */
  const canvas = $('#heroCanvas');
  const ctx = canvas.getContext('2d');
  const mouse = { x: -9999, y: -9999 };
  let W, H, dots = [];

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(110, Math.floor((W * H) / 14000));
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, s: Math.random() * 1.8 + .8
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const d of dots) {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > W) d.vx *= -1;
      if (d.y < 0 || d.y > H) d.vy *= -1;
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < 140) { d.x += dx / dist * 1.6; d.y += dy / dist * 1.6; }
      ctx.fillStyle = 'rgba(238,234,247,.75)';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.s, 0, 6.283); ctx.fill();
    }
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(127,107,255,${(1 - d / 120) * .5})`;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
        }
      }
      const m = Math.hypot(dots[i].x - mouse.x, dots[i].y - mouse.y);
      if (m < 170) {
        ctx.strokeStyle = `rgba(255,179,71,${(1 - m / 170) * .8})`;
        ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  resize();
  addEventListener('resize', resize);
  hero.addEventListener('pointermove', e => {
    const b = canvas.getBoundingClientRect();
    mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top;
  });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  if (!reduceMotion) draw();

  /* Custom cursor: dot + trailing ring + sparkle trail */
  if (finePointer && !reduceMotion) {
    const dot = $('#cursorDot'), ring = $('#cursorRing');
    let mx = 0, my = 0, rx = 0, ry = 0, lastTrail = 0;
    addEventListener('pointermove', e => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add('cursor-ready');
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const now = performance.now();
      if (now - lastTrail > 45) {
        lastTrail = now;
        const t = document.createElement('span');
        t.className = 'cursor-trail';
        t.style.transform = `translate(${mx}px, ${my}px)`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 600);
      }
    });
    (function follow() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    })();
    document.addEventListener('pointerover', e => {
      document.body.classList.toggle('cursor-hover', !!e.target.closest('a, button, .project, .stack-card, .xp__item'));
    });
    addEventListener('pointerdown', () => document.body.classList.add('cursor-down'));
    addEventListener('pointerup', () => document.body.classList.remove('cursor-down'));
    document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-ready'));

    /* Magnetic buttons */
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const b = btn.getBoundingClientRect();
        btn.style.translate = `${(e.clientX - b.left - b.width / 2) * .25}px ${(e.clientY - b.top - b.height / 2) * .35}px`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.translate = ''; });
    });

    /* 3D tilt + spotlight on project cards */
    $$('.tilt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const b = card.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        card.style.transform = `perspective(900px) rotateX(${(.5 - y) * 10}deg) rotateY(${(x - .5) * 12}deg) translateY(-6px)`;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* Resume viewer */
  const dialog = $('#resumeDialog');
  const frame = $('#resumeFrame');
  $$('[data-resume-open]').forEach(b => b.addEventListener('click', () => {
    if (!frame.getAttribute('src')) frame.setAttribute('src', 'pdf/resume.pdf');
    dialog.showModal();
  }));
  $('[data-resume-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  /* Contact form: validation, then opens the visitor's email app */
  const form = $('#contactForm');
  const status = $('#formStatus');
  const rules = {
    name: v => v.trim().length >= 2 || 'Enter your name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
    message: v => v.trim().length >= 10 || 'Write at least 10 characters.'
  };
  const check = field => {
    const result = rules[field.name](field.value);
    const box = field.closest('.field');
    box.classList.toggle('has-error', result !== true);
    $(`.error[data-for="${field.name}"]`).textContent = result === true ? '' : result;
    return result === true;
  };
  $$('input, textarea', form).forEach(f => f.addEventListener('blur', () => check(f)));
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = $$('input, textarea', form).map(check).every(Boolean);
    if (!ok) { status.textContent = 'Fix the highlighted fields and try again.'; return; }
    const d = new FormData(form);
    const subject = encodeURIComponent(`Portfolio message from ${d.get('name')}`);
    const body = encodeURIComponent(`${d.get('message')}\n\nFrom: ${d.get('name')} (${d.get('email')})`);
    window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
    status.textContent = 'Opening your email app to send the message.';
    form.reset();
  });
})();