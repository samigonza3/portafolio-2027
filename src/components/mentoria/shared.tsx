import { useRef, useState } from 'react';
import { ArrowRight, ArrowDown } from 'lucide-react';

// Piezas compartidas entre /mentoria-dropshipping y /empieza-aqui-tu-mentoria: el
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

// ============================================================
// Mapa de la escalera de valor ("Del grupo gratis a la mentoría"):
// atracción → grupo de WhatsApp → Blueprint → mentoría, con los casos de
// éxito volviendo a alimentar la atracción. Mismo contenido del mapa
// mental de la marca personal.
// ============================================================

type Tono = 'violet' | 'blue' | 'teal';

type Etapa = {
  id: string;
  tag: string;
  nombre: string;
  etapa: string;
  tono: Tono;
  nodos: { titulo: string; texto: string }[]; // [arriba-izq, arriba-der, abajo-izq, abajo-der]
  puente?: string; // etiqueta de la flecha hacia la siguiente etapa
};

const ATRACCION = [
  { titulo: 'Contenido orgánico', texto: 'Reels, TikTok, LinkedIn' },
  { titulo: 'Pauta', texto: 'Meta Ads y TikTok Ads' },
  { titulo: 'Referidos', texto: 'Alumnos y comunidad' },
];

const ETAPAS: Etapa[] = [
  {
    id: 'whatsapp',
    tag: '01 · Gratis',
    nombre: 'Grupo de WhatsApp',
    etapa: 'Etapa: confianza',
    tono: 'violet',
    nodos: [
      { titulo: 'Qué recibes', texto: 'Tips semanales, noticias y casos reales' },
      { titulo: 'Lead magnet', texto: 'Infografía del Blueprint gratis al entrar' },
      { titulo: 'Objetivo', texto: 'Construir autoridad y confianza' },
      { titulo: 'Puente', texto: 'Oferta del Blueprint con precio de lanzamiento' },
    ],
    puente: 'oferta',
  },
  {
    id: 'blueprint',
    tag: '02 · Bajo costo',
    nombre: 'Blueprint Dropshipping',
    etapa: 'Etapa: conversión',
    tono: 'blue',
    nodos: [
      { titulo: 'Qué recibes', texto: 'Guía de 10 etapas, plantillas y KPIs' },
      { titulo: 'Precio accesible', texto: 'Filtra a los compradores reales' },
      { titulo: 'Objetivo', texto: 'Que logres tu primer resultado' },
      { titulo: 'Puente', texto: 'Invitación a mentoría para quien ya aplicó' },
    ],
    puente: 'invitación',
  },
  {
    id: 'mentoria',
    tag: '03 · Premium',
    nombre: 'Mentoría',
    etapa: 'Etapa: transformación',
    tono: 'teal',
    nodos: [
      { titulo: 'Qué recibes', texto: 'Acompañamiento 1 a 1, en sesiones privadas' },
      { titulo: 'Revisión experta', texto: 'Tienda, campañas y números' },
      { titulo: 'Objetivo', texto: 'Escalar tu tienda con sistema' },
      { titulo: 'Resultado', texto: 'Casos de éxito que se vuelven contenido' },
    ],
  },
];

const TONOS: Record<Tono, { nodo: string; stroke: string; label: string }> = {
  violet: {
    nodo: 'from-violet-600 to-purple-500 shadow-[0_0_50px_-12px_rgba(139,92,246,0.7)]',
    stroke: 'rgba(139,92,246,0.8)',
    label: 'text-violet-300',
  },
  blue: {
    nodo: 'from-blue-600 to-sky-500 shadow-[0_0_50px_-12px_rgba(59,130,246,0.7)]',
    stroke: 'rgba(59,130,246,0.8)',
    label: 'text-sky-300',
  },
  teal: {
    nodo: 'from-teal-500 to-emerald-500 shadow-[0_0_50px_-12px_rgba(20,184,166,0.7)]',
    stroke: 'rgba(45,212,191,0.8)',
    label: 'text-teal-300',
  },
};

function MapaCard({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-star-light/15 bg-space-900/90 px-3.5 py-3 h-full">
      <p className="font-extrabold text-frost text-[13px] leading-tight mb-1">{titulo}</p>
      <p className="text-ice text-xs leading-snug">{texto}</p>
    </div>
  );
}

function MapaNodo({ e, destacar }: { e: Etapa; destacar?: boolean }) {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${TONOS[e.tono].nodo} px-5 py-4 text-left w-full ${
        destacar ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-space-950' : ''
      }`}
    >
      <p className="text-[10px] font-bold tracking-[0.2em] text-white/80 uppercase mb-1">{e.tag}</p>
      <p className="text-lg xl:text-xl font-extrabold text-white leading-tight">{e.nombre}</p>
      <p className="text-xs text-white/85 mt-1">{e.etapa}</p>
    </div>
  );
}

// Etapa con sus 4 nodos y conectores curvos. Alturas fijas para que el SVG
// calce: tarjeta 108 · hueco 52 · nodo 116 · hueco 52 · tarjeta 108 = 436.
const H = { card: 108, gap: 52, nodo: 116 };
const H_TOTAL = H.card * 2 + H.gap * 2 + H.nodo;

function EtapaDiagrama({ e, destacar }: { e: Etapa; destacar?: boolean }) {
  const [a, b, c, d] = e.nodos;
  const y1 = H.card;
  const y2 = H.card + H.gap;
  const y3 = y2 + H.nodo;
  const y4 = y3 + H.gap;
  return (
    <div
      className="relative grid grid-cols-2 gap-x-3"
      style={{ gridTemplateRows: `${H.card}px ${H.gap}px ${H.nodo}px ${H.gap}px ${H.card}px` }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox={`0 0 100 ${H_TOTAL}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g fill="none" stroke={TONOS[e.tono].stroke} strokeWidth="1.5">
          {[
            `M25 ${y1} C25 ${y1 + 32} 50 ${y2 - 28} 50 ${y2}`,
            `M75 ${y1} C75 ${y1 + 32} 50 ${y2 - 28} 50 ${y2}`,
            `M50 ${y3} C50 ${y3 + 28} 25 ${y4 - 32} 25 ${y4}`,
            `M50 ${y3} C50 ${y3 + 28} 75 ${y4 - 32} 75 ${y4}`,
          ].map((dPath) => (
            <path key={dPath} d={dPath} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
      <div className="relative row-start-1 col-start-1"><MapaCard {...a} /></div>
      <div className="relative row-start-1 col-start-2"><MapaCard {...b} /></div>
      <div className="relative row-start-3 col-span-2 flex items-center justify-center px-4">
        <MapaNodo e={e} destacar={destacar} />
      </div>
      <div className="relative row-start-5 col-start-1"><MapaCard {...c} /></div>
      <div className="relative row-start-5 col-start-2"><MapaCard {...d} /></div>
    </div>
  );
}

function Flecha({ label, vertical }: { label: string; vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-1 py-3 text-star-light">
        <span className="font-mono text-[11px] tracking-wider">{label}</span>
        <ArrowDown className="w-5 h-5" />
      </div>
    );
  }
  return (
    <div className="relative h-full flex items-center" aria-hidden="true">
      <div className="w-full h-px bg-star-light/70" />
      <span className="absolute right-[-2px] w-0 h-0 border-y-[6px] border-y-transparent border-l-[9px] border-l-star-light/90" />
      <span className="absolute left-1/2 -translate-x-1/2 -translate-y-4 font-mono text-[10px] text-star-light whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

// Versión compacta de cada etapa para celular: nodo arriba y sus 4
// componentes en 2x2.
function EtapaCompacta({ e, destacar }: { e: Etapa; destacar?: boolean }) {
  return (
    <div className="space-y-3">
      <MapaNodo e={e} destacar={destacar} />
      <div className="grid grid-cols-2 gap-2.5">
        {e.nodos.map((n) => (
          <MapaCard key={n.titulo} {...n} />
        ))}
      </div>
    </div>
  );
}

export function MapaEscalera({ destacar }: { destacar?: 'whatsapp' | 'blueprint' | 'mentoria' }) {
  return (
    <div>
      {/* ===== Escritorio ancho: el mapa completo en horizontal ===== */}
      <div className="hidden xl:block">
        <div
          className="grid items-stretch"
          style={{ gridTemplateColumns: '172px 44px 1fr 64px 1fr 64px 1fr' }}
        >
          {/* 00 · Atracción */}
          <div className="relative" style={{ height: H_TOTAL }}>
            <p className="absolute top-6 left-0 right-0 text-center font-mono text-[10px] tracking-[0.2em] text-muted">
              00 · ATRACCIÓN
            </p>
            {ATRACCION.map((f, i) => (
              <div
                key={f.titulo}
                className="absolute left-0 right-0 -translate-y-1/2"
                style={{ top: H_TOTAL / 2 + (i - 1) * 112 }}
              >
                <MapaCard {...f} />
              </div>
            ))}
          </div>
          {/* Conectores de atracción al grupo */}
          <svg
            className="w-full"
            style={{ height: H_TOTAL }}
            viewBox={`0 0 44 ${H_TOTAL}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <g fill="none" stroke="rgba(127,168,255,0.55)" strokeWidth="1.5">
              {[-112, 0, 112].map((dy) => (
                <path
                  key={dy}
                  d={`M0 ${H_TOTAL / 2 + dy} C24 ${H_TOTAL / 2 + dy} 20 ${H_TOTAL / 2} 44 ${H_TOTAL / 2}`}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          </svg>
          {ETAPAS.map((e, i) => (
            <div key={e.id} className="contents">
              <EtapaDiagrama e={e} destacar={destacar === e.id} />
              {e.puente && i < ETAPAS.length - 1 && <Flecha label={e.puente} />}
            </div>
          ))}
        </div>
        {/* Retorno: los casos de éxito alimentan la atracción */}
        <div className="relative mt-3 mx-[86px] mr-[calc((100%-172px-44px-128px)/6)]">
          <div className="h-10 border-x border-b border-dashed border-teal-400/60 rounded-b-3xl" />
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-2.5 bg-space-950 px-3 font-mono text-[11px] text-teal-300 whitespace-nowrap">
            casos de éxito → alimentan la atracción
          </span>
        </div>
      </div>

      {/* ===== Tablet y celular: el mismo recorrido en vertical ===== */}
      <div className="xl:hidden max-w-2xl mx-auto">
        <div className="rounded-2xl border border-star-light/15 bg-space-900/60 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted text-center mb-3">00 · ATRACCIÓN</p>
          <div className="grid grid-cols-3 gap-2">
            {ATRACCION.map((f) => (
              <MapaCard key={f.titulo} {...f} />
            ))}
          </div>
        </div>
        <Flecha label="entran al grupo" vertical />
        {ETAPAS.map((e) => (
          <div key={e.id}>
            <EtapaCompacta e={e} destacar={destacar === e.id} />
            {e.puente && <Flecha label={e.puente} vertical />}
          </div>
        ))}
        <p className="mt-6 text-center font-mono text-[11px] text-teal-300 border border-dashed border-teal-400/50 rounded-full px-4 py-2">
          ↺ casos de éxito → alimentan la atracción
        </p>
      </div>
    </div>
  );
}
