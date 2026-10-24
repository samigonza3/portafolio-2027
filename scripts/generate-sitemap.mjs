// Genera public/sitemap.xml y public/llms.txt antes de cada build, desde
// src/data/seo.ts (páginas) y src/data/posts.ts (blog). No hay listas
// duplicadas: para publicar algo nuevo basta con editar esos archivos.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadData, ROOT, indexablePages } from './lib/load-data.mjs';

const { seo, posts, contacto } = await loadData();
const { SITE_URL, SITE_NAME } = seo;
const pages = indexablePages(seo);

// ---- sitemap.xml -------------------------------------------------
const urls = [
  ...pages.map((p) => ({ loc: `${SITE_URL}${p.path}`, lastmod: p.lastmod, changefreq: p.changefreq, priority: p.priority })),
  ...posts.map((p) => ({ loc: `${SITE_URL}/blog/${p.slug}`, lastmod: p.date, changefreq: 'monthly', priority: '0.7' })),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join('\n')}\n</urlset>\n`;
writeFileSync(resolve(ROOT, 'public/sitemap.xml'), xml);
console.log(`sitemap.xml: ${urls.length} URLs`);

// ---- llms.txt ----------------------------------------------------
const line = (title, url, desc) => `- [${title}](${url}): ${desc}`;
const main = pages.filter((p) => ['home', 'landing'].includes(p.kind));
const tools = pages.filter((p) => ['tool', 'hub'].includes(p.kind));
const llms = `# ${SITE_NAME}

> ${seo.DEFAULT_DESCRIPTION} Sitio personal en español, con sede en ${contacto.ciudad}.

Samuel González es Paid Media & Data Analyst (Google Ads, Meta Ads, TikTok Ads, Microsoft Advertising), tiene una maestría en Data Science, enseña marketing digital y visualización de datos en universidades de Cali, y ofrece mentoría de dropshipping 1 a 1.

## Páginas principales
${main.map((p) => line(p.title.split(" | ")[0], `${SITE_URL}${p.path}`, p.description)).join('\n')}

## Herramientas gratuitas
${tools.map((p) => line(p.title.split(" | ")[0], `${SITE_URL}${p.path}`, p.description)).join('\n')}
${line('WiPi Converter', 'https://webp-converter.samuelgonzalez.org/', 'Convierte tus imágenes a WebP gratis.')}

## Blog
${line('Blog', `${SITE_URL}/blog`, 'Índice de todos los artículos.')}
${posts.map((p) => line(p.title, `${SITE_URL}/blog/${p.slug}`, p.metaDescription || p.excerpt)).join('\n')}

## Contacto
- LinkedIn: ${contacto.linkedin}
- Sitio: ${SITE_URL}
`;
writeFileSync(resolve(ROOT, 'public/llms.txt'), llms);
console.log('llms.txt: ok');
