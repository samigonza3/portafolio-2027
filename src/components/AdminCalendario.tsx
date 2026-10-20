import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Lock, LogOut, Calendar, Clock, Copy, Check, Plus, Trash2,
  Sparkles, Eye, ChevronDown, X, AlertTriangle,
} from 'lucide-react';

// ─── Tipos ──────────────────────────────────────────────────────────────────

export type SlotType = 'mentoria' | 'consultoria' | 'clase' | 'libre';

interface CalendarSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: SlotType;
}

interface Block {
  id: string;
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  reason?: string;
}

interface CalendarState {
  // weekly[dow][startTime] = true → disponible por defecto
  // dow: 1=Lun … 7=Dom
  weekly: Record<number, Record<string, boolean>>;
  // tipo por día de semana
  weeklyTypes: Record<number, SlotType>;
  // bloqueos puntuales para fechas específicas
  blocks: Block[];
  // duración de cada slot en minutos
  slotDuration: number;
}

// ─── Constantes ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'sg_calendar_v2';
const SESSION_KEY = 'sg_admin_auth';
const ADMIN_PASSWORD =
  (import.meta as any).env?.VITE_ADMIN_PASSWORD ?? 'Samigonza44*';

const HOURS = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00',
];

const DAYS: { dow: number; label: string; short: string }[] = [
  { dow: 1, label: 'Lunes', short: 'Lun' },
  { dow: 2, label: 'Martes', short: 'Mar' },
  { dow: 3, label: 'Miércoles', short: 'Mié' },
  { dow: 4, label: 'Jueves', short: 'Jue' },
  { dow: 5, label: 'Viernes', short: 'Vie' },
  { dow: 6, label: 'Sábado', short: 'Sáb' },
  { dow: 0, label: 'Domingo', short: 'Dom' },
];

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

const TYPE_CELL: Record<SlotType, string> = {
  mentoria: 'bg-star/25 border-star/50 text-star-light',
  consultoria: 'bg-signal-teal/20 border-signal-teal/40 text-signal-teal',
  clase: 'bg-signal-amber/20 border-signal-amber/40 text-signal-amber',
  libre: 'bg-frost/10 border-frost/25 text-frost',
};

const DEFAULT_STATE: CalendarState = {
  weekly: {},
  weeklyTypes: { 1: 'mentoria', 2: 'libre', 3: 'consultoria', 4: 'libre', 5: 'mentoria', 6: 'libre', 0: 'libre' },
  blocks: [],
  slotDuration: 60,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`;
}

function isSlotBlocked(blocks: Block[], date: string, start: string, end: string): boolean {
  return blocks.some(b => b.date === date && start < b.endTime && end > b.startTime);
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function formatDateShort(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m-1, d);
  const weekdays = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${weekdays[dt.getDay()]} ${d} ${months[m-1]}`;
}

function loadState(): CalendarState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

function saveState(s: CalendarState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function encodeSlots(slots: CalendarSlot[]): string {
  return btoa(encodeURIComponent(JSON.stringify(slots)));
}

function generateSlots(state: CalendarState, days = 42): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const td = today();
  const cur = new Date();
  for (let i = 0; i < days; i++) {
    const dateStr = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
    if (dateStr >= td) {
      const dow = cur.getDay(); // 0=Sun, 1=Mon, ...
      const daySchedule = state.weekly[dow] || {};
      Object.entries(daySchedule).forEach(([start, available]) => {
        if (!available) return;
        const end = addMinutes(start, state.slotDuration);
        if (isSlotBlocked(state.blocks, dateStr, start, end)) return;
        slots.push({
          id: `${dateStr}-${start}`,
          date: dateStr,
          startTime: start,
          endTime: end,
          type: state.weeklyTypes[dow] || 'libre',
        });
      });
    }
    cur.setDate(cur.getDate() + 1);
  }
  return slots.sort((a,b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
}

// ─── Password Gate ───────────────────────────────────────────────────────────

function PasswordGate({ onAuth }: { onAuth: () => void }) {
  const [pwd, setPwd] = useState('');
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onAuth();
    } else {
      setError(true);
      setPwd('');
    }
  }

  return (
    <div className="min-h-screen bg-space-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
              type="password" value={pwd} autoFocus
              onChange={e => { setPwd(e.target.value); setError(false); }}
              placeholder="••••••••"
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-4 py-3 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50 transition-colors"
            />
            {error && <p className="text-red-400 text-xs mt-2">Contraseña incorrecta.</p>}
          </div>
          <button type="submit" className="btn-pill-light justify-center">Ingresar</button>
        </form>
        <p className="text-center text-muted/40 text-xs mt-6">
          <Link to="/" className="hover:text-muted transition-colors">← Volver al inicio</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Weekly Grid ─────────────────────────────────────────────────────────────

function WeeklyGrid({
  state, onChange,
}: {
  state: CalendarState;
  onChange: (s: CalendarState) => void;
}) {
  function toggle(dow: number, hour: string) {
    const current = state.weekly[dow]?.[hour] ?? false;
    const updated: CalendarState = {
      ...state,
      weekly: {
        ...state.weekly,
        [dow]: { ...(state.weekly[dow] || {}), [hour]: !current },
      },
    };
    onChange(updated);
  }

  function setType(dow: number, type: SlotType) {
    onChange({ ...state, weeklyTypes: { ...state.weeklyTypes, [dow]: type } });
  }

  function toggleAllDay(dow: number) {
    const daySlots = state.weekly[dow] || {};
    const allOn = HOURS.every(h => daySlots[h]);
    const updated: Record<string, boolean> = {};
    HOURS.forEach(h => { updated[h] = !allOn; });
    onChange({ ...state, weekly: { ...state.weekly, [dow]: updated } });
  }

  return (
    <div className="bg-space-900 border border-star-light/10 rounded-card overflow-hidden">
      <div className="px-5 py-4 border-b border-star-light/10">
        <h2 className="font-sans font-bold text-frost text-sm">Horario base semanal</h2>
        <p className="text-muted text-xs mt-0.5">Marca los horarios en que estás disponible por defecto cada semana. Haz clic para activar/desactivar.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="w-16 px-3 py-3 text-left">
                <span className="label-mono !text-muted/50 !text-[9px]">HORA</span>
              </th>
              {DAYS.map(({ dow, short }) => {
                const type = state.weeklyTypes[dow] || 'libre';
                const count = Object.values(state.weekly[dow] || {}).filter(Boolean).length;
                return (
                  <th key={dow} className="px-1 py-2 text-center min-w-[88px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => toggleAllDay(dow)}
                        className="text-[11px] font-bold uppercase tracking-wider text-muted hover:text-frost transition-colors"
                        title={`Seleccionar/limpiar ${short}`}
                      >
                        {short} {count > 0 && <span className="text-[9px] text-star-light ml-0.5">({count})</span>}
                      </button>
                      <select
                        value={type}
                        onChange={e => setType(dow, e.target.value as SlotType)}
                        className="w-full bg-space-800 border border-star-light/10 rounded-lg text-[10px] font-semibold px-1.5 py-1 text-muted focus:outline-none focus:border-star-light/30 transition-colors"
                        style={{ fontSize: '10px' }}
                      >
                        {(Object.entries(TYPE_LABELS) as [SlotType,string][]).map(([k,v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map(hour => (
              <tr key={hour} className="border-t border-star-light/5">
                <td className="px-3 py-1">
                  <span className="label-mono !text-muted/40 !text-[10px]">{hour}</span>
                </td>
                {DAYS.map(({ dow }) => {
                  const active = state.weekly[dow]?.[hour] ?? false;
                  const type = state.weeklyTypes[dow] || 'libre';
                  return (
                    <td key={dow} className="px-1 py-0.5 text-center">
                      <button
                        onClick={() => toggle(dow, hour)}
                        className={`w-full h-8 rounded-lg border text-[10px] font-bold transition-all ${
                          active
                            ? `${TYPE_CELL[type]} shadow-sm`
                            : 'bg-space-800/40 border-star-light/5 text-muted/30 hover:border-star-light/20 hover:text-muted/60'
                        }`}
                      >
                        {active ? '✓' : ''}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Slot duration */}
      <div className="px-5 py-3 border-t border-star-light/10 flex items-center gap-3">
        <span className="label-mono !text-muted text-[10px]">Duración de cada slot:</span>
        {[30, 45, 60, 90].map(min => (
          <button
            key={min}
            onClick={() => onChange({ ...state, slotDuration: min })}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              state.slotDuration === min
                ? 'bg-star/20 text-star-light border border-star/40'
                : 'bg-space-800 text-muted border border-star-light/10 hover:border-star-light/30'
            }`}
          >
            {min === 60 ? '1h' : `${min}min`}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Blocks Section ───────────────────────────────────────────────────────────

function BlocksSection({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');

  function addBlock(e: React.FormEvent) {
    e.preventDefault();
    onChange([...blocks, { id: generateId(), date, startTime, endTime, reason: reason || undefined }]);
    setReason('');
    setOpen(false);
  }

  function removeBlock(id: string) {
    onChange(blocks.filter(b => b.id !== id));
  }

  const upcoming = blocks.filter(b => b.date >= today()).sort((a,b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  const past = blocks.filter(b => b.date < today());

  return (
    <div className="bg-space-900 border border-star-light/10 rounded-card overflow-hidden">
      <div className="px-5 py-4 border-b border-star-light/10 flex items-center justify-between">
        <div>
          <h2 className="font-sans font-bold text-frost text-sm">Bloqueos puntuales</h2>
          <p className="text-muted text-xs mt-0.5">Fechas específicas en las que NO estás disponible (reuniones, compromisos, vacaciones).</p>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-star/15 text-star-light text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-star/25 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Bloquear
        </button>
      </div>

      {open && (
        <form onSubmit={addBlock} className="px-5 py-4 border-b border-star-light/10 bg-space-800/40 grid grid-cols-2 gap-3">
          <div className="col-span-2 sm:col-span-1">
            <label className="label-mono !text-muted block mb-1.5">Fecha *</label>
            <input type="date" value={date} min={today()} onChange={e => setDate(e.target.value)} required
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm focus:outline-none focus:border-star-light/50" />
          </div>
          <div className="hidden sm:block" />
          <div>
            <label className="label-mono !text-muted block mb-1.5">Hora inicio *</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm focus:outline-none focus:border-star-light/50" />
          </div>
          <div>
            <label className="label-mono !text-muted block mb-1.5">Hora fin *</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm focus:outline-none focus:border-star-light/50" />
          </div>
          <div className="col-span-2">
            <label className="label-mono !text-muted block mb-1.5">Razón (opcional)</label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ej: Reunión de equipo IFMG"
              className="w-full bg-space-800 border border-star-light/15 rounded-xl px-3 py-2.5 text-frost text-sm placeholder:text-muted/40 focus:outline-none focus:border-star-light/50" />
          </div>
          <div className="col-span-2 flex gap-3 justify-end">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-sm text-muted hover:text-frost">Cancelar</button>
            <button type="submit" className="btn-pill-light !py-2 !text-sm">Guardar bloqueo</button>
          </div>
        </form>
      )}

      <div className="px-5 py-4 flex flex-col gap-2">
        {upcoming.length === 0 && !past.length ? (
          <p className="text-muted/50 text-xs text-center py-4">Sin bloqueos registrados. Tus slots disponibles aparecerán según el horario base.</p>
        ) : upcoming.length === 0 ? (
          <p className="text-muted/50 text-xs text-center py-4">No hay bloqueos futuros.</p>
        ) : null}

        {upcoming.map(b => (
          <div key={b.id} className="flex items-center gap-3 bg-space-800/60 border border-signal-amber/15 rounded-xl px-4 py-2.5 group">
            <AlertTriangle className="w-3.5 h-3.5 text-signal-amber/70 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-frost text-sm font-semibold">{formatDateShort(b.date)}</span>
              <span className="text-muted text-xs ml-2">{b.startTime} – {b.endTime}</span>
              {b.reason && <span className="text-muted/60 text-xs ml-2">· {b.reason}</span>}
            </div>
            <button onClick={() => removeBlock(b.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/15 text-muted hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {past.length > 0 && (
          <details className="mt-1">
            <summary className="cursor-pointer label-mono !text-muted/40 hover:!text-muted/60 transition-colors select-none text-[10px]">
              Pasados ({past.length})
            </summary>
            <div className="mt-2 flex flex-col gap-1.5 opacity-40">
              {past.map(b => (
                <div key={b.id} className="flex items-center gap-2 bg-space-800/40 rounded-lg px-3 py-2 group">
                  <span className="text-muted text-xs">{formatDateShort(b.date)} · {b.startTime}–{b.endTime}</span>
                  <button onClick={() => removeBlock(b.id)} className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 text-muted">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ slots }: { slots: CalendarSlot[] }) {
  const byDate: Record<string, CalendarSlot[]> = {};
  slots.forEach(s => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  if (slots.length === 0) {
    return (
      <div className="bg-space-900 border border-star-light/10 rounded-card px-5 py-8 text-center">
        <Calendar className="w-8 h-8 mx-auto mb-2 text-muted/30" />
        <p className="text-muted text-sm">Sin disponibilidad aún.</p>
        <p className="text-muted/50 text-xs mt-1">Activa horarios en el calendario semanal para empezar.</p>
      </div>
    );
  }

  return (
    <div className="bg-space-900 border border-star-light/10 rounded-card overflow-hidden">
      <div className="px-5 py-4 border-b border-star-light/10">
        <h2 className="font-sans font-bold text-frost text-sm">Vista previa ({slots.length} slots)</h2>
        <p className="text-muted text-xs mt-0.5">Esto es lo que verá quien reciba tu link de reserva.</p>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3 max-h-64 overflow-y-auto">
        {Object.entries(byDate).slice(0, 14).map(([date, daySlots]) => (
          <div key={date} className="flex gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted/60 w-24 shrink-0 pt-0.5">{formatDateShort(date)}</span>
            <div className="flex flex-wrap gap-1.5">
              {daySlots.map(s => (
                <span key={s.id} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  s.type === 'mentoria' ? 'bg-star/20 text-star-light border-star/30' :
                  s.type === 'consultoria' ? 'bg-signal-teal/15 text-signal-teal border-signal-teal/30' :
                  s.type === 'clase' ? 'bg-signal-amber/15 text-signal-amber border-signal-amber/30' :
                  'bg-frost/10 text-frost border-frost/20'
                }`}>
                  {s.startTime}
                </span>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(byDate).length > 14 && (
          <p className="text-muted/40 text-xs">… y {slots.length - Object.values(byDate).slice(0,14).flat().length} más</p>
        )}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminCalendario() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [state, setState] = useState<CalendarState>(DEFAULT_STATE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authed) setState(loadState());
  }, [authed]);

  function update(newState: CalendarState) {
    setState(newState);
    saveState(newState);
  }

  function updateBlocks(blocks: Block[]) {
    update({ ...state, blocks });
  }

  const availableSlots = generateSlots(state, 42);

  function copyLink() {
    const encoded = encodeSlots(availableSlots);
    const url = `${window.location.origin}/reservar-espacio?v=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function preview() {
    const encoded = encodeSlots(availableSlots);
    window.open(`/reservar-espacio?v=${encoded}`, '_blank');
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-space-950">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-space-950/80 border-b border-star-light/15">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-star/15 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-star-light" />
            </div>
            <div>
              <span className="font-sans font-extrabold text-frost text-sm">Mi Calendario</span>
              <span className="label-mono !text-muted block" style={{ fontSize: '9px' }}>ÁREA PRIVADA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-muted/50 text-xs">
              {availableSlots.length} slots disponibles
            </span>
            <button onClick={preview} disabled={availableSlots.length === 0}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted border border-star-light/15 rounded-lg hover:text-frost hover:border-star-light/35 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
              <Eye className="w-3.5 h-3.5" /> Vista previa
            </button>
            <button onClick={copyLink} disabled={availableSlots.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-star text-frost rounded-lg hover:bg-star-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar link'}
            </button>
            <button onClick={logout} title="Salir"
              className="p-2 rounded-lg text-muted hover:text-frost hover:bg-star-light/10 transition-all">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        {/* Info banner */}
        <div className="bg-star/8 border border-star-light/20 rounded-card px-5 py-4 flex gap-3">
          <Sparkles className="w-4 h-4 text-star-light mt-0.5 shrink-0" />
          <p className="text-sm text-ice/80 leading-relaxed">
            Define tu horario base (días y horas disponibles por defecto), luego <strong className="text-frost">bloquea</strong> los espacios específicos que no puedes atender.
            Cuando esté listo, copia el link y compártelo. Genera un nuevo link cada vez que actualices tu disponibilidad.
          </p>
        </div>

        <WeeklyGrid state={state} onChange={update} />
        <BlocksSection blocks={state.blocks} onChange={updateBlocks} />
        <PreviewPanel slots={availableSlots} />
      </main>
    </div>
  );
}
