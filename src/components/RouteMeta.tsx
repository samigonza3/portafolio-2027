import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Título, descripción y canonical por ruta. Las rutas dinámicas
// (/blog/:slug y el diagnóstico) definen su propio título desde su
// componente, así que aquí se omiten para no pisarlo.
export const SITE_URL = 'https://samuelgonzalez.org';

const DEFAULT_DESCRIPTION =
  'Samuel González. +15 años conectando adquisición pagada, analítica de datos y desarrollo web para marcas nacionales e internacionales.';

type Meta = { title: string; description?: string; noindex?: boolean };

const META: Record<string, Meta> = {
  '/': { title: 'Samuel González | Data, Marketing & Code' },
  '/blog': {
    title: 'Blog | Samuel González',
    description: 'Ideas prácticas sobre paid media, analítica, e-commerce y dropshipping.',
  },
  '/herramientas/foundational-docs': {
    title: 'Documentos Fundacionales con IA | Samuel González',
    description: 'Herramienta gratuita para generar los 4 documentos fundacionales de tu marca con IA.',
  },
  '/mentoria-dropshipping': {
    title: 'Mentoría de Dropshipping | Samuel González',
    description: 'Inicia tu camino en el comercio electrónico con acompañamiento paso a paso.',
  },
  '/comienza-aqui-tu-mentoria': {
    title: 'Mentoría privada de dropshipping | Samuel González',
    description:
      'Acompañamiento 1 a 1 o grupal para construir y escalar tu tienda de dropshipping: 4 horas al mes, tareas, plan de entrenamiento y revisión de tus números.',
  },
  '/google-ads-checklist': {
    title: 'Checklist de Google Ads | Samuel González',
    description: 'Checklist gratuito para auditar y optimizar tus campañas de Google Ads.',
  },
  '/recursos/google-ads-checklist': {
    title: 'Checklist de Google Ads | Samuel González',
    description: 'Checklist gratuito para auditar y optimizar tus campañas de Google Ads.',
  },
  '/privacidad': {
    title: 'Política de Privacidad | Samuel González',
    description: 'Cómo se recolectan, usan y protegen tus datos personales en samuelgonzalez.org.',
  },
  '/terminos': {
    title: 'Términos y Condiciones | Samuel González',
    description: 'Condiciones de uso del sitio, sus herramientas gratuitas y servicios.',
  },
  '/gracias': { title: 'Gracias por escribirme | Samuel González', noindex: true },
};

const SELF_MANAGED = [/^\/blog\/.+/, /^\/diagnostico$/, /^\/recursos\/ruta-clara$/];

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

    // Canonical y og:url siempre apuntan a la URL limpia de la ruta.
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path === '/' ? '/' : path}`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical.href);

    const known = META[path];
    const isNotFound = !known && !SELF_MANAGED.some((r) => r.test(path));
    const noindex = known?.noindex || isNotFound;
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    if (SELF_MANAGED.some((r) => r.test(path))) return;

    const meta = known ?? { title: 'Página no encontrada | Samuel González' };
    const description = meta.description ?? DEFAULT_DESCRIPTION;
    document.title = meta.title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  }, [pathname]);

  return null;
}
