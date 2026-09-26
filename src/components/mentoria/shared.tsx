import { useRef, useState } from 'react';
import { ArrowRight, Users, SearchCheck, Target, Trophy } from 'lucide-react';

// Piezas compartidas entre /mentoria-dropshipping y /comienza-aqui-tu-mentoria: el
// formulario de reserva de llamada y el mapa de la mentoría.

export function encodeFormData(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&');
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const inputBase =
  'w-full rounded-xl bg-space-900 border px-4 py-3 text-sm text-frost placeholder:text-muted outline-none transition-colors';
export const inputState = (hasError: boolean) =>
  hasError ? 'border-red-400/80' : 'border-star-light/15 focus:border-cyan-400/60';

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-red-400 text-xs font-semibold mt-1.5 text-left">
      {message}
    </p>
  );
}


// Pregunta de filtro para la llamada: cuántos pedidos al día saca hoy.
const PEDIDOS_OPCIONES = [
  'Todavía no vendo nada (estoy empezando)',
  'Entre 1 y 5 pedidos al día',
  'Entre 6 y 20 pedidos al día',
  'Más de 20 pedidos al día',
];

function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function BookingForm({ origen }: { origen: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });
  const minDate = todayISO();

  const clear = (field: string) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

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
    if (!data.fecha_tentativa) nextErrors.fecha_tentativa = 'Elige una fecha tentativa.';
    else if (data.fecha_tentativa < minDate) nextErrors.fecha_tentativa = 'Elige una fecha de hoy en adelante.';
    const email = (data.user_email ?? '').trim();
    if (!email) nextErrors.user_email = 'Escribe tu correo para confirmarte la llamada.';
    else if (!EMAIL_RE.test(email))
      nextErrors.user_email = 'Este correo no parece válido. Revisa que tenga @ y un dominio.';
    if (!data.pedidos_dia) nextErrors.pedidos_dia = 'Cuéntame en qué punto estás hoy.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus({ message: '', type: null });
      return;
    }

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
      window.gtag?.('event', 'generate_lead', { form_name: 'reserva-mentoria', origen });
      setStatus({
        message: 'Solicitud enviada. Te escribo al correo para confirmar la fecha y el horario.',
        type: 'success',
      });
      form.reset();
    } catch (error) {
      console.error('Error al enviar la reserva a Netlify:', error);
      setStatus({
        message: 'Hubo un error al enviar tu solicitud. Intenta de nuevo en un momento.',
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
      noValidate
      className="space-y-5"
    >
      <input type="hidden" name="form-name" value="reserva-mentoria" />
      {/* Página desde la que llega la solicitud, para distinguir los leads */}
      <input type="hidden" name="origen" value={origen} />
      <p className="hidden">
        <label>
          No llenar: <input name="bot-field" />
        </label>
      </p>

      <div>
        <label htmlFor="fecha_tentativa" className="block text-sm font-semibold text-ice mb-2">
          Fecha tentativa para la llamada
        </label>
        <input
          id="fecha_tentativa"
          type="date"
          name="fecha_tentativa"
          min={minDate}
          required
          aria-invalid={!!errors.fecha_tentativa}
          onInput={() => clear('fecha_tentativa')}
          className={`${inputBase} ${inputState(!!errors.fecha_tentativa)} [color-scheme:dark]`}
        />
        <FieldError message={errors.fecha_tentativa} />
      </div>

      <div>
        <label htmlFor="booking_email" className="block text-sm font-semibold text-ice mb-2">
          Correo electrónico
        </label>
        <input
          id="booking_email"
          type="email"
          name="user_email"
          required
          autoComplete="email"
          placeholder="tucorreo@email.com"
          aria-invalid={!!errors.user_email}
          onInput={() => clear('user_email')}
          className={`${inputBase} ${inputState(!!errors.user_email)}`}
        />
        <FieldError message={errors.user_email} />
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-ice mb-2">
          ¿Cuántos pedidos al día sacas hoy?
        </legend>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {PEDIDOS_OPCIONES.map((op) => (
            <label
              key={op}
              className="flex items-center gap-3 rounded-xl border border-star-light/15 px-4 py-3 text-sm text-ice cursor-pointer transition-colors hover:border-cyan-400/40 has-[:checked]:border-cyan-400 has-[:checked]:bg-cyan-400/10 has-[:checked]:text-frost"
            >
              <input
                type="radio"
                name="pedidos_dia"
                value={op}
                onChange={() => clear('pedidos_dia')}
                className="accent-cyan-400"
              />
              {op}
            </label>
          ))}
        </div>
        <FieldError message={errors.pedidos_dia} />
      </fieldset>

      <button type="submit" disabled={sending} className="btn-star w-full justify-center disabled:opacity-60">
        {sending ? 'Enviando...' : 'Solicitar mi llamada'}
        <ArrowRight className="w-4 h-4" />
      </button>

      {status.type && (
        <p role="status" className={`text-sm ${status.type === 'success' ? 'text-signal-teal' : 'text-red-400'}`}>
          {status.message}
        </p>
      )}

      <p className="text-xs text-muted leading-relaxed">
        La fecha es tentativa y está sujeta a disponibilidad. Te confirmo el horario exacto por
        correo. Los cupos de mentoría son limitados cada mes.
      </p>
    </form>
  );
}

// Proceso de la mentoría (tercer escalón): nodo central con sus 4
// componentes, igual al mapa de la escalera de valor.
const MENTORIA_NODOS = [
  { icon: Users, title: 'Qué recibes', text: 'Acompañamiento 1 a 1 o grupal' },
  { icon: SearchCheck, title: 'Revisión experta', text: 'Tienda, campañas y números' },
  { icon: Target, title: 'Objetivo', text: 'Escalar tu tienda con sistema' },
  { icon: Trophy, title: 'Resultado', text: 'Casos de éxito que se vuelven contenido' },
];

function NodoCard({ icon: Icon, title, text }: (typeof MENTORIA_NODOS)[number]) {
  return (
    <div className="rounded-xl border border-star-light/15 bg-space-900/90 p-4 h-full">
      <p className="font-extrabold text-frost text-sm mb-1 flex items-center gap-2">
        <Icon className="w-4 h-4 text-teal-300" /> {title}
      </p>
      <p className="text-ice text-sm leading-snug">{text}</p>
    </div>
  );
}

function NodoCentral() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 px-6 py-5 shadow-[0_0_50px_-10px_rgba(20,184,166,0.65)] text-left">
      <p className="text-[11px] font-bold tracking-[0.2em] text-teal-50/90 mb-1">03 · PREMIUM</p>
      <p className="text-2xl font-extrabold text-white leading-tight">Mentoría</p>
      <p className="text-sm text-teal-50/90 mt-1">Etapa: transformación</p>
    </div>
  );
}

export function MentoriaProceso() {
  const [a, b, c, d] = MENTORIA_NODOS;
  return (
    <>
      {/* Mobile: nodo arriba y sus 4 componentes debajo */}
      <div className="md:hidden space-y-4">
        <NodoCentral />
        <div className="grid grid-cols-2 gap-3">
          {MENTORIA_NODOS.map((n) => (
            <NodoCard key={n.title} {...n} />
          ))}
        </div>
      </div>

      {/* Desktop: mapa con conectores curvos */}
      <div className="hidden md:grid relative max-w-3xl mx-auto grid-cols-2 gap-x-24 grid-rows-[92px_64px_120px_64px_92px]">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 432"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g fill="none" stroke="rgba(45,212,191,0.75)" strokeWidth="1.5" vectorEffect="non-scaling-stroke">
            <path d="M22 92 C22 130 50 120 50 156" vectorEffect="non-scaling-stroke" />
            <path d="M78 92 C78 130 50 120 50 156" vectorEffect="non-scaling-stroke" />
            <path d="M50 276 C50 312 22 302 22 340" vectorEffect="non-scaling-stroke" />
            <path d="M50 276 C50 312 78 302 78 340" vectorEffect="non-scaling-stroke" />
          </g>
          <path
            d="M66 216 C96 216 99 280 94 336"
            fill="none"
            stroke="rgba(45,212,191,0.6)"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="row-start-1 col-start-1 relative">
          <NodoCard {...a} />
        </div>
        <div className="row-start-1 col-start-2 relative">
          <NodoCard {...b} />
        </div>
        <div className="row-start-3 col-span-2 relative flex justify-center">
          <div className="w-72">
            <NodoCentral />
          </div>
        </div>
        <div className="row-start-5 col-start-1 relative">
          <NodoCard {...c} />
        </div>
        <div className="row-start-5 col-start-2 relative">
          <NodoCard {...d} />
        </div>
      </div>
    </>
  );
}

