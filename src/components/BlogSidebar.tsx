import { useState } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Home, Rss, Mail, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { posts, CATEGORIES } from '../data/posts';

// Columna lateral estilo PPC Land: navegación + filtros por categoría
// siempre visibles a la izquierda en desktop; en mobile se colapsa
// detrás de un botón para no empujar el contenido hacia abajo.

export default function BlogSidebar() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeCategory = searchParams.get('categoria');
  const isBlogList = location.pathname === '/blog';

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = posts.filter((p) => p.category === cat).length;
    return acc;
  }, {});

  return (
    <aside className="lg:w-64 shrink-0 lg:border-r border-b lg:border-b-0 border-star-light/15 lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16">
      {/* Toggle solo en mobile/tablet */}
      <button
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between px-6 py-4 text-sm font-bold"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-star-light" />
          Blog · Filtros{activeCategory ? `: ${activeCategory}` : ''}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform ${mobileOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className={`${mobileOpen ? 'block' : 'hidden'} lg:block lg:h-full lg:overflow-y-auto px-6 pb-8 lg:py-8`}
      >
        <Link to="/" className="hidden lg:flex items-center gap-2 mb-8 group">
          <Home className="w-4 h-4 text-muted group-hover:text-star-light transition-colors" />
          <span className="text-sm font-semibold text-muted group-hover:text-frost transition-colors">
            Volver al sitio
          </span>
        </Link>

        <Link to="/blog" className="hidden lg:block mb-8">
          <span className="text-2xl font-extrabold">
            Blog<span className="text-star-light">.</span>
          </span>
          <p className="text-xs text-muted mt-1">Algunas ideas, noticias y recursos para compartir.</p>
        </Link>

        <nav className="mb-8 pt-2 lg:pt-0">
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted mb-3">
            Categorías
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                to="/blog"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isBlogList && !activeCategory
                    ? 'bg-star/12 text-star-light border border-star-light/25'
                    : 'text-muted hover:text-frost hover:bg-space-800'
                }`}
              >
                Todas
                <span className="text-xs font-sans">{posts.length}</span>
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <Link
                  to={`/blog?categoria=${encodeURIComponent(cat)}`}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isBlogList && activeCategory === cat
                      ? 'bg-star/12 text-star-light border border-star-light/25'
                      : 'text-muted hover:text-frost hover:bg-space-800'
                  }`}
                >
                  {cat}
                  <span className="text-xs font-sans">{counts[cat] ?? 0}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-6 border-t border-star-light/15">
          <p className="text-[10.5px] font-bold uppercase tracking-widest text-muted mb-3">
            Sígueme
          </p>
          <div className="flex flex-col gap-2">
            <a
              href="https://www.linkedin.com/in/samuelgonzalez/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-star-light transition-colors"
            >
              <Rss className="w-3.5 h-3.5" /> LinkedIn
            </a>
            <a
              href="/#contacto"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-star-light transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Contacto
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
