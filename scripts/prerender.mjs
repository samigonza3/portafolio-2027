// Prerender estático: corre DESPUÉS de `vite build`. Toma dist/index.html
// como plantilla y genera un HTML real por ruta (dist/<ruta>/index.html)
// con título, descripción, canonical, Open Graph, datos estructurados
// (JSON-LD) y contenido visible sin JavaScript. React sigue montándose
// encima igual que siempre (createRoot reemplaza el contenido de #root).
//
// Resultado: Google ve el contenido en el primer HTML, y los rastreadores
// de IA que no ejecutan JavaScript (GPTBot, ClaudeBot, PerplexityBot...)
// también.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { loadData, ROOT, esc, indexablePages } from './lib/load-data.mjs';

const DIST = resolve(ROOT, 'dist');
if (!existsSync(resolve(DIST, 'index.html'))) {
  console.error('prerender: falta dist/index.html. Corre `vite build` primero.');
  process.exit(1);
}

const { seo, posts, faqs, herramientas, contacto } = await loadData();
const { SITE_URL, SITE_NAME, PAGES } = seo;
const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');

// Formularios ocultos de Netlify Forms: solo se dejan en la home para no
// duplicarlos en cada página.
const formsMatch = template.match(/<form[\s\S]*<\/form>/);
const FORMS = formsMatch ? formsMatch[0] : '';
const baseHtml = template.replace(FORMS, '<!--FORMS-->');

const OG_IMAGE = `${SITE_URL}/og-image.png`;
const OG_ALT = 'Samuel González. Data, Marketing & Code al servicio de marcas en crecimiento.';

const PERSON_ID = `${SITE_URL}/#samuel`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const person = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/samuel-perfil.6836711e.jpg`,
  jobTitle: 'Paid Media & Data Analyst',
  description: seo.DEFAULT_DESCRIPTION,
  address: { '@type': 'PostalAddress', addressLocality: 'Cali', addressRegion: 'Valle del Cauca', addressCountry: 'CO' },
  worksFor: { '@type': 'Organization', name: 'Interactive Financial Marketing Group (IFMG)' },
  sameAs: [contacto.linkedin],
  knowsAbout: ['Google Ads', 'Meta Ads', 'TikTok Ads', 'Microsoft Advertising', 'Analítica de datos', 'Data Science', 'Desarrollo web', 'Dropshipping', 'Ecommerce'],
};
const website = {
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  inLanguage: 'es',
  publisher: { '@id': PERSON_ID },
};

const NAV = [
  ['Inicio', '/'],
  ['Mentoría de dropshipping', '/mentoria-dropshipping'],
  ['Mentoría privada', '/empieza-aqui-tu-mentoria'],
  ['Diagnóstico', '/diagnostico'],
  ['Herramientas', '/herramientas'],
  ['Blog', '/blog'],
];

const abs = (p) => `${SITE_URL}${p === '/' ? '/' : p}`;
const crumb = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});

function faqSchema(list) {
  return {
    '@type': 'FAQPage',
    mainEntity: list.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

function graphFor(page) {
  const url = abs(page.canonicalPath ?? page.path);
  const g = [person, website];
  const webpage = {
    '@type': page.kind === 'blog' ? 'CollectionPage' : 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: 'es',
    isPartOf: { '@id': WEBSITE_ID },
  };
  if (page.kind === 'home') webpage.about = { '@id': PERSON_ID };
  g.push(webpage);

  if (page.kind === 'home') {
    g.push({
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#navegacion`,
      name: 'Navegación principal',
      itemListElement: NAV.slice(1).map(([name, path], i) => ({ '@type': 'SiteNavigationElement', position: i + 1, name, url: abs(path) })),
    });
  } else if (!page.noindex) {
    const parents = page.path.startsWith('/herramientas/') || page.path === '/google-ads-checklist' ? [['Herramientas', '/herramientas']] : [];
    g.push(crumb([['Inicio', '/'], ...parents, [page.h1, page.path]]));
  }
  if (page.faq) g.push(faqSchema(page.faq === 'mentoria' ? faqs.FAQS_MENTORIA : faqs.FAQS_DROPSHIPPING));
  if (page.service) {
    g.push({
      '@type': 'Service',
      name: page.service.name,
      description: page.description,
      provider: { '@id': PERSON_ID },
      areaServed: ['CO', 'Latinoamérica'],
      url,
      offers: { '@type': 'Offer', price: page.service.price, priceCurrency: 'USD', url },
    });
  }
  if (page.tool && !page.canonicalPath) {
    g.push({
      '@type': 'WebApplication',
      name: page.tool.name,
      url,
      description: page.description,
      applicationCategory: page.tool.category,
      operatingSystem: 'Web',
      inLanguage: 'es',
      author: { '@id': PERSON_ID },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
  }
  if (page.kind === 'hub') {
    g.push({
      '@type': 'ItemList',
      name: 'Herramientas gratuitas',
      itemListElement: herramientas.map((h, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: h.nombre,
        url: h.to.startsWith('http') ? h.to : abs(h.to),
      })),
    });
  }
  if (page.kind === 'blog') {
    g.push({
      '@type': 'Blog',
      name: 'Blog de Samuel González',
      url,
      inLanguage: 'es',
      author: { '@id': PERSON_ID },
      blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`/blog/${p.slug}`), datePublished: p.date })),
    });
  }
  return g;
}

function graphForPost(post) {
  const url = abs(`/blog/${post.slug}`);
  return [
    person,
    website,
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      inLanguage: 'es',
      articleSection: post.category,
      keywords: post.tags.join(', '),
      image: OG_IMAGE,
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      isPartOf: { '@id': WEBSITE_ID },
    },
    crumb([['Inicio', '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]),
  ];
}

const jsonLd = (graph) =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

function headBlock({ title, description, path, noindex, ogType = 'website', graph }) {
  const url = abs(path);
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" />`,
    `<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow'}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:locale" content="es_CO" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(OG_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    graph ? jsonLd(graph) : '',
  ]
    .filter(Boolean)
    .join('\n    ');
}

// Contenido estático visible: se muestra solo hasta que React monta la app.
const SHELL_STYLE =
  '<style>#root .pre{background:#040817;color:#dbe4ff;font-family:system-ui,sans-serif;line-height:1.6;min-height:100vh;padding:24px;max-width:860px;margin:0 auto}#root .pre a{color:#7fa8ff}#root .pre nav a{margin-right:14px}</style>';

function shell(inner) {
  const nav = NAV.map(([n, p]) => `<a href="${p}">${esc(n)}</a>`).join('');
  return `${SHELL_STYLE}<div class="pre"><header><nav aria-label="Principal">${nav}</nav></header><main>${inner}</main><footer><p>© ${new Date().getFullYear()} ${SITE_NAME} · Cali, Colombia · <a href="/privacidad">Privacidad</a> · <a href="/terminos">Términos</a></p></footer></div>`;
}

function pageHtml(page, bodyInner, { ogType, graph, isHome }) {
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/i, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/i, '')
    .replace(/<meta\s+(?:property|name)="(?:og:|twitter:)[^"]*"[^>]*>\s*/gi, '');
  html = html.replace('</head>', `    ${headBlock({ ...page, ogType, graph })}\n  </head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${shell(bodyInner)}</div>`);
  html = html.replace('<!--FORMS-->', isHome ? FORMS : '');
  return html;
}

function write(urlPath, html) {
  const file = urlPath === '/' ? resolve(DIST, 'index.html') : resolve(DIST, urlPath.replace(/^\//, ''), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const fmtDate = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
let count = 0;

// 1) Páginas estáticas
for (const page of PAGES) {
  let body = page.body;
  if (page.kind === 'blog') {
    body = `<p>Ideas prácticas sobre paid media, analítica, ecommerce y dropshipping.</p>${posts
      .map(
        (p) =>
          `<article><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p>${esc(p.category)} · ${fmtDate(p.date)} · ${esc(p.readTime)}</p><p>${esc(p.excerpt)}</p></article>`
      )
      .join('')}`;
  }
  const inner = `<h1>${esc(page.h1)}</h1>${body}`;
  write(page.path, pageHtml(page, inner, { ogType: 'website', graph: page.noindex ? null : graphFor(page), isHome: page.path === '/' }));
  count++;
}

// 2) Artículos del blog
for (const post of posts) {
  const path = `/blog/${post.slug}`;
  const related = (post.relatedPosts || [])
    .map((s) => posts.find((x) => x.slug === s))
    .filter(Boolean)
    .map((r) => `<li><a href="/blog/${r.slug}">${esc(r.title)}</a></li>`)
    .join('');
  const inner = `<article><p><a href="/blog">Blog</a> / ${esc(post.category)}</p><h1>${esc(post.title)}</h1><p>${esc(post.author)} · ${fmtDate(post.date)} · ${esc(post.readTime)} de lectura</p>${post.content}${
    post.sourceUrl ? `<p>Fuente: <a href="${esc(post.sourceUrl)}" rel="noopener nofollow">${esc(post.sourceName || post.sourceUrl)}</a></p>` : ''
  }${related ? `<h2>Sigue leyendo</h2><ul>${related}</ul>` : ''}</article>`;
  const page = { title: `${post.title} | ${SITE_NAME}`, description: post.metaDescription || post.excerpt, path };
  write(path, pageHtml(page, inner, { ogType: 'article', graph: graphForPost(post), isHome: false }));
  count++;
}

// 3) 404 real (Netlify lo sirve con status 404 para cualquier URL inexistente).
const nf = { title: `Página no encontrada | ${SITE_NAME}`, description: seo.DEFAULT_DESCRIPTION, path: '/404', noindex: true };
writeFileSync(
  resolve(DIST, '404.html'),
  pageHtml(nf, '<h1>Página no encontrada</h1><p>El enlace no existe o cambió de lugar.</p><p><a href="/">Ir al inicio</a></p>', { ogType: 'website', graph: null, isHome: false })
);

// 4) Verificación rápida
const problems = [];
for (const p of [...PAGES.map((x) => x.path), ...posts.map((x) => `/blog/${x.slug}`)]) {
  const f = p === '/' ? resolve(DIST, 'index.html') : resolve(DIST, p.slice(1), 'index.html');
  const h = readFileSync(f, 'utf8');
  if ((h.match(/<title>/g) || []).length !== 1) problems.push(`${p}: title duplicado o ausente`);
  if ((h.match(/rel="canonical"/g) || []).length !== 1) problems.push(`${p}: canonical duplicado o ausente`);
  if (!/<h1>/.test(h)) problems.push(`${p}: sin h1 estático`);
}
console.log(`prerender: ${count} páginas + 404.html`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
