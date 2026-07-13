/* ===== Nabil's Barbershop — main.js ===== */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = root.classList.contains('reduce-motion');

  /* ---------- year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- intro ---------- */
  var intro = document.getElementById('intro');
  if (intro && !reduce) {
    document.body.style.overflow = 'hidden';
    var done = function () {
      intro.classList.add('is-done');
      document.body.style.overflow = '';
      setTimeout(function () { if (intro && intro.parentNode) intro.parentNode.removeChild(intro); }, 700);
      window.removeEventListener('click', done);
    };
    setTimeout(done, 2100);
    window.addEventListener('click', done);
  } else if (intro) {
    intro.parentNode && intro.parentNode.removeChild(intro);
  }

  /* ---------- header scroll ---------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var mq = window.matchMedia('(max-width:960px)');
  var lastFocus = null;

  function isMobile() { return mq.matches; }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    if (isMobile()) {
      nav.inert = !open;
      if (open) { lastFocus = document.activeElement; var f = nav.querySelector('a'); f && f.focus(); }
      else if (lastFocus) { lastFocus.focus(); }
    } else {
      nav.inert = false;
    }
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' && isMobile()) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
    var syncMq = function () { if (!isMobile()) { nav.classList.remove('open'); nav.inert = false; burger.setAttribute('aria-expanded', 'false'); } else { if (!nav.classList.contains('open')) nav.inert = true; } };
    mq.addEventListener ? mq.addEventListener('change', syncMq) : mq.addListener(syncMq);
    syncMq();
  }

  /* ---------- reveal + watchdog ---------- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  function showAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
    // watchdog: if IO never fires within 1.5s, reveal everything
    var fired = false;
    var wd = new IntersectionObserver(function () { fired = true; wd.disconnect(); });
    wd.observe(document.body);
    setTimeout(function () { if (!fired) showAll(); }, 1500);
  }

  /* ---------- dynamic hours (Europe/Rome) — Centrale ---------- */
  // 0=Sun ... 6=Sat ; windows in minutes from midnight
  var HOURS = {
    1: [[540, 1260]], 2: [[540, 1260]], 3: [[540, 1260]], 4: [[540, 1260]],
    5: [[540, 1260]], 6: [[540, 1260]], 0: [[600, 1200]]
  };
  function romeNow() {
    var s = new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' });
    return new Date(s);
  }
  function fmt(min) { var h = Math.floor(min / 60), m = min % 60; return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
  function updateHours(lang) {
    var statusEl = document.getElementById('hoursStatus');
    if (!statusEl) return;
    var now = romeNow();
    var day = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var wins = HOURS[day] || [];
    var open = false, nextClose = null, nextOpen = null;
    wins.forEach(function (w) { if (mins >= w[0] && mins < w[1]) { open = true; nextClose = w[1]; } });
    if (!open) { for (var i = 0; i < wins.length; i++) { if (mins < wins[i][0]) { nextOpen = wins[i][0]; break; } } }
    var t = {
      it: { open: 'Aperto ora', closes: 'chiude alle', closed: 'Chiuso ora', opens: 'apre oggi alle', opensNext: 'apre alla prossima apertura' },
      en: { open: 'Open now', closes: 'closes at', closed: 'Closed now', opens: 'opens today at', opensNext: 'opens next session' }
    }[lang] || {};
    var html;
    if (open) html = '<span class="dot"></span>' + t.open + ' · ' + t.closes + ' ' + fmt(nextClose);
    else if (nextOpen !== null) html = '<span class="dot"></span>' + t.closed + ' · ' + t.opens + ' ' + fmt(nextOpen);
    else html = '<span class="dot"></span>' + t.closed;
    statusEl.className = 'hours__status ' + (open ? 'is-open' : 'is-closed');
    statusEl.innerHTML = html;
    // highlight today
    var rows = document.querySelectorAll('.hours__table tr');
    rows.forEach(function (r) { r.classList.toggle('today', parseInt(r.getAttribute('data-day'), 10) === day); });
  }

  /* ---------- i18n ---------- */
  var EN = {
    'skip': 'Skip to content',
    'nav.about': 'The barbershop', 'nav.services': 'Services', 'nav.gallery': 'Gallery', 'nav.locations': 'Locations', 'nav.reviews': 'Reviews',
    'cta.book': 'Book',
    'hero.eyebrow': 'Barbershop · from the pitch to the chair',
    'hero.lead': 'Care as a ritual. Five locations across Milan, a 77,000-strong community and the hands of people who treat every head like a piece of work.',
    'hero.cta2': 'Services & prices',
    'hero.stat1': 'locations in Milan', 'hero.stat2': 'on Google · 1,356 reviews', 'hero.stat3': 'Instagram community',
    'story.label': 'The barbershop',
    'story.title': 'Born from the discipline of the pitch.',
    'story.p1': 'First the matches, then the passion. Nabil left a football career to bet on the art of hairdressing, surrounding himself with professionals who now work side by side. From a neighbourhood shop to a city landmark — visited even by those who still play on the pitch.',
    'story.p2': '"Care" is the word that describes the work: from a client\'s first step to the last there is always time for a smile, a coffee, a kindness — beyond precision and attention to every request. Tradition and innovation, with constant staff training.',
    'story.chip1': 'Elegant & urban mood', 'story.chip2': 'Cut · Beard · Colour', 'story.chip3': 'Bandido · Seb Man',
    'services.label': 'Services & prices',
    'services.title': 'The hand, the blade, the right time.',
    'srv.1': 'Haircut', 'srv.2': 'Beard', 'srv.3': 'Cut, shampoo & hot-towel beard', 'srv.4': 'Colour', 'srv.5': 'Sideburns & neck trim',
    'services.newtag': 'New',
    'services.wellnessTitle': 'Hammam · Nails & Spa',
    'services.wellnessText': 'The new wellness corner in Via Vitruvio 43: a regenerating hammam and luxury manicure and pedicure treatments, where every detail is designed for relaxation. Care, taken beyond the chair.',
    'services.wellnessCta': 'Book an experience',
    'services.note': 'Prices may vary slightly by location and service. Reference price list: Via Vitruvio 44.',
    'gallery.label': 'Gallery', 'gallery.title': 'Inside our shops.',
    'loc.label': 'The locations', 'loc.title': 'Five addresses, one signature.',
    'loc.flag': 'Flagship', 'loc.lanza': 'M Lanza', 'loc.pasteur': 'M Pasteur', 'loc.spa': 'Nails & Spa',
    'hours.title': 'Hours — Centrale',
    'hours.note': 'Hours may vary by location. Confirm your shop before dropping by.',
    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday', 'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday',
    'rev.label': 'Reviews', 'rev.title': 'The words of those who sit down.',
    'book.label': 'Book', 'book.title': 'Claim your chair.',
    'book.lead': 'Choose location, time and barber online, or message us on WhatsApp. Walk-ins are always welcome — but at peak times, booking makes the difference.',
    'book.tw': 'Book on Treatwell', 'book.call': 'Call · 320 448 5897',
    'faq.title': 'Frequently asked questions',
    'faq.q1': 'Do I need to book or can I walk in?',
    'faq.a1': 'You can walk in at any location, but at peak times the wait can be long: we recommend booking online on Treatwell or via WhatsApp to choose location, time and barber.',
    'faq.q2': 'What services do you offer?',
    'faq.a2': 'Haircut, beard, cut with shampoo and hot-towel beard, colour and sideburns & neck trim. In Via Vitruvio 43 you\'ll also find the Hammam, Nails & Spa area.',
    'faq.q3': 'How many locations do you have in Milan?',
    'faq.a3': 'Five: Centrale (Via Vitruvio 44), Cenisio (Via Govone 28), Brera (Via Pontaccio 2), Pasteur (Viale Monza 51) and Loreto (Via Padova 37), plus the wellness area in Via Vitruvio 43.',
    'faq.q4': 'How much is a haircut?',
    'faq.a4': 'A haircut starts from €20, beard from €10 and the cut + shampoo + hot-towel beard package is €30. Prices may vary slightly by location.',
    'footer.visit': 'Come and see us', 'footer.follow': 'Follow us',
    'hero.lead2': 'Care as a ritual.', 'footer.credit': 'Demo website — Bespoke Studio',
    'ab.call': 'Call'
  };
  var IT = {};
  [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) {
    IT[el.getAttribute('data-i18n')] = el.innerHTML;
  });

  function applyLang(lang) {
    var dict = lang === 'en' ? EN : IT;
    [].slice.call(document.querySelectorAll('[data-i18n]')).forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (dict[k] != null) el.innerHTML = dict[k];
    });
    root.setAttribute('lang', lang);
    var it = document.querySelector('.lang__it'), en = document.querySelector('.lang__en');
    if (it && en) { it.classList.toggle('is-active', lang === 'it'); en.classList.toggle('is-active', lang === 'en'); }
    var lt = document.getElementById('langToggle');
    if (lt) lt.setAttribute('aria-label', lang === 'it' ? 'Switch language to English' : 'Passa all\'italiano');
    try { localStorage.setItem('nabils-lang', lang); } catch (e) {}
    updateHours(lang);
  }
  var langToggle = document.getElementById('langToggle');
  var curLang = 'it';
  try { curLang = localStorage.getItem('nabils-lang') || 'it'; } catch (e) {}
  if (langToggle) {
    langToggle.addEventListener('click', function () { applyLang(root.getAttribute('lang') === 'it' ? 'en' : 'it'); });
  }
  applyLang(curLang);
  // refresh clock-based status each minute
  setInterval(function () { updateHours(root.getAttribute('lang')); }, 60000);

  /* ---------- lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lightboxImg');
  var lbClose = document.getElementById('lightboxClose');
  var lbLast = null;
  function openLb(src, alt) {
    lbImg.src = src; lbImg.alt = alt || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    lbLast = document.activeElement; lbClose.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    lbImg.src = ''; document.body.style.overflow = '';
    lbLast && lbLast.focus();
  }
  [].slice.call(document.querySelectorAll('.shot')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      openLb(btn.getAttribute('data-full'), img ? img.alt : '');
    });
  });
  lbClose && lbClose.addEventListener('click', closeLb);
  lb && lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeLb(); });

})();
