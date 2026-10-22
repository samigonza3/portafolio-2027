// Prueba de humo: simula la API de ChateaPro (mismas rutas y formas del OpenAPI) y recorre la bandeja.
import http from 'node:http';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/api.mjs';

const calls = [];
const now = Math.floor(Date.now() / 1000);
const fmt = (ts) => new Date(ts * 1000).toISOString().slice(0, 19).replace('T', ' ');
const subs = [
  { name: 'Ana Prueba', user_ns: 'f1u1', phone: '573001112233', profile_pic: '', last_message_at: fmt(now - 120), last_message_type: 'text', tags: [{ name: 'Ventas', tag_ns: 't1' }], user_fields: [], last_interaction: fmt(now - 120) },
  { name: 'Beto Viejo', user_ns: 'f1u2', phone: '573104445566', last_message_at: fmt(now - 9000), tags: [], user_fields: [] },
];
const convRows = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, user_ns: 'f1u1', created_at: new Date().toISOString().slice(0, 10) + ' 10:00:00', is_new_bot_user: i % 2 }));

const mock = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let body = '';
  for await (const c of req) body += c;
  calls.push({ m: req.method, p: url.pathname, q: Object.fromEntries(url.searchParams), b: body && JSON.parse(body), auth: req.headers.authorization });
  const out = (o, s = 200) => (res.writeHead(s, { 'Content-Type': 'application/json' }), res.end(JSON.stringify(o)));
  if (req.headers.authorization !== 'Bearer TOKEN_OK') return out({ message: 'Unauthenticated.' }, 401);
  const p = url.pathname;
  if (p === '/flow/bot-users-count') return out({ data: [{ status: 'open', num: 7 }, { status: 'done', num: 90 }], status: 'ok' });
  if (p === '/flow/conversations/data') {
    if (url.searchParams.get('status') === 'open') return out({ data: [{ id: 1, user_ns: 'f1u1', last_open_at: fmt(now - 100) }], status: 'ok' });
    return out({ data: convRows(url.searchParams.get('start_time') ? 4 : 1), status: 'ok' });
  }
  if (p === '/flow/tags') return out({ data: [{ name: 'Ventas', tag_ns: 't1' }] });
  if (p === '/flow/agents') return out({ data: [{ id: 5, name: 'Samuel', role: 'owner', is_online: true }] });
  if (p === '/subscribers') return out({ data: subs });
  if (p === '/subscriber/get-info') return out({ ...subs[0], email: 'a@x.co', user_fields: [{ name: 'ciudad', value: 'Cali' }, { name: 'vacio', value: '' }] });
  if (p === '/subscriber/chat-messages')
    return out({ data: [
      { id: 2, type: 'out', msg_type: 'text', content: 'Hola, soy el bot', ts: now - 3000 },
      { id: 1, type: 'in', msg_type: 'text', content: '<img src=x onerror=alert(1)>', ts: now - 3100 },
      { id: 3, type: 'in', msg_type: 'image', payload: { url: 'https://cdn.x/p.jpg' }, ts: now - 100 },
    ] });
  if (req.method === 'POST' || req.method === 'DELETE') return out({ status: 'ok' });
  return out({ message: 'nope' }, 404);
});
await new Promise((r) => mock.listen(0, r));
process.env.CHATEAPRO_BASE_URL = `http://127.0.0.1:${mock.address().port}`;

const call = (path, { method = 'GET', body, cookie, csrf = true } = {}) =>
  handler(new Request('http://t.local/api' + path, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...(method !== 'GET' && csrf ? { 'x-bandeja': '1' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  }));
const j = async (r) => r.json();

/* 1. modo demostracion */
delete process.env.CHATEAPRO_TOKEN;
let r = await call('/session');
assert.deepEqual(await j(r), { mode: 'demo', needsSetup: false, authed: true });
r = await call('/chats');
const demo = await j(r);
assert.ok(demo.items.length >= 5, 'demo lista chats');
r = await call('/chat/f1');
assert.equal((await j(r)).messages.length, 3);
r = await call('/chat/f1/send', { method: 'POST', body: { content: 'hola demo' } });
assert.equal(r.status, 200);
assert.equal((await j(await call('/chat/f1'))).messages.at(-1).text, 'hola demo');
console.log('ok demo');

/* 2. modo real sin clave */
process.env.CHATEAPRO_TOKEN = 'TOKEN_OK';
delete process.env.APP_PASSWORD;
r = await call('/chats');
assert.equal(r.status, 503);
assert.equal((await j(await call('/session'))).needsSetup, true);
console.log('ok sin APP_PASSWORD no expone datos');

/* 3. modo real con clave */
process.env.APP_PASSWORD = 'clave-secreta';
assert.equal((await call('/chats')).status, 401, 'sin sesion = 401');
r = await call('/login', { method: 'POST', body: { password: 'mala' } });
assert.equal(r.status, 401);
r = await call('/login', { method: 'POST', body: { password: 'clave-secreta' } });
assert.equal(r.status, 200);
const cookie = r.headers.get('set-cookie').split(';')[0];
assert.match(r.headers.get('set-cookie'), /HttpOnly/);
assert.equal((await j(await call('/session', { cookie }))).authed, true);
assert.equal((await call('/chats', { cookie: 'bp=999999999999.deadbeef' })).status, 401, 'cookie falsa');

const ov = await j(await call('/overview', { cookie }));
assert.equal(ov.statusCounts.open, 7);
assert.equal(ov.week.daily.length, 7);
assert.equal(ov.today.conversations, 4);

const meta = await j(await call('/meta', { cookie }));
assert.equal(meta.agents[0].id, 5);

const chats = await j(await call('/chats?window=24h', { cookie }));
assert.equal(chats.items[0].user_ns, 'f1u1', 'ordenado por ultimo mensaje');
assert.equal(chats.items[0].open, true);
assert.equal(chats.items[0].tags[0], 'Ventas');
assert.ok(calls.find((c) => c.p === '/subscribers' && c.q.is_last_message_in_last_24h === 'yes'));

const openOnly = await j(await call('/chats?status=open', { cookie }));
assert.equal(openOnly.items.length, 1);

const chat = await j(await call('/chat/f1u1', { cookie }));
assert.equal(chat.messages[0].ts < chat.messages.at(-1).ts, true, 'mensajes ascendentes');
assert.equal(chat.canSendText, true);
assert.equal(chat.contact.fields.length, 1, 'campos vacios fuera');
assert.equal(chat.messages.at(-1).url, 'https://cdn.x/p.jpg');

/* acciones */
assert.equal((await call('/chat/f1u1/send', { method: 'POST', body: { content: 'Hola' }, cookie })).status, 200);
assert.equal((await call('/chat/f1u1/send', { method: 'POST', body: { content: 'Hola' }, cookie, csrf: false })).status, 403, 'CSRF');
assert.equal((await call('/chat/f1u1/send', { method: 'POST', body: { content: '   ' }, cookie })).status, 400);
assert.equal((await call('/chat/f1u1/status', { method: 'POST', body: { status: 'done' }, cookie })).status, 200);
assert.equal((await call('/chat/f1u1/status', { method: 'POST', body: { status: 'borrar' }, cookie })).status, 400);
assert.equal((await call('/chat/f1u1/bot', { method: 'POST', body: { action: 'pause', minutes: 30 }, cookie })).status, 200);
assert.equal((await call('/chat/f1u1/bot', { method: 'POST', body: { action: 'resume' }, cookie })).status, 200);
assert.equal((await call('/chat/f1u1/tag', { method: 'POST', body: { name: 'VIP' }, cookie })).status, 200);
assert.equal((await call('/chat/f1u1/tag', { method: 'POST', body: { name: 'VIP', remove: true }, cookie })).status, 200);
assert.equal((await call('/chat/f1u1/assign', { method: 'POST', body: { agent_id: 5 }, cookie })).status, 200);
assert.equal((await call('/chat/f1u1/assign', { method: 'POST', body: {}, cookie })).status, 200);
assert.equal((await call('/chat/..%2Fx/send', { method: 'POST', body: { content: 'x' }, cookie })).status, 400);

const find = (m, p) => calls.find((c) => c.m === m && c.p === p);
assert.deepEqual(find('POST', '/subscriber/send-text').b, { user_ns: 'f1u1', content: 'Hola' });
assert.deepEqual(find('POST', '/subscriber/move-chat-to').b, { user_ns: 'f1u1', status: 'done' });
assert.deepEqual(find('POST', '/subscriber/pause-bot').b, { user_ns: 'f1u1', minutes: 30 });
assert.deepEqual(find('POST', '/subscriber/add-tag-by-name').b, { user_ns: 'f1u1', tag_name: 'VIP' });
assert.deepEqual(find('DELETE', '/subscriber/remove-tag-by-name').b, { user_ns: 'f1u1', tag_name: 'VIP' });
assert.deepEqual(find('POST', '/subscriber/assign-agent').b, { user_ns: 'f1u1', agent_id: 5 });
assert.ok(find('POST', '/subscriber/unassign-agent'));
assert.ok(calls.every((c) => c.auth === 'Bearer TOKEN_OK'), 'siempre envia el Bearer');

/* token malo */
process.env.CHATEAPRO_TOKEN = 'TOKEN_MALO';
const bad = await call('/chats', { cookie: (await call('/login', { method: 'POST', body: { password: 'clave-secreta' } })).headers.get('set-cookie').split(';')[0] });
assert.equal(bad.status, 502);
assert.match((await j(bad)).error, /token/i);
console.log('ok modo real (%d llamadas simuladas)', calls.length);

mock.close();
console.log('TODO OK');
