import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, ExternalLink, Newspaper, PenLine } from 'lucide-react';
import { posts } from '../data/posts';
import BlogSidebar from './BlogSidebar';

// Blog / Noticias — layout de dos columnas estilo PPC Land:
// sidebar izquierdo fijo con navegación y filtros, lista de posts
// a la derecha en formato editorial denso.

const formatDate = (iso: string) => {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function Blog() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('categoria');

  const filtered = useMemo(
    () =>
      [...posts]
        // Más reciente primero. En empate de fecha, gana el que esté
        // antes en el array de posts.ts (así el último que agregues
        // manda, sin depender de un flag `featured` manual).
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
        .filter((p) => !activeCategory || p.category === activeCategory),
    [activeCategory]
  );

  // El destacado siempre es el post más reciente (el último publicado),
  // nunca uno fijado a mano.
  const featured = !activeCategory ? filtered[0] : null;
  const rest = featured ? filtered.filter((p) => p.slug !== featured.slug) : filtered;

  return (
    <div className="min-h-screen bg-space-950 text-frost flex flex-col lg:flex-row">
      <BlogSidebar />

      <main className="flex-1 min-w-0">
        <header className="border-b border-star-light/15 px-6 lg:px-10 py-10">
          <span className="eyebrow">
            {activeCategory ? activeCategory : 'Blog'}
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold mt-4 mb-2 leading-tight">
            {activeCategory ? (
              <>
                Categoría: <span className="glow">{activeCategory}</span>
              </>
            ) : (
              <>
                Blog<span className="glow">.</span>
              </>
            )}
          </h1>
          <p className="text-ice max-w-2xl text-sm">
            Algunas ideas, noticias y recursos para compartir.
          </p>
        </header>

        <div className="px-6 lg:px-10 py-10">
          {featured && (
            <Link
              to={`/blog/${featured.slug}`}
              className="card-galaxy block p-8 md:p-10 mb-10 relative overflow-hidden group"
            >
              <div
                className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 60% at 80% -10%, rgba(27,46,102,.8), transparent 70%)',
                }}
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10.5px] font-bold uppercase tracking-widest text-star-light bg-star/10 border border-star-light/15 rounded-full px-3 py-1">
                    {featured.category}
                  </span>
                  <span className="text-xs text-muted">{formatDate(featured.date)}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3 group-hover:text-star-light transition-colors">
                  {featured.title}
                </h2>
                <p className="text-ice max-w-3xl mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {featured.readTime} de lectura
                  </span>
                  <span>{featured.author}</span>
                </div>
              </div>
            </Link>
          )}

          <div className="divide-y divide-star-light/10">
            {rest.map((post) => (
              <article key={post.slug} className="py-7 group">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-widest text-star-light bg-star/10 border border-star-light/15 rounded-full px-3 py-1">
                    {post.category}
                  </span>
                  <span className="text-xs text-muted">{formatDate(post.date)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted">
                    {post.type === 'noticia' ? (
                      <>
                        <Newspaper className="w-3.5 h-3.5" /> Noticia curada
                      </>
                    ) : (
                      <>
                        <PenLine className="w-3.5 h-3.5" /> Artículo
                      </>
                    )}
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="text-xl font-extrabold mb-2 group-hover:text-star-light transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-muted text-sm max-w-3xl mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> {post.readTime}
                  </span>
                  {post.sourceUrl && (
                    <a
                      href={post.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-star-light hover:text-star transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Fuente: {post.sourceName ?? 'ver original'}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          {rest.length === 0 && !featured && (
            <p className="text-muted text-center py-20">
              Aún no hay entradas en esta categoría. Pronto habrá más.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
