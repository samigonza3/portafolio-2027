import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  MessageCircle,
  BookOpen,
  Video,
  Sparkles,
  Clock,
} from 'lucide-react';

// ============================================================
// Página de venta: Mentoría de Dropshipping / Ecommerce
// Estructura de "venta en frío" clásica (hero → calificación →
// por qué escucharme → 3 formas de empezar → reserva → FAQ),
// adaptada a la oferta real de Samuel: comunidad de WhatsApp
// gratuita, Blueprint de pago único ($5) y mentoría 1:1 ($250).
// ============================================================

// TODO: reemplazar por el link real del grupo/canal de WhatsApp.
const WHATSAPP_LINK = 'https://chat.whatsapp.com/LADFopGXS5mF6O3eMDRcV6';

// TODO: reemplazar por el link real de cobro en Bold (checkout.bold.co/payment/...).
const BLUEPRINT_PAYMENT_LINK = 'https://checkout.bold.co/payment/TU-LINK-DE-BOLD';

// Horarios disponibles para la llamada de discovery. Samuel los actualiza
// directamente aquí (agregar o quitar líneas) cuando cambie su disponibilidad.
const AVAILABLE_SLOTS = [
  'Martes 10:00 a.m. (hora Colombia)',
  'Miércoles 4:00 p.m. (hora Colombia)',
  'Jueves 11:00 a.m. (hora Colombia)',
  'Viernes 3:00 p.m. (hora Colombia)',
];

const QUALIFY_ITEMS = [
  'Quieres lanzar o ya tienes un ecommerce, pero sientes que vas a ciegas con los números.',
  'Has visto cursos o contenido gratuito sobre dropshipping, pero te falta un paso a paso claro y aplicado a tu caso.',
  'Te importa más entender qué funciona con datos reales que "creer" en una fórmula mágica.',
  'Estás dispuesto a invertir tiempo (y algo de dinero) en aprender bien, no solo en probar suerte.',
  'Prefieres avanzar acompañado, con alguien que ya ha trabajado pauta y datos para marcas reales.',
];

function encodeFormData(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

function BookingForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[0]);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = formRef.current;
    if (!form) {
      setSending(false);
      return;
    }

    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData(data),
      });

      if (!response.ok) {
        throw new Error(`Netlify Forms respondió con estado ${response.status}`);
      }

      setStatus({
        message: 'Solicitud enviada. Te escribo por WhatsApp o correo para confirmar el horario.',
        type: 'success',
      });
      form.reset();
      setSelectedSlot(AVAILABLE_SLOTS[0]);
    } catch (error) {
      console.error('Error al enviar la reserva a Netlify:', error);
      setStatus({
        message: 'Hubo un error al enviar tu solicitud. Intenta de nuevo o escríbeme directo.',
        type: 'error',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      name="reserva-mentoria"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="space-y-4"
    >
      <input type="hidden" name="form-name" value="reserva-mentoria" />
      <p className="hidden">
        <label>
          No llenar: <input name="bot-field" />
        </label>
      </p>

      <div>
        <label className="label-mono !text-muted block mb-3">Elige un horario</label>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {AVAILABLE_SLOTS.map((slot) => (
            <button
              type="button"
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`text-left text-sm px-4 py-3 rounded-xl border transition-colors ${
                selectedSlot === slot
                  ? 'border-star-light bg-star/10 text-frost'
                  : 'border-star-light/15 text-ice hover:border-star-light/40'
              }`}
            >
              <Clock className="w-3.5 h-3.5 inline-block mr-2 -mt-0.5" />
              {slot}
            </button>
          ))}
        </div>
        <input type="hidden" name="slot" value={selectedSlot} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="user_name"
          required
          placeholder="Tu nombre"
          className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-sm text-frost placeholder:text-muted focus:border-star-light/45 outline-none"
        />
        <input
          type="email"
          name="user_email"
          required
          placeholder="Tu correo"
          className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-sm text-frost placeholder:text-muted focus:border-star-light/45 outline-none"
        />
      </div>
      <input
        type="text"
        name="user_whatsapp"
        required
        placeholder="Tu WhatsApp (con indicativo)"
        className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-sm text-frost placeholder:text-muted focus:border-star-light/45 outline-none"
      />

      <button type="submit" disabled={sending} className="btn-star w-full justify-center disabled:opacity-60">
        {sending ? 'Enviando...' : 'Solicitar este horario'}
        <ArrowRight className="w-4 h-4" />
      </button>

      {status.type && (
        <p className={`text-sm ${status.type === 'success' ? 'text-signal-teal' : 'text-red-400'}`}>
          {status.message}
        </p>
      )}

      <p className="text-xs text-muted leading-relaxed">
        Al confirmar, coordinamos por WhatsApp o correo el link de la llamada. El cupo de mentoría 1:1
        de $250 USD es limitado por semana.
      </p>
    </form>
  );
}

export default function DropshippingMentoria() {
  return (
    <div className="min-h-screen bg-space-950 text-frost">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="eyebrow">Mentoría · Dropshipping & Ecommerce</span>
        <h1 className="display-xl text-4xl sm:text-5xl md:text-6xl mt-6 mb-6">
          Construye tu ecommerce
          <br />
          con <span className="glow">datos</span>, no con adivinanzas.
        </h1>
        <p className="text-ice text-lg max-w-2xl mx-auto mb-10">
          Más de 10 años trabajando pauta digital y analítica de datos para marcas como Telefónica,
          UNICEF, Banco de Occidente e IFMG. Ahora aplico lo mismo a ayudarte a lanzar y escalar tu
          propio dropshipping, paso a paso y sin humo.
        </p>
        <a href="#opciones" className="btn-star">
          Ver las 3 formas de empezar <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* Calificación / para quién es */}
      <section className="max-w-4xl mx-auto px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">
          Esto es para ti si...
        </h2>
        <div className="space-y-4">
          {QUALIFY_ITEMS.map((item) => (
            <div key={item} className="flex items-start gap-3 card-galaxy p-5">
              <Check className="w-5 h-5 text-star-light shrink-0 mt-0.5" />
              <p className="text-ice text-sm md:text-base">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Por qué escucharme */}
      <section className="max-w-4xl mx-auto px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-center">
          Por qué te conviene escucharme
        </h2>
        <div className="card-galaxy p-8 md:p-10">
          <p className="text-ice leading-relaxed mb-4">
            Soy <strong className="text-frost">Samuel González</strong>, especialista en Paid Media
            y análisis de datos. Llevo más de una década diseñando campañas y sistemas de medición
            para marcas grandes y negocios que están empezando — desde equipos corporativos como
            Telefónica, UNICEF, Banco de Occidente e IFMG, hasta emprendedores que arrancan su
            primer ecommerce.
          </p>
          <p className="text-ice leading-relaxed mb-4">
            Escribí la guía{' '}
            <Link to="/blog/ecommerce-en-5-pasos-con-dropi" className="text-star-light underline hover:text-frost">
              "Cómo lanzar un ecommerce en 5 pasos con Dropi"
            </Link>{' '}
            para compartir gratis parte de ese proceso. Esta mentoría es para quien quiere ir más
            allá del artículo: aplicarlo a su caso concreto, con acompañamiento directo.
          </p>
          <p className="text-ice leading-relaxed">
            No prometo cifras de ingresos ni fórmulas mágicas. Te ofrezco un método claro, basado en
            datos, y la posibilidad de resolver tus dudas conmigo directamente.
          </p>
        </div>
      </section>

      {/* Las 3 formas de empezar */}
      <section id="opciones" className="max-w-5xl mx-auto px-6 py-14 border-t border-star-light/15">
        <div className="text-center mb-10">
          <span className="eyebrow">Elige cómo empezar</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-4">3 formas de dar el paso</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* WhatsApp */}
          <div className="card-galaxy p-7 flex flex-col">
            <MessageCircle className="w-8 h-8 text-star-light mb-4" />
            <h3 className="text-lg font-extrabold mb-1">Comunidad de WhatsApp</h3>
            <p className="label-mono !text-signal-teal mb-4">Gratis</p>
            <p className="text-ice text-sm mb-6 flex-1">
              Únete a un grupo donde comparto recursos, resuelvo dudas rápidas y aviso cuando publico
              contenido nuevo sobre ecommerce y dropshipping.
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost w-full justify-center"
            >
              Unirme al grupo <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Blueprint */}
          <div className="card-galaxy p-7 flex flex-col border-star-light/45 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 label-mono !text-star-light bg-space-900 px-3 py-1 rounded-full border border-star-light/30">
              Más popular
            </span>
            <BookOpen className="w-8 h-8 text-star-light mb-4" />
            <h3 className="text-lg font-extrabold mb-1">Blueprint: cómo hacer dropshipping paso a paso</h3>
            <p className="label-mono !text-star-light mb-4">$5 USD · pago único</p>
            <p className="text-ice text-sm mb-6 flex-1">
              La guía completa y aplicada: de la idea al primer pedido. El mismo proceso que uso con
              mis propios proyectos y clientes, en un documento que puedes seguir hoy.
            </p>
            <a
              href={BLUEPRINT_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-star w-full justify-center"
            >
              Comprar el Blueprint <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Discovery call */}
          <div className="card-galaxy p-7 flex flex-col">
            <Video className="w-8 h-8 text-star-light mb-4" />
            <h3 className="text-lg font-extrabold mb-1">Mentoría 1:1</h3>
            <p className="label-mono !text-signal-teal mb-4">$250 USD</p>
            <p className="text-ice text-sm mb-6 flex-1">
              Una llamada de discovery para revisar tu caso puntual, resolver dudas y definir un plan
              de acción hecho a tu medida.
            </p>
            <a href="#reservar" className="btn-ghost w-full justify-center">
              Agendar llamada <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Reserva de llamada */}
      <section id="reservar" className="max-w-2xl mx-auto px-6 py-14 border-t border-star-light/15">
        <div className="text-center mb-8">
          <Sparkles className="w-6 h-6 text-star-light mx-auto mb-3" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Agenda tu llamada de discovery</h2>
          <p className="text-ice text-sm max-w-md mx-auto">
            Elige el horario que más se te acomode y déjame tus datos. Te confirmo por WhatsApp o
            correo.
          </p>
        </div>
        <div className="card-galaxy p-8">
          <BookingForm />
        </div>
      </section>

      {/* FAQ corto */}
      <section className="max-w-3xl mx-auto px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">Preguntas frecuentes</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-frost mb-1.5">¿Qué recibo exactamente con el Blueprint?</h3>
            <p className="text-ice text-sm">
              Un documento paso a paso sobre cómo estructurar y lanzar tu dropshipping, con el mismo
              enfoque que uso en mis propios proyectos. Pago único de $5 USD, acceso inmediato tras
              la compra.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-frost mb-1.5">¿La comunidad de WhatsApp tiene algún costo?</h3>
            <p className="text-ice text-sm">
              No, es gratuita. Ahí comparto recursos y contenido antes que en cualquier otro canal.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-frost mb-1.5">¿Qué pasa después de agendar la mentoría 1:1?</h3>
            <p className="text-ice text-sm">
              Te contacto para confirmar el horario y coordinar el pago de los $250 USD antes de la
              llamada. En la sesión revisamos tu caso concreto y salimos con un plan claro.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4">¿Listo para dar el paso?</h2>
        <p className="text-ice mb-8">Elige la opción con la que quieras empezar.</p>
        <a href="#opciones" className="btn-star">
          Ver las 3 formas de empezar <ArrowRight className="w-4 h-4" />
        </a>
      </section>
    </div>
  );
}
