import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock,
  Plus,
  Trash2,
  Copy,
  Check,
  Calendar,
  Clock,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Eye,
} from 'lucide-react';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type SlotType = 'mentoria' | 'consultoria' | 'clase' | 'libre';

export interface CalendarSlot {
  id: string;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  type: SlotType;
  notes?: string;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sg_calendar_v1';
const SESSION_KEY = 'sg_admin_auth';
// Contraseña por defecto. Para cambiarla sin código, define la variable
// VITE_ADMIN_PASSWORD en tus variables de entorno de Netlify/Vercel.
const ADMIN_PASSWORD =
  (import.meta as any).env?.VITE_ADMIN_PASSWORD ?? 'samuel2026';

const TYPE_LABELS: Record<SlotType, string> = {
  mentoria: 'Mentoría 1:1',
  consultoria: 'Consultoría',
  clase: 'Clase / Taller',
  libre: 'Sesión libre',
};

const TYPE_COLORS: Record<SlotType, string> = {
  mentoria: 'bg-star/20 text-star-light border-star/30',
  consultoria: 'bg-signal-teal/15 text-signal-teal border-signal-teal/30',
  clase: 'bg-signal-amber/15 text-signal-amber border-signal-amber/30',
  libre: 'bg-frost/10 text-frost border-frost/20',
};

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  const dt = new Date(Number(y), Number(m)-1, Number(d));
  return `${DAYS_ES[dt.getDay()]} ${d} de ${MONTHS_ES[dt.getMonth()]}`;
}

function encodeSlots(slots: CalendarSlot[]): string {
  const future = slots.filter(s => s.date >= today());
  return btoa(encodeURIComponent(JSON.stringify(future)));
}

function loadSlots(): CalendarSlot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSlots(slots: CalendarSlot[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
}

// ─── Password Gate ───────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onAuth();
    } else {
      setError(true);
      setShake(true);
      setPwd('');
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center px-4">
      <div className={`w-full max-w-sm ${shake ? 'animate-bounce' : ''}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl border border-star-light/20 bg-star/10 mb-4">
            <Lock className="w-6 h-6 text-star-light" />
          </div>
          <h1 className="font-sans font-extrabold text-xl text-frost">Área privada</h1>
          <p className="text-muted text-sm mt-1">Calendario de disponibilidad</p>
        </div>

        <form onSubmit={submit} className="bg-space-900 border border-star-light/10 rounded-card p-6 flex flex-col gap-4">
          <div>
            <label className="label-mono !text-muted block mb-2">Contraseña</label>
            <input
              type="password"
              value={pwd}
              onChange={e => { setPwd(e.target.value); setError(false); }}
              placeholder="••••••••"
              autoFocus
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-4 py-3 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50 transition-colors"
            />
            {error && (
              <p className="text-red-400 text-xs mt-2">Contraseña incorrecta. Inténtalo de nuevo.</p>
            )}
          </div>
          <button type="submit" className="btn-pill-light justify-center">
            Ingresar
          </button>
        </form>

        <p className="text-center text-muted/40 text-xs mt-6">
          <Link to="/" className="hover:text-muted transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Add Slot Form ───────────────────────────────────────────────────────────

function AddSlotForm({ onAdd }: { onAdd: (s: CalendarSlot) => void }) {
  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<SlotType>('mentoria');
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !startTime || !endTime) return;
    onAdd({ id: generateId(), date, startTime, endTime, type, notes: notes || undefined });
    setNotes('');
    setOpen(false);
  }

  return (
    <div className="bg-space-900 border border-star-light/10 rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-star/5 transition-colors"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-star/15 text-star-light">
          <Plus className="w-4 h-4" />
        </div>
        <span className="font-sans font-semibold text-frost text-sm">Agregar disponibilidad</span>
        <span className="ml-auto text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <form onSubmit={submit} className="border-t border-star-light/10 px-5 pb-5 pt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="label-mono !text-muted block mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              min={today()}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm focus:outline-none focus:border-star-light/50 transition-colors"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="label-mono !text-muted block mb-1.5">Tipo</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as SlotType)}
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm focus:outline-none focus:border-star-light/50 transition-colors"
            >
              {(Object.entries(TYPE_LABELS) as [SlotType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-mono !text-muted block mb-1.5">Inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              required
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm focus:outline-none focus:border-star-light/50 transition-colors"
            />
          </div>

          <div>
            <label className="label-mono !text-muted block mb-1.5">Fin</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              required
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm focus:outline-none focus:border-star-light/50 transition-colors"
            />
          </div>

          <div className="col-span-2">
            <label className="label-mono !text-muted block mb-1.5">Notas internas (opcional)</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej: Solo para comunidad WhatsApp"
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50 transition-colors"
            />
          </div>

          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-muted hover:text-frost transition-colors">
              Cancelar
            </button>
            <button type="submit" className="btn-pill-light !py-2 !text-sm">
              Guardar slot
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── Slot Card ───────────────────────────────────────────────────────────────

function SlotCard({ slot, onDelete }: { slot: CalendarSlot; onDelete: (id: string) => void }) {
  return (
    <div className="flex items-center gap-4 bg-space-900 border border-star-light/10 rounded-xl px-4 py-3 group hover:border-star-light/25 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-sans font-semibold text-frost text-sm">{formatDate(slot.date)}</span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TYPE_COLORS[slot.type]}`}>
            {TYPE_LABELS[slot.type]}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Clock className="w-3 h-3 text-muted" />
          <span className="text-muted text-xs">{slot.startTime} – {slot.endTime}</span>
          {slot.notes && (
            <span className="text-muted/60 text-xs ml-2">· {slot.notes}</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(slot.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/15 text-muted hover:text-red-400"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminCalendario() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [slots, setSlots] = useState<CalendarSlot[]>([]);
  const [copied, setCopied] = useState(false);
  const [filterWeek, setFilterWeek] = useState(0); // 0 = esta semana, 1 = próxima, etc.

  useEffect(() => {
    if (authed) setSlots(loadSlots());
  }, [authed]);

  function addSlot(s: CalendarSlot) {
    const updated = [...slots, s].sort((a, b) =>
      `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)
    );
    setSlots(updated);
    saveSlots(updated);
  }

  function deleteSlot(id: string) {
    const updated = slots.filter(s => s.id !== id);
    setSlots(updated);
    saveSlots(updated);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  function copyBookingLink() {
    const encoded = encodeSlots(slots);
    const url = `${window.location.origin}/reservar-espacio?v=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function previewBookingLink() {
    const encoded = encodeSlots(slots);
    window.open(`/reservar-espacio?v=${encoded}`, '_blank');
  }

  // Agrupar slots por fecha
  const futureSlotsGrouped: Record<string, CalendarSlot[]> = {};
  const td = today();
  slots
    .filter(s => s.date >= td)
    .forEach(s => {
      if (!futureSlotsGrouped[s.date]) futureSlotsGrouped[s.date] = [];
      futureSlotsGrouped[s.date].push(s);
    });

  const pastSlots = slots.filter(s => s.date < td);

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-space-950">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-space-950/80 border-b border-star-light/15">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-star/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-star-light" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-frost text-sm">Calendario</span>
              <span className="label-mono !text-muted block" style={{ fontSize: '9px', lineHeight: 1 }}>ÁREA PRIVADA</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={previewBookingLink}
              disabled={Object.keys(futureSlotsGrouped).length === 0}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted hover:text-frost border border-star-light/15 rounded-lg hover:border-star-light/35 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Eye className="w-3.5 h-3.5" />
              Vista previa
            </button>
            <button
              onClick={copyBookingLink}
              disabled={Object.keys(futureSlotsGrouped).length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-star text-frost rounded-lg hover:bg-star-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Link copiado!' : 'Copiar link de reserva'}
            </button>
            <button onClick={logout} title="Cerrar sesión" className="p-2 rounded-lg text-muted hover:text-frost hover:bg-star-light/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Instrucciones */}
        <div className="bg-star/8 border border-star-light/20 rounded-card px-5 py-4 flex gap-3">
          <Sparkles className="w-4 h-4 text-star-light mt-0.5 shrink-0" />
          <div className="text-sm text-ice/80 leading-relaxed">
            Agrega los horarios en los que estás disponible para reservas. Cuando termines,
            haz clic en <strong className="text-frost">"Copiar link de reserva"</strong> y comparte ese link con tus contactos.
            El link lleva toda tu disponibilidad codificada; genera un nuevo link cada vez que actualices los horarios.
          </div>
        </div>

        {/* Add slot form */}
        <AddSlotForm onAdd={addSlot} />

        {/* Future slots grouped by date */}
        {Object.keys(futureSlotsGrouped).length > 0 ? (
          <div className="flex flex-col gap-4">
            <h2 className="label-mono !text-muted">Disponibilidad activa ({slots.filter(s => s.date >= td).length} slots)</h2>
            {Object.entries(futureSlotsGrouped).map(([date, daySlots]) => (
              <div key={date} className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-star-light/70 px-1">
                  {formatDate(date)}
                </span>
                {daySlots.map(slot => (
                  <SlotCard key={slot.id} slot={slot} onDelete={deleteSlot} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted">
            <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Aún no tienes disponibilidad configurada.</p>
            <p className="text-xs mt-1 opacity-60">Agrega tu primer horario con el botón de arriba.</p>
          </div>
        )}

        {/* Past slots (collapsed) */}
        {pastSlots.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer label-mono !text-muted/50 hover:!text-muted transition-colors select-none">
              Pasados ({pastSlots.length})
            </summary>
            <div className="mt-3 flex flex-col gap-2 opacity-50">
              {pastSlots.map(slot => (
                <SlotCard key={slot.id} slot={slot} onDelete={deleteSlot} />
              ))}
            </div>
          </details>
        )}
      </main>
    </div>
  );
}
