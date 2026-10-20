import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Send,
  MapPin,
  User,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CONTACTO } from '../data/contacto';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type SlotType = 'mentoria' | 'consultoria' | 'clase' | 'libre';

interface CalendarSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: SlotType;
  notes?: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<SlotType, string> = {
  mentoria: 'Mentoría 1:1',
  consultoria: 'Consultoría',
  clase: 'Clase / Taller',
  libre: 'Sesión libre',
};

const TYPE_DOT: Record<SlotType, string> = {
  mentoria: 'bg-star',
  consultoria: 'bg-signal-teal',
  clase: 'bg-signal-amber',
  libre: 'bg-frost/50',
};

const TYPE_CARD: Record<SlotType, string> = {
  mentoria: 'border-star/40 hover:border-star/70',
  consultoria: 'border-signal-teal/30 hover:border-signal-teal/60',
  clase: 'border-signal-amber/30 hover:border-signal-amber/60',
  libre: 'border-frost/15 hover:border-frost/40',
};

const TYPE_BADGE: Record<SlotType, string> = {
  mentoria: 'bg-star/20 text-star-light border-star/30',
  consultoria: 'bg-signal-teal/15 text-signal-teal border-signal-teal/30',
  clase: 'bg-signal-amber/15 text-signal-amber border-signal-amber/30',
  libre: 'bg-frost/10 text-frost border-frost/20',
};

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_MAP: Record<string, SlotType> = {
  m: 'mentoria', c: 'consultoria', k: 'clase', l: 'libre',
};

function decodeSlots(encoded: string): CalendarSlot[] {
  try {
    const raw = atob(encoded);
    if (/^[0-9]{16}[mckl]/.test(raw)) {
      return raw.split('~').map(s => {
        const date = s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8);
        const startTime = s.slice(8, 10) + ':' + s.slice(10, 12);
        const endTime = s.slice(12, 14) + ':' + s.slice(14, 16);
        const type: SlotType = TYPE_MAP[s.slice(16)] ?? 'libre';
        return { id: date + '-' + startTime, date, startTime, endTime, type };
      });
    }
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return [];
  }
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLong(iso: string) {
  const [y, m, d] = iso.split('-');
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return `${DAYS_ES[dt.getDay()]} ${d} de ${MONTHS_ES[Number(m) - 1]}`;
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Fecha', 'Horario', 'Datos'];
  return (
    <div className="flex items-center gap-1 justify-center mb-8">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <React.Fragment key={n}>
            <div className="flex items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                done ? 'bg-signal-teal text-space-950' :
                active ? 'bg-star text-frost' :
                'bg-space-800 text-muted border border-star-light/15'
              }`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline transition-colors ${active ? 'text-frost' : 'text-muted/60'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px max-w-12 transition-colors ${n < current ? 'bg-signal-teal/50' : 'bg-star-light/15'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 1: Calendar ────────────────────────────────────────────────────────

function StepDate({
  slots,
  onSelect,
}: {
  slots: CalendarSlot[];
  onSelect: (date: string) => void;
}) {
  const td = todayStr();
  const [ty, tm] = td.split('-').map(Number);

  const [viewYear, setViewYear] = useState(ty);
  const [viewMonth, setViewMonth] = useState(tm - 1); // 0-indexed

  // Available dates set and types map
  const dateTypes = new Map<string, Set<SlotType>>();
  slots.forEach(s => {
    if (s.date >= td) {
      if (!dateTypes.has(s.date)) dateTypes.set(s.date, new Set());
      dateTypes.get(s.date)!.add(s.type);
    }
  });
  const availableDates = new Set(dateTypes.keys());

  // Calendar grid
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const startOffset = (firstDayOfWeek + 6) % 7; // Monday-first
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // Navigation guards
  const isCurrentMonth = viewYear === ty && viewMonth === tm - 1;
  const maxDate = availableDates.size > 0
    ? [...availableDates].sort().at(-1)!
    : td;
  const [maxY, maxM] = maxDate.split('-').map(Number);
  const isMaxMonth = viewYear > maxY || (viewYear === maxY && viewMonth >= maxM - 1);

  const goPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  // All unique types that appear in available dates (for legend)
  const allTypes = new Set<SlotType>();
  dateTypes.forEach(types => types.forEach(t => allTypes.add(t)));

  if (availableDates.size === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-signal-amber/50" />
        <p className="text-frost font-semibold">No hay disponibilidad activa</p>
        <p className="text-muted text-sm mt-1">
          Este link ha expirado o aún no hay horarios configurados.
        </p>
        <a
          href={`mailto:${CONTACTO.email}`}
          className="mt-5 inline-flex items-center gap-2 btn-pill-light"
        >
          <Mail className="w-4 h-4" /> Escríbeme directamente
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-sans font-extrabold text-frost text-lg mb-1">Elige una fecha</h2>
      <p className="text-muted text-sm mb-5">Los días marcados tienen disponibilidad.</p>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          disabled={isCurrentMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-space-800 border border-star-light/15 text-muted hover:text-frost hover:border-star-light/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-sans font-bold text-frost text-sm tracking-wide">
          {MONTHS_ES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={goNext}
          disabled={isMaxMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-space-800 border border-star-light/15 text-muted hover:text-frost hover:border-star-light/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 mb-1.5">
        {DAY_NAMES.map(d => (
          <div
            key={d}
            className="text-center text-[9px] font-bold uppercase tracking-widest text-muted/50 py-1.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="aspect-square" />;

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isAvailable = availableDates.has(dateStr);
          const isToday = dateStr === td;
          const isPast = dateStr < td;
          const types = dateTypes.get(dateStr);

          return (
            <button
              key={`d-${i}`}
              onClick={() => isAvailable && onSelect(dateStr)}
              disabled={!isAvailable || isPast}
              className={`
                relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all select-none
                ${isAvailable && !isPast
                  ? 'bg-space-800 border border-star-light/20 hover:border-star-light/50 hover:bg-star/10 text-frost cursor-pointer'
                  : 'text-muted/20 cursor-default'}
                ${isToday ? 'ring-1 ring-star-light/50 ring-offset-1 ring-offset-space-900' : ''}
              `}
            >
              <span className={isToday ? 'text-star-light' : ''}>{day}</span>
              {types && types.size > 0 && (
                <div className="flex gap-0.5 absolute bottom-1.5">
                  {[...types].slice(0, 3).map(t => (
                    <div key={t} className={`w-1 h-1 rounded-full ${TYPE_DOT[t]}`} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {allTypes.size > 0 && (
        <div className="flex gap-4 mt-4 flex-wrap border-t border-star-light/10 pt-4">
          {([...allTypes] as SlotType[]).map(type => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${TYPE_DOT[type]}`} />
              <span className="text-[10px] text-muted/60">{TYPE_LABELS[type]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Time slots ──────────────────────────────────────────────────────

function StepTime({
  slots,
  date,
  onSelect,
  onBack,
}: {
  slots: CalendarSlot[];
  date: string;
  onSelect: (slot: CalendarSlot) => void;
  onBack: () => void;
}) {
  const daySlots = slots.filter(s => s.date === date);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-muted hover:text-frost transition-colors text-sm mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Cambiar fecha
      </button>

      <h2 className="font-sans font-extrabold text-frost text-lg mb-1">Elige un horario</h2>
      <p className="text-muted text-sm mb-6">
        <Calendar className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
        {formatDateLong(date)}
      </p>

      <div className="flex flex-col gap-3">
        {daySlots.map(slot => (
          <button
            key={slot.id}
            onClick={() => onSelect(slot)}
            className={`flex items-center gap-4 bg-space-900 border rounded-xl px-5 py-4 transition-all text-left ${TYPE_CARD[slot.type]} hover:bg-star/5`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-space-800 shrink-0">
              <Clock className="w-5 h-5 text-star-light" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-sans font-bold text-frost">
                  {slot.startTime} – {slot.endTime}
                </span>
                <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TYPE_BADGE[slot.type]}`}>
                  {TYPE_LABELS[slot.type]}
                </span>
              </div>
              {slot.notes && (
                <p className="text-xs text-muted mt-0.5">{slot.notes}</p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-muted shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 3: Contact form ────────────────────────────────────────────────────

function StepForm({
  slot,
  onBack,
  onSuccess,
}: {
  slot: CalendarSlot;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({ nombre: '', email: '', empresa: '', mensaje: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const slotSummary = `${formatDateLong(slot.date)} · ${slot.startTime}–${slot.endTime} · ${TYPE_LABELS[slot.type]}`;
    const body = new URLSearchParams({
      'form-name': 'reservar-espacio',
      nombre: form.nombre,
      email: form.email,
      empresa: form.empresa,
      mensaje: form.mensaje,
      slot: slotSummary,
    }).toString();
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      if (res.ok || res.status === 200 || res.redirected) {
        onSuccess();
      } else {
        setError('Hubo un problema al enviar. Intenta de nuevo o escríbeme directamente.');
      }
    } catch {
      setError('No se pudo enviar. Verifica tu conexión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-muted hover:text-frost transition-colors text-sm mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> Cambiar horario
      </button>

      {/* Selected slot summary */}
      <div className={`flex items-center gap-3 bg-space-900 border rounded-xl px-4 py-3 mb-6 ${TYPE_CARD[slot.type]}`}>
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-star/15 shrink-0">
          <Clock className="w-4 h-4 text-star-light" />
        </div>
        <div>
          <p className="text-frost font-semibold text-sm">{formatDateLong(slot.date)}</p>
          <p className="text-muted text-xs">
            {slot.startTime} – {slot.endTime} · {TYPE_LABELS[slot.type]}
          </p>
        </div>
      </div>

      <h2 className="font-sans font-extrabold text-frost text-lg mb-1">Tus datos</h2>
      <p className="text-muted text-sm mb-6">Completa la info y confirmo tu reserva por email.</p>

      {/* Hidden Netlify form declaration */}
      <form name="reservar-espacio" data-netlify="true" hidden>
        <input name="nombre" />
        <input name="email" />
        <input name="empresa" />
        <input name="mensaje" />
        <input name="slot" />
      </form>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label-mono !text-muted block mb-1.5">Nombre completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
              <input
                type="text"
                value={form.nombre}
                onChange={e => setField('nombre', e.target.value)}
                required
                placeholder="Tu nombre"
                className="w-full bg-space-800 border border-star-light/15 rounded-xl pl-10 pr-4 py-3 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="label-mono !text-muted block mb-1.5">Correo electrónico *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
              <input
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full bg-space-800 border border-star-light/15 rounded-xl pl-10 pr-4 py-3 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label-mono !text-muted block mb-1.5">Empresa / Proyecto</label>
          <input
            type="text"
            value={form.empresa}
            onChange={e => setField('empresa', e.target.value)}
            placeholder="Nombre de tu empresa o proyecto (opcional)"
            className="w-full bg-space-800 border border-star-light/15 rounded-xl px-4 py-3 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50 transition-colors"
          />
        </div>

        <div>
          <label className="label-mono !text-muted block mb-1.5">¿De qué quieres hablar? *</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-muted/50" />
            <textarea
              value={form.mensaje}
              onChange={e => setField('mensaje', e.target.value)}
              required
              rows={3}
              placeholder="Cuéntame brevemente el tema o proyecto que quieres tratar..."
              className="w-full bg-space-800 border border-star-light/15 rounded-xl pl-10 pr-4 py-3 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50 transition-colors resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-pill-light justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-frost/30 border-t-frost rounded-full animate-spin" />
              Enviando…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Confirmar reserva
            </>
          )}
        </button>

        <p className="text-center text-muted/60 text-xs">
          Al enviar aceptas que Samuel se ponga en contacto contigo por correo para confirmar.
        </p>
      </form>
    </div>
  );
}

// ─── Success screen ──────────────────────────────────────────────────────────

function SuccessScreen({ slot }: { slot: CalendarSlot }) {
  return (
    <div className="text-center py-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-signal-teal/15 border border-signal-teal/30 mb-6">
        <CheckCircle2 className="w-8 h-8 text-signal-teal" />
      </div>
      <h2 className="font-sans font-extrabold text-frost text-xl mb-2">¡Reserva enviada!</h2>
      <p className="text-muted text-sm max-w-xs mx-auto">
        Samuel revisará tu solicitud y te confirmará por correo. Quedan reservados para ti:
      </p>
      <div className="mt-4 inline-flex items-center gap-2 bg-space-900 border border-signal-teal/30 rounded-xl px-5 py-3">
        <Clock className="w-4 h-4 text-signal-teal shrink-0" />
        <span className="text-frost font-semibold text-sm">
          {formatDateLong(slot.date)} · {slot.startTime}–{slot.endTime}
        </span>
      </div>
      <div className="mt-6">
        <Link to="/" className="text-sm text-muted hover:text-frost transition-colors">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

// ─── No slots state ──────────────────────────────────────────────────────────

function NoSlotsState() {
  return (
    <div className="text-center py-12">
      <Calendar className="w-10 h-10 mx-auto mb-3 text-star-light/30" />
      <h2 className="font-sans font-extrabold text-frost text-lg mb-2">Reserva un espacio</h2>
      <p className="text-muted text-sm max-w-xs mx-auto">
        Para ver los horarios disponibles necesitas el link personalizado de Samuel.
        Si te lo compartió, asegúrate de abrirlo completo.
      </p>
      <a
        href={`mailto:${CONTACTO.email}`}
        className="mt-6 inline-flex items-center gap-2 btn-pill-light"
      >
        <Mail className="w-4 h-4" /> Contáctame directamente
      </a>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ReservarEspacio() {
  const [searchParams] = useSearchParams();
  const encoded = searchParams.get('v');
  const slots = encoded ? decodeSlots(encoded) : [];
  const hasSlots = slots.length > 0;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<CalendarSlot | null>(null);
  const [success, setSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-space-950">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-space-950/80 border-b border-star-light/15">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-sans font-extrabold text-lg tracking-tight text-frost">
            Samuel González
          </Link>
          <div className="flex items-center gap-3">
            <MapPin className="w-3.5 h-3.5 text-muted" />
            <span className="hidden sm:inline label-mono !text-muted">Cali, Colombia</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="eyebrow mb-4">
            <Calendar className="w-3 h-3" /> Reservar espacio
          </div>
          <h1 className="font-display font-bold text-3xl text-frost display-xl leading-tight">
            AGENDA<br />UN ESPACIO
          </h1>
          <p className="text-muted text-sm mt-3">
            Sesión 1:1 con Samuel González · Estrategia, mentoría y consultoría en marketing digital.
          </p>
        </div>

        <div className="bg-space-900/60 border border-star-light/10 rounded-card p-6 sm:p-8">
          {!hasSlots ? (
            <NoSlotsState />
          ) : success && selectedSlot ? (
            <SuccessScreen slot={selectedSlot} />
          ) : (
            <>
              <StepIndicator current={step} />
              {step === 1 && (
                <StepDate
                  slots={slots}
                  onSelect={date => { setSelectedDate(date); setStep(2); }}
                />
              )}
              {step === 2 && (
                <StepTime
                  slots={slots}
                  date={selectedDate}
                  onSelect={slot => { setSelectedSlot(slot); setStep(3); }}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && selectedSlot && (
                <StepForm
                  slot={selectedSlot}
                  onBack={() => setStep(2)}
                  onSuccess={() => setSuccess(true)}
                />
              )}
            </>
          )}
        </div>

        {!success && (
          <p className="text-center text-muted/40 text-xs mt-6">
            ¿Prefieres escribir directamente?{' '}
            <a href={`mailto:${CONTACTO.email}`} className="underline hover:text-muted transition-colors">
              {CONTACTO.email}
            </a>
          </p>
        )}
      </main>
    </div>
  );
}
