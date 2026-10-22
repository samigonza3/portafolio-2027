// Servidor local sin dependencias: sirve /public y enruta /api/* a la funcion.
// Uso: node scripts/dev.mjs   (lee .env si existe)
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
if (existsSync(join(root, '.env'))) {
  for (const line of readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const { default: handler } = await import(pathToFileURL(join(root, 'netlify/functions/api.mjs')).href);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const port = Number(process.env.PORT || 8888);

http
  .createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname.startsWith('/api/')) {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const body = chunks.length ? Buffer.concat(chunks) : undefined;
        const r = await handler(new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }));
        const headers = {};
        r.headers.forEach((v, k) => (headers[k] = v));
        const cookies = r.headers.getSetCookie?.() || [];
        if (cookies.length) headers['set-cookie'] = cookies.map((c) => c.replace('; Secure', ''));
        res.writeHead(r.status, headers);
        return res.end(Buffer.from(await r.arrayBuffer()));
      }
      const rel = normalize(url.pathname === '/' ? '/index.html' : url.pathname).replace(/^(\.\.[/\\])+/, '');
      const data = await readFile(join(root, 'public', rel));
      res.writeHead(200, { 'Content-Type': types[extname(rel)] || 'application/octet-stream' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('No encontrado');
    }
  })
  .listen(port, () => console.log(`Bandeja en http://localhost:${port}  (${process.env.CHATEAPRO_TOKEN ? 'datos reales' : 'modo demostracion'})`));
