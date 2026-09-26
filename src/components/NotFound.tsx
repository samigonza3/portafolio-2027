import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-space-950 text-frost flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="label-mono mb-6">Error 404</p>
        <h1 className="display-xl text-5xl sm:text-7xl md:text-8xl mb-6">
          Esta página se <span className="glow">perdió</span> en el espacio
        </h1>
        <p className="text-ice text-base md:text-lg max-w-xl mx-auto mb-10">
          El enlace que seguiste no existe o cambió de lugar. Desde aquí puedes volver a lo
          importante.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-star">
            Ir al inicio <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/blog" className="btn-ghost">
            Leer el blog
          </Link>
          <Link to="/diagnostico" className="btn-ghost">
            Diagnóstico para Dropshippers
          </Link>
        </div>
      </div>
    </div>
  );
}
