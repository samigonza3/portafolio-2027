import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Clock,
  Calendar,
  Share2,
  BookmarkPlus,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { getPost, posts } from '../data/posts';
import BlogSidebar from './BlogSidebar';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = slug ? getPost(slug) : undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Samuel González`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.metaDescription);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = post.metaDescription;
        document.head.appendChild(meta);
      }
      window.scrollTo(0, 0);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-space-950 text-frost flex flex-col lg:flex-row">
        <BlogSidebar />
        <main className="flex-1 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-extrabold text-signal-amber mb-8">Post no encontrado</h1>
              <p className="text-muted mb-8">
                Lo sentimos, el artículo que buscas no existe o ha sido movido.
              </p>
              <Link to="/blog" className="btn-star">
                <ChevronLeft className="w-5 h-5" />
                Volver al blog
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: post.title,
        text: post.metaDescription,
        url: window.location.href,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const related = (post.relatedPosts ?? [])
    .map((s) => posts.find((p) => p.slug === s))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-space-950 text-frost flex flex-col lg:flex-row">
      <BlogSidebar />

      <main className="flex-1 min-w-0">
        {/* Header del artículo */}
        <div
          className="border-b border-star-light/15"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% -20%, rgba(27,46,102,.9), transparent 75%)',
          }}
        >
          <div className="max-w-3xl px-6 lg:px-10 pt-14 pb-10">
            <Link
              to="/blog"
              className="inline-flex items-center text-star-light hover:text-star transition-colors mb-6 text-sm font-semibold"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Volver al blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-star-light bg-star/10 border border-star-light/15 rounded-full px-3 py-1">
                {post.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="inline-flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {post.date}
              </span>
              <span className="inline-flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {post.readTime} de lectura
              </span>
              <span className="text-star-light">{post.author}</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl px-6 lg:px-10 py-12">
        {/* Acciones */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-10 p-4 card-galaxy">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-3 py-1 bg-space-700/60 text-star-light rounded-full border border-star-light/15"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-muted hover:text-star-light transition-colors"
              title="Compartir"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-muted hover:text-star-light transition-colors"
              title="Guardar"
            >
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {post.sourceUrl && (
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mb-8 text-sm text-star-light hover:text-star transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Leer la noticia original en {post.sourceName ?? 'la fuente'}
          </a>
        )}

        {/* Contenido */}
        <article className="prose-galaxy">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Relacionados */}
        {related.length > 0 && (
          <div className="mt-16 pt-8 border-t border-star-light/15">
            <h3 className="text-2xl font-extrabold mb-8 text-center">
              Artículos <span className="glow">relacionados</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((rp, index) => (
                <article key={index} className="card-galaxy p-6">
                  <time className="text-xs text-muted">{rp!.date}</time>
                  <h4 className="text-lg font-extrabold mt-2 mb-4">{rp!.title}</h4>
                  <Link
                    to={`/blog/${rp!.slug}`}
                    className="text-star-light hover:text-star inline-flex items-center text-sm font-semibold"
                  >
                    Leer más
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="mt-12 flex justify-between items-center pt-8 border-t border-star-light/15">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-muted hover:text-star-light transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Anterior
          </button>
          <button
            onClick={() => navigate(1)}
            className="inline-flex items-center text-muted hover:text-star-light transition-colors text-sm font-semibold"
          >
            Siguiente
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </nav>
        </div>
      </main>
    </div>
  );
}
