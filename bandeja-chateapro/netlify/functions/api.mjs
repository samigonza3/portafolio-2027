// Bandeja ChateaPro: proxy seguro entre el navegador y la API de ChateaPro.
// El token vive SOLO aqui (variable de entorno). El navegador nunca lo ve.
//
// Variables de entorno:
//   CHATEAPRO_TOKEN         token de API (scopes: Gestionar el flujo, Gestionar equipo)
//   APP_PASSWORD            clave para entrar a la bandeja
//   CHATEAPRO_BASE_URL      opcional, por defecto https://chateapro.app/api
//   TZ_OFFSET_HOURS         opcional, zona horaria para "hoy" (Colombia = -5)
//   UPSTREAM_TZ_OFFSET_HOURS opcional, zona de las fechas que devuelve ChateaPro (por defecto 0 = UTC)
//
// Sin CHATEAPRO_TOKEN la bandeja corre en modo demostracion con datos de ejemplo.

import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const config = { path: '/api/*' };

const env = (k) => (process.env[k] || '').trim();
const BASE = () => (env('CHATEAPRO_BASE_URL') || 'https://chateapro.app/api').replace(/\/+$/, '');
const TZ = () => Number(env('TZ_OFFSET_HOURS') || -5);
const UP_TZ = () => Number(env('UPSTREAM_TZ_OFFSET_HOURS') || 0);

const STATUSES = ['open', 'pending', 'done', 'spam'];
const SESSION_DAYS = 7;

class HttpError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });

/* ---------- utilidades ---------- */

const cache = new Map();
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.exp > Date.now()) return hit.val;
  const val = await fn();
  cache.set(key, { val, exp: Date.now() + ttlMs });
  return val;
}

async function pmap(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    })
  );
  return out;
}

function dayStart(offsetDays = 0) {
  const shifted = new Date(Date.now() + TZ() * 3600e3);
  const base = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
  return Math.floor(base / 1000 - TZ() * 3600) - offsetDays * 86400;
}

function dayKey(offsetDays = 0) {
  return new Date(Date.now() + TZ() * 3600e3 - offsetDays * 86400e3).toISOString().slice(0, 10);
}

// "2026-10-18 13:05:00" (hora de ChateaPro) -> epoch en segundos
function toTs(str) {
  if (!str) return 0;
  const ms = Date.parse(String(str).replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(str) ? '' : 'Z'));
  if (Number.isNaN(ms)) return 0;
  return Math.floor((ms - UP_TZ() * 3600e3) / 1000);
}

/* ---------- sesion ---------- */

const secretKey = () => createHash('sha256').update(`${env('APP_PASSWORD')}|${env('CHATEAPRO_TOKEN')}`).digest();
const sign = (payload) => createHmac('sha256', secretKey()).update(payload).digest('hex');

function makeCookie() {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400);
  return `bp=${exp}.${sign(exp)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86400}`;
}
const clearCookie = () => 'bp=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0';

function isAuthed(req) {
  const raw = (req.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith('bp='));
  if (!raw) return false;
  const [exp, sig] = raw.slice(3).split('.');
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false;
  const good = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got);
}

function samePassword(input) {
  const a = createHash('sha256').update(String(input)).digest();
  const b = createHash('sha256').update(env('APP_PASSWORD')).digest();
  return timingSafeEqual(a, b);
}

const attempts = new Map();
function throttle(ip) {
  const now = Date.now();
  const rec = attempts.get(ip) || { n: 0, t: now };
  if (now - rec.t > 10 * 60e3) {
    rec.n = 0;
    rec.t = now;
  }
  rec.n++;
  attempts.set(ip, rec);
  if (rec.n > 8) throw new HttpError(429, 'Demasiados intentos. Espera 10 minutos.');
}

/* ---------- cliente de ChateaPro ---------- */

async function up(path, { method = 'GET', query, body } = {}) {
  const url = new URL(BASE() + path);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const init = {
    method,
    headers: { Authorization: `Bearer ${env('CHATEAPRO_TOKEN')}`, Accept: 'application/json' },
  };
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
      if ((res.status === 429 || res.status >= 500) && attempt < 2) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text.slice(0, 200) };
      }
      if (!res.ok) {
        if (res.status === 401) throw new HttpError(502, 'ChateaPro no acepto el token. Revisa CHATEAPRO_TOKEN.');
        if (res.status === 403)
          throw new HttpError(502, 'El token no tiene permiso para esta accion (necesita Gestionar el flujo).');
        if (res.status === 429) throw new HttpError(429, 'ChateaPro limito las peticiones. Intenta en unos segundos.');
        throw new HttpError(502, `ChateaPro respondio ${res.status}: ${data.message || 'error'}`);
      }
      return data;
    } catch (e) {
      if (e instanceof HttpError) throw e;
      lastErr = e;
    }
  }
  console.error('upstream', path, lastErr?.message);
  throw new HttpError(504, 'No hubo respuesta de ChateaPro. Intenta de nuevo.');
}

/* ---------- proveedor real ---------- */

const tagNames = (tags) => (tags || []).map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean);

function mapSubscriber(s, openSet) {
  const full = [s.first_name, s.last_name].filter(Boolean).join(' ');
  return {
    user_ns: s.user_ns,
    name: s.name || full || s.phone || 'Sin nombre',
    phone: s.phone || '',
    pic: /^https?:\/\//.test(s.profile_pic || '') ? s.profile_pic : '',
    last_message_ts: toTs(s.last_message_at || s.last_interaction),
    last_message_type: s.last_message_type || '',
    tags: tagNames(s.tags),
    open: openSet ? openSet.has(s.user_ns) : false,
  };
}

async function fetchConversations({ status, startTime, maxPages = 5, userNs }) {
  const rows = [];
  let startId;
  for (let p = 0; p < maxPages; p++) {
    const r = await up('/flow/conversations/data', {
      query: {
        status,
        user_ns: userNs,
        date_type: startTime ? 'created_at' : undefined,
        start_time: startTime,
        start_id: startId,
        limit: 1000,
      },
    });
    const data = Array.isArray(r.data) ? r.data : [];
    rows.push(...data);
    if (data.length < 1000) break;
    const maxId = Math.max(...data.map((d) => Number(d.id) || 0));
    if (!maxId || (startId && maxId < startId)) break;
    startId = maxId + 1;
  }
  return rows;
}

const openConversations = () =>
  cached('open-convs', 30e3, async () => {
    try {
      return await fetchConversations({ status: 'open', maxPages: 2 });
    } catch (e) {
      console.error('open convs', e.message);
      return [];
    }
  });

const live = {
  async overview() {
    return cached('overview', 25e3, async () => {
      const today0 = dayStart(0);
      const week0 = dayStart(6);
      const [counts, today, week] = await Promise.all([
        up('/flow/bot-users-count'),
        fetchConversations({ status: 'all', startTime: today0, maxPages: 2 }),
        fetchConversations({ status: 'all', startTime: week0, maxPages: 5 }),
      ]);
      const byStatus = {};
      for (const r of counts.data || []) byStatus[r.status] = Number(r.num) || 0;
      const keys = Array.from({ length: 7 }, (_, i) => dayKey(6 - i));
      const daily = Object.fromEntries(keys.map((k) => [k, 0]));
      for (const c of week) {
        const k = String(c.created_at || '').slice(0, 10);
        if (k in daily) daily[k]++;
      }
      return {
        today: { conversations: today.length, newContacts: today.filter((c) => Number(c.is_new_bot_user) === 1).length },
        week: {
          conversations: week.length,
          newContacts: week.filter((c) => Number(c.is_new_bot_user) === 1).length,
          daily: keys.map((k) => ({ day: k, n: daily[k] })),
          capped: week.length >= 5000,
        },
        statusCounts: byStatus,
      };
    });
  },

  async meta() {
    return cached('meta', 120e3, async () => {
      const [tags, agents] = await Promise.all([
        up('/flow/tags', { query: { limit: 100 } }).catch(() => ({ data: [] })),
        up('/flow/agents', { query: { limit: 100 } }).catch(() => ({ data: [] })),
      ]);
      return {
        tags: (tags.data || []).map((t) => ({ name: t.name, tag_ns: t.tag_ns })),
        agents: (agents.data || []).map((a) => ({ id: a.id, name: a.name, role: a.role, online: !!a.is_online })),
      };
    });
  },

  async chats({ q, window, status, tag_ns, channel, page }) {
    const pageNum = Math.max(1, Math.min(Number(page) || 1, 1000));
    if (status === 'open') {
      const convs = (await openConversations())
        .slice()
        .sort((a, b) => toTs(b.last_open_at || b.created_at) - toTs(a.last_open_at || a.created_at));
      const seen = new Set();
      const unique = convs.filter((c) => (seen.has(c.user_ns) ? false : seen.add(c.user_ns)));
      const per = 25;
      const slice = unique.slice((pageNum - 1) * per, pageNum * per);
      const infos = await pmap(slice, 5, (c) => up('/subscriber/get-info', { query: { user_ns: c.user_ns } }).catch(() => null));
      const open = new Set(unique.map((c) => c.user_ns));
      return {
        items: infos.filter(Boolean).map((s) => mapSubscriber(s, open)),
        hasMore: unique.length > pageNum * per,
      };
    }
    const query = { limit: 50, page: pageNum, tag_ns, is_channel: channel || undefined };
    if (q) {
      if (/^[+\d\s()-]{6,}$/.test(q)) query.phone = q.replace(/\D/g, '');
      else query.name = q;
    }
    if (window === '24h') query.is_last_message_in_last_24h = 'yes';
    const [r, convs] = await Promise.all([up('/subscribers', { query }), openConversations()]);
    const open = new Set(convs.map((c) => c.user_ns));
    const data = Array.isArray(r.data) ? r.data : [];
    const items = data.map((s) => mapSubscriber(s, open)).sort((a, b) => b.last_message_ts - a.last_message_ts);
    return { items, hasMore: data.length >= 50 };
  },

  async chat(ns) {
    const [info, msgs, convs] = await Promise.all([
      up('/subscriber/get-info', { query: { user_ns: ns } }),
      up('/subscriber/chat-messages', { query: { user_ns: ns, include_bot: 1, include_note: 1, limit: 100 } }),
      up('/flow/conversations/data', { query: { user_ns: ns, status: 'open', limit: 1 } }).catch(() => ({ data: [] })),
    ]);
    const messages = (msgs.data || [])
      .map((m) => ({
        id: m.id,
        type: m.type,
        msg_type: m.msg_type || 'text',
        text: m.content || m.payload?.text || '',
        url: /^https?:\/\//.test(m.payload?.url || '') ? m.payload.url : '',
        ts: Number(m.ts) || 0,
      }))
      .sort((a, b) => a.ts - b.ts);
    const lastIn = messages.filter((m) => m.type === 'in').at(-1)?.ts || 0;
    const fields = (info.user_fields || [])
      .filter((f) => f.value !== null && f.value !== '' && f.value !== undefined)
      .slice(0, 14)
      .map((f) => ({ name: f.name, value: String(f.value) }));
    return {
      contact: {
        ...mapSubscriber(info, new Set((convs.data || []).length ? [ns] : [])),
        email: info.email || '',
        subscribed_ts: toTs(info.subscribed),
        fields,
      },
      messages,
      canSendText: lastIn > 0 && Date.now() / 1000 - lastIn < 24 * 3600,
    };
  },

  send: (ns, content) => up('/subscriber/send-text', { method: 'POST', body: { user_ns: ns, content } }),
  status: (ns, status) => up('/subscriber/move-chat-to', { method: 'POST', body: { user_ns: ns, status } }),
  bot: (ns, action, minutes) =>
    action === 'pause'
      ? up('/subscriber/pause-bot', { method: 'POST', body: { user_ns: ns, minutes } })
      : up('/subscriber/resume-bot', { method: 'POST', body: { user_ns: ns } }),
  tag: (ns, name, remove) =>
    up(remove ? '/subscriber/remove-tag-by-name' : '/subscriber/add-tag-by-name', {
      method: remove ? 'DELETE' : 'POST',
      body: { user_ns: ns, tag_name: name },
    }),
  assign: (ns, agentId) =>
    agentId
      ? up('/subscriber/assign-agent', { method: 'POST', body: { user_ns: ns, agent_id: Number(agentId) } })
      : up('/subscriber/unassign-agent', { method: 'POST', body: { user_ns: ns } }),
};

/* ---------- proveedor demo ---------- */

let demoDb;
function demoData() {
  if (demoDb) return demoDb;
  const now = Math.floor(Date.now() / 1000);
  const mk = (ns, name, phone, status, tags, msgs) => ({
    user_ns: ns,
    name,
    phone,
    status,
    tags,
    botPaused: false,
    agent: null,
    messages: msgs.map(([type, text, ago], i) => ({ id: `${ns}-${i}`, type, msg_type: 'text', text, url: '', ts: now - ago })),
  });
  demoDb = {
    chats: [
      mk('f1', 'Juan Perez', '573001112233', 'open', ['Soporte', 'Nuevo'], [
        ['in', 'Hola, buenas tardes', 900],
        ['out', 'Hola! Soy el asistente virtual. En que te puedo ayudar?', 880],
        ['in', 'Tienen envio a Bogota?', 300],
      ]),
      mk('f2', 'Maria Gomez', '573104445566', 'open', ['Ventas', 'Dropi'], [
        ['in', 'Quiero pedir 2 berberinas contra entrega', 2400],
        ['out', 'Perfecto, te genero la guia de envio.', 2380],
        ['out', 'Generando guia de envio...', 2300],
      ]),
      mk('f3', 'Carlos Ruiz', '573207778899', 'pending', ['Garantia', 'Urgente'], [
        ['in', 'El frasco llego roto', 5400],
        ['out', 'Lamentamos mucho lo ocurrido. Te paso con un asesor.', 5380],
        ['note', 'Pedir foto del empaque antes de reponer.', 5200],
      ]),
      mk('f4', 'Laura Martinez', '573151234567', 'done', ['Ventas'], [
        ['in', 'Gracias, ya me llego el pedido', 30000],
        ['agent', 'Con mucho gusto Laura, que lo disfrutes!', 29000],
      ]),
      mk('f5', 'Andres Torres', '573009876543', 'open', ['Nuevo'], [['in', 'Cuanto cuesta la peptona?', 120]]),
      mk('f6', 'Paola Rios', '573112223344', 'done', [], [
        ['in', 'Puedo pagar con Nequi?', 90000],
        ['out', 'Si, aceptamos Nequi, Bold y contra entrega.', 89900],
      ]),
    ],
    tags: ['Soporte', 'Nuevo', 'Ventas', 'Dropi', 'Garantia', 'Urgente'].map((n) => ({ name: n, tag_ns: `t_${n.toLowerCase()}` })),
    agents: [
      { id: 1, name: 'Samuel', role: 'owner', online: true },
      { id: 2, name: 'Asesor demo', role: 'agent', online: false },
    ],
  };
  return demoDb;
}

const demoItem = (c) => {
  const last = c.messages.at(-1);
  return {
    user_ns: c.user_ns,
    name: c.name,
    phone: c.phone,
    pic: '',
    last_message_ts: last?.ts || 0,
    last_message_type: 'text',
    tags: c.tags,
    open: c.status === 'open',
  };
};
const demoFind = (ns) => {
  const c = demoData().chats.find((x) => x.user_ns === ns);
  if (!c) throw new HttpError(404, 'Chat no encontrado');
  return c;
};

const demo = {
  async overview() {
    const db = demoData();
    const counts = {};
    for (const c of db.chats) counts[c.status] = (counts[c.status] || 0) + 1;
    const vals = [38, 52, 47, 61, 55, 70, 124];
    return {
      today: { conversations: 124, newContacts: 41 },
      week: {
        conversations: vals.reduce((a, b) => a + b, 0),
        newContacts: 212,
        daily: vals.map((n, i) => ({ day: dayKey(6 - i), n })),
        capped: false,
      },
      statusCounts: counts,
    };
  },
  async meta() {
    const db = demoData();
    return { tags: db.tags, agents: db.agents };
  },
  async chats({ q, status, tag_ns }) {
    let list = demoData().chats.slice();
    if (status === 'open') list = list.filter((c) => c.status === 'open');
    if (q) list = list.filter((c) => (c.name + c.phone).toLowerCase().includes(q.toLowerCase()));
    if (tag_ns) {
      const name = demoData().tags.find((t) => t.tag_ns === tag_ns)?.name;
      list = list.filter((c) => c.tags.includes(name));
    }
    const items = list.map(demoItem).sort((a, b) => b.last_message_ts - a.last_message_ts);
    return { items, hasMore: false };
  },
  async chat(ns) {
    const c = demoFind(ns);
    const lastIn = c.messages.filter((m) => m.type === 'in').at(-1)?.ts || 0;
    return {
      contact: { ...demoItem(c), email: '', subscribed_ts: c.messages[0]?.ts || 0, fields: [{ name: 'ciudad', value: 'Cali' }], status: c.status, botPaused: c.botPaused, agent: c.agent },
      messages: c.messages,
      canSendText: Date.now() / 1000 - lastIn < 24 * 3600,
    };
  },
  async send(ns, content) {
    const c = demoFind(ns);
    c.messages.push({ id: `${ns}-${Date.now()}`, type: 'agent', msg_type: 'text', text: content, url: '', ts: Math.floor(Date.now() / 1000) });
    return { status: 'ok' };
  },
  async status(ns, status) {
    demoFind(ns).status = status;
    return { status: 'ok' };
  },
  async bot(ns, action) {
    demoFind(ns).botPaused = action === 'pause';
    return { status: 'ok' };
  },
  async tag(ns, name, remove) {
    const c = demoFind(ns);
    c.tags = remove ? c.tags.filter((t) => t !== name) : [...new Set([...c.tags, name])];
    return { status: 'ok' };
  },
  async assign(ns, agentId) {
    demoFind(ns).agent = agentId ? Number(agentId) : null;
    return { status: 'ok' };
  },
};

/* ---------- rutas ---------- */

async function route(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/(\.netlify\/functions\/api|api)/, '') || '/';
  const method = req.method;
  const isDemo = !env('CHATEAPRO_TOKEN');
  const hasPw = !!env('APP_PASSWORD');
  const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for') || 'local';

  if (path === '/session' && method === 'GET') {
    return json({
      mode: isDemo ? 'demo' : 'live',
      needsSetup: !isDemo && !hasPw,
      authed: isDemo || (hasPw && isAuthed(req)),
    });
  }

  if (path === '/login' && method === 'POST') {
    if (isDemo) return json({ ok: true });
    if (!hasPw) throw new HttpError(503, 'Falta definir APP_PASSWORD en Netlify.');
    throttle(ip);
    const body = await req.json().catch(() => ({}));
    if (!samePassword(body.password || '')) throw new HttpError(401, 'Clave incorrecta.');
    attempts.delete(ip);
    return json({ ok: true }, 200, { 'Set-Cookie': makeCookie() });
  }

  if (path === '/logout' && method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': clearCookie() });

  if (!isDemo) {
    if (!hasPw) throw new HttpError(503, 'Falta definir APP_PASSWORD en Netlify.');
    if (!isAuthed(req)) throw new HttpError(401, 'Sesion requerida.');
  }
  if (method !== 'GET' && req.headers.get('x-bandeja') !== '1') throw new HttpError(403, 'Peticion no permitida.');

  const p = isDemo ? demo : live;

  if (path === '/overview' && method === 'GET') return json(await p.overview());
  if (path === '/meta' && method === 'GET') return json(await p.meta());
  if (path === '/chats' && method === 'GET') {
    const g = (k) => url.searchParams.get(k) || undefined;
    return json(
      await p.chats({ q: (g('q') || '').trim().slice(0, 80), window: g('window'), status: g('status'), tag_ns: g('tag_ns'), channel: g('channel'), page: g('page') })
    );
  }

  const m = path.match(/^\/chat\/([^/]+)(?:\/(send|status|bot|tag|assign))?$/);
  if (m) {
    const ns = decodeURIComponent(m[1]);
    if (!/^[\w.:-]{1,80}$/.test(ns)) throw new HttpError(400, 'Identificador invalido.');
    const action = m[2];
    if (!action && method === 'GET') return json(await p.chat(ns));
    if (action && method === 'POST') {
      const b = await req.json().catch(() => ({}));
      if (action === 'send') {
        const content = String(b.content || '').trim();
        if (!content || content.length > 4000) throw new HttpError(400, 'Mensaje vacio o demasiado largo.');
        return json(await p.send(ns, content));
      }
      if (action === 'status') {
        if (!STATUSES.includes(b.status)) throw new HttpError(400, 'Estado invalido.');
        return json(await p.status(ns, b.status));
      }
      if (action === 'bot') {
        if (!['pause', 'resume'].includes(b.action)) throw new HttpError(400, 'Accion invalida.');
        const minutes = Math.max(1, Math.min(Number(b.minutes) || 30, 60 * 24 * 7));
        return json(await p.bot(ns, b.action, minutes));
      }
      if (action === 'tag') {
        const name = String(b.name || '').trim().slice(0, 60);
        if (!name) throw new HttpError(400, 'Etiqueta vacia.');
        return json(await p.tag(ns, name, !!b.remove));
      }
      if (action === 'assign') return json(await p.assign(ns, b.agent_id || null));
    }
  }

  throw new HttpError(404, 'Ruta no encontrada.');
}

export default async (req) => {
  try {
    return await route(req);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.publicMessage }, e.status);
    console.error('api', e);
    return json({ error: 'Error inesperado en el servidor.' }, 500);
  }
};
