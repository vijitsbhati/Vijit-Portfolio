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
