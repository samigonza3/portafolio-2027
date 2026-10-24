// ============================================================
// SEO: fuente única de títulos, descripciones y contenido estático
// de cada ruta. La usan dos consumidores:
//   1) RouteMeta.tsx (cambia title/description/canonical al navegar).
//   2) scripts/prerender.mjs (genera un HTML real por ruta en el build,
//      con contenido legible sin JavaScript para Google, ChatGPT,
//      Perplexity, etc.).
// Para publicar una página nueva: agrégala a PAGES, súmale su <Route>
// en App.tsx y vuelve a hacer build. El sitemap se genera solo.
// Los posts del blog salen de posts.ts, no hay que tocarlos aquí.
// ============================================================
import { MENTORIA, BLUEPRINT } from './oferta';

export const SITE_URL = 'https://samuelgonzalez.org';
export const SITE_NAME = 'Samuel González';
export const DEFAULT_DESCRIPTION =
  'Samuel González, Paid Media & Data Analyst en Cali, Colombia. Google Ads, Meta Ads, TikTok Ads, analítica de datos, desarrollo web y mentoría de dropshipping.';

export type PageKind = 'home' | 'blog' | 'landing' | 'tool' | 'hub' | 'legal' | 'utility';

export interface PageSeo {
  path: string;
  title: string;
  description: string;
  kind: PageKind;
  h1: string;
  /** HTML estático (sin JS) que ve el rastreador antes de que cargue React. */
  body: string;
  noindex?: boolean;
  /** Si la ruta es un alias, apunta a la URL canónica real. */
  canonicalPath?: string;
  lastmod: string;
  priority: string;
  changefreq: string;
  /** Solo kind 'tool': datos para el schema WebApplication. */
  tool?: { name: string; category: string };
  /** Solo landings: genera FAQPage y Service. */
  faq?: 'dropshipping' | 'mentoria';
  service?: { name: string; price: string };
}

const LASTMOD = '2026-10-24';

export const PAGES: PageSeo[] = [
  {
    path: '/',
    kind: 'home',
    title: 'Samuel González | Marketing Digital, Data y Desarrollo Web',
    description:
      'Samuel González, Paid Media & Data Analyst en Cali, Colombia. +15 años en Google Ads, Meta Ads y TikTok Ads, analítica de datos, desarrollo web y mentoría de dropshipping.',
    h1: 'Samuel González: Data, Marketing y Código',
    lastmod: LASTMOD,
    priority: '1.0',
    changefreq: 'weekly',
    body: `
<p>Soy Samuel González, Paid Media &amp; Data Analyst con base en Cali, Colombia. Llevo más de 15 años conectando adquisición pagada, analítica de datos y desarrollo web para marcas nacionales e internacionales.</p>
<h2>Servicios</h2>
<h3>Data Science</h3><p>Análisis predictivo, Machine Learning y visualización de datos para impulsar decisiones basadas en datos.</p>
<h3>Marketing Digital</h3><p>Estrategias SEM, Social Media Marketing, Growth CRO y análisis de métricas para maximizar tu presencia digital en Google Ads, Meta Ads, TikTok Ads y Microsoft Advertising.</p>
<h3>Desarrollo Full Stack</h3><p>Desarrollo web de punta a punta con las últimas tecnologías.</p>
<h2>Experiencia</h2>
<p>Actualmente lidero la ejecución de TikTok Ads y apoyo campañas de Meta y Microsoft Advertising en IFMG (Interactive Financial Marketing Group). Antes trabajé como Paid Media Specialist en Telefónica Hispam y UNICEF Colombia, Sr. Performance Strategist en Digital57 y CRO Growth Hacker en Banco de Occidente.</p>
<h2>Docencia</h2>
<p>Enseño visualización de datos en la Universidad de San Buenaventura Cali y Manejo de Plataformas Digitales en la Universidad Icesi.</p>
<h2>Empieza por aquí</h2>
<ul>
<li><a href="/mentoria-dropshipping">Mentoría de dropshipping: sistema paso a paso para vender por internet</a></li>
<li><a href="/empieza-aqui-tu-mentoria">Mentoría privada 1 a 1 de dropshipping</a></li>
<li><a href="/diagnostico">Diagnóstico gratuito para tiendas de dropshipping</a></li>
<li><a href="/herramientas">Herramientas gratuitas de marketing e IA</a></li>
<li><a href="/blog">Blog sobre paid media, datos, ecommerce y dropshipping</a></li>
<li><a href="/google-ads-checklist">Checklist gratuito de Google Ads</a></li>
</ul>`,
  },
  {
    path: '/mentoria-dropshipping',
    kind: 'landing',
    title: 'Curso y Mentoría de Dropshipping en Colombia | Samuel González',
    description:
      'Aprende el sistema de dropshipping paso a paso: caso de estudio gratis, Blueprint, comunidad de WhatsApp y mentoría 1 a 1 para vender por internet desde cero.',
    h1: 'Te enseño el sistema de dropshipping para que vendas lo que sea por internet',
    lastmod: LASTMOD,
    priority: '0.9',
    changefreq: 'monthly',
    faq: 'dropshipping',
    body: `
<p>Descarga gratis el caso de estudio de cómo una tienda de dropshipping desde cero llegó a $10.000 USD de facturación en el mes 2, y elige cómo dar el paso.</p>
<h2>3 formas de dar el paso</h2>
<h3>1. Comunidad de WhatsApp (gratis)</h3><p>Un grupo donde comparto recursos, resuelvo dudas rápidas y aviso cuando publico contenido nuevo sobre ecommerce y dropshipping.</p>
<h3>2. Blueprint: cómo hacer dropshipping paso a paso (${BLUEPRINT.precio}, pago único)</h3><p>El mapa visual y el PDF con el paso a paso para arrancar desde cero: de la idea al primer pedido.</p>
<h3>3. Mentoría 1 a 1 (${MENTORIA.precio} ${MENTORIA.periodo})</h3><p>Acompañamiento privado con revisión de tu tienda, tus campañas y tus números para escalar con sistema. <a href="/empieza-aqui-tu-mentoria">Ver la mentoría completa</a>.</p>
<h2>Sobre el mentor</h2>
<p>Más de 15 años de experiencia en marketing digital, ecommerce y desarrollo web. Paid Media &amp; Data Analyst en IFMG, docente universitario y operador de tiendas propias de dropshipping en Colombia.</p>
<p>Los resultados mencionados no son típicos ni garantizados: dependen de tu esfuerzo, producto, mercado y ejecución.</p>`,
  },
  {
    path: '/empieza-aqui-tu-mentoria',
    kind: 'landing',
    title: 'Mentoría Privada de Dropshipping 1 a 1 | Samuel González',
    description: `Acompañamiento 1 a 1 para construir y escalar tu tienda de dropshipping: ${MENTORIA.horasMes} horas al mes, tareas, plan de entrenamiento y revisión de tus números. ${MENTORIA.precio} ${MENTORIA.periodo}.`,
    h1: 'Deja de probar solo. Construye tu tienda con acompañamiento',
    lastmod: LASTMOD,
    priority: '0.9',
    changefreq: 'monthly',
    faq: 'mentoria',
    service: { name: 'Mentoría privada de dropshipping 1 a 1', price: String(MENTORIA.precio).replace(/[^0-9.]/g, '') },
    body: `
<p>${MENTORIA.horasMes} horas al mes conmigo para decidir qué probar, qué apagar y qué escalar con tus propios números, con tareas y un plan de entrenamiento hecho para tu tienda.</p>
<ul>
<li>Inversión: ${MENTORIA.precio} ${MENTORIA.periodo} (unos ${MENTORIA.precioHora} por hora)</li>
<li>${MENTORIA.horasMes} horas de sesiones privadas al mes, siempre 1 a 1 por videollamada</li>
<li>${MENTORIA.cupos} cupos al mes</li>
<li>Se renueva mes a mes, sin compromiso de varios meses</li>
</ul>
<p>Revisamos tu tienda, tus campañas de Meta y TikTok y tus números, y armamos un sistema para escalar. Si todavía no has vendido nada, la primera sesión se enfoca en elegir producto y montar la base correctamente.</p>
<p>No se garantizan resultados: dependen de tu producto, tu mercado, tu ejecución y tu constancia. ¿Primera vez? Empieza con el <a href="/mentoria-dropshipping">caso de estudio gratis y el Blueprint</a> o haz el <a href="/diagnostico">diagnóstico de tu tienda</a>.</p>`,
  },
  {
    path: '/diagnostico',
    kind: 'tool',
    title: 'Diagnóstico Gratis para Tiendas de Dropshipping | Samuel González',
    description:
      'Responde sobre visitas, ventas, pauta y entregas. El diagnóstico calcula tu conversión, tu costo por pedido y tu retorno, y te da un plan de 14 días para tu cuello de botella.',
    h1: 'Descubre qué está frenando tu tienda de dropshipping, con tus propios números',
    lastmod: LASTMOD,
    priority: '0.8',
    changefreq: 'monthly',
    tool: { name: 'Diagnóstico para Dropshippers (Ruta Clara)', category: 'BusinessApplication' },
    body: `
<p>Respondes sobre tus visitas, ventas, pauta, entregas, herramientas y habilidades. El diagnóstico calcula tu conversión, tu costo por pedido y tu retorno, y te dice dónde está tu cuello de botella real.</p>
<ul><li>12 a 16 preguntas según tu etapa</li><li>4 minutos con números aproximados</li><li>Plan de 14 días para tu punto más débil</li></ul>
<p>Gratis. Si luego quieres acompañamiento, mira la <a href="/empieza-aqui-tu-mentoria">mentoría privada</a>.</p>`,
  },
  {
    path: '/recursos/ruta-clara',
    kind: 'tool',
    canonicalPath: '/diagnostico',
    title: 'Diagnóstico Gratis para Tiendas de Dropshipping | Samuel González',
    description:
      'Responde sobre visitas, ventas, pauta y entregas. El diagnóstico calcula tu conversión, tu costo por pedido y tu retorno, y te da un plan de 14 días para tu cuello de botella.',
    h1: 'Diagnóstico para Dropshippers',
    lastmod: LASTMOD,
    priority: '0.1',
    changefreq: 'yearly',
    body: '<p>Esta herramienta vive en <a href="/diagnostico">/diagnostico</a>.</p>',
  },
  {
    path: '/herramientas',
    kind: 'hub',
    title: 'Herramientas Gratuitas de Marketing y Dropshipping | Samuel González',
    description:
      'Herramientas gratuitas: Documentos Fundacionales con IA, diagnóstico para dropshippers, convertidor de imágenes a WebP, lector de texto a voz y checklist de Google Ads.',
    h1: 'Herramientas gratuitas para marketing y dropshipping',
    lastmod: LASTMOD,
    priority: '0.8',
    changefreq: 'monthly',
    body: `
<p>Utilidades que uso y construyo para mi trabajo en paid media, datos y ecommerce. Todas son gratuitas.</p>
<ul>
<li><a href="/herramientas/foundational-docs">Documentos Fundacionales con IA</a>: genera los 4 documentos de tu marca.</li>
<li><a href="/diagnostico">Diagnóstico para Dropshippers</a>: diagnóstico de tu tienda de dropshipping.</li>
<li><a href="https://webp-converter.samuelgonzalez.org/">WiPi Converter</a>: convierte tus imágenes a WebP gratis.</li>
<li><a href="/herramientas/text-reader">Lector de Texto</a>: convierte cualquier texto a voz con controles de reproducción.</li>
<li><a href="/google-ads-checklist">Google Ads ROAS+ Checklist</a>: 21 elementos críticos para campañas rentables.</li>
</ul>`,
  },
  {
    path: '/herramientas/foundational-docs',
    kind: 'tool',
    title: 'Documentos Fundacionales con IA: Generador Gratis | Samuel González',
    description:
      'Herramienta gratuita que genera tu prompt para crear los 4 Documentos Fundacionales de tu marca con IA: Deep Research, Avatar, Offer y Necessary Beliefs.',
    h1: 'Tus Documentos Fundacionales con IA',
    lastmod: LASTMOD,
    priority: '0.8',
    changefreq: 'monthly',
    tool: { name: 'Generador de Documentos Fundacionales con IA', category: 'BusinessApplication' },
    body: `
<p>Responde preguntas cortas sobre tu marca. Al final recibes un solo prompt, listo para pegar en un Proyecto de Claude, que genera tus 4 Documentos Fundacionales: Deep Research Doc (mercado y competencia), Avatar, Offer y Necessary Beliefs Doc.</p>
<p>Gratis y sin registro. Más herramientas en <a href="/herramientas">/herramientas</a>.</p>`,
  },
  {
    path: '/herramientas/text-reader',
    kind: 'tool',
    title: 'Lector de Texto a Voz Gratis (PDF y texto) | Samuel González',
    description:
      'Sube un archivo o pega tu texto y escúchalo en voz alta con controles de reproducción. Lector de texto a voz gratuito para PDF y texto.',
    h1: 'TextReader: lector de texto a voz',
    lastmod: LASTMOD,
    priority: '0.7',
    changefreq: 'monthly',
    tool: { name: 'TextReader, lector de texto a voz', category: 'UtilitiesApplication' },
    body: `
<p>Sube un archivo (incluye PDF) o pega tu texto y te lo leo en voz alta, con controles de reproducción. Gratis. Más herramientas en <a href="/herramientas">/herramientas</a>.</p>`,
  },
  {
    path: '/google-ads-checklist',
    kind: 'tool',
    title: 'Google Ads ROAS+ Checklist: 21 Puntos para Campañas Rentables | Samuel González',
    description:
      'Checklist gratuito de 21 elementos críticos para auditar y optimizar tus campañas de Google Ads y mejorar el ROAS.',
    h1: 'Google Ads ROAS+ Checklist: 21 elementos críticos para campañas rentables',
    lastmod: LASTMOD,
    priority: '0.7',
    changefreq: 'monthly',
    tool: { name: 'Google Ads ROAS+ Checklist', category: 'BusinessApplication' },
    body: `
<p>Checklist interactivo con 21 elementos críticos para auditar y optimizar tus campañas de Google Ads y aumentar el retorno sobre la inversión publicitaria (ROAS). Gratis.</p>
<p>¿Quieres ayuda implementando la estrategia? <a href="/#contacto">Escríbeme</a>. Más herramientas en <a href="/herramientas">/herramientas</a>.</p>`,
  },
  {
    path: '/recursos/google-ads-checklist',
    kind: 'tool',
    canonicalPath: '/google-ads-checklist',
    title: 'Google Ads ROAS+ Checklist: 21 Puntos para Campañas Rentables | Samuel González',
    description:
      'Checklist gratuito de 21 elementos críticos para auditar y optimizar tus campañas de Google Ads y mejorar el ROAS.',
    h1: 'Google Ads ROAS+ Checklist',
    lastmod: LASTMOD,
    priority: '0.1',
    changefreq: 'yearly',
    body: '<p>Esta herramienta vive en <a href="/google-ads-checklist">/google-ads-checklist</a>.</p>',
  },
  {
    path: '/blog',
    kind: 'blog',
    title: 'Blog de Paid Media, Datos y Dropshipping | Samuel González',
    description:
      'Ideas prácticas sobre paid media, Meta Ads, analítica, ecommerce y dropshipping, escritas por Samuel González desde la operación real.',
    h1: 'Blog: paid media, datos, ecommerce y dropshipping',
    lastmod: LASTMOD,
    priority: '0.9',
    changefreq: 'weekly',
    body: '', // el prerender inserta aquí el listado de artículos
  },
  {
    path: '/privacidad',
    kind: 'legal',
    title: 'Política de Privacidad | Samuel González',
    description: 'Cómo se recolectan, usan y protegen tus datos personales en samuelgonzalez.org.',
    h1: 'Política de Privacidad',
    lastmod: LASTMOD,
    priority: '0.2',
    changefreq: 'yearly',
    body: '<p>Cómo se recolectan, usan y protegen tus datos personales en samuelgonzalez.org.</p>',
  },
  {
    path: '/terminos',
    kind: 'legal',
    title: 'Términos y Condiciones | Samuel González',
    description: 'Condiciones de uso del sitio, sus herramientas gratuitas y servicios.',
    h1: 'Términos y Condiciones',
    lastmod: LASTMOD,
    priority: '0.2',
    changefreq: 'yearly',
    body: '<p>Condiciones de uso del sitio, sus herramientas gratuitas y servicios.</p>',
  },
  {
    path: '/gracias',
    kind: 'utility',
    noindex: true,
    title: 'Gracias por escribirme | Samuel González',
    description: DEFAULT_DESCRIPTION,
    h1: 'Gracias por escribirme',
    lastmod: LASTMOD,
    priority: '0.0',
    changefreq: 'yearly',
    body: '<p>Recibí tu mensaje. Te responderé pronto.</p>',
  },
  {
    path: '/reservar-espacio',
    kind: 'utility',
    noindex: true,
    title: 'Reservar un espacio | Samuel González',
    description: 'Agenda una sesión 1:1 con Samuel González: mentoría, consultoría o clase de marketing digital.',
    h1: 'Reservar un espacio',
    lastmod: LASTMOD,
    priority: '0.0',
    changefreq: 'yearly',
    body: '<p>Agenda una sesión 1:1 con Samuel González.</p>',
  },
  {
    path: '/admin/calendario',
    kind: 'utility',
    noindex: true,
    title: 'Admin · Calendario | Samuel González',
    description: DEFAULT_DESCRIPTION,
    h1: 'Admin · Calendario',
    lastmod: LASTMOD,
    priority: '0.0',
    changefreq: 'yearly',
    body: '',
  },
];

export const PAGE_BY_PATH: Record<string, PageSeo> = Object.fromEntries(PAGES.map((p) => [p.path, p]));
