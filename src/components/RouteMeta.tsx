import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// Título, descripción y canonical por ruta: salen de src/data/seo.ts (la
// misma fuente que usa el prerender). Las rutas dinámicas (/blog/:slug)
// definen su propio título desde su componente, así que aquí
// se omiten para no pisarlo.
import { PAGE_BY_PATH, SITE_URL, DEFAULT_DESCRIPTION } from '../data/seo';
export { SITE_URL };

const DEFAULT_DESCRIPTION_FALLBACK = DEFAULT_DESCRIPTION;

const SELF_MANAGED = [/^\/blog\/.+/];

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
  const lastTracked = useRef<string | null>(null);

  // Meta Pixel: index.html ya dispara el PageView de la primera carga; aquí
  // se cubren las navegaciones internas de la SPA (cada ruta nueva).
  useEffect(() => {
    if (lastTracked.current === null) {
      lastTracked.current = pathname;
      return;
    }
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;
    window.fbq?.('track', 'PageView');
  }, [pathname]);

  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;

    // Canonical y og:url siempre apuntan a la URL limpia de la ruta.
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    const canonicalPath = PAGE_BY_PATH[path]?.canonicalPath ?? path;
    canonical.href = `${SITE_URL}${canonicalPath === '/' ? '/' : canonicalPath}`;
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical.href);

    const known = PAGE_BY_PATH[path];
    const isNotFound = !known && !SELF_MANAGED.some((r) => r.test(path));
    const noindex = known?.noindex || isNotFound;
    setMeta('meta[name="robots"]', 'name', 'robots', noindex ? 'noindex, follow' : 'index, follow');

    if (SELF_MANAGED.some((r) => r.test(path))) return;

    const meta = known ?? { title: 'Página no encontrada | Samuel González', description: DEFAULT_DESCRIPTION_FALLBACK };
    const description = meta.description;
    document.title = meta.title;
    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  }, [pathname]);

  return null;
}
