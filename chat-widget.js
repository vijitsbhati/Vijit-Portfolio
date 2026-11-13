// "Ask Vijit" portfolio chat widget. Renders inside a Shadow DOM so page styles
// (global section/button/input rules on each page) can't leak into it.
(function () {
  if (typeof window === 'undefined' || window.__askVijitLoaded) return;
  window.__askVijitLoaded = true;

  var STORAGE_KEY = 'askVijitChat';
  var EMAIL = 'vijitsinghbhati@gmail.com';
  var SUGGESTIONS = [
    "What's Vijit's most recent work?",
    'Give me the 60-second recruiter pitch',
    'How can I get in touch with Vijit?',
  ];
  var GREETING = "Hi! I'm Vijit's AI assistant. Ask me about his work, case studies or teaching, and I'll point you to the right page.";

  var ICON_SPARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.2 6.6 6.8 2.4-6.8 2.4L12 20.5l-2.2-6.6L3 11.5l6.8-2.4z" fill="currentColor"/></svg>';
  var ICON_RESET = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5.5 11.5L12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var css = `
  :host { all: initial; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :focus-visible { outline: 2px solid #1a1a1a; outline-offset: 2px; }
  svg { width: 20px; height: 20px; display: block; }

  .launch {
    position: fixed; right: 24px; bottom: 24px; z-index: 2147483000;
    display: inline-flex; align-items: center; gap: 8px; min-height: 48px; padding: 0 20px;
    border: none; border-radius: 6px; background: #D6136A; color: #fff; cursor: pointer;
    font: 700 1.05rem/1 'Rajdhani', system-ui, sans-serif; letter-spacing: .02em;
    box-shadow: 0 8px 24px rgba(214,19,106,.3);
    transition: background .15s, transform .15s, opacity .15s, visibility 0s;
  }
  .launch svg { width: 18px; height: 18px; }
  .launch:hover { background: #B80F5A; transform: translateY(-1px); }
  .launch:active { transform: translateY(1px); }
  .launch[aria-expanded="true"] { display: none; }
  .launch.hidden { opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .15s, visibility 0s .15s; }

  .panel {
    position: fixed; right: 24px; bottom: 24px; z-index: 2147483001;
    width: 400px; max-width: calc(100vw - 32px);
    height: 620px; max-height: calc(100vh - 48px);
    display: none; flex-direction: column; overflow: hidden;
    background: #fff; color: #1a1a1a; border: 1px solid rgba(0,0,0,.08); border-radius: 16px;
    box-shadow: 0 24px 64px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.06);
    font: 500 16px/1.5 'Rajdhani', system-ui, sans-serif;
  }
  .panel.open { display: flex; animation: rise .2s ease-out; }
  @keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }

  .head { display: flex; align-items: center; gap: 12px; padding: 14px 12px 14px 18px; border-bottom: 1px solid rgba(0,0,0,.08); }
  .avatar { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: #D6136A; color: #fff; }
  .avatar svg { width: 20px; height: 20px; }
  .who { flex: 1; min-width: 0; }
  .title { font-size: 1.15rem; font-weight: 700; line-height: 1.2; }
  .sub { display: flex; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; align-items: center; gap: 6px; font-size: .88rem; color: #5a5a5a; line-height: 1.3; margin-top: 2px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #1f9d63; flex: none; }
  .icon {
    flex: none; width: 40px; height: 40px; display: grid; place-items: center;
    border: none; border-radius: 10px; background: transparent; color: #4f4f4f; cursor: pointer;
    transition: background .15s, color .15s;
  }
  .icon:hover { background: #f2f2f4; color: #1a1a1a; }

  .log { flex: 1; overflow-y: auto; padding: 20px 18px; display: flex; flex-direction: column; gap: 12px; background: #fafafb; scrollbar-width: thin; }
  .msg { max-width: 88%; padding: 10px 14px; border-radius: 14px; font-size: 1.02rem; line-height: 1.5; overflow-wrap: anywhere; }
  .msg p + p { margin-top: 8px; }
  .msg ul { margin: 6px 0; padding-left: 18px; }
  .msg li + li { margin-top: 4px; }
  .msg strong { font-weight: 700; }
  .bot { align-self: flex-start; background: #fff; border: 1px solid rgba(0,0,0,.08); border-bottom-left-radius: 4px; }
  .bot a { color: #D6136A; font-weight: 700; text-decoration: underline; text-underline-offset: 2px; }
  .bot a:hover { color: #B80F5A; }
  .user { align-self: flex-end; background: #D6136A; color: #fff; border-bottom-right-radius: 4px; }
  .err { align-self: flex-start; background: #fff4f7; border: 1px solid #ffc7da; color: #4f4f4f; }

  .suggest { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
  .suggest-label { font-size: .8rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6b6b6b; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    min-height: 40px; padding: 8px 14px; text-align: left; cursor: pointer;
    background: #fff; color: #1a1a1a; border: 1px solid rgba(214,19,106,.35); border-radius: 999px;
    font: 600 .95rem/1.3 'Rajdhani', system-ui, sans-serif;
    transition: background .15s, border-color .15s;
  }
  .chip:hover { background: #fff0f6; border-color: #D6136A; }

  .typing { display: inline-flex; gap: 4px; align-items: center; height: 20px; }
  .typing span { width: 7px; height: 7px; border-radius: 50%; background: #D6136A; opacity: .3; animation: blink 1s infinite; }
  .typing span:nth-child(2) { animation-delay: .15s; }
  .typing span:nth-child(3) { animation-delay: .3s; }
  @keyframes blink { 0%, 80%, 100% { opacity: .25; } 40% { opacity: 1; } }

  .composer { padding: 12px 16px 6px; background: #fff; border-top: 1px solid rgba(0,0,0,.08); }
  .field {
    display: flex; align-items: flex-end; gap: 6px; padding: 4px 4px 4px 14px;
    border: 1px solid rgba(0,0,0,.18); border-radius: 12px; background: #fff;
    transition: border-color .15s, box-shadow .15s;
  }
  .field:focus-within { border-color: #D6136A; box-shadow: 0 0 0 3px rgba(214,19,106,.15); }
  textarea {
    flex: 1; min-width: 0; resize: none; border: none; outline: none; background: transparent;
    padding: 9px 0; max-height: 120px; overflow-y: hidden; color: #1a1a1a;
    font: 500 1rem/1.4 'Rajdhani', system-ui, sans-serif;
  }
  textarea::placeholder { color: #767676; }
  textarea:focus-visible { outline: none; }
  .send {
    flex: none; width: 40px; height: 40px; display: grid; place-items: center;
    border: none; border-radius: 10px; background: #D6136A; color: #fff; cursor: pointer;
    transition: background .15s, opacity .15s;
  }
  .send:hover { background: #B80F5A; }
  .send:disabled { opacity: .45; cursor: not-allowed; }
  .foot { padding: 4px 16px 12px; font-size: .8rem; color: #6b6b6b; text-align: center; background: #fff; }
  .foot a { color: #D6136A; font-weight: 700; }
  .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  @media (max-width: 520px) {
    .launch { right: 16px; bottom: 16px; }
    .panel { left: 0; right: 0; bottom: 0; width: auto; max-width: none; height: 100dvh; max-height: 100dvh; border-radius: 0; border: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    .panel.open, .typing span { animation: none; }
    .launch, .chip, .icon, .send { transition: none; }
  }
  `;

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (text) node.textContent = text;
    return node;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function safeHref(url) {
    return /^(https:\/\/|mailto:|\/|#)/i.test(url) ? url : null;
  }

  function inline(text) {
    var out = escapeHtml(text);
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      var href = safeHref(url.replace(/&amp;/g, '&'));
      if (!href) return label;
      var external = /^https:\/\//i.test(href);
      return '<a href="' + escapeHtml(href) + '"' + (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + label + '</a>';
    });
    out = out.replace(/(^|[\s(])(https:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return out;
  }

  // Minimal, XSS-safe markdown: paragraphs, bullet lists, bold, links.
  function renderMarkdown(text) {
    var html = '';
    var inList = false;
    text.split(/\r?\n/).forEach(function (raw) {
      var line = raw.trim();
      var bullet = line.match(/^[-*•]\s+(.*)/);
      if (bullet) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += '<li>' + inline(bullet[1]) + '</li>';
        return;
      }
      if (inList) { html += '</ul>'; inList = false; }
      if (line) html += '<p>' + inline(line.replace(/^#+\s*/, '')) + '</p>';
    });
    if (inList) html += '</ul>';
    return html;
  }

  function loadHistory() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
  }
  function saveHistory(h) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(h.slice(-20))); } catch (e) {}
  }

  function init() {
    var host = el('div', { id: 'ask-vijit' });
    document.body.appendChild(host);
    var root = host.attachShadow({ mode: 'open' });

    var style = el('style');
    style.textContent = css;
    root.appendChild(style);

    var launch = el('button', { class: 'launch', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'panel' });
    launch.innerHTML = ICON_SPARK + '<span>Ask Vijit AI</span>';

    var panel = el('div', { class: 'panel', id: 'panel', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'av-title' });
    panel.innerHTML =
      '<div class="head">' +
        '<div class="avatar">' + ICON_SPARK + '</div>' +
        '<div class="who"><div class="title" id="av-title">Ask Vijit AI</div>' +
        '<div class="sub"><span class="dot" aria-hidden="true"></span>Resume, LinkedIn &amp; portfolio</div></div>' +
        '<button type="button" class="icon reset" aria-label="Start a new chat" title="New chat">' + ICON_RESET + '</button>' +
        '<button type="button" class="icon close" aria-label="Close chat" title="Close">' + ICON_CLOSE + '</button>' +
      '</div>' +
      '<div class="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<form class="composer"><label class="sr" for="av-input">Your question</label>' +
        '<div class="field"><textarea id="av-input" rows="1" maxlength="1000" placeholder="Ask about Vijit\'s work…"></textarea>' +
        '<button type="submit" class="send" aria-label="Send">' + ICON_SEND + '</button></div>' +
      '</form>' +
      '<div class="foot">AI can make mistakes. For anything important, <a href="mailto:' + EMAIL + '">email Vijit</a>.</div>';

    root.appendChild(launch);
    root.appendChild(panel);

    var log = panel.querySelector('.log');
    var form = panel.querySelector('.composer');
    var input = panel.querySelector('textarea');
    var send = panel.querySelector('.send');
    var history = loadHistory();
    var busy = false;

    function scrollDown() { log.scrollTop = log.scrollHeight; }

    function addBubble(role, content, isError) {
      var b = el('div', { class: 'msg ' + (isError ? 'err' : role === 'user' ? 'user' : 'bot') });
      if (role === 'user') b.textContent = content;
      else b.innerHTML = renderMarkdown(content);
      log.appendChild(b);
      scrollDown();
      return b;
    }

    function renderAll() {
      log.innerHTML = '';
      addBubble('assistant', GREETING);
      if (!history.length) {
        var wrap = el('div', { class: 'suggest' });
        wrap.appendChild(el('div', { class: 'suggest-label' }, 'Try asking'));
        var chips = el('div', { class: 'chips' });
        SUGGESTIONS.forEach(function (q) {
          var c = el('button', { class: 'chip', type: 'button' }, q);
          c.addEventListener('click', function () { ask(q); });
          chips.appendChild(c);
        });
        wrap.appendChild(chips);
        log.appendChild(wrap);
      }
      history.forEach(function (m) { addBubble(m.role, m.content); });
    }

    function setBusy(state) {
      busy = state;
      send.disabled = state;
      input.setAttribute('aria-busy', String(state));
    }

    function autosize() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      input.style.overflowY = input.scrollHeight > 120 ? 'auto' : 'hidden';
    }

    function ask(question) {
      question = (question || '').trim();
      if (!question || busy) return;
      var suggest = log.querySelector('.suggest');
      if (suggest) suggest.remove();

      history.push({ role: 'user', content: question });
      saveHistory(history);
      addBubble('user', question);
      input.value = '';
      autosize();
      setBusy(true);

      var typing = el('div', { class: 'msg bot', 'aria-label': 'Assistant is typing' });
      typing.innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
      log.appendChild(typing);
      scrollDown();

      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10) }),
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (data) {
            if (!r.ok || !data.reply) throw new Error(data.error || 'Something went wrong.');
            return data.reply;
          });
        })
        .then(function (reply) {
          typing.remove();
          history.push({ role: 'assistant', content: reply });
          saveHistory(history);
          addBubble('assistant', reply);
          if (window.va) window.va('event', { name: 'ask_vijit_message' });
        })
        .catch(function (err) {
          typing.remove();
          history.pop();
          saveHistory(history);
          addBubble('assistant', (err && err.message ? err.message : 'Something went wrong.') +
            ' You can also [email Vijit](mailto:' + EMAIL + ').', true);
        })
        .then(function () {
          setBusy(false);
          input.focus();
        });
    }

    function open() {
      panel.classList.add('open');
      launch.setAttribute('aria-expanded', 'true');
      scrollDown();
      input.focus();
    }
    function close() {
      panel.classList.remove('open');
      launch.setAttribute('aria-expanded', 'false');
      launch.focus();
    }

    launch.addEventListener('click', open);
    panel.querySelector('.close').addEventListener('click', close);
    panel.querySelector('.reset').addEventListener('click', function () {
      if (busy) return;
      history = [];
      saveHistory(history);
      renderAll();
      input.focus();
    });
    panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    input.addEventListener('input', autosize);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input.value); }
    });

    renderAll();
    window.askVijit = function (q) { open(); if (q) ask(q); };
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest && e.target.closest('[data-ask-vijit]');
      if (trigger) { e.preventDefault(); open(); }
    });

    // Avoid two identical "Ask Vijit AI" actions on one screen.
    var inlineTriggers = document.querySelectorAll('[data-ask-vijit]');
    if (inlineTriggers.length && 'IntersectionObserver' in window) {
      var visible = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
        launch.classList.toggle('hidden', visible.size > 0);
      });
      inlineTriggers.forEach(function (n) { io.observe(n); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
