import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookingForm,
  EMAIL_RE,
  FieldError,
  encodeFormData,
  inputBase,
  inputState,
} from './mentoria/shared';
import { BLUEPRINT, MENTORIA, WHATSAPP_LINK } from '../data/oferta';
import {
  ArrowRight,
  MessageCircle,
  BookOpen,
  Video,
  Sparkles,
  Briefcase,
  Rocket,
  GraduationCap,
  Store,
  TrendingUp,
  Linkedin,
  ImageOff,
  PlayCircle,
  Volume2,
  VolumeX,
  Download,
  X,
  CheckCircle2,
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


// PDF del caso de estudio que se descarga desde el popup tras dejar los
// datos. TODO: subir el archivo a /public con exactamente este nombre.
const CASE_STUDY_PDF = '/caso-de-estudio-dropshipping.pdf';

// Precios visibles en la página (se usan en tarjetas y FAQ).
const BLUEPRINT_PRICE = BLUEPRINT.precio;
const MENTORIA_PRICE = `${MENTORIA.precio} ${MENTORIA.periodo}`;

// TODO: reemplazar por el link real de cobro en Bold (checkout.bold.co/payment/...).
const BLUEPRINT_PAYMENT_LINK = 'https://checkout.bold.co/payment/TU-LINK-DE-BOLD';

// Países con bandera + indicativo telefónico, para el selector de WhatsApp
// con prefijo de país (mismo patrón visual que la referencia de Master
// Escala: bandera + código pegados al campo de número).
const COUNTRY_CODES = [
  { name: 'Colombia', flag: '🇨🇴', dial: '+57' },
  { name: 'Ecuador', flag: '🇪🇨', dial: '+593' },
  { name: 'México', flag: '🇲🇽', dial: '+52' },
  { name: 'Perú', flag: '🇵🇪', dial: '+51' },
  { name: 'Uruguay', flag: '🇺🇾', dial: '+598' },
  { name: 'Paraguay', flag: '🇵🇾', dial: '+595' },
  { name: 'Argentina', flag: '🇦🇷', dial: '+54' },
  { name: 'Chile', flag: '🇨🇱', dial: '+56' },
  { name: 'Brasil', flag: '🇧🇷', dial: '+55' },
  { name: 'Costa Rica', flag: '🇨🇷', dial: '+506' },
  { name: 'Puerto Rico', flag: '🇵🇷', dial: '+1' },
  { name: 'República Dominicana', flag: '🇩🇴', dial: '+1' },
  { name: 'Guatemala', flag: '🇬🇹', dial: '+502' },
  { name: 'Honduras', flag: '🇭🇳', dial: '+504' },
  { name: 'El Salvador', flag: '🇸🇻', dial: '+503' },
  { name: 'Nicaragua', flag: '🇳🇮', dial: '+505' },
  { name: 'Panamá', flag: '🇵🇦', dial: '+507' },
  { name: 'España', flag: '🇪🇸', dial: '+34' },
  { name: 'Estados Unidos', flag: '🇺🇸', dial: '+1' },
  { name: 'Venezuela', flag: '🇻🇪', dial: '+58' },
];

// TODO: reemplazar por el video real (ej: '/mentoria-hero.mp4'). Mientras
// esté vacío, se muestra un placeholder en el mismo espacio para no
// inventar contenido que todavía no existe.
const HERO_VIDEO_SRC = '';

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

// Capturas reales de resultados (en /public/resultados). Para agregar
// otra, súmala aquí con su texto alternativo y su pie de foto.
const RESULT_IMAGES: { src: string; alt: string; caption: string }[] = [
  {
    src: '/resultados/pedidos-abr-jun-2026.webp',
    alt: 'Panel de pedidos de abril a junio de 2026: 1.503 pedidos generados y $138.922.159 vendidos',
    caption: 'Abr a jun 2026: 1.503 pedidos y $138,9 M vendidos',
  },
  {
    src: '/resultados/pedidos-jul-sep-2026.webp',
    alt: 'Panel de pedidos de julio a septiembre de 2026: 2.802 pedidos generados y $252.911.013 vendidos',
    caption: 'Jul a sep 2026: 2.802 pedidos y $252,9 M vendidos',
  },
  {
    src: '/resultados/rendimiento-abr-jun-2026.webp',
    alt: 'Gráfica de rendimiento diario de abril a junio de 2026 con pedidos, utilidad y entregados',
    caption: 'Rendimiento diario abr a jun 2026',
  },
  {
    src: '/resultados/rendimiento-jul-sep-2026.webp',
    alt: 'Gráfica de rendimiento diario de julio a septiembre de 2026 con pedidos, utilidad y entregados',
    caption: 'Rendimiento diario jul a sep 2026',
  },
  {
    src: '/resultados/sesiones-tienda-2026.webp',
    alt: 'Sesiones de la tienda online en 2026: 159.422, un 395% más que el periodo anterior',
    caption: '159.422 sesiones en la tienda en 2026 (+395%)',
  },
  {
    src: '/resultados/ventas-tienda-2026.webp',
    alt: 'Ventas totales de la tienda online en 2026: $408.835.124, un 250% más que el periodo anterior',
    caption: '$408,8 M en ventas de la tienda en 2026 (+250%)',
  },
];

// TODO: cuando tengas testimonios de estudiantes o clientes de la mentoría,
// agrégalos aquí. Mientras el array esté vacío, la sección de prueba social
// no se muestra en la página.
const TESTIMONIALS: { name: string; quote: string }[] = [];

// Video del hero con botón de silencio/sonido superpuesto, igual que la
// referencia. Si todavía no hay archivo cargado (HERO_VIDEO_SRC vacío), se
// muestra un placeholder marcado en vez de inventar contenido.
function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  if (!HERO_VIDEO_SRC) {
    return (
      <div className="relative aspect-[9/16] sm:aspect-video w-full rounded-2xl border border-cyan-400/25 bg-space-900 flex flex-col items-center justify-center gap-3 text-center px-6">
        <PlayCircle className="w-10 h-10 text-cyan-400" />
        <p className="text-sm text-muted">
          Espacio reservado para el video del caso de estudio. Se agrega en{' '}
          <code className="text-cyan-400">HERO_VIDEO_SRC</code> dentro de este componente.
        </p>
      </div>
    );
  }

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <div className="relative aspect-[9/16] sm:aspect-video w-full rounded-2xl overflow-hidden border border-cyan-400/25 bg-black">
      <video
        ref={videoRef}
        src={HERO_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 rounded-full bg-black/70 border border-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/85 transition-colors"
      >
        {muted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        {muted ? 'Activar sonido' : 'Silenciar'}
      </button>
    </div>
  );
}

// Popup que aparece cuando el lead se guardó bien: descarga del caso de
// estudio en PDF y acceso al grupo gratuito de WhatsApp.
function CaseStudyModal({ open, name, onClose }: { open: boolean; name: string; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const firstName = name.trim().split(/\s+/)[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-study-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-black via-space-950 to-nebula p-7 sm:p-8 text-center shadow-[0_0_60px_-15px_rgba(34,211,238,0.45)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-9 h-9 rounded-full inline-flex items-center justify-center text-muted hover:text-frost hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>
        <CheckCircle2 className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
        <h2 id="case-study-title" className="display-xl text-2xl sm:text-3xl mb-3">
          {firstName ? `¡Listo, ${firstName}!` : '¡Listo!'}
        </h2>
        <p className="text-ice text-sm leading-relaxed mb-6">
          Tu caso de estudio está listo para descargar. Y si quieres seguir aprendiendo conmigo,
          únete gratis a la comunidad de WhatsApp.
        </p>
        <div className="space-y-3">
          <a
            href={CASE_STUDY_PDF}
            download
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#FF2D55] hover:bg-[#e6234c] text-white font-bold text-sm sm:text-base px-6 py-4 transition-colors"
          >
            <Download className="w-5 h-5" /> Descargar el caso de estudio (PDF)
          </a>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-black font-bold text-sm sm:text-base px-6 py-4 transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> Unirme gratis al grupo de WhatsApp
          </a>
        </div>
        <button
          type="button"
          onClick={() => {
            onClose();
            document.getElementById('opciones')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-5 text-xs text-muted underline hover:text-frost"
        >
          Ver las 3 formas de empezar
        </button>
      </div>
    </div>
  );
}

// Formulario de captura del hero: nombre, correo, país y WhatsApp. Si el
// correo es válido y Netlify guarda el lead, se abre el popup del caso de
// estudio.
function LeadCaptureForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [countryIndex, setCountryIndex] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [modal, setModal] = useState<{ open: boolean; name: string }>({ open: false, name: '' });

  const selectedCountry = COUNTRY_CODES[countryIndex];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = String(value);
    });

    const nextErrors: Record<string, string> = {};
    if ((data.lead_name ?? '').trim().length < 2) nextErrors.lead_name = 'Escribe tu nombre.';
    const email = (data.lead_email ?? '').trim();
    if (!email) nextErrors.lead_email = 'Escribe tu correo para enviarte el caso de estudio.';
    else if (!EMAIL_RE.test(email))
      nextErrors.lead_email = 'Este correo no parece válido. Revisa que tenga @ y un dominio.';
    if (whatsappNumber.replace(/\D/g, '').length < 7)
      nextErrors.lead_whatsapp = 'Escribe un número de WhatsApp válido.';
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSending(true);
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encodeFormData(data),
      });
      if (!response.ok) {
        throw new Error(`Netlify Forms respondió con estado ${response.status}`);
      }
      window.gtag?.('event', 'generate_lead', { form_name: 'lead-mentoria' });
      setModal({ open: true, name: data.lead_name ?? '' });
      form.reset();
      setCountryIndex(0);
      setWhatsappNumber('');
    } catch (error) {
      console.error('Error al enviar el lead a Netlify:', error);
      setSubmitError('Hubo un error al enviar tus datos. Intenta de nuevo en un momento.');
    } finally {
      setSending(false);
    }
  };

  const clear = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        name="lead-mentoria"
        data-netlify="true"
        netlify-honeypot="bot-field"
        noValidate
        className="space-y-3 text-left"
      >
        <input type="hidden" name="form-name" value="lead-mentoria" />
        <p className="hidden">
          <label>
            No llenar: <input name="bot-field" />
          </label>
        </p>

        <div>
          <input
            type="text"
            name="lead_name"
            required
            autoComplete="name"
            placeholder="Nombre completo"
            aria-invalid={!!errors.lead_name}
            onInput={() => clear('lead_name')}
            className={`${inputBase} ${inputState(!!errors.lead_name)}`}
          />
          <FieldError message={errors.lead_name} />
        </div>
        <div>
          <input
            type="email"
            name="lead_email"
            required
            autoComplete="email"
            placeholder="Correo electrónico"
            aria-invalid={!!errors.lead_email}
            onInput={() => clear('lead_email')}
            className={`${inputBase} ${inputState(!!errors.lead_email)}`}
          />
          <FieldError message={errors.lead_email} />
        </div>
        <input type="hidden" name="lead_country" value={selectedCountry.name} />
        <div>
          <div className="flex gap-2">
            <select
              value={countryIndex}
              onChange={(e) => setCountryIndex(Number(e.target.value))}
              aria-label="Indicativo de país"
              className="shrink-0 w-[6.5rem] rounded-xl bg-space-900 border border-star-light/15 px-2 py-3 text-sm text-frost focus:border-cyan-400/60 outline-none"
            >
              {COUNTRY_CODES.map((c, i) => (
                <option key={c.name} value={i}>
                  {c.flag} {c.dial}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => {
                setWhatsappNumber(e.target.value);
                clear('lead_whatsapp');
              }}
              required
              autoComplete="tel-national"
              placeholder="Número de WhatsApp"
              aria-invalid={!!errors.lead_whatsapp}
              className={`${inputBase} ${inputState(!!errors.lead_whatsapp)}`}
            />
          </div>
          <FieldError message={errors.lead_whatsapp} />
        </div>
        <input type="hidden" name="lead_whatsapp" value={`${selectedCountry.dial} ${whatsappNumber}`} />

        <button
          type="submit"
          disabled={sending}
          className="w-full justify-center inline-flex items-center gap-2 rounded-full bg-[#FF2D55] hover:bg-[#e6234c] text-white font-bold text-sm sm:text-base px-6 py-4 transition-colors disabled:opacity-60"
        >
          <Download className="w-5 h-5" />
          {sending ? 'Enviando...' : 'QUIERO EL CASO DE ESTUDIO'}
        </button>

        {submitError && (
          <p role="alert" className="text-sm text-red-400">
            {submitError}
          </p>
        )}

        <p className="text-xs text-muted leading-relaxed">
          Al dar clic aceptas que te contacte por WhatsApp o correo para darte seguimiento, según la{' '}
          <Link to="/privacidad" className="underline hover:text-frost">
            Política de Privacidad
          </Link>
          .
        </p>
      </form>
      <CaseStudyModal
        open={modal.open}
        name={modal.name}
        onClose={() => setModal({ open: false, name: '' })}
      />
    </>
  );
}

export default function DropshippingMentoria() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-space-950 to-nebula text-frost">
      <div className="bg-cyan-400 text-black text-center py-2.5 px-3">
        <p className="label-mono !text-black !tracking-wide text-[11px] sm:text-xs font-bold">
          Programa de mentoría para emprendedores y emprendedoras
        </p>
      </div>

      {/* Hero: título, subtítulo corto, formulario y video */}
      <section className="max-w-3xl mx-auto px-3 sm:px-6 pt-10 pb-16">
        <div className="text-center mb-8">
          <span className="eyebrow">Caso de estudio · $10.000 USD de facturación en el mes 2</span>
          <h1 className="display-xl text-4xl sm:text-5xl md:text-6xl mt-6 mb-6">
            Te enseño el sistema de dropshipping para que vendas{' '}
            <span className="text-cyan-400 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)]">
              LO QUE SEA
            </span>{' '}
            por internet
          </h1>
          <p className="text-ice text-lg max-w-xl mx-auto">
            Deja tus datos y descarga gratis el caso de estudio de cómo llegamos a $10.000 USD de
            facturación en el mes 2 con una tienda desde cero.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-space-900 p-5 sm:p-8 mb-6">
          <p className="label-mono !text-cyan-400 mb-4 text-center">
            Recibe el caso de estudio gratis
          </p>
          <LeadCaptureForm />
        </div>

        <HeroVideo />
      </section>

      {/* Para quién es */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 border-t border-star-light/15">
        <h2 className="display-xl text-3xl md:text-5xl mb-3 text-center">
          Esto es para ti <span className="text-cyan-400">si...</span>
        </h2>
        <p className="text-muted text-center text-sm mb-10">Si te identificas con al menos una, sigue leyendo.</p>
        <div className="grid md:grid-cols-2 gap-3 md:gap-4">
          {QUALIFY_ITEMS.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={`rounded-2xl border border-star-light/15 bg-space-900/70 p-5 md:p-6 flex items-start gap-4 transition-colors hover:border-cyan-400/40 ${
                i === QUALIFY_ITEMS.length - 1 && QUALIFY_ITEMS.length % 2 === 1
                  ? 'md:col-span-2 md:max-w-[calc(50%-0.5rem)] md:mx-auto md:w-full'
                  : ''
              }`}
            >
              <span className="shrink-0 w-11 h-11 rounded-xl bg-cyan-400/10 border border-cyan-400/25 inline-flex items-center justify-center">
                <Icon className="w-5 h-5 text-cyan-400" />
              </span>
              <div>
                <h3 className="font-extrabold text-frost text-base mb-1">{title}</h3>
                <p className="text-ice text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {TESTIMONIALS.length > 0 && (
        <section className="max-w-5xl mx-auto px-3 sm:px-6 py-14 border-t border-star-light/15">
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

      {/* Autoridad */}
      <section className="max-w-4xl mx-auto px-3 sm:px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-center">
          +15 años de experiencia en marketing digital, ecommerce y desarrollo web
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
            Llevo más de 15 años diseñando campañas y sistemas de medición para marcas grandes y para
            negocios que están empezando: desde equipos corporativos como Telefónica, UNICEF y Banco
            de Occidente, hasta emprendedores que arrancan su primer ecommerce.
          </p>
          <p className="text-ice leading-relaxed">
            No prometo cifras de ingresos ni fórmulas mágicas. Te ofrezco un método claro, basado en
            datos, y la posibilidad de resolver tus dudas conmigo directamente.
          </p>
        </div>
      </section>

      {/* Resultados */}
      <section className="max-w-5xl mx-auto px-3 sm:px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-center">Algunos resultados</h2>
        <p className="text-muted text-sm text-center mb-10">
          Capturas reales de los paneles de mis tiendas en 2026. Valores en pesos colombianos.
        </p>
        {RESULT_IMAGES.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-5">
            {RESULT_IMAGES.map((r) => (
              <figure
                key={r.src}
                className="rounded-2xl border border-star-light/15 bg-space-900/70 p-3 transition-colors hover:border-cyan-400/40"
              >
                <a href={r.src} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="rounded-xl bg-white p-2 sm:p-3 aspect-[2/1] flex items-center justify-center overflow-hidden">
                    <img
                      src={r.src}
                      alt={r.alt}
                      loading="lazy"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </a>
                <figcaption className="text-ice text-sm font-semibold mt-3 px-1">{r.caption}</figcaption>
              </figure>
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

      {/* Escalera de valor: 3 formas de empezar */}
      <section id="opciones" className="max-w-5xl mx-auto px-3 sm:px-6 py-14 border-t border-star-light/15">
        <div className="text-center mb-10">
          <span className="eyebrow">Elige cómo empezar</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-4">3 formas de dar el paso</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          <div className="card-galaxy p-7 flex flex-col">
            <p className="label-mono !text-muted mb-4">01 · Gratis</p>
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

          <div className="card-galaxy p-7 flex flex-col border-star-light/45 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 label-mono !text-star-light bg-space-900 px-3 py-1 rounded-full border border-star-light/30 whitespace-nowrap">
              Más popular
            </span>
            <p className="label-mono !text-muted mb-4">02 · Pago único</p>
            <BookOpen className="w-8 h-8 text-star-light mb-4" />
            <h3 className="text-lg font-extrabold mb-1">Blueprint: cómo hacer dropshipping paso a paso</h3>
            <p className="label-mono !text-star-light mb-4">{BLUEPRINT_PRICE} · pago único</p>
            <p className="text-ice text-sm mb-6 flex-1">
              El mapa visual y el PDF con el paso a paso para arrancar desde cero, aunque no sepas
              nada: de la idea al primer pedido.
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

          <div className="rounded-card p-[1px] bg-gradient-to-br from-teal-400 to-emerald-500 shadow-[0_0_40px_-12px_rgba(20,184,166,0.6)]">
            <div className="rounded-card bg-space-800 p-7 flex flex-col h-full">
              <p className="label-mono !text-teal-300 mb-4">03 · Premium</p>
              <Video className="w-8 h-8 text-teal-300 mb-4" />
              <h3 className="text-lg font-extrabold mb-1">Mentoría</h3>
              <p className="label-mono !text-signal-teal mb-4">{MENTORIA_PRICE}</p>
              <p className="text-ice text-sm mb-6 flex-1">
                Acompañamiento 1 a 1, con revisión experta de tu tienda, tus campañas y tus
                números, para escalar con sistema.
              </p>
              <Link to="/empieza-aqui-tu-mentoria" className="btn-ghost w-full justify-center !border-teal-400/50">
                Ver la mentoría completa <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reserva de llamada */}
      <section id="reservar" className="max-w-2xl mx-auto px-3 sm:px-6 py-14 border-t border-star-light/15">
        <div className="text-center mb-8">
          <Sparkles className="w-6 h-6 text-star-light mx-auto mb-3" />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Agenda tu llamada</h2>
          <p className="text-ice text-sm max-w-md mx-auto">
            Elige una fecha tentativa y cuéntame en qué punto estás. Revisamos si la mentoría es para
            ti y te confirmo por correo.
          </p>
        </div>
        <div className="card-galaxy p-6 sm:p-8">
          <BookingForm origen="mentoria-dropshipping" />
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-3 sm:px-6 py-14 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-star-light/15 bg-space-900/60 px-5 py-4 open:border-cyan-400/40"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-bold text-frost">
                {f.q}
                <span className="text-cyan-400 text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-ice text-sm leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-3xl mx-auto px-3 sm:px-6 py-16 text-center border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-4">¿Listo para dar el paso?</h2>
        <p className="text-ice mb-8">Elige la opción con la que quieras empezar.</p>
        <a href="#opciones" className="btn-star">
          Ver las 3 formas de empezar <ArrowRight className="w-4 h-4" />
        </a>
      </section>

      {/* Disclaimers compactos */}
      <footer className="border-t border-star-light/10">
        <div className="max-w-3xl mx-auto px-4 py-6 text-muted/70 text-[10px] sm:text-[11px] leading-snug space-y-1.5 text-center">
          <p>
            Este sitio no es parte de Facebook, Meta o Instagram ni está respaldado por ellos.
            FACEBOOK e INSTAGRAM son marcas registradas de Meta, Inc.
          </p>
          <p>
            Los resultados mencionados no son típicos ni garantizados: dependen de tu esfuerzo,
            producto, mercado y ejecución. Todo negocio implica riesgo.
          </p>
          <p>
            © {new Date().getFullYear()} Samuel González ·{' '}
            <Link to="/privacidad" className="underline hover:text-frost">
              Privacidad
            </Link>{' '}
            ·{' '}
            <Link to="/terminos" className="underline hover:text-frost">
              Términos
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

const FAQS = [
  {
    q: '¿Cómo recibo el caso de estudio?',
    a: 'Deja tu nombre, correo y WhatsApp en el formulario de arriba. Apenas se envíe, se abre una ventana para descargar el PDF y unirte al grupo gratuito de WhatsApp.',
  },
  {
    q: '¿Necesito experiencia previa para empezar?',
    a: 'No. El Blueprint está pensado para arrancar desde cero, y en la comunidad y la mentoría resolvemos las dudas a medida que avanzas.',
  },
  {
    q: '¿Qué incluye el Blueprint?',
    a: `Un mapa visual y un PDF con el paso a paso para lanzar tu tienda de dropshipping: producto, tienda, pauta y operación. Pago único de ${BLUEPRINT_PRICE} con acceso inmediato.`,
  },
  {
    q: '¿La comunidad de WhatsApp tiene algún costo?',
    a: 'No, es gratuita. Ahí comparto recursos, respondo dudas rápidas y aviso primero cuando publico contenido nuevo.',
  },
  {
    q: '¿Cómo funciona la mentoría?',
    a: 'Es acompañamiento 1 a 1, siempre en sesiones privadas por videollamada. Revisamos tu tienda, tus campañas y tus números, y armamos un sistema para escalar. Los cupos son limitados cada mes.',
  },
  {
    q: '¿Qué pasa después de solicitar la llamada?',
    a: 'Reviso tu solicitud y te escribo al correo para confirmar el horario según disponibilidad. En la llamada vemos si la mentoría encaja con tu momento y, si es así, coordinamos el pago y el arranque.',
  },
  {
    q: '¿Necesito dinero para pauta?',
    a: 'Sí. Para vender por internet necesitas un presupuesto para anuncios, además del costo de la tienda. En la mentoría definimos uno acorde a tu etapa para no quemar dinero probando.',
  },
  {
    q: '¿Me garantizas resultados o ingresos específicos?',
    a: 'No. Te doy un método basado en datos y acompañamiento directo, pero tus resultados dependen de tu producto, tu mercado, tu ejecución y tu constancia. Quien te prometa una cifra fija de ingresos te está vendiendo humo.',
  },
];
