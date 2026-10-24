import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { herramientas } from '../data/herramientas';

// Hub de herramientas gratuitas. Existe como página propia para que los
// buscadores tengan una URL que agrupe todas las herramientas del sitio.
export default function Herramientas() {
  return (
    <div className="min-h-[70vh] bg-space-950 text-frost">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <p className="label-mono mb-4">Herramientas</p>
        <h1 className="display-xl text-4xl sm:text-5xl md:text-6xl mb-4">
          Herramientas gratuitas para <span className="glow">marketing y dropshipping</span>
        </h1>
        <p className="text-ice text-base md:text-lg max-w-2xl mb-12">
          Utilidades que uso y construyo para mi trabajo en paid media, datos y ecommerce. Todas son
          gratuitas y funcionan desde el navegador.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          {herramientas.map((h) => {
            const inner = (
              <>
                <h2 className="text-xl font-extrabold mb-2">{h.nombre}</h2>
                <p className="text-ice text-sm mb-6 flex-1">{h.descripcion}</p>
                <span className="inline-flex items-center gap-2 text-star-light font-bold text-sm">
                  Abrir herramienta <ArrowRight className="w-4 h-4" />
                </span>
              </>
            );
            const cls = 'card-galaxy p-7 flex flex-col hover:border-star-light/45 transition-colors';
            return h.externo ? (
              <a key={h.to} href={h.to} target="_blank" rel="noopener noreferrer" className={cls}>
                {inner}
              </a>
            ) : (
              <Link key={h.to} to={h.to} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
