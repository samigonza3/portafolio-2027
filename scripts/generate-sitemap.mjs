// Genera public/sitemap.xml antes de cada build, leyendo los slugs y
// fechas de src/data/posts.ts. Para agregar una página estática nueva,
// súmala a STATIC_ROUTES.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SITE = 'https://samuelgonzalez.org';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'weekly' },
  { path: '/mentoria-dropshipping', priority: '0.9', changefreq: 'monthly' },
  { path: '/diagnostico', priority: '0.8', changefreq: 'monthly' },
  { path: '/herramientas/foundational-docs', priority: '0.8', changefreq: 'monthly' },
  { path: '/google-ads-checklist', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacidad', priority: '0.2', changefreq: 'yearly' },
  { path: '/terminos', priority: '0.2', changefreq: 'yearly' },
];

const source = readFileSync(resolve(root, 'src/data/posts.ts'), 'utf8');
const posts = [...source.matchAll(/slug:\s*'([^']+)'[\s\S]*?date:\s*'(\d{4}-\d{2}-\d{2})'/g)].map(
  ([, slug, date]) => ({ slug, date })
);
const today = new Date().toISOString().slice(0, 10);

const urls = [
  ...STATIC_ROUTES.map(
    (r) =>
      `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
  ),
  ...posts.map(
    (p) =>
      `  <url>\n    <loc>${SITE}/blog/${p.slug}</loc>\n    <lastmod>${p.date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
writeFileSync(resolve(root, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml: ${urls.length} URLs`);
