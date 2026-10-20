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

  /* Navigation: always visible, gains a background once the page scrolls */
  const nav = $('#nav');
  const hero = $('#home');
  const toggleNav = () => nav.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', toggleNav, { passive: true });
  toggleNav();

  /* Burger menu */
  const burger = $('#burger');
  const burgerLabel = $('#burgerLabel');
  const menu = $('#menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burgerLabel.textContent = open ? 'Close' : 'Menu';
    menu.inert = !open;
  }
  // Switching to desktop width closes the burger menu
  window.matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  $$('.menu [data-resume-open]').forEach(b => b.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { setMenu(false); burger.focus(); } });

  /* Active link highlight */
  const links = $$('.menu__link, .nav__links a');
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
  /* Education: scrolling drives the progress line, the active year and the counter */
  const eduTrack = $('#eduTrack');
  const eduPin = $('#eduPin');
  const eduEl = $('.edu');
  const counter = $('[data-count]');
  const yearItems = $$('.years li');
  function updateEducation() {
    const r = eduTrack.getBoundingClientRect();
    const stickyTop = parseFloat(getComputedStyle(eduPin).top) || 0;
    const range = Math.max(1, r.height - eduPin.offsetHeight);
    const raw = Math.min(1, Math.max(0, (stickyTop - r.top) / range));
    const started = reduceMotion || r.top < innerHeight * 0.6;
    const p = reduceMotion ? 1 : Math.min(1, raw / 0.85);
    eduEl.style.setProperty('--ep', p.toFixed(3));
    const steps = yearItems.length - 1;
    let current = -1;
    yearItems.forEach((li, i) => {
      const on = started && p >= i / steps - 0.001;
      li.classList.toggle('is-on', on);
      if (on) current = i;
    });
    yearItems.forEach((li, i) => li.classList.toggle('is-now', i === current));
    counter.textContent = started ? Math.round(p * +counter.dataset.count) : 0;
  }
  addEventListener('scroll', updateEducation, { passive: true });
  addEventListener('resize', updateEducation);
  updateEducation();

  /* Projects: cards appear one by one in the middle, then move to their own spots */
  const projTrack = $('#projTrack');
  const projPin = $('#projPin');
  const projGrid = $('#projGrid');
  const projCards = $$('.project');
  const projMQ = window.matchMedia('(min-width: 900px)');
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const ease = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const FOCUS_SCALE = 1.28;

  function resetProjects() {
    projCards.forEach(c => {
      ['--tx', '--ps', '--po'].forEach(v => c.style.removeProperty(v));
      c.classList.remove('is-active', 'is-hidden');
    });
  }
  function updateProjects() {
    if (!projMQ.matches || reduceMotion) { resetProjects(); return; }
    const r = projTrack.getBoundingClientRect();
    const stickyTop = parseFloat(getComputedStyle(projPin).top) || 0;
    const range = Math.max(1, r.height - projPin.offsetHeight);
    const p = clamp01((stickyTop - r.top) / range / 0.92);
    const n = projCards.length;
    const ts = projCards.map((_, i) => clamp01(p * n - i));
    // How strongly each card is "on stage" (used to dim the cards already in place)
    const focus = ts.map(t => (t <= 0 || t >= 1 ? 0 : t < 0.5 ? clamp01(t / 0.2) : clamp01((1 - t) / 0.5)));
    const gridW = projGrid.clientWidth;
    projCards.forEach((card, i) => {
      const t = ts[i];
      const appear = ease(clamp01(t / 0.25));
      const move = ease(clamp01((t - 0.5) / 0.5));
      const dx = gridW / 2 - (card.offsetLeft + card.offsetWidth / 2);
      const stageScale = 0.85 + (FOCUS_SCALE - 0.85) * appear;
      const scale = stageScale + (1 - stageScale) * move;
      let dim = 0;
      for (let k = i + 1; k < n; k++) dim = Math.max(dim, focus[k]);
      const opacity = appear * (1 - 0.65 * dim);
      card.style.setProperty('--tx', `${(dx * (1 - move)).toFixed(1)}px`);
      card.style.setProperty('--ps', scale.toFixed(4));
      card.style.setProperty('--po', opacity.toFixed(3));
      card.classList.toggle('is-active', t > 0 && t < 1);
      card.classList.toggle('is-hidden', opacity < 0.05);
    });
  }
  addEventListener('scroll', updateProjects, { passive: true });
  addEventListener('resize', updateProjects);
  projMQ.addEventListener('change', updateProjects);
  updateProjects();

  /* Hero letters: a letter portrait that scatters as you scroll */
  const PORTRAIT = [
    "000000000000000000000000000000000000000000000000000000000000000000000000",
    "000000000000000000000000000000000000000000000000000000000000000000000000",
    "000000000000000000000000000000000000000000000000000000000000000000000000",
    "000000000000000000000000000000000000000000000000000000000000000000000000",
    "000000000000000000000000000000000000000000000000000000000000000000000000",
    "000000000000000000000000000000085554222478000000000000000000000000000000",
    "000000000000000000000000000000a57542443348777000000000000000000000000000",
    "00000000000000000000000000000b876425311225977650000000000000000000000000",
    "000000000000000000000000000888764332122333665554300000000000000000000000",
    "000000000000000000000000643445652331111146675565350000000000000000000000",
    "000000000000000000000005333343441221111124666753334000000000000000000000",
    "000000000000000000000042333144231121111111433221542500000000000000000000",
    "000000000000000000000523211246222232111111365325555400000000000000000000",
    "000000000000000000007344222333222234334421135545653200000000000000000000",
    "0000000000000000000a5343114112334666788754223456642150000000000000000000",
    "000000000000000000084344123435788999aaaa87532322343140000000000000000000",
    "0000000000000000000734431135679abbbbcccba9864343553246000000000000000000",
    "0000000000000000000734321125799bccccdcdeeeeb8642342134600000000000000000",
    "00000000000000000007331111369abbcddcddeefffffda5321122700000000000000000",
    "00000000000000000006521111469bbccdcddddddeefffea743212000000000000000000",
    "00000000000000000005621113568abbcdddeddcdeeeeedb943422000000000000000000",
    "000000000000000000055411235789bcdeeeeeddeffffebaa54222000000000000000000",
    "00000000000000000008521122678acddeeefeddeecaa877973312000000000000000000",
    "00000000000000000008422223787666679bdccb95444676782232000000000000000000",
    "0000000000000000000742112476444443489aaa75568bba892122000000000000000000",
    "00000000000000000007522115a867ab9644579975458aaaa94122500000000000000000",
    "00000000000000000008421117c9668bca7337dd74212456aa7112600000000000000000",
    "0000000000000000000952212bc75421687538ff95322666aa8212800000000000000000",
    "0000000000000000000042213ca63356ac9539ffb843479bca8313800000000000000000",
    "0000000000000000000072214d8764689ba549effdca9acddb8325700000000000000000",
    "0000000000000000000042215d889bcddda559efffeccdeffc9338700000000000000000",
    "0000000000000000000044225c99cefffe945aefeedcdffffd934a800000000000000000",
    "0000000000000000000036214ca9befffe756aefffb7befffc9349b00000000000000000",
    "0000000000000000000045212ba8adfffa3646bdccc659dfeb8669000000000000000000",
    "0000000000000000000084132a979cefd412114741ac348bca8b99000000000000000000",
    "0000000000000000000006223a976adda4211128ddfea359a97bab000000000000000000",
    "0000000000000000000007453aa757bb965457aaefffc74889acb0000000000000000000",
    "00000000000000000000006726a745aa756779bcdddec55899ab00000000000000000000",
    "00000000000000000000000932b8548a3232454677534478990000000000000000000000",
    "000000000000000000000000a8a9547a511112579a8398788a0000000000000000000000",
    "00000000000000000000000000bb6348973258ecca9bc9766c0000000000000000000000",
    "000000000000000000000000009b832378645798bebec965800000000000000000000000",
    "000000000000000000000000000ca4113653257899cdca76000000000000000000000000",
    "000000000000000000000000000da7212443112359eedb7a000000000000000000000000",
    "000000000000000000000000000ea96224565457aeffeb60000000000000000000000000",
    "0000000000000000000000000000a885335689aabeffd770000000000000000000000000",
    "0000000000000000000000000000a6464345689879cc6590000000000000000000000000",
    "000000000000000000000000000aa52344322455445447a0000000000000000000000000",
    "000000000000000000000000002da5212232212111257ab0000000000000000000000000",
    "000000000000000000000000042da52111122212247a9bc0000000000000000000000000",
    "000000000000000000000000621cc522222223456adbabc0000000000000000000000000",
    "000000000000000000000004321aca4444333458add9bc90000000000000000000000000",
    "0000000000000000000000511117c00666544446ab99cc6d000000000000000000000000",
    "00000000000000000000a4111115b00c77765544689bcc4b000000000000000000000000",
    "0000000000000000009422111113accfc887665458cddb2ba57c00000000000000000000",
    "0000000000000000a543222111139ccefd9977777bced91cc54450000000000000000000",
    "00000000000000a74444143221238cdeffea98899bbec62fd64554490000000000000000",
    "000000000000b7644455255332347ceeffffb98889dea57fd75565555800000000000000",
    "0000000000c875555665257633456bddefffeba9aced74dfe66566565446000000000000",
    "00000000a87555567776268745566aeeeeffffbbcdfb68fff67656555555460000000000",
    "000000a86654567778863267566669eefeffffeccee96deff68877566656544580000000",
    "0000b9766555666778867522577667effffffdadeed9ec14f78886675666655447000000",
    "00ca96566666777879868664467666cfffffdacececed3119a8777788766666554000000",
    "0b8668657677888999977656987766affffb78abbeffa2114c9878787666666665600000",
    "e864468688788989999865799877669effe333479bb855111c8888777766567676500000",
    "d874137979888a99a9a8427a9987667dff533333434767411a8996787767666786500000",
    "c772125899989a99999961598998666bf722334445677674287999557777767776480000",
    "a6612247a8999aa99a9872289988856a9434322335666776634999877777767666360000",
    "744421347a8889aaa9988616999986595442344444577875632898876877667664440000",
    "566612235a7879a9aa9877329a8987687353235435568765631888787766665664440000",
    "8a83132348987899aa99876189a987669255323676877765641988876777665653530000",
    "db31112346a5668aaa98877249aa8867a246423558867665541788897887766553330000"
  ];
  const STREAM = [...'WORDPRESSHTML5CSS3JAVASCRIPTPHPJQUERYELEMENTORGUTENBERGSEOGIT'];
  const RETURN_DELAY = 2000; // ms before a dropped letter drifts back (use Infinity to keep letters where you drop them)
  const FONT = '"Bricolage Grotesque", system-ui, sans-serif';
  const heroTrack = $('#heroTrack');
  const cv = $('#lettersCanvas');
  const cctx = cv.getContext('2d');
  const sprites = new Map();
  let LW = 0, LH = 0, parts = [], mS = 0, introStart = performance.now();
  const ptrN = { x: 0, y: 0 }, ptrS = { x: 0, y: 0 };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));
  const mix = (a, b, t) => a + (b - a) * t;
  const easeIO = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const toneRgb = b => { const t = b / 7; return `${Math.round(mix(127, 238, t))},${Math.round(mix(107, 234, t))},${Math.round(mix(255, 247, t))}`; };

  function sprite(ch, rgb) {
    const key = ch + '|' + rgb;
    let s = sprites.get(key);
    if (!s) {
      s = document.createElement('canvas'); s.width = s.height = 48;
      const g = s.getContext('2d');
      g.font = `800 36px ${FONT}`; g.fillStyle = `rgb(${rgb})`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(ch, 24, 26);
      sprites.set(key, s);
    }
    return s;
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => sprites.clear());

  function layout() {
    LW = hero.clientWidth; LH = hero.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(LW * dpr); cv.height = Math.round(LH * dpr);
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    parts = [];
    if (LW < 50 || LH < 200) return;

    const wide = LW >= 900;
    const P = wide ? clampN(Math.min(LH * 0.82, LW * 0.44, 640), 280, 640) : clampN(Math.min(LW * 0.82, LH * 0.42), 200, 360);
    const pcx = wide ? Math.min(LW * 0.74, LW - P / 2 - 20) : LW / 2;
    const pcy = wide ? LH * 0.52 : LH * 0.72;
    const G = PORTRAIT.length, stride = LW < 700 ? 2 : 1, cell = P / G;

    let si = 0;
    for (let r = 0; r < G; r += stride) {
      for (let k = 0; k < G; k += stride) {
        const tone = parseInt(PORTRAIT[r][k], 16);
        if (!tone) continue;
        const t = (tone - 1) / 14, hx = pcx - P / 2 + (k + stride / 2) * cell, hy = pcy - P / 2 + (r + stride / 2) * cell;
        parts.push({
          hx, hy, ch: STREAM[si++ % STREAM.length], tone,
          sizeP: cell * stride * 1.12, alphaP: 0.12 + 0.88 * Math.pow(t, 0.95), rgbP: toneRgb(Math.round(t * 7)),
          sx: rnd(0, LW), sy: rnd(0, LH),                       // where this letter scatters to
          d: rnd(0, 0.3) + Math.hypot(hx - pcx, hy - pcy) / P * 0.12, introDelay: rnd(0, 0.7),
          ax: rnd(-0.5, 0.5) * LW * 0.25, ay: rnd(-0.5, 0.5) * LH * 0.25, z: rnd(0.4, 1),
          ph: rnd(0, 6.28), sw: rnd(0.5, 1.1),
          dx: 0, dy: 0, vx: 0, vy: 0, drag: false, holdUntil: 0, rx: 0, ry: 0, ra: 0, rs: 0
        });
      }
    }
  }

  /* Dragging (mouse and pen) */
  let dragging = null;
  const lastPtr = { x: 0, y: 0 };
  hero.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' || dragging || e.target.closest('a, button')) return;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    let best = null, bestD = Infinity;
    for (const p of parts) {
      if (p.ra < 0.25) continue;
      const d = Math.hypot(p.rx - x, p.ry - y);
      if (d < Math.max(10, p.rs * 0.55) && d < bestD) { best = p; bestD = d; }
    }
    if (!best) return;
    e.preventDefault();
    hero.setPointerCapture(e.pointerId);
    hero.classList.add('is-dragging');
    best.drag = true; best.vx = best.vy = 0;
    dragging = { p: best, id: e.pointerId, gox: x - best.rx, goy: y - best.ry };
    lastPtr.x = x; lastPtr.y = y;
  });
  addEventListener('pointermove', e => {
    const rect = hero.getBoundingClientRect();
    if (dragging && e.pointerId === dragging.id) { lastPtr.x = e.clientX - rect.left; lastPtr.y = e.clientY - rect.top; }
    if (!reduceMotion && LW) {
      ptrN.x = clampN((e.clientX - rect.left) / LW * 2 - 1, -1, 1);
      ptrN.y = clampN((e.clientY - rect.top) / LH * 2 - 1, -1, 1);
    }
  });
  const endDrag = e => {
    if (!dragging || e.pointerId !== dragging.id) return;
    const p = dragging.p;
    p.drag = false;
    p.vx *= 0.7; p.vy *= 0.7;
    if (reduceMotion) p.vx = p.vy = 0;
    p.holdUntil = performance.now() + RETURN_DELAY;
    hero.classList.remove('is-dragging');
    dragging = null;
  };
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  /* Animation loop */
  let prev = performance.now();
  function tickLetters(now) {
    requestAnimationFrame(tickLetters);
    const dt = Math.min(0.05, (now - prev) / 1000);
    prev = now;
    if (!parts.length || heroTrack.getBoundingClientRect().bottom < -60) return;
    const k = dt * 60, t = now / 1000;

    // The banner scrolls away normally; the letters finish scattering after about 60% of its height
    const target = reduceMotion ? 0 : clampN(scrollY / (hero.offsetHeight * 0.6), 0, 1);
    mS = reduceMotion ? 0 : mS + (target - mS) * Math.min(1, 0.14 * k);
    ptrS.x += (ptrN.x - ptrS.x) * Math.min(1, 0.08 * k);
    ptrS.y += (ptrN.y - ptrS.y) * Math.min(1, 0.08 * k);

    cctx.clearRect(0, 0, LW, LH);
    let held = null;
    for (const p of parts) {
      const e = easeIO(clampN((mS - p.d) / 0.6, 0, 1));               // 0 = portrait, 1 = scattered
      const u = reduceMotion ? 1 : easeIO(clampN((now - introStart - 200 - p.introDelay * 1000) / 1500, 0, 1)); // intro: letters fly in
      const a = u * (1 - e), s = Math.sin(Math.PI * a);               // 1 = in place, 0 = scattered
      const depth = p.tone / 15 - 0.4;
      let bx = mix(p.sx, p.hx, a) + p.ax * s + ptrS.x * 18 * depth * a;
      let by = mix(p.sy, p.hy, a) + p.ay * s + ptrS.y * 12 * depth * a;
      if (!reduceMotion) { const w = 1.2 + (1 - a) * 3.5; bx += Math.sin(t * p.sw + p.ph) * w; by += Math.cos(t * p.sw * 0.8 + p.ph) * w; }

      if (p.drag) {
        const nx = clampN(lastPtr.x - dragging.gox, 0, LW), ny = clampN(lastPtr.y - dragging.goy, 0, LH);
        p.vx = p.vx * 0.6 + (nx - bx - p.dx) * 0.4;
        p.vy = p.vy * 0.6 + (ny - by - p.dy) * 0.4;
        p.dx = nx - bx; p.dy = ny - by;
      } else if (p.vx > 0.05 || p.vx < -0.05 || p.vy > 0.05 || p.vy < -0.05) {
        p.dx += p.vx * k; p.dy += p.vy * k;
        if (bx + p.dx < 0 || bx + p.dx > LW) { p.vx *= -0.6; p.dx = clampN(bx + p.dx, 0, LW) - bx; }
        if (by + p.dy < 0 || by + p.dy > LH) { p.vy *= -0.6; p.dy = clampN(by + p.dy, 0, LH) - by; }
        p.vx *= Math.pow(0.9, k); p.vy *= Math.pow(0.9, k);
      } else if ((p.dx || p.dy) && now >= p.holdUntil) {
        const f = Math.pow(0.9, k);
        p.dx *= f; p.dy *= f;
        if (Math.abs(p.dx) + Math.abs(p.dy) < 0.4) p.dx = p.dy = 0;
      }

      const x = bx + p.dx, y = by + p.dy;
      const size = p.sizeP * (1 + 0.8 * s * p.z);
      const alpha = p.alphaP * (0.55 + 0.45 * a);
      p.rx = x; p.ry = y; p.ra = alpha; p.rs = size;
      if (p.drag) { held = p; continue; }
      if (alpha < 0.02) continue;
      const dsz = size * 48 / 36;
      cctx.globalAlpha = alpha;
      cctx.drawImage(sprite(p.ch, p.rgbP), x - dsz / 2, y - dsz / 2, dsz, dsz);
    }
    if (held) {
      const p = held, dsz = p.rs * 1.5 * 48 / 36;
      cctx.save();
      cctx.shadowColor = 'rgba(0,0,0,.55)'; cctx.shadowBlur = 14; cctx.shadowOffsetY = 6;
      cctx.globalAlpha = 1;
      cctx.drawImage(sprite(p.ch, '255,179,71'), p.rx - dsz / 2, p.ry - dsz / 2, dsz, dsz);
      cctx.restore();
    }
    cctx.globalAlpha = 1;
  }

  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (!dragging) layout(); }, 200);
  });
  const startLetters = () => { introStart = performance.now(); layout(); requestAnimationFrame(tickLetters); };
  if (document.readyState === 'complete') startLetters();
  else addEventListener('load', startLetters);

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

    /* Spotlight on footer contact cards */
    $$('.contact-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const b = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - b.left}px`);
        card.style.setProperty('--my', `${e.clientY - b.top}px`);
      });
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

  /* Back to top button with scroll progress ring */
  const toTop = $('#toTop');
  const toTopBar = $('#toTopBar');
  const circ = 2 * Math.PI * 24;
  toTopBar.setAttribute('stroke-dasharray', circ.toFixed(2));
  function updateToTop() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    toTopBar.setAttribute('stroke-dashoffset', (circ * (1 - p)).toFixed(2));
    toTop.classList.toggle('is-visible', scrollY > 600);
  }
  addEventListener('scroll', updateToTop, { passive: true });
  addEventListener('resize', updateToTop);
  updateToTop();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* Copy buttons in the footer */
  const toast = $('#toast');
  let toastTimer;
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }
  $$('.copy').forEach(btn => btn.addEventListener('click', async () => {
    const ok = await copyText(btn.dataset.copy);
    toast.textContent = ok ? 'Copied: ' + btn.dataset.copy : 'Could not copy, please copy it manually';
    toast.classList.add('is-on');
    if (ok) { btn.classList.add('is-copied'); setTimeout(() => btn.classList.remove('is-copied'), 1800); }
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 2200);
  }));

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
