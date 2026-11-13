// "Ask Vijit" portfolio chat widget. Self-contained: injects its own styles and DOM.
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
  var GREETING = "Hi! I'm Vijit's AI assistant. Ask me about his work, experience, or teaching — I'll keep it short and point you to the right place.";

  var css = `
  .av-launch{position:fixed;right:24px;bottom:24px;z-index:9998;display:flex;align-items:center;gap:8px;
    min-height:48px;padding:12px 20px;border:none;border-radius:6px;background:#D6136A;color:#fff;cursor:pointer;
    font:600 1.05rem/1 'Rajdhani',sans-serif;letter-spacing:.02em;box-shadow:0 8px 24px rgba(214,19,106,.3);
    transition:transform .2s ease,box-shadow .2s ease}
  .av-launch:hover{background:#B80F5A;transform:translateY(-1px)}
  .av-launch:active{transform:translateY(1px)}
  .av-launch:focus-visible,.av-panel button:focus-visible,.av-panel textarea:focus-visible,.av-panel a:focus-visible{outline:2px solid #1a1a1a;outline-offset:2px}
  .av-launch[aria-expanded="true"]{display:none}
  .av-launch.av-hidden{opacity:0;transform:translateY(8px);pointer-events:none;visibility:hidden;transition:opacity .15s,transform .15s,visibility 0s .15s}
  .av-spark{font-size:1.1rem;line-height:1}
  .av-panel{position:fixed;right:24px;bottom:24px;z-index:9999;width:380px;max-width:calc(100vw - 32px);
    height:560px;max-height:calc(100vh - 48px);display:none;flex-direction:column;background:#fff;color:#1a1a1a;
    border:1px solid rgba(0,0,0,.08);border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.18);overflow:hidden;
    font-family:'Rajdhani',sans-serif}
  .av-panel.av-open{display:flex;animation:av-in .22s ease-out}
  @keyframes av-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
  .av-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:#1a1a1a;color:#fff}
  .av-title{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1.15rem}
  .av-dot{width:9px;height:9px;border-radius:50%;background:#2ecc8a;box-shadow:0 0 0 3px rgba(46,204,138,.25)}
  .av-sub{font-weight:500;font-size:.85rem;opacity:.7;margin-top:2px}
  .av-head-btns{display:flex;gap:4px}
  .av-icon{background:transparent;border:none;color:#fff;cursor:pointer;width:44px;height:44px;border-radius:8px;
    font-size:1.1rem;display:grid;place-items:center;opacity:.8}
  .av-icon:hover{opacity:1;background:rgba(255,255,255,.12)}
  .av-log{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;background:#f9f9fa}
  .av-msg{max-width:86%;padding:10px 14px;border-radius:14px;font-size:1.02rem;line-height:1.4;font-weight:500;word-wrap:break-word}
  .av-msg p{margin:0 0 6px}.av-msg p:last-child{margin:0}
  .av-msg ul{margin:4px 0;padding-left:18px}.av-msg li{margin:2px 0}
  .av-bot{align-self:flex-start;background:#fff;border:1px solid rgba(0,0,0,.08);border-bottom-left-radius:4px}
  .av-user{align-self:flex-end;background:#D6136A;color:#fff;border-bottom-right-radius:4px}
  .av-bot a{color:#d81b6a;font-weight:600;text-decoration:underline;text-underline-offset:2px}
  .av-err{align-self:flex-start;background:#fff4f7;border:1px solid #ffc7da;color:#5e5e5e}
  .av-chips{display:flex;flex-direction:column;gap:8px;margin-top:4px}
  .av-chip{min-height:44px;text-align:left;background:#fff;border:1px solid rgba(255,42,133,.35);color:#1a1a1a;border-radius:12px;
    padding:9px 12px;cursor:pointer;font:600 .98rem/1.3 'Rajdhani',sans-serif;transition:background .15s,border-color .15s}
  .av-chip:hover{background:#fff0f6;border-color:#FF2A85}
  .av-chip::before{content:"✦ ";color:#D6136A}
  .av-typing{display:inline-flex;gap:4px;align-items:center;height:18px}
  .av-typing span{width:6px;height:6px;border-radius:50%;background:#FF2A85;opacity:.4;animation:av-blink 1s infinite}
  .av-typing span:nth-child(2){animation-delay:.15s}.av-typing span:nth-child(3){animation-delay:.3s}
  @keyframes av-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}
  .av-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(0,0,0,.08);background:#fff}
  .av-input{flex:1;resize:none;border:1px solid rgba(0,0,0,.15);border-radius:12px;padding:10px 12px;max-height:110px;
    font:500 1rem/1.35 'Rajdhani',sans-serif;color:#1a1a1a}
  .av-input:focus,.av-input:focus-visible{border-color:#D6136A;box-shadow:0 0 0 2px rgba(214,19,106,.25);outline:none}
  .av-send{min-height:44px;border:none;border-radius:6px;background:#D6136A;color:#fff;padding:0 16px;cursor:pointer;font:700 1rem 'Rajdhani',sans-serif}
  .av-send:disabled{opacity:.5;cursor:not-allowed}
  .av-foot{padding:0 12px 10px;font-size:.78rem;color:#5e5e5e;background:#fff;text-align:center}
  .av-foot a{color:#D6136A;font-weight:600}
  .av-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
  @media (max-width:520px){
    .av-panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}
    .av-launch{right:16px;bottom:16px}
  }
  @media (prefers-reduced-motion:reduce){.av-panel.av-open,.av-typing span,.av-launch{animation:none;transition:none}}
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
    var lines = text.split(/\r?\n/);
    var html = '';
    var inList = false;
    lines.forEach(function (raw) {
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
    var style = el('style');
    style.textContent = css;
    document.head.appendChild(style);

    var launch = el('button', { class: 'av-launch', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'av-panel' });
    launch.innerHTML = '<span class="av-spark" aria-hidden="true">✦</span>Ask Vijit AI';

    var panel = el('section', { class: 'av-panel', id: 'av-panel', role: 'dialog', 'aria-label': 'Ask Vijit AI chat' });
    panel.innerHTML =
      '<div class="av-head"><div><div class="av-title"><span class="av-dot" aria-hidden="true"></span>Ask Vijit AI</div>' +
      '<div class="av-sub">Answers from Vijit\'s resume &amp; LinkedIn</div></div>' +
      '<div class="av-head-btns"><button type="button" class="av-icon av-reset" aria-label="Start a new chat" title="New chat">↺</button>' +
      '<button type="button" class="av-icon av-close" aria-label="Close chat" title="Close">✕</button></div></div>' +
      '<div class="av-log" aria-live="polite" aria-relevant="additions"></div>' +
      '<form class="av-form"><label class="av-sr" for="av-input">Your question</label>' +
      '<textarea id="av-input" class="av-input" rows="1" maxlength="1000" placeholder="Ask about Vijit\'s work…"></textarea>' +
      '<button type="submit" class="av-send">Send</button></form>' +
      '<div class="av-foot">AI can make mistakes — for anything important, <a href="mailto:' + EMAIL + '">email Vijit</a>.</div>';

    document.body.appendChild(launch);
    document.body.appendChild(panel);

    var log = panel.querySelector('.av-log');
    var form = panel.querySelector('.av-form');
    var input = panel.querySelector('.av-input');
    var send = panel.querySelector('.av-send');
    var history = loadHistory();
    var busy = false;

    function scrollDown() { log.scrollTop = log.scrollHeight; }

    function addBubble(role, content, isError) {
      var b = el('div', { class: 'av-msg ' + (isError ? 'av-err' : role === 'user' ? 'av-user' : 'av-bot') });
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
        var chips = el('div', { class: 'av-chips' });
        SUGGESTIONS.forEach(function (q) {
          var c = el('button', { class: 'av-chip', type: 'button' }, q);
          c.addEventListener('click', function () { ask(q); });
          chips.appendChild(c);
        });
        log.appendChild(chips);
      }
      history.forEach(function (m) { addBubble(m.role, m.content); });
    }

    function setBusy(state) {
      busy = state;
      send.disabled = state;
      input.setAttribute('aria-busy', String(state));
    }

    function ask(question) {
      question = (question || '').trim();
      if (!question || busy) return;
      var chips = log.querySelector('.av-chips');
      if (chips) chips.remove();

      history.push({ role: 'user', content: question });
      saveHistory(history);
      addBubble('user', question);
      input.value = '';
      autosize();
      setBusy(true);

      var typing = el('div', { class: 'av-msg av-bot', 'aria-label': 'Assistant is typing' });
      typing.innerHTML = '<span class="av-typing"><span></span><span></span><span></span></span>';
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

    function autosize() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 110) + 'px';
    }

    function open() {
      panel.classList.add('av-open');
      launch.setAttribute('aria-expanded', 'true');
      scrollDown();
      input.focus();
    }
    function close() {
      panel.classList.remove('av-open');
      launch.setAttribute('aria-expanded', 'false');
      launch.focus();
    }

    launch.addEventListener('click', open);
    panel.querySelector('.av-close').addEventListener('click', close);
    panel.querySelector('.av-reset').addEventListener('click', function () {
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
      var trigger = e.target.closest('[data-ask-vijit]');
      if (trigger) { e.preventDefault(); open(); }
    });

    // Avoid two identical "Ask Vijit AI" actions on one screen.
    var inline = document.querySelectorAll('[data-ask-vijit]');
    if (inline.length && 'IntersectionObserver' in window) {
      var visible = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { en.isIntersecting ? visible.add(en.target) : visible.delete(en.target); });
        launch.classList.toggle('av-hidden', visible.size > 0);
      });
      inline.forEach(function (n) { io.observe(n); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
