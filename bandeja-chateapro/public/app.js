(() => {
  'use strict';

  /* ---------- utilidades ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto', style: 'short' });
  const nf = new Intl.NumberFormat('es-CO');

  // Constructor DOM sin innerHTML: el contenido de los mensajes es de terceros.
  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) {
      if (c == null || c === false) continue;
      e.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return e;
  }

  function ago(ts) {
    if (!ts) return '';
    const s = Math.round(ts - Date.now() / 1000);
    const a = Math.abs(s);
    if (a < 60) return 'ahora';
    if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
    if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
    return rtf.format(Math.round(s / 86400), 'day');
  }
  const clock = (ts) => new Date(ts * 1000).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const dayLabel = (ts) => new Date(ts * 1000).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' });
  const initials = (n) => (n || '?').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  let toastTimer;
  function toast(msg, err) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.className = 'toast'), 3200);
  }

  async function api(path, { method = 'GET', body } = {}) {
    const res = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Bandeja': '1' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== '/login') {
      showGate();
      throw new Error('Sesión vencida');
    }
    if (!res.ok) throw new Error(data.error || 'Error de red');
    return data;
  }

  /* ---------- estado ---------- */
  const S = {
    mode: 'live',
    meta: { tags: [], agents: [] },
    f: { q: '', window: '24h', status: 'all', channel: '', tag_ns: '' },
    page: 1,
    chats: [],
    hasMore: false,
    sel: null,
    thread: null,
    busy: false,
  };

  /* ---------- acceso ---------- */
  function showGate(setup) {
    $('#shell').hidden = true;
    $('#gate').hidden = false;
    if (setup) {
      $('#gate-title').textContent = 'Falta la clave';
      $('#gate-text').textContent = 'Define la variable APP_PASSWORD en Netlify y vuelve a desplegar. Sin clave la bandeja no muestra datos reales.';
      $('#login-form').hidden = true;
    }
  }

  $('#login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('#login-error').textContent = '';
    try {
      await api('/login', { method: 'POST', body: { password: $('#pw').value } });
      $('#pw').value = '';
      boot();
    } catch (err) {
      $('#login-error').textContent = err.message;
    }
  });

  $('#btn-logout').addEventListener('click', async () => {
    await api('/logout', { method: 'POST' }).catch(() => {});
    location.reload();
  });

  /* ---------- panel gerencial ---------- */
  const STATUS_LABEL = { open: 'Abiertos', pending: 'Pendientes', done: 'Resueltos', spam: 'Spam' };

  function spark(points) {
    const W = 220, H = 44, max = Math.max(1, ...points.map((p) => p.n));
    const xs = points.map((_, i) => (i / (points.length - 1)) * W);
    const ys = points.map((p) => H - 4 - (p.n / max) * (H - 10));
    const d = xs.map((x, i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    const area = document.createElementNS(ns, 'path');
    area.setAttribute('d', `${d} L${W},${H} L0,${H} Z`);
    area.setAttribute('fill', 'rgba(62,123,255,.18)');
    const line = document.createElementNS(ns, 'path');
    line.setAttribute('d', d);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', '#3e7bff');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-linecap', 'round');
    line.setAttribute('vector-effect', 'non-scaling-stroke');
    const last = document.createElementNS(ns, 'circle');
    last.setAttribute('cx', xs.at(-1));
    last.setAttribute('cy', ys.at(-1));
    last.setAttribute('r', '3.5');
    last.setAttribute('fill', '#7fa8ff');
    svg.append(area, line, last);
    return svg;
  }

  async function loadOverview() {
    try {
      const o = await api('/overview');
      $('#m-today').textContent = nf.format(o.today.conversations);
      $('#m-today-sub').textContent = `${nf.format(o.today.newContacts)} contactos nuevos`;
      $('#m-week').textContent = nf.format(o.week.conversations) + (o.week.capped ? '+' : '');
      $('#m-week-sub').textContent = `${nf.format(o.week.newContacts)} contactos nuevos`;
      const sp = $('#spark');
      sp.replaceChildren(spark(o.week.daily));
      const box = $('#m-status');
      box.replaceChildren();
      const entries = Object.entries(o.statusCounts).filter(([, n]) => n > 0);
      if (!entries.length) box.append(h('span', { class: 'muted tiny', text: 'Sin datos' }));
      for (const [k, n] of entries) box.append(h('span', { class: `pill ${k}` }, STATUS_LABEL[k] || k, h('b', { text: nf.format(n) })));
    } catch (err) {
      if (err.message !== 'Sesión vencida') toast('Panel: ' + err.message, true);
    }
  }

  /* ---------- lista ---------- */
  function renderList() {
    const box = $('#chat-list');
    const keep = box.scrollTop;
    box.replaceChildren();
    if (!S.chats.length) {
      box.append(h('p', { class: 'muted', text: S.busy ? 'Cargando...' : 'No hay conversaciones con estos filtros.' }));
    }
    for (const c of S.chats) {
      const item = h(
        'button',
        { class: 'chat-item' + (S.sel === c.user_ns ? ' is-active' : ''), type: 'button', role: 'listitem', 'data-ns': c.user_ns, onclick: () => openChat(c.user_ns) },
        h('div', { class: 'avatar' }, c.pic ? h('img', { src: c.pic, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' }) : initials(c.name)),
        h('div', { style: 'min-width:0' }, h('div', { class: 'ci-name', text: c.name }), h('div', { class: 'ci-line', text: c.phone ? '+' + c.phone.replace(/^\+/, '') : 'Sin teléfono' })),
        h('div', { class: 'ci-meta' }, h('span', { text: ago(c.last_message_ts) }), h('span', { class: 'dot' + (c.open ? ' open' : ''), title: c.open ? 'Abierto' : 'Sin conversación abierta' })),
        h('div', { class: 'ci-reveal' }, h('div', null, c.tags.length ? c.tags.map((t) => h('span', { class: 'tag', text: t })) : h('span', { class: 'tag', text: 'Sin etiquetas' })))
      );
      box.append(item);
    }
    box.scrollTop = keep;
    $('#btn-more').hidden = !S.hasMore;
  }

  async function loadChats(reset = true) {
    if (reset) S.page = 1;
    S.busy = true;
    try {
      const p = new URLSearchParams({ page: S.page });
      for (const [k, v] of Object.entries(S.f)) if (v) p.set(k, v);
      const r = await api('/chats?' + p);
      S.chats = reset ? r.items : S.chats.concat(r.items.filter((n) => !S.chats.some((o) => o.user_ns === n.user_ns)));
      S.hasMore = r.hasMore;
    } catch (err) {
      if (err.message !== 'Sesión vencida') toast(err.message, true);
    } finally {
      S.busy = false;
      renderList();
    }
  }

  let qTimer;
  $('#q').addEventListener('input', (e) => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => {
      S.f.q = e.target.value.trim();
      loadChats();
    }, 350);
  });
  for (const [id, key] of [['#f-window', 'window'], ['#f-channel', 'channel'], ['#f-tag', 'tag_ns']]) {
    $(id).addEventListener('change', (e) => {
      S.f[key] = e.target.value;
      loadChats();
    });
  }
  document.querySelectorAll('.seg-btn').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach((x) => x.classList.toggle('is-on', x === b));
      S.f.status = b.dataset.status;
      loadChats();
    })
  );
  $('#btn-more').addEventListener('click', () => {
    S.page++;
    loadChats(false);
  });
  $('#btn-refresh').addEventListener('click', () => {
    loadOverview();
    loadChats();
    if (S.sel) loadThread(true);
  });

  /* ---------- conversacion ---------- */
  function setView(v) {
    $('#shell').dataset.view = v;
  }
  $('#btn-back').addEventListener('click', () => setView('list'));

  async function openChat(ns) {
    S.sel = ns;
    S.thread = null;
    $('#thread-empty').hidden = true;
    $('#thread-body').hidden = false;
    $('#messages').replaceChildren(h('p', { class: 'muted', text: 'Cargando conversación...' }));
    document.querySelectorAll('.chat-item').forEach((el) => el.classList.toggle('is-active', el.dataset.ns === ns));
    setView('thread');
    await loadThread(false);
    $('#c-text').focus({ preventScroll: true });
  }

  async function loadThread(silent) {
    const ns = S.sel;
    if (!ns) return;
    try {
      const t = await api('/chat/' + encodeURIComponent(ns));
      if (S.sel !== ns) return;
      S.thread = t;
      renderThread(silent);
    } catch (err) {
      if (!silent && err.message !== 'Sesión vencida') toast(err.message, true);
    }
  }

  function renderThread(silent) {
    const { contact: c, messages, canSendText } = S.thread;
    const av = $('#t-avatar');
    av.replaceChildren(c.pic ? h('img', { src: c.pic, alt: '', referrerpolicy: 'no-referrer' }) : initials(c.name));
    $('#t-name').textContent = c.name;
    $('#t-sub').textContent = [c.phone && '+' + c.phone.replace(/^\+/, ''), c.email, c.last_message_ts && 'Último mensaje ' + ago(c.last_message_ts)].filter(Boolean).join(' · ');

    const st = $('#t-state');
    st.replaceChildren();
    if (c.open || c.status === 'open') st.append(h('span', { class: 'state-chip open', text: 'Abierto' }));
    if (c.botPaused) st.append(h('span', { class: 'state-chip bot', text: 'Bot en pausa' }));
    if (document.activeElement !== $('#a-status')) $('#a-status').value = c.status || (c.open ? 'open' : 'done');

    const ag = $('#a-agent');
    if (document.activeElement !== ag) {
      ag.replaceChildren(h('option', { value: '', text: 'Sin asignar' }), ...S.meta.agents.map((a) => h('option', { value: a.id, text: a.name + (a.online ? ' (en línea)' : '') })));
      ag.value = c.agent || '';
    }

    const tr = $('#t-tags');
    if (!tr.contains(document.activeElement)) {
      tr.replaceChildren(
        ...c.tags.map((t) =>
          h('span', { class: 'tag tag-x' }, t, h('button', { type: 'button', 'aria-label': 'Quitar ' + t, onclick: () => tagAction(t, true), text: '×' }))
        ),
        h('input', { class: 'input small tag-add', list: 'tag-options', placeholder: '+ etiqueta', 'aria-label': 'Agregar etiqueta', onkeydown: (e) => {
          if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v) tagAction(v, false); }
        } }),
        h('datalist', { id: 'tag-options' }, S.meta.tags.map((t) => h('option', { value: t.name })))
      );
    }

    const box = $('#messages');
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
    box.replaceChildren();
    let lastDay = '';
    for (const m of messages) {
      const d = dayLabel(m.ts);
      if (d !== lastDay) {
        box.append(h('div', { class: 'msg system', text: d }));
        lastDay = d;
      }
      const who = { in: '', out: 'Bot', agent: 'Agente', note: 'Nota privada', system: '' }[m.type] || '';
      const body = m.text || (m.url ? '' : `[${m.msg_type}]`);
      box.append(
        h('div', { class: 'msg ' + (['in', 'out', 'agent', 'note', 'system'].includes(m.type) ? m.type : 'in') },
          who && h('div', { class: 'who', text: who }),
          body,
          m.url && h('div', null, h('a', { href: m.url, target: '_blank', rel: 'noopener noreferrer', text: `Abrir ${m.msg_type !== 'text' ? m.msg_type : 'archivo'}` })),
          h('small', { text: clock(m.ts) })
        )
      );
    }
    if (!silent || nearBottom) box.scrollTop = box.scrollHeight;

    const send = $('#c-send');
    const ta = $('#c-text');
    const notice = $('#c-notice');
    ta.disabled = send.disabled = !canSendText;
    notice.hidden = canSendText;
    notice.textContent = 'Pasaron más de 24 h desde el último mensaje del cliente. WhatsApp solo permite plantillas aprobadas, así que el texto libre está desactivado.';
  }

  async function act(label, fn) {
    try {
      await fn();
      toast(label);
      await loadThread(true);
      loadChats();
      loadOverview();
    } catch (err) {
      toast(err.message, true);
    }
  }
  const chatPath = (a) => `/chat/${encodeURIComponent(S.sel)}/${a}`;
  const post = (a, body) => api(chatPath(a), { method: 'POST', body });
  const tagAction = (name, remove) => act(remove ? 'Etiqueta quitada' : 'Etiqueta agregada', () => post('tag', { name, remove }));

  $('#a-status').addEventListener('change', (e) => act('Estado actualizado', () => post('status', { status: e.target.value })));
  $('#a-agent').addEventListener('change', (e) => act('Asignación actualizada', () => post('assign', { agent_id: e.target.value || null })));
  $('#a-pause').addEventListener('click', () => act('Bot en pausa', () => post('bot', { action: 'pause', minutes: Number($('#a-minutes').value) })));
  $('#a-resume').addEventListener('click', () => act('Bot reanudado', () => post('bot', { action: 'resume' })));

  async function sendMessage() {
    const ta = $('#c-text');
    const content = ta.value.trim();
    if (!content || !S.sel) return;
    const btn = $('#c-send');
    btn.disabled = true;
    try {
      await post('send', { content });
      ta.value = '';
      toast('Mensaje enviado');
      await loadThread(false);
      loadChats();
    } catch (err) {
      toast(err.message, true);
    } finally {
      btn.disabled = !S.thread?.canSendText;
    }
  }
  $('#composer').addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
  });
  $('#c-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ---------- arranque ---------- */
  let timers = [];
  function startPolling() {
    timers.forEach(clearInterval);
    timers = [
      setInterval(() => {
        if (document.hidden) return;
        loadChats();
        loadOverview();
      }, 25000),
      setInterval(() => {
        if (!document.hidden && S.sel) loadThread(true);
      }, 10000),
    ];
  }

  async function boot() {
    let s;
    try {
      s = await api('/session');
    } catch {
      return showGate();
    }
    if (s.needsSetup) return showGate(true);
    if (!s.authed) return showGate();
    S.mode = s.mode;
    $('#gate').hidden = true;
    $('#shell').hidden = false;
    $('#badge-demo').hidden = s.mode !== 'demo';
    $('#btn-logout').hidden = s.mode === 'demo';
    try {
      S.meta = await api('/meta');
    } catch { /* las etiquetas y agentes son opcionales */ }
    const sel = $('#f-tag');
    sel.replaceChildren(h('option', { value: '', text: 'Todas las etiquetas' }), ...S.meta.tags.map((t) => h('option', { value: t.tag_ns, text: t.name })));
    loadOverview();
    await loadChats();
    startPolling();
  }

  boot();
})();
