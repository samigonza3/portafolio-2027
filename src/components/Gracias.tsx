import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

// Página de confirmación tras enviar el formulario de contacto. Tener
// una URL propia permite medir la conversión en GA4 (evento
// generate_lead) y usarla como objetivo en Google Ads o Meta.
export default function Gracias() {
  useEffect(() => {
    window.gtag?.('event', 'generate_lead', { form_name: 'contacto' });
  }, []);

  return (
    <div className="min-h-[70vh] bg-space-950 text-frost flex items-center">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <CheckCircle2 className="w-14 h-14 text-signal-teal mx-auto mb-6" />
        <h1 className="display-xl text-5xl sm:text-6xl md:text-7xl mb-6">
          ¡Gracias por <span className="glow">escribirme</span>!
        </h1>
        <p className="text-ice text-base md:text-lg max-w-xl mx-auto mb-10">
          Recibí tu mensaje y te responderé lo antes posible, normalmente en menos de 48 horas
          hábiles. Mientras tanto, puedes aprovechar estos recursos gratuitos.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/diagnostico" className="btn-star">
            Diagnóstico para Dropshippers <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/blog" className="btn-ghost">
            Leer el blog
          </Link>
          <Link to="/" className="btn-ghost">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
