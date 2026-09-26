import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  PhoneCall,
  CreditCard,
  Stethoscope,
  Dumbbell,
  LineChart,
  RefreshCcw,
  Video,
  Clock,
  ListChecks,
  SearchCheck,
  Check,
  X,
  Linkedin,
  Package,
  Store,
  Clapperboard,
  Megaphone,
  MessageSquareText,
  Truck,
  Calculator,
  TrendingUp,
} from 'lucide-react';
import { BookingForm } from './mentoria/shared';
import { MENTORIA } from '../data/oferta';

// ============================================================
// Landing de la Mentoría privada (/empieza-aqui-tu-mentoria)
// Punto de llegada para quien ya decidió ir por la mentoría: explica
// qué se hace, cómo, en qué formato y con qué condiciones, y cierra con
// el mismo formulario de reserva de /mentoria-dropshipping.
// ============================================================

const PRECIO = `${MENTORIA.precio} ${MENTORIA.periodo}`;

const PASOS = [
  {
    icon: ClipboardList,
    cuando: 'Hoy',
    titulo: 'Solicitas tu cupo',
    texto:
      'Llenas el formulario de abajo con una fecha tentativa, tu correo y cuántos pedidos sacas hoy. Toma menos de un minuto.',
  },
  {
    icon: PhoneCall,
    cuando: 'En pocos días',
    titulo: 'Conversación de encaje',
    texto:
      'Te escribo para confirmar la fecha y hablamos un momento sobre tu punto de partida. Si la mentoría no es lo que necesitas ahora, te lo digo y te indico por dónde empezar.',
  },
  {
    icon: CreditCard,
    cuando: 'Antes de arrancar',
    titulo: 'Confirmas tu cupo',
    texto: `Pagas el mes (${MENTORIA.precio}) y agendamos tus sesiones. Los cupos se asignan en orden de confirmación.`,
  },
  {
    icon: Stethoscope,
    cuando: 'Semana 1',
    titulo: 'Sesión de diagnóstico y plan',
    texto:
      'Revisamos en qué etapa estás, tu producto o nicho, tu capital, tu tiempo disponible y la meta del mes. Sales con un plan de trabajo concreto.',
  },
  {
    icon: Dumbbell,
    cuando: 'Semanas 1 a 3',
    titulo: 'Tareas y plan de entrenamiento',
    texto:
      'Ejecutas con tareas claras y priorizadas: qué montar, qué probar y qué medir. Nada de teoría suelta, todo aterrizado a tu tienda.',
  },
  {
    icon: LineChart,
    cuando: 'Semana 3',
    titulo: 'Sesión de lectura de números',
    texto:
      'Miramos tu tasa de entrega, tu CPA real frente al CPA máximo y tus creativos: qué apagar, qué mantener y qué escalar.',
  },
  {
    icon: RefreshCcw,
    cuando: 'Fin de mes',
    titulo: 'Decides si sigues',
    texto:
      'La mentoría se renueva mes a mes. Si continúas, arrancamos el siguiente ciclo con un nuevo objetivo sobre lo que ya lograste.',
  },
];

const FORMATO = [
  {
    icon: Clock,
    titulo: `${MENTORIA.horasMes} horas al mes`,
    texto: 'Repartidas como te sirva: por ejemplo dos sesiones de 2 horas, o varias más cortas.',
  },
  {
    icon: Video,
    titulo: 'Por videollamada',
    texto: 'Desde cualquier país. Compartimos pantalla y trabajamos directamente sobre tu tienda y tus cuentas.',
  },
  {
    icon: ListChecks,
    titulo: 'Tareas y plan de entrenamiento',
    texto: 'Cada sesión termina con tareas concretas para ejecutar antes de la siguiente.',
  },
  {
    icon: SearchCheck,
    titulo: 'Revisión experta',
    texto: 'Tu tienda, tus campañas y tus números revisados por alguien que opera tiendas y pauta todos los días.',
  },
];

const TEMAS = [
  { icon: Package, titulo: 'Producto', texto: 'Criterios de nicho y filtros para elegir qué vender.' },
  { icon: Store, titulo: 'Tienda', texto: 'Estructura de la tienda y de la página de venta.' },
  { icon: Clapperboard, titulo: 'Contenido', texto: 'Creativos, hooks y cómo estudiar lo que funciona.' },
  { icon: Megaphone, titulo: 'Pauta', texto: 'Meta y TikTok, estructura de campañas y reglas de apagado.' },
  { icon: MessageSquareText, titulo: 'Confirmación', texto: 'Filtros antes de despachar y guiones de WhatsApp.' },
  { icon: Truck, titulo: 'Logística', texto: 'Transportadoras, novedades y flujo de caja.' },
  { icon: Calculator, titulo: 'Números', texto: 'CPA máximo, tasa de entrega y ROAS de equilibrio.' },
  { icon: TrendingUp, titulo: 'Escalado', texto: 'Cuándo y cómo escalar sin quemar el margen.' },
];

const PARA_TI = [
  'Ya arrancaste tu tienda o leíste el Blueprint y quieres ejecutar con acompañamiento.',
  'Tienes capital para probar y puedes dedicarle tiempo todos los días.',
  'Quieres decidir con números y no por intuición.',
  'Estás dispuesto a hacer las tareas entre sesiones.',
];

const NO_ES = [
  'Buscas hacerte rico rápido o una cifra de ingresos garantizada.',
  'No tienes presupuesto para pauta ni para probar productos.',
  'Quieres que alguien monte y opere la tienda por ti: esto no es una agencia.',
];

const CONDICIONES = [
  { label: 'Inversión', valor: `${PRECIO} (equivale a ${MENTORIA.precioHora} por hora)` },
  { label: 'Tiempo', valor: `${MENTORIA.horasMes} horas de sesiones privadas al mes, repartidas de forma flexible` },
  { label: 'Modalidad', valor: '1 a 1, en sesiones privadas por videollamada' },
  { label: 'Permanencia', valor: 'Renovación mensual, sin contrato largo' },
  { label: 'Cupos', valor: `${MENTORIA.cupos} cupos al mes, asignados en orden de confirmación` },
  {
    label: 'Requisitos',
    valor:
      'Haber leído el Blueprint o hecho el Diagnóstico para Dropshippers, y contar con el capital y el tiempo mínimos que plantea la guía para probar',
  },
  { label: 'Agenda', valor: 'Las sesiones se agendan y se reprograman de común acuerdo, avisando con anticipación' },
  { label: 'Garantía', valor: 'No hay garantía de ingresos ni de resultados: dependen de tu ejecución y tu mercado' },
];

const FAQS = [
  {
    q: '¿Cuánto cuesta y cómo se paga?',
    a: `${PRECIO} por ${MENTORIA.horasMes} horas de sesiones privadas. Te comparto el link de pago cuando confirmamos tu cupo, antes de la primera sesión.`,
  },
  {
    q: '¿Tengo que comprometerme por varios meses?',
    a: 'No. La mentoría se renueva mes a mes y decides al final de cada ciclo si continúas.',
  },
  {
    q: '¿Qué pasa si todavía no he vendido nada?',
    a: 'Puedes entrar igual, siempre que tengas el capital y el tiempo para probar. La primera sesión se enfoca en elegir producto y montar la base correctamente.',
  },
  {
    q: '¿Las sesiones son en grupo?',
    a: 'No. Todas las sesiones son 1 a 1, solo tú y yo por videollamada, para trabajar directamente sobre tu tienda y tus números.',
  },
  {
    q: '¿Qué necesito tener listo para la primera sesión?',
    a: 'Acceso a tu tienda y a tus cuentas de anuncios si ya las tienes, tus números del último mes y claridad sobre cuánto capital y tiempo puedes invertir.',
  },
  {
    q: '¿Me garantizas resultados?',
    a: 'No. Te doy método, números y acompañamiento directo, pero los resultados dependen de tu producto, tu mercado, tu ejecución y tu constancia.',
  },
];

function SectionTitle({ eyebrow, title, sub }: { eyebrow?: string; title: React.ReactNode; sub?: string }) {
  return (
    <div className="text-center mb-10 md:mb-12">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className="display-xl text-3xl sm:text-4xl md:text-5xl mt-4 mb-3">{title}</h2>
      {sub && <p className="text-ice text-sm md:text-base max-w-2xl mx-auto">{sub}</p>}
    </div>
  );
}

const btnTeal =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 text-space-950 font-extrabold text-sm sm:text-base px-7 py-4 shadow-[0_12px_32px_-8px_rgba(20,184,166,0.65)] transition-transform hover:-translate-y-0.5';

export default function MentoriaPrivada() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-space-950 to-nebula text-frost">
      <div className="bg-gradient-to-r from-teal-400 to-emerald-400 text-black text-center py-2.5 px-3">
        <p className="label-mono !text-black !tracking-wide text-[11px] sm:text-xs font-bold">
          Mentoría privada de dropshipping · {MENTORIA.cupos} cupos al mes
        </p>
      </div>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.18), transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-16 md:pt-20 md:pb-24 text-center">
          <span className="eyebrow !text-teal-300 !border-teal-400/30 !bg-teal-400/5">03 · Premium · Mentoría</span>
          <h1 className="display-xl text-4xl sm:text-5xl md:text-7xl mt-6 mb-6">
            Deja de probar solo.{' '}
            <span className="text-teal-300 drop-shadow-[0_0_18px_rgba(45,212,191,0.45)]">
              Construye tu tienda
            </span>{' '}
            con acompañamiento
          </h1>
          <p className="text-ice text-base md:text-lg max-w-2xl mx-auto mb-9">
            {MENTORIA.horasMes} horas al mes conmigo para decidir qué probar, qué apagar y qué
            escalar con tus propios números, con tareas y un plan de entrenamiento hecho para tu
            tienda.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <a href="#reservar" className={btnTeal}>
              Reservar mi cupo <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#paso-a-paso" className="btn-ghost">
              Ver cómo funciona
            </a>
          </div>
          <div className="grid grid-cols-3 max-w-2xl mx-auto rounded-2xl border border-teal-400/25 bg-space-900/70 divide-x divide-star-light/15">
            {[
              { v: MENTORIA.precio, l: MENTORIA.periodo },
              { v: `${MENTORIA.horasMes} h`, l: 'de sesiones al mes' },
              { v: String(MENTORIA.cupos), l: 'cupos al mes' },
            ].map((s) => (
              <div key={s.l} className="px-3 py-4 sm:py-5">
                <p className="font-display font-bold text-2xl sm:text-3xl text-frost">{s.v}</p>
                <p className="text-muted text-[11px] sm:text-xs mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Paso a paso ===== */}
      <section id="paso-a-paso" className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-star-light/15">
        <SectionTitle
          eyebrow="El paso a paso"
          title="Qué pasa desde que reservas"
          sub="Así se ve un mes de mentoría, de la solicitud a la decisión de seguir."
        />
        <ol className="relative">
          <span
            aria-hidden="true"
            className="absolute left-[1.35rem] top-2 bottom-2 w-px bg-gradient-to-b from-teal-400/70 via-teal-400/30 to-transparent"
          />
          {PASOS.map(({ icon: Icon, cuando, titulo, texto }, i) => (
            <li key={titulo} className="relative pl-16 pb-8 last:pb-0">
              <span className="absolute left-0 top-0 w-11 h-11 rounded-xl bg-space-900 border border-teal-400/40 inline-flex items-center justify-center shadow-[0_0_24px_-8px_rgba(45,212,191,0.6)]">
                <Icon className="w-5 h-5 text-teal-300" />
              </span>
              <p className="label-mono !text-teal-300 !tracking-[0.2em] mb-1">
                Paso {i + 1} · {cuando}
              </p>
              <h3 className="text-lg md:text-xl font-extrabold text-frost mb-1.5">{titulo}</h3>
              <p className="text-ice text-sm md:text-base leading-relaxed">{texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ===== Cómo trabajamos ===== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-star-light/15">
        <SectionTitle eyebrow="De qué forma" title="Cómo trabajamos" />
        <div className="grid sm:grid-cols-2 gap-4">
          {FORMATO.map(({ icon: Icon, titulo, texto }) => (
            <div
              key={titulo}
              className="rounded-2xl border border-star-light/15 bg-space-900/70 p-6 flex items-start gap-4 transition-colors hover:border-teal-400/40"
            >
              <span className="shrink-0 w-11 h-11 rounded-xl bg-teal-400/10 border border-teal-400/25 inline-flex items-center justify-center">
                <Icon className="w-5 h-5 text-teal-300" />
              </span>
              <div>
                <h3 className="font-extrabold text-frost mb-1">{titulo}</h3>
                <p className="text-ice text-sm leading-relaxed">{texto}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-center font-extrabold text-xl md:text-2xl mt-14 mb-2">Qué trabajamos en las sesiones</h3>
        <p className="text-muted text-sm text-center mb-8">
          Según tu etapa, nos enfocamos en las partes del proceso que hoy te frenan.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TEMAS.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="rounded-xl border border-star-light/15 bg-space-900/60 p-4">
              <Icon className="w-5 h-5 text-teal-300 mb-2" />
              <p className="font-bold text-frost text-sm mb-1">{titulo}</p>
              <p className="text-ice text-xs leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Para quién ===== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-star-light/15">
        <SectionTitle eyebrow="Antes de reservar" title="¿Es para ti?" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-teal-400/30 bg-teal-400/[0.04] p-6 md:p-7">
            <p className="font-extrabold text-teal-300 mb-4">Es para ti si...</p>
            <ul className="space-y-3">
              {PARA_TI.map((t) => (
                <li key={t} className="flex items-start gap-3 text-ice text-sm leading-relaxed">
                  <Check className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-star-light/15 bg-space-900/60 p-6 md:p-7">
            <p className="font-extrabold text-frost mb-4">No es para ti si...</p>
            <ul className="space-y-3">
              {NO_ES.map((t) => (
                <li key={t} className="flex items-start gap-3 text-ice text-sm leading-relaxed">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== Condiciones ===== */}
      <section id="condiciones" className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-star-light/15">
        <SectionTitle eyebrow="Condiciones" title="Todo claro desde el inicio" />
        <div className="rounded-card p-[1px] bg-gradient-to-br from-teal-400 to-emerald-500 shadow-[0_0_50px_-15px_rgba(20,184,166,0.55)]">
          <div className="rounded-card bg-space-900 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4 pb-6 mb-6 border-b border-star-light/15">
              <div>
                <p className="label-mono !text-teal-300 mb-2">Mentoría privada</p>
                <p className="font-display font-bold text-4xl md:text-5xl">
                  {MENTORIA.precio}
                  <span className="text-muted text-lg md:text-xl font-sans font-semibold"> / mes</span>
                </p>
              </div>
              <a href="#reservar" className={btnTeal}>
                Reservar mi cupo <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <dl className="divide-y divide-star-light/10">
              {CONDICIONES.map((c) => (
                <div key={c.label} className="grid sm:grid-cols-[9rem_1fr] gap-1 sm:gap-6 py-3.5">
                  <dt className="label-mono !text-muted !tracking-[0.2em]">{c.label}</dt>
                  <dd className="text-ice text-sm leading-relaxed">{c.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ===== Quién te acompaña ===== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-star-light/15">
        <SectionTitle eyebrow="Quién te acompaña" title="+15 años en marketing digital, ecommerce y desarrollo web" />
        <div className="card-galaxy p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src="/samuel-perfil.6836711e.jpg"
              alt="Samuel González"
              className="w-24 h-24 rounded-full object-cover border border-teal-400/40 shrink-0"
            />
            <div className="text-center sm:text-left">
              <p className="font-extrabold text-lg text-frost">Samuel González</p>
              <p className="label-mono !text-muted mb-3">Data · Marketing · Code</p>
              <p className="text-ice text-sm leading-relaxed mb-3">
                Opero mis propias tiendas y pauto todos los días. Antes lideré medios pagados para
                Telefónica, UNICEF y Banco de Occidente. En la mentoría te llevo el mismo sistema
                que uso en mis tiendas.
              </p>
              <a
                href="https://www.linkedin.com/in/samuelgonzalez/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-300 hover:text-frost inline-flex items-center gap-2 text-sm"
              >
                <Linkedin className="w-4 h-4" /> LinkedIn
              </a>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-7 pt-7 border-t border-star-light/15 text-center">
            {[
              { v: '2.802', l: 'pedidos de jul a sep 2026' },
              { v: '$252,9 M', l: 'COP vendidos en ese trimestre' },
              { v: '+395%', l: 'sesiones en la tienda en 2026' },
            ].map((s) => (
              <div key={s.l}>
                <p className="font-display font-bold text-xl sm:text-3xl text-teal-300">{s.v}</p>
                <p className="text-muted text-[11px] sm:text-xs mt-1 leading-snug">{s.l}</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-5">
            <Link to="/mentoria-dropshipping" className="text-xs text-muted underline hover:text-frost">
              Ver las capturas de estos resultados
            </Link>
          </p>
        </div>
      </section>

      {/* ===== Reserva ===== */}
      <section id="reservar" className="max-w-2xl mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-star-light/15">
        <div className="text-center mb-8">
          <CalendarCheck className="w-7 h-7 text-teal-300 mx-auto mb-3" />
          <h2 className="display-xl text-3xl sm:text-4xl mb-3">Reserva tu espacio</h2>
          <p className="text-ice text-sm max-w-md mx-auto">
            Elige una fecha tentativa y cuéntame en qué punto estás. Te escribo para confirmar y
            coordinar tu primera sesión.
          </p>
        </div>
        <div className="rounded-card p-[1px] bg-gradient-to-br from-teal-400/70 to-emerald-500/40">
          <div className="rounded-card bg-space-900 p-6 sm:p-8">
            <BookingForm origen="empieza-aqui-tu-mentoria" />
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20 border-t border-star-light/15">
        <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-center">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-xl border border-star-light/15 bg-space-900/60 px-5 py-4 open:border-teal-400/40"
            >
              <summary className="cursor-pointer list-none flex items-center justify-between gap-4 font-bold text-frost">
                {f.q}
                <span className="text-teal-300 text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-ice text-sm leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-12">
          <a href="#reservar" className={btnTeal}>
            Reservar mi cupo <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* ===== Disclaimers compactos ===== */}
      <footer className="border-t border-star-light/10">
        <div className="max-w-3xl mx-auto px-4 py-6 text-muted/70 text-[10px] sm:text-[11px] leading-snug space-y-1.5 text-center">
          <p>
            Este sitio no es parte de Facebook, Meta o Instagram ni está respaldado por ellos.
            FACEBOOK e INSTAGRAM son marcas registradas de Meta, Inc.
          </p>
          <p>
            Los resultados mencionados son propios, no típicos ni garantizados: dependen de tu
            esfuerzo, producto, mercado y ejecución. Todo negocio implica riesgo.
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
