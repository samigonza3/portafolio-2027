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
  Briefcase,
  Rocket,
  GraduationCap,
  Store,
  TrendingUp,
  Linkedin,
  ImageOff,
} from 'lucide-react';

// ============================================================
// Página de venta: Mentoría de Dropshipping / Ecommerce
// Estructura inspirada en el funnel de referencia de Master Escala
// (masterescala.co/soyivancaicedo): hero con captura de lead →
// calificación en tarjetas con ícono → prueba social → autoridad
// del mentor → resultados → oferta real → reserva → FAQ → disclaimers.
// Adaptada a la oferta real de Samuel: comunidad de WhatsApp
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

const COUNTRIES = [
  'Colombia',
  'Ecuador',
  'México',
  'Perú',
  'Uruguay',
  'Paraguay',
  'Argentina',
  'Chile',
  'Brasil',
  'Costa Rica',
  'Puerto Rico',
  'República Dominicana',
  'Guatemala',
  'Honduras',
  'El Salvador',
  'Nicaragua',
  'Panamá',
  'España',
  'Estados Unidos',
  'Venezuela',
];

// Tarjetas de calificación: ícono + título corto + descripción,
// mismo formato que "Esto es para ti solo si..." de la referencia.
const QUALIFY_ITEMS = [
  {
    icon: Briefcase,
    title: 'Eres empleado',
    description:
      'y aunque no estás satisfecho del todo, te da miedo soltar la seguridad de un sueldo fijo sin tener algo propio construido primero.',
  },
  {
    icon: Rocket,
    title: 'Eres emprendedor',
    description:
      'y quieres un negocio digital que puedas manejar desde cualquier parte, sin depender de un local físico ni de un horario fijo.',
  },
  {
    icon: GraduationCap,
    title: 'Ya compraste cursos grabados',
    description:
      'pero sin acompañamiento personalizado te perdiste en el camino y todavía no has visto resultados reales.',
  },
  {
    icon: Store,
    title: 'Tienes una tienda que no despega',
    description:
      'haces dropshipping o ecommerce, pero no logras resultados estables que te permitan dedicarte de lleno a esto.',
  },
  {
    icon: TrendingUp,
    title: 'Estás dispuesto a invertir en ti',
    description:
      'en tiempo y en dinero, para llevar tus resultados a otro nivel en vez de seguir probando solo por tu cuenta.',
  },
];

// TODO: cuando tengas capturas de resultados de clientes o de tus propias
// tiendas, agrégalas aquí como rutas de imagen (ej: '/resultados/venta-1.png')
// y la sección de resultados las muestra automáticamente en grid.
const RESULT_IMAGES: string[] = [];

// TODO: cuando tengas testimonios de estudiantes o clientes de la mentoría,
// agrégalos aquí. Mientras el array esté vacío, la sección de prueba social
// no se muestra en la página.
const TESTIMONIALS: { name: string; quote: string }[] = [];

function encodeFormData(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

// Formulario de captura de lead en el hero, mismo set de campos que la
// referencia: nombre, correo, país y WhatsApp. Al enviarlo, guarda el lead
// vía Netlify Forms y lleva al visitante a las 3 formas de empezar.
function LeadCaptureForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [country, setCountry] = useState(COUNTRIES[0]);
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
        message: 'Listo. Aquí abajo tienes el caso de estudio completo y las 3 formas de empezar.',
        type: 'success',
      });
      form.reset();
      setCountry(COUNTRIES[0]);
      document.getElementById('opciones')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error al enviar el lead a Netlify:', error);
      setStatus({
        message: 'Hubo un error al enviar tus datos. Intenta de nuevo o escríbeme directo.',
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
      name="lead-mentoria"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="space-y-3 text-left"
    >
      <input type="hidden" name="form-name" value="lead-mentoria" />
      <p className="hidden">
        <label>
          No llenar: <input name="bot-field" />
        </label>
      </p>

      <input
        type="text"
        name="lead_name"
        required
        placeholder="Nombre completo"
        className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-sm text-frost placeholder:text-muted focus:border-star-light/45 outline-none"
      />
      <input
        type="email"
        name="lead_email"
        required
        placeholder="Correo electrónico"
        className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-sm text-frost placeholder:text-muted focus:border-star-light/45 outline-none"
      />
      <select
        name="lead_country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-sm text-frost focus:border-star-light/45 outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="lead_whatsapp"
        required
        placeholder="WhatsApp (con indicativo del país)"
        className="w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3 text-sm text-frost placeholder:text-muted focus:border-star-light/45 outline-none"
      />

      <button type="submit" disabled={sending} className="btn-star w-full justify-center disabled:opacity-60">
        {sending ? 'Enviando...' : 'Accede aquí al caso de estudio'}
        <ArrowRight className="w-4 h-4" />
      </button>

      {status.type && (
        <p className={`text-sm ${status.type === 'success' ? 'text-signal-teal' : 'text-red-400'}`}>
          {status.message}
        </p>
      )}

      <p className="text-xs text-muted leading-relaxed">
        Al dar clic aceptas que te contacte por WhatsApp o correo para darte seguimiento.
      </p>
    </form>
  );
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
      {/* Hero: mismo formato que la referencia — headline + subheadline tipo
          "caso de estudio" + formulario de captura de lead arriba del scroll */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="text-center lg:text-left">
            <span className="eyebrow">Caso de estudio · $10.000 USD de facturación en el mes 2</span>
            <h1 className="display-xl text-4xl sm:text-5xl md:text-6xl mt-6 mb-6">
              Te enseño cómo vender <span className="glow">cualquier cosa</span>
              <br />
              por internet.
            </h1>
            <p className="text-ice text-lg mb-4">
              Ingresa tus datos y aprende con este caso de estudio cómo llegamos a $10.000 USD de
              facturación en el mes 2, en una tienda armada desde cero, con el mismo proceso que
              uso hoy con mis propios proyectos y con grandes marcas nacionales e internacionales.
            </p>
            <p className="text-muted text-sm mb-8">
              Parte de ese proceso también está en la guía{' '}
              <Link
                to="/blog/ecommerce-en-5-pasos-con-dropi"
                className="text-star-light underline hover:text-frost"
              >
                "Cómo lanzar un ecommerce en 5 pasos con Dropi"
              </Link>
              .
            </p>
          </div>
          <div className="card-galaxy p-6 sm:p-8">
            <p className="label-mono !text-star-light mb-4 text-center lg:text-left">
              Déjame tus datos y accede al caso de estudio
            </p>
            <LeadCaptureForm />
          </div>
        </div>
      </section>

      {/* Calificación / para quién es, en tarjetas con ícono como la referencia */}
      <section className="max-w-5xl mx-auto px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">
          Esto es para ti solo si...
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {QUALIFY_ITEMS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card-galaxy p-6 flex items-start gap-4">
              <Icon className="w-6 h-6 text-star-light shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-frost mb-1">{title}</h3>
                <p className="text-ice text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prueba social: solo se muestra cuando haya testimonios reales cargados
          en TESTIMONIALS, igual que la referencia pero sin inventar nada. */}
      {TESTIMONIALS.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 py-14 border-t border-star-light/15">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">
            Lo que dicen quienes ya pasaron por la mentoría
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-galaxy p-6">
                <p className="text-ice text-sm leading-relaxed mb-3">"{t.quote}"</p>
                <p className="label-mono !text-muted">{t.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Autoridad del mentor, mismo formato que la ficha de perfil de la
          referencia: foto, nombre, redes y bio */}
      <section className="max-w-4xl mx-auto px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-center">
          Por qué te conviene escucharme
        </h2>
        <div className="card-galaxy p-8 md:p-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
            <img
              src="/samuel-perfil.6836711e.jpg"
              alt="Samuel González"
              className="w-24 h-24 rounded-full object-cover border border-star-light/30"
            />
            <div className="text-center sm:text-left">
              <p className="font-extrabold text-lg text-frost">Samuel González</p>
              <p className="label-mono !text-muted mb-2">Data · Marketing · Code</p>
              <a
                href="https://www.linkedin.com/in/samuelgonzalez/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-star-light hover:text-frost inline-flex items-center gap-2 text-sm"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            </div>
          </div>
          <p className="text-ice leading-relaxed mb-4">
            Llevo más de una década diseñando campañas y sistemas de medición para marcas grandes y
            para negocios que están empezando: desde equipos corporativos como Telefónica, UNICEF y
            Banco de Occidente, hasta emprendedores que arrancan su primer ecommerce.
          </p>
          <p className="text-ice leading-relaxed">
            No prometo cifras de ingresos ni fórmulas mágicas. Te ofrezco un método claro, basado en
            datos, y la posibilidad de resolver tus dudas conmigo directamente.
          </p>
        </div>
      </section>

      {/* Resultados: solo se muestra cuando haya capturas reales cargadas en
          RESULT_IMAGES. Mientras tanto, se deja el espacio listo y marcado. */}
      <section className="max-w-5xl mx-auto px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">Algunos resultados</h2>
        {RESULT_IMAGES.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {RESULT_IMAGES.map((src) => (
              <img key={src} src={src} alt="Resultado" className="rounded-xl border border-star-light/15" />
            ))}
          </div>
        ) : (
          <div className="card-galaxy p-8 text-center text-muted flex flex-col items-center gap-3">
            <ImageOff className="w-6 h-6" />
            <p className="text-sm">
              Espacio reservado para capturas de resultados reales. Se agregan en{' '}
              <code className="text-star-light">RESULT_IMAGES</code> dentro de este componente.
            </p>
          </div>
        )}
      </section>

      {/* Las 3 formas de empezar: la oferta real de Samuel */}
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
          <div>
            <h3 className="font-bold text-frost mb-1.5">¿Me garantizas resultados o ingresos específicos?</h3>
            <p className="text-ice text-sm">
              No. Te doy un método basado en datos y acompañamiento directo, pero tus resultados
              dependen de tu producto, tu mercado, tu ejecución y tu constancia. Cualquiera que te
              prometa una cifra fija de ingresos te está vendiendo humo.
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

      {/* Disclaimers: igual función que en la referencia — transparencia legal
          y aviso de que este sitio no depende de Meta/Facebook/Instagram. */}
      <section className="max-w-3xl mx-auto px-6 py-14 border-t border-star-light/15">
        <div className="text-muted text-xs leading-relaxed space-y-3">
          <p>
            Este sitio no es parte del sitio web de Facebook, Meta o Instagram, ni está respaldado
            por ellos de ninguna manera. FACEBOOK e INSTAGRAM son marcas registradas de Meta, Inc.
          </p>
          <p>
            Los resultados y experiencias que se mencionan en esta página (propios o de terceros
            cuando se compartan) son personales y no típicos. No garantizo ingresos ni resultados
            específicos: dependen de tu esfuerzo, tu producto, tu mercado, tu ejecución y factores
            fuera de mi control. Todo negocio implica riesgo.
          </p>
          <p>
            Al enviar tu nombre, correo o WhatsApp en esta página, autorizas a que te contacte por
            esos medios para darte seguimiento sobre la mentoría, el Blueprint o la comunidad.
          </p>
        </div>
      </section>
    </div>
  );
}
