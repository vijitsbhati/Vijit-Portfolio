// Site-wide behaviour that pairs with polish.css: smooth in-page links and the phone menu.
(function () {
  // Smooth scrolling only for clicked in-page links, so keyboard focus moves without lag.
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains('skip-link') || a.getAttribute('href').length < 2) return;
    var target = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (!target) return;
    e.preventDefault();
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', a.getAttribute('href'));
  });
})();

// Light/dark toggle. The theme itself is applied by an inline script in each page's <head>.
(function () {
  var root = document.documentElement;
  var SUN = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
  var MOON = '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  function current() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'theme-toggle';
  btn.innerHTML = SUN + MOON;

  function sync() {
    var t = current();
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = btn.getAttribute('aria-label');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0e0e13' : '#ffffff');
  }

  btn.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
    document.dispatchEvent(new CustomEvent('themechange', { detail: next }));
  });

  var nav = document.getElementById('navbar');
  var list = nav && nav.querySelector('.nav-links');
  if (list) {
    list.insertAdjacentElement('afterend', btn);
  } else {
    btn.classList.add('theme-toggle--floating');
    document.body.appendChild(btn);
  }
  sync();
})();

(function () {
  var nav = document.getElementById('navbar');
  var list = nav && nav.querySelector('.nav-links');
  if (!nav || !list) return;

  list.id = list.id || 'site-menu';
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'menu-btn';
  btn.setAttribute('aria-controls', list.id);
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span class="menu-btn__bars" aria-hidden="true"></span><span>Menu</span>';
  nav.appendChild(btn);

  function setOpen(open) {
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-locked', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.lastChild.textContent = open ? 'Close' : 'Menu';
    nav.style.setProperty('--nav-h', nav.getBoundingClientRect().height + 'px');
  }

  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('menu-open')); });
  list.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('menu-open')) { setOpen(false); btn.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
})();
