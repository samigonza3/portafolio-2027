import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from 'lucide-react';

// ============================================================
// Ruta Clara · Diagnóstico de tu tienda
// Reconstruido desde el bundle publicado (preview-BWzyR-M1.js).
// Preguntas, opciones, pesos, umbrales, fórmulas de puntaje, tiers,
// textos de resultado y acciones del plan de 14 días son literales
// del bundle. Solo cambian nombres de variables (el bundle venía
// minificado) y el envío del lead, que ahora es una prop opcional
// (`onLead`) para no agregar dependencias nuevas (el original usaba
// EmailJS con variables VITE_EMAILJS_* que estaban vacías).
// ============================================================

// ---------- Configuración ----------

const CONFIG = {
  marca: 'Diagnóstico para Dropshippers',
  trm: 4000,
  links: {
    mentoria: '/#contacto',
    escala: '/#contacto',
    checklist: '/recursos/google-ads-checklist',
    blog: '/blog',
  },
  umbrales: {
    conversion: { bueno: 0.02, atencion: 0.01 },
    cpaSobreTicket: { bueno: 0.2, atencion: 0.35 },
    entrega: { bueno: 0.85, atencion: 0.7 },
    roas: { bueno: 3, atencion: 2 },
  },
  facturacionEscalaUSD: 10000,
};

// En el original esta función recibía el diagnóstico (para armar un
// mensaje de WhatsApp) pero siempre devolvía "/#contacto".
function urlContacto(): string {
  return '/#contacto';
}

const STORAGE_KEY = 'ruta_clara_v2';

// ---------- Tipos ----------

type Rama = 'nuevo' | 'operador';
type Estado = 'bueno' | 'atencion' | 'critico';
type TipoPregunta = 'single' | 'multi' | 'grid' | 'pais';
type Tier = 'MENOR' | 'ESCALA' | 'A' | 'B' | 'C' | 'D';

interface Opcion {
  v: string;
  l: string;
  n?: number;
}

interface Fila {
  id: string;
  l: string;
}

type Valor = string | string[] | Record<string, number>;
type Respuestas = Record<string, Valor | undefined>;

interface Pregunta {
  id: string;
  rama?: Rama;
  texto: string;
  ayuda?: string;
  tipo: TipoPregunta;
  opciones?: Opcion[];
  opcionesDe?: (r: Respuestas) => Opcion[];
  filas?: Fila[];
}

interface Dimension {
  id: string;
  score: number;
  nota: string;
}

interface Metrica {
  id: string;
  label: string;
  valor: string;
  detalle: string;
  estado?: Estado;
}

interface Diagnostico {
  rama: Rama;
  dims: Dimension[];
  global: number;
  cuello: Dimension;
  segundo: Dimension;
  declarado: string | null;
  coincide: boolean;
  metricas: Metrica[];
  faltantes: string[];
  tier: Tier;
  etapaRuta: number;
  capital: number;
}

interface InfoDimension {
  nombre: string;
  mide: string;
  perfil: string;
  perfilLinea: string;
  idea: string;
  noHacer: string;
  acciones: string[];
}

export interface RutaClaraLead {
  nombre: string;
  whatsapp: string;
  email: string;
  rama: Rama;
  puntaje_global: number;
  cuello: string;
  nivel: Tier;
  dimensiones: Record<string, number>;
  metricas: Record<string, string>;
  /** Resumen en texto plano (el mismo que el original enviaba por EmailJS). */
  mensaje: string;
  [utm: string]: unknown;
}

// ---------- Datos: países ----------

const PAISES_LATAM = [
  'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Costa Rica', 'Ecuador', 'El Salvador', 'Guatemala',
  'Honduras', 'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
  'República Dominicana', 'Uruguay', 'Venezuela',
];

const PAISES_FUERA = [
  'Estados Unidos', 'España', 'Canadá', 'Reino Unido', 'Italia', 'Alemania', 'Francia', 'Portugal',
  'Australia', 'Otro',
];

const INDICATIVOS: [string, string][] = [
  ['+57', 'CO'], ['+52', 'MX'], ['+54', 'AR'], ['+56', 'CL'], ['+51', 'PE'], ['+593', 'EC'],
  ['+58', 'VE'], ['+507', 'PA'], ['+506', 'CR'], ['+502', 'GT'], ['+503', 'SV'], ['+504', 'HN'],
  ['+591', 'BO'], ['+595', 'PY'], ['+598', 'UY'], ['+1', 'US/CA'], ['+34', 'ES'], ['+44', 'UK'],
  ['+39', 'IT'], ['+49', 'DE'], ['+33', 'FR'], ['+351', 'PT'],
];

const INDICATIVO_POR_PAIS: Record<string, string> = {
  Colombia: '+57', México: '+52', Argentina: '+54', Chile: '+56', Perú: '+51', Ecuador: '+593',
  Venezuela: '+58', Panamá: '+507', 'Costa Rica': '+506', Guatemala: '+502', 'El Salvador': '+503',
  Honduras: '+504', Bolivia: '+591', Paraguay: '+595', Uruguay: '+598', 'Estados Unidos': '+1',
  Canadá: '+1', 'Puerto Rico': '+1', 'República Dominicana': '+1', España: '+34',
  'Reino Unido': '+44', Italia: '+39', Alemania: '+49', Francia: '+33', Portugal: '+351',
};

// ---------- Datos: opciones compartidas ----------

const OBSTACULOS_NUEVO: Opcion[] = [
  { v: 'no_se_por_donde', l: 'No sé por dónde empezar' },
  { v: 'miedo_perder', l: 'Me da miedo perder dinero' },
  { v: 'no_confio', l: 'No sé en quién confiar para aprender' },
  { v: 'abandono', l: 'Empiezo y abandono, no soy constante' },
  { v: 'capital_incierto', l: 'No sé cuánto capital necesito de verdad' },
];

const OBSTACULOS_OPERADOR: Opcion[] = [
  { v: 'producto', l: 'No encuentro un producto que funcione' },
  { v: 'trafico_sin_ventas', l: 'Tengo tráfico pero no vendo' },
  { v: 'metricas', l: 'No entiendo mis métricas cuando pauto' },
  { v: 'sin_utilidad', l: 'Vendo, pero al final no me queda nada' },
  { v: 'caro', l: 'Cada venta me sale muy cara en pauta' },
  { v: 'no_escalo', l: 'No logro escalar lo que ya funciona' },
  { v: 'solo', l: 'Estoy solo y todo depende de mí' },
  { v: 'baneos', l: 'Me bloquean las cuentas publicitarias' },
];

const OBSTACULOS_CONSOLIDADO: Opcion[] = [
  { v: 'delegar', l: 'Delegar y armar equipo' },
  { v: 'rentabilidad', l: 'Rentabilidad neta real' },
  { v: 'escalar_trafico', l: 'Escalar tráfico sin quemar dinero' },
  { v: 'sistemas', l: 'Sistemas, finanzas y control' },
];

const HABILIDADES: Fila[] = [
  { id: 'creativos', l: 'Grabar y editar creativos en video' },
  { id: 'copy', l: 'Escribir textos y ofertas que venden' },
  { id: 'campanas', l: 'Estructurar campañas y presupuestos' },
  { id: 'metricas', l: 'Leer métricas y decidir con ellas' },
  { id: 'landing', l: 'Construir y mejorar una landing' },
];

const NIVELES_HABILIDAD: Opcion[] = [
  { v: '1', l: 'No sé', n: 1 },
  { v: '2', l: 'A medias', n: 2 },
  { v: '3', l: 'Lo domino', n: 3 },
];

// `n` = puntos que aporta cada pieza a la dimensión "Medición y herramientas" (suma máx. 100).
const HERRAMIENTAS_OPERADOR: Opcion[] = [
  { v: 'tienda', l: 'Tienda propia (Shopify, WooCommerce o landing)', n: 8 },
  { v: 'pixel_capi', l: 'Píxel con API de Conversiones o eventos server-side', n: 20 },
  { v: 'analytics', l: 'Analítica de la tienda o GA4 revisada cada semana', n: 10 },
  { v: 'utms', l: 'UTMs para saber qué anuncio trajo cada venta', n: 12 },
  { v: 'proveedor', l: 'Proveedor integrado (Dropi u otro) con estados automáticos', n: 10 },
  { v: 'whatsapp', l: 'Chatbot o CRM de WhatsApp', n: 8 },
  { v: 'confirmacion', l: 'Confirmación de pedidos antes de despachar', n: 14 },
  { v: 'finanzas', l: 'Control financiero por pedido', n: 14 },
  { v: 'ia', l: 'IA para creativos, textos o landings', n: 4 },
  { v: 'ninguna', l: 'Ninguna de las anteriores' },
];

const HERRAMIENTAS_NUEVO: Opcion[] = [
  { v: 'meta', l: 'Administrador de anuncios de Meta' },
  { v: 'tiktok', l: 'TikTok Ads' },
  { v: 'tienda', l: 'Shopify u otro creador de tiendas' },
  { v: 'edicion', l: 'Canva o CapCut' },
  { v: 'ia', l: 'ChatGPT, Claude u otra IA' },
  { v: 'hojas', l: 'Excel o Google Sheets' },
  { v: 'ninguna', l: 'Ninguna todavía' },
];

const CAPITAL: Opcion[] = [
  { v: 'menos_300', l: 'Menos de USD 300 (≈ $1,2 millones COP)', n: 0 },
  { v: '300_1000', l: 'USD 300 a 1.000 (≈ $1,2 a 4 millones COP)', n: 1 },
  { v: '1000_2500', l: 'USD 1.000 a 2.500 (≈ $4 a 10 millones COP)', n: 2 },
  { v: 'mas_2500', l: 'Más de USD 2.500 (≈ $10 millones COP)', n: 3 },
  { v: 'atado', l: 'Lo tengo, pero está atado (CDT, liquidación, un pago pendiente)', n: 2 },
];

// ---------- Datos: preguntas ----------
// Las 3 primeras son comunes. La respuesta a "etapa" define la rama:
// "nunca" / "teoria" => rama "nuevo"; el resto => rama "operador".

const PREGUNTAS: Pregunta[] = [
  {
    id: 'edad',
    texto: '¿Cuántos años tienes?',
    tipo: 'single',
    opciones: [
      { v: 'menos_18', l: 'Menos de 18' },
      { v: '18_24', l: '18 a 24' },
      { v: '25_34', l: '25 a 34' },
      { v: '35_44', l: '35 a 44' },
      { v: 'mas_45', l: '45 o más' },
    ],
  },
  {
    id: 'etapa',
    texto: '¿En qué punto estás hoy?',
    tipo: 'single',
    opciones: [
      { v: 'nunca', l: 'Aún no empiezo, quiero entender el modelo' },
      { v: 'teoria', l: 'Sé la teoría pero no he lanzado nada' },
      { v: 'sin_ventas', l: 'Tengo tienda y he pautado, pero casi no vendo' },
      { v: 'con_ventas', l: 'Vendo, pero no me queda utilidad o no logro escalar' },
      { v: 'consolidado', l: 'Facturo de forma constante y quiero profesionalizar' },
    ],
  },
  {
    id: 'ubicacion',
    texto: '¿Dónde vendes o quieres vender?',
    tipo: 'pais',
    opciones: [
      { v: 'colombia', l: 'Colombia' },
      { v: 'latam', l: 'Otro país de Latinoamérica' },
      { v: 'fuera', l: 'Fuera de Latinoamérica' },
    ],
  },

  // ----- Rama "operador" (ya tiene tienda / tráfico) -----
  {
    id: 'visitas',
    rama: 'operador',
    texto: '¿Cuántas visitas recibe tu tienda al mes?',
    ayuda: 'Sesiones en Shopify, Analytics o tu plataforma. Un promedio aproximado sirve.',
    tipo: 'single',
    opciones: [
      { v: 'v1', l: 'Menos de 1.000', n: 500 },
      { v: 'v2', l: '1.000 a 5.000', n: 3000 },
      { v: 'v3', l: '5.000 a 20.000', n: 12000 },
      { v: 'v4', l: '20.000 a 100.000', n: 50000 },
      { v: 'v5', l: 'Más de 100.000', n: 150000 },
      { v: 'no_mido', l: 'No lo mido' },
    ],
  },
  {
    id: 'pedidos',
    rama: 'operador',
    texto: '¿Cuántos pedidos recibes al mes, en promedio?',
    ayuda: 'Pedidos creados, antes de devoluciones.',
    tipo: 'single',
    opciones: [
      { v: 'p0', l: 'Ninguno todavía', n: 0 },
      { v: 'p1', l: '1 a 30', n: 15 },
      { v: 'p2', l: '31 a 150', n: 90 },
      { v: 'p3', l: '151 a 500', n: 300 },
      { v: 'p4', l: '501 a 2.000', n: 1000 },
      { v: 'p5', l: 'Más de 2.000', n: 3000 },
    ],
  },
  {
    id: 'ticket',
    rama: 'operador',
    texto: '¿Cuál es tu ticket promedio por pedido?',
    ayuda: 'Lo que paga el cliente en promedio, con envío incluido.',
    tipo: 'single',
    // n = ticket en USD
    opciones: [
      { v: 't1', l: 'Menos de $60.000 COP (≈ USD 15)', n: 11 },
      { v: 't2', l: '$60.000 a $120.000 COP (≈ USD 15 a 30)', n: 22 },
      { v: 't3', l: '$120.000 a $200.000 COP (≈ USD 30 a 50)', n: 40 },
      { v: 't4', l: '$200.000 a $350.000 COP (≈ USD 50 a 90)', n: 68 },
      { v: 't5', l: 'Más de $350.000 COP (≈ USD 90)', n: 110 },
    ],
  },
  {
    id: 'pauta',
    rama: 'operador',
    texto: '¿Cuánto inviertes en pauta al mes?',
    ayuda: 'Sumando Meta, TikTok, Google y cualquier otra plataforma.',
    tipo: 'single',
    // n = pauta mensual en USD
    opciones: [
      { v: 'a0', l: 'No pauto, todo es orgánico', n: 0 },
      { v: 'a1', l: 'Menos de $400.000 COP (≈ USD 100)', n: 60 },
      { v: 'a2', l: '$400.000 a $2 millones COP (≈ USD 100 a 500)', n: 300 },
      { v: 'a3', l: '$2 a $8 millones COP (≈ USD 500 a 2.000)', n: 1200 },
      { v: 'a4', l: '$8 a $40 millones COP (≈ USD 2.000 a 10.000)', n: 5000 },
      { v: 'a5', l: 'Más de $40 millones COP (≈ USD 10.000)', n: 15000 },
    ],
  },
  {
    id: 'canales',
    rama: 'operador',
    texto: '¿De dónde vienen tus ventas?',
    ayuda: 'Marca todas las que apliquen.',
    tipo: 'multi',
    opciones: [
      { v: 'meta', l: 'Meta Ads (Facebook e Instagram)' },
      { v: 'tiktok', l: 'TikTok Ads' },
      { v: 'google', l: 'Google Ads' },
      { v: 'organico', l: 'Contenido orgánico en redes' },
      { v: 'whatsapp', l: 'WhatsApp, referidos o influencers' },
      { v: 'marketplace', l: 'Marketplaces (Mercado Libre, Falabella, etc.)' },
    ],
  },
  {
    id: 'entrega',
    rama: 'operador',
    texto: 'De cada 10 pedidos, ¿cuántos terminan entregados y pagados?',
    ayuda: 'Si vendes contraentrega, descuenta devoluciones, rechazos y novedades.',
    tipo: 'single',
    // n = tasa de entrega/pago
    opciones: [
      { v: 'e1', l: '9 o 10', n: 0.92 },
      { v: 'e2', l: '7 u 8', n: 0.75 },
      { v: 'e3', l: '5 o 6', n: 0.55 },
      { v: 'e4', l: 'Menos de 5', n: 0.4 },
      { v: 'prepago', l: 'Casi todo es pago anticipado', n: 0.97 },
      { v: 'no_se', l: 'No lo tengo claro' },
    ],
  },
  {
    id: 'margen',
    rama: 'operador',
    texto: '¿Sabes cuánto te queda limpio por cada pedido entregado?',
    ayuda: 'Después de producto, flete, pauta y devoluciones.',
    tipo: 'single',
    opciones: [
      { v: 'semanal', l: 'Sí, lo calculo cada semana con números', n: 95 },
      { v: 'aprox', l: 'Tengo una idea aproximada', n: 50 },
      { v: 'no', l: 'No, miro la facturación y la cuenta del banco', n: 20 },
      { v: 'negativo', l: 'Sé que hoy estoy perdiendo por pedido', n: 10 },
    ],
  },
  {
    id: 'herramientas',
    rama: 'operador',
    texto: '¿Qué de esto tienes funcionando hoy?',
    ayuda: 'Solo lo que está configurado y lo usas, no lo que tienes instalado y olvidado.',
    tipo: 'multi',
    opciones: HERRAMIENTAS_OPERADOR,
  },
  {
    id: 'habilidades',
    rama: 'operador',
    texto: '¿Qué tan bien manejas esto hoy?',
    ayuda: 'Sé honesto. Esto define qué aprender y qué delegar.',
    tipo: 'grid',
    filas: HABILIDADES,
  },
  {
    id: 'testeo',
    rama: 'operador',
    texto: '¿Cuántos creativos nuevos lanzas por semana?',
    tipo: 'single',
    opciones: [
      { v: 'c0', l: 'Ninguno, uso los mismos', n: 10 },
      { v: 'c1', l: '1 a 3', n: 40 },
      { v: 'c2', l: '4 a 10', n: 75 },
      { v: 'c3', l: 'Más de 10', n: 95 },
    ],
  },
  {
    id: 'equipo',
    rama: 'operador',
    texto: '¿Quién opera el negocio contigo?',
    tipo: 'single',
    opciones: [
      { v: 'solo', l: 'Lo hago todo yo', n: 30 },
      { v: 'uno', l: 'Tengo una persona de apoyo', n: 55 },
      { v: 'pequeno', l: 'Equipo de 2 a 5 personas', n: 80 },
      { v: 'grande', l: 'Más de 5 personas', n: 95 },
    ],
  },
  {
    id: 'obstaculo',
    rama: 'operador',
    texto: '¿Cuál sientes que es tu mayor obstáculo hoy?',
    ayuda: 'Lo vamos a comparar con lo que dicen tus números.',
    tipo: 'single',
    opcionesDe: (r) => (r.etapa === 'consolidado' ? OBSTACULOS_CONSOLIDADO : OBSTACULOS_OPERADOR),
  },
  {
    id: 'capital',
    rama: 'operador',
    texto: '¿Cuánto capital adicional podrías invertir para crecer?',
    ayuda: 'Formación, pauta y herramientas, sin endeudarte.',
    tipo: 'single',
    opciones: CAPITAL,
  },

  // ----- Rama "nuevo" (aún no empieza) -----
  {
    id: 'situacion',
    rama: 'nuevo',
    texto: '¿Cuál es tu situación hoy?',
    tipo: 'single',
    opciones: [
      { v: 'estudio', l: 'Estudio' },
      { v: 'trabajo', l: 'Trabajo como empleado' },
      { v: 'negocio', l: 'Tengo un negocio propio' },
      { v: 'sin_empleo', l: 'Estoy sin empleo' },
    ],
  },
  {
    id: 'experiencia',
    rama: 'nuevo',
    texto: '¿Has vendido algo antes, online u offline?',
    tipo: 'single',
    opciones: [
      { v: 'nunca', l: 'Nunca he vendido nada', n: 15 },
      { v: 'informal', l: 'Algo informal, a conocidos o por catálogo', n: 40 },
      { v: 'redes', l: 'Sí, por Instagram, WhatsApp o Marketplace', n: 70 },
      { v: 'negocio', l: 'Tengo o tuve un negocio con clientes', n: 90 },
    ],
  },
  {
    id: 'herramientas_n',
    rama: 'nuevo',
    texto: '¿Cuáles de estas herramientas ya has usado?',
    ayuda: 'Aunque sea para practicar.',
    tipo: 'multi',
    opciones: HERRAMIENTAS_NUEVO,
  },
  {
    id: 'habilidades',
    rama: 'nuevo',
    texto: '¿Qué tan bien manejas esto hoy?',
    ayuda: 'Nadie empieza sabiendo. Esto define por dónde arrancar.',
    tipo: 'grid',
    filas: HABILIDADES,
  },
  {
    id: 'horas',
    rama: 'nuevo',
    texto: '¿Cuántas horas reales a la semana puedes dedicarle?',
    tipo: 'single',
    opciones: [
      { v: 'menos_5', l: 'Menos de 5', n: 15 },
      { v: '5_10', l: 'Entre 5 y 10', n: 45 },
      { v: '10_20', l: 'Entre 10 y 20', n: 75 },
      { v: 'mas_20', l: 'Más de 20', n: 95 },
    ],
  },
  {
    id: 'capital',
    rama: 'nuevo',
    texto: '¿Con cuánto capital cuentas hoy para arrancar?',
    ayuda: 'Formación, pauta y herramientas, sin endeudarte.',
    tipo: 'single',
    opciones: CAPITAL,
  },
  {
    id: 'plazo',
    rama: 'nuevo',
    texto: '¿En cuánto tiempo necesitas que esto te genere ingresos?',
    tipo: 'single',
    opciones: [
      { v: '1m', l: 'En un mes o menos', n: 15 },
      { v: '3m', l: 'En unos 3 meses', n: 45 },
      { v: '6m', l: 'En unos 6 meses', n: 80 },
      { v: '12m', l: 'En un año o más', n: 95 },
      { v: 'sin_afan', l: 'No tengo afán, quiero hacerlo bien', n: 90 },
    ],
  },
  {
    id: 'razon',
    rama: 'nuevo',
    texto: '¿Cuál es tu razón real para hacer esto?',
    ayuda: 'La de verdad, no la bonita.',
    tipo: 'single',
    opciones: [
      { v: 'familia', l: 'Ayudar a mi familia' },
      { v: 'dejar_trabajo', l: 'Dejar mi trabajo y reemplazar ese ingreso' },
      { v: 'extra', l: 'Tener un ingreso extra' },
      { v: 'libertad', l: 'Libertad de tiempo y de dinero' },
    ],
  },
  {
    id: 'obstaculo',
    rama: 'nuevo',
    texto: '¿Cuál sientes que es tu mayor obstáculo hoy?',
    ayuda: 'Lo vamos a comparar con tus respuestas.',
    tipo: 'single',
    opciones: OBSTACULOS_NUEVO,
  },
];

// ---------- Helpers de respuestas ----------

function ramaDe(r: Respuestas): Rama | null {
  const etapa = r.etapa;
  if (etapa === 'nunca' || etapa === 'teoria') return 'nuevo';
  return typeof etapa === 'string' ? 'operador' : null;
}

function preguntasVisibles(r: Respuestas): Pregunta[] {
  const rama = ramaDe(r);
  return PREGUNTAS.filter((p) => !p.rama || p.rama === rama);
}

function opcionesDe(p: Pregunta, r: Respuestas): Opcion[] {
  return p.opcionesDe ? p.opcionesDe(r) : p.opciones ?? [];
}

function opcionElegida(id: string, r: Respuestas): Opcion | undefined {
  const valor = r[id];
  if (typeof valor !== 'string') return undefined;
  const rama = ramaDe(r);
  const pregunta = PREGUNTAS.find((p) => p.id === id && (!p.rama || p.rama === rama));
  return pregunta ? opcionesDe(pregunta, r).find((o) => o.v === valor) : undefined;
}

function lista(id: string, r: Respuestas): string[] {
  const valor = r[id];
  return Array.isArray(valor) ? valor : [];
}

function mapa(id: string, r: Respuestas): Record<string, number> {
  const valor = r[id];
  return valor && typeof valor === 'object' && !Array.isArray(valor) ? valor : {};
}

function estaRespondida(p: Pregunta, r: Respuestas): boolean {
  const valor = r[p.id];
  if (p.tipo === 'multi') return Array.isArray(valor) && valor.length > 0;
  if (p.tipo === 'grid') return (p.filas ?? []).every((f) => mapa(p.id, r)[f.id] > 0);
  if (p.tipo === 'pais') return typeof valor === 'string' && (valor === 'colombia' || typeof r.pais === 'string');
  return typeof valor === 'string';
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function estadoDeScore(score: number): Estado {
  return score >= 65 ? 'bueno' : score >= 40 ? 'atencion' : 'critico';
}

// ---------- Formato ----------

const fmtEntero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const fmtDecimal = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

function usd(n: number): string {
  return `USD ${n < 100 && n % 1 !== 0 ? fmtDecimal.format(n) : fmtEntero.format(n)}`;
}

function cop(nUsd: number): string {
  const pesos = nUsd * CONFIG.trm;
  return pesos >= 1e6
    ? `$${fmtDecimal.format(pesos / 1e6)} millones COP`
    : `$${fmtEntero.format(Math.round(pesos / 1000) * 1000)} COP`;
}

function pct(n: number): string {
  return `${fmtDecimal.format(n * 100)}%`;
}

function num(n: number): string {
  return fmtEntero.format(n);
}

// ---------- Scoring ----------

function evaluarHabilidades(r: Respuestas) {
  const valores = mapa('habilidades', r);
  const niveles = HABILIDADES.map((h) => valores[h.id] || 1);
  const promedio = niveles.reduce((a, b) => a + b, 0) / niveles.length;
  let idxBaja = 0;
  niveles.forEach((v, i) => {
    if (v < niveles[idxBaja]) idxBaja = i;
  });
  const dominadas = niveles.filter((v) => v === 3).length;
  return {
    score: clamp(((promedio - 1) / 2) * 100),
    nota: `${dominadas} de ${niveles.length} habilidades dominadas`,
    baja: HABILIDADES[idxBaja].l.toLowerCase(),
  };
}

function habilidadMasBaja(r: Respuestas): string {
  return evaluarHabilidades(r).baja;
}

// Obstáculo declarado -> dimensión a la que apunta.
const OBSTACULO_A_DIMENSION: Record<string, string> = {
  producto: 'conversion',
  trafico_sin_ventas: 'conversion',
  metricas: 'capacidades',
  sin_utilidad: 'rentabilidad',
  caro: 'eficiencia',
  no_escalo: 'operacion',
  solo: 'operacion',
  baneos: 'medicion',
  delegar: 'operacion',
  rentabilidad: 'rentabilidad',
  escalar_trafico: 'eficiencia',
  sistemas: 'medicion',
  no_se_por_donde: 'capacidades',
  miedo_perder: 'capital',
  no_confio: 'experiencia',
  abandono: 'tiempo',
  capital_incierto: 'capital',
};

interface ResultadoRama {
  dims: Dimension[];
  metricas: Metrica[];
  faltantes: string[];
  pesos: Record<string, number>;
  facturacion: number;
}

const FALTANTE_TEXTO: Record<string, string> = {
  pixel_capi: 'Píxel con API de Conversiones: sin esto la plataforma no sabe a quién mostrar tus anuncios.',
  confirmacion: 'Confirmación antes de despachar: la forma más barata de subir tu tasa de entrega.',
  finanzas: 'Control financiero por pedido: el único número que dice si de verdad ganas.',
  utms: 'UTMs en cada anuncio: te dicen qué creativo vende, no solo cuál recibe clics.',
  analytics: 'Analítica semanal: sin ella no sabes si tu problema es tráfico o conversión.',
  proveedor: 'Proveedor integrado: menos errores manuales y novedades a tiempo.',
  whatsapp: 'WhatsApp automatizado: responder en minutos y no en horas cambia la conversión.',
  tienda: 'Tienda o landing propia: sin ella dependes de plataformas que no controlas.',
};

function evaluarOperador(r: Respuestas): ResultadoRama {
  const visitas = opcionElegida('visitas', r)?.n;
  const pedidos = opcionElegida('pedidos', r)?.n ?? 0;
  const ticket = opcionElegida('ticket', r)?.n ?? 22;
  const pauta = opcionElegida('pauta', r)?.n ?? 0;
  const entrega = opcionElegida('entrega', r)?.n;
  const canales = lista('canales', r);
  const herramientas = lista('herramientas', r).filter((h) => h !== 'ninguna');
  const u = CONFIG.umbrales;
  const dims: Dimension[] = [];
  const metricas: Metrica[] = [];

  // Tráfico
  const baseTrafico =
    visitas === undefined ? 20 : visitas <= 500 ? 15 : visitas <= 3000 ? 35 : visitas <= 12000 ? 60 : visitas <= 50000 ? 80 : 95;
  const bonoFuentes = Math.min(10, Math.max(0, canales.length - 1) * 5);
  dims.push({
    id: 'trafico',
    score: clamp(baseTrafico + bonoFuentes - (canales.length === 1 && pauta > 0 ? 5 : 0)),
    nota:
      visitas === undefined
        ? 'No mides tus visitas'
        : `≈ ${num(visitas)} visitas al mes · ${canales.length} ${canales.length === 1 ? 'fuente' : 'fuentes'}`,
  });

  // Conversión
  let tasaConversion: number | undefined;
  if (visitas !== undefined && visitas > 0) tasaConversion = pedidos / visitas;
  let scoreConversion = 30;
  if (tasaConversion !== undefined) {
    scoreConversion =
      pedidos === 0 ? 5 : tasaConversion < 0.005 ? 15 : tasaConversion < 0.01 ? 35 : tasaConversion < 0.02 ? 60 : tasaConversion < 0.035 ? 80 : 95;
  }
  dims.push({
    id: 'conversion',
    score: scoreConversion,
    nota: tasaConversion !== undefined ? `≈ ${pct(tasaConversion)} de las visitas compra` : 'Sin visitas medidas no se puede calcular',
  });
  if (tasaConversion !== undefined) {
    metricas.push({
      id: 'conversion',
      label: 'Tasa de conversión',
      valor: pct(tasaConversion),
      detalle: `${num(pedidos)} pedidos sobre ≈ ${num(visitas ?? 0)} visitas`,
      estado: tasaConversion >= u.conversion.bueno ? 'bueno' : tasaConversion >= u.conversion.atencion ? 'atencion' : 'critico',
    });
  }

  // Eficiencia de pauta (CPA / ROAS)
  let scoreEficiencia = 50;
  let notaEficiencia = 'No pautas: dependes del orgánico';
  const tasaEntrega = entrega ?? 0.7;
  if (pauta > 0 && pedidos === 0) {
    scoreEficiencia = 5;
    notaEficiencia = 'Inviertes en pauta y aún no hay pedidos';
  } else if (pauta > 0) {
    const cpa = pauta / pedidos;
    const cpaSobreTicket = cpa / ticket;
    scoreEficiencia = cpaSobreTicket < 0.15 ? 95 : cpaSobreTicket < 0.25 ? 80 : cpaSobreTicket < 0.35 ? 60 : cpaSobreTicket < 0.5 ? 40 : 15;
    notaEficiencia = `≈ ${usd(cpa)} de pauta por pedido (${pct(cpaSobreTicket)} del ticket)`;
    metricas.push({
      id: 'cpa',
      label: 'Costo de pauta por pedido',
      valor: usd(cpa),
      detalle: `${pct(cpaSobreTicket)} de tu ticket · ≈ ${cop(cpa)}`,
      estado: cpaSobreTicket <= u.cpaSobreTicket.bueno ? 'bueno' : cpaSobreTicket <= u.cpaSobreTicket.atencion ? 'atencion' : 'critico',
    });
    const roas = (pedidos * tasaEntrega * ticket) / pauta;
    metricas.push({
      id: 'roas',
      label: 'Retorno sobre pauta (entregado)',
      valor: `${fmtDecimal.format(roas)}x`,
      detalle:
        entrega === undefined
          ? 'Estimado con 70% de entrega'
          : `Por cada dólar en pauta vuelven ${fmtDecimal.format(roas)} en ventas entregadas`,
      estado: roas >= u.roas.bueno ? 'bueno' : roas >= u.roas.atencion ? 'atencion' : 'critico',
    });
  }
  dims.push({ id: 'eficiencia', score: scoreEficiencia, nota: notaEficiencia });

  // Rentabilidad y entrega
  const scoreEntrega =
    entrega === undefined ? 20 : entrega >= 0.95 ? 95 : entrega >= 0.9 ? 85 : entrega >= 0.75 ? 60 : entrega >= 0.55 ? 30 : 10;
  const scoreMargen = opcionElegida('margen', r)?.n ?? 20;
  dims.push({
    id: 'rentabilidad',
    score: clamp(scoreEntrega * 0.5 + scoreMargen * 0.5),
    nota: `${entrega === undefined ? 'Entrega sin medir' : `≈ ${Math.round(entrega * 100)}% de los pedidos se pagan`} · ${
      opcionElegida('margen', r)?.l.toLowerCase() ?? ''
    }`,
  });
  if (entrega !== undefined && pedidos > 0) {
    metricas.push({
      id: 'entrega',
      label: 'Pedidos que se vuelven plata',
      valor: pct(entrega),
      detalle: `≈ ${num(Math.round(pedidos * entrega))} de ${num(pedidos)} pedidos al mes`,
      estado: entrega >= u.entrega.bueno ? 'bueno' : entrega >= u.entrega.atencion ? 'atencion' : 'critico',
    });
  }

  // Medición y herramientas
  const puntosHerramientas = HERRAMIENTAS_OPERADOR.reduce((acc, h) => acc + (herramientas.includes(h.v) ? h.n ?? 0 : 0), 0);
  dims.push({
    id: 'medicion',
    score: clamp(puntosHerramientas),
    nota: `${herramientas.length} de ${HERRAMIENTAS_OPERADOR.length - 1} piezas del sistema funcionando`,
  });

  // Capacidades
  const hab = evaluarHabilidades(r);
  dims.push({ id: 'capacidades', score: hab.score, nota: `${hab.nota} · más baja: ${hab.baja}` });

  // Operación y escala
  const scoreTesteo = opcionElegida('testeo', r)?.n ?? 10;
  const scoreEquipo = opcionElegida('equipo', r)?.n ?? 30;
  dims.push({
    id: 'operacion',
    score: clamp(scoreTesteo * 0.6 + scoreEquipo * 0.4),
    nota: `${opcionElegida('testeo', r)?.l.toLowerCase() ?? ''} creativos por semana · ${opcionElegida('equipo', r)?.l.toLowerCase() ?? ''}`,
  });

  // Facturación estimada
  const facturacion = pedidos * ticket;
  if (pedidos > 0) {
    metricas.unshift({
      id: 'facturacion',
      label: 'Facturación mensual estimada',
      valor: usd(facturacion),
      detalle: `≈ ${cop(facturacion)} · entregado ≈ ${usd(facturacion * tasaEntrega)}`,
    });
  }

  // Las 3 piezas faltantes de mayor peso
  const faltantes = [...HERRAMIENTAS_OPERADOR]
    .filter((h) => h.n && !herramientas.includes(h.v) && FALTANTE_TEXTO[h.v])
    .sort((a, b) => (b.n ?? 0) - (a.n ?? 0))
    .slice(0, 3)
    .map((h) => FALTANTE_TEXTO[h.v]);

  return {
    dims,
    metricas,
    faltantes,
    pesos: { trafico: 1, conversion: 1.3, eficiencia: 1.2, rentabilidad: 1.3, medicion: 1, capacidades: 1, operacion: 0.8 },
    facturacion,
  };
}

function evaluarNuevo(r: Respuestas): ResultadoRama {
  const dims: Dimension[] = [];

  const hab = evaluarHabilidades(r);
  dims.push({ id: 'capacidades', score: hab.score, nota: `${hab.nota} · más baja: ${hab.baja}` });

  const usadas = lista('herramientas_n', r).filter((h) => h !== 'ninguna');
  dims.push({
    id: 'herramientas',
    score: clamp(usadas.length * 17),
    nota: usadas.length ? `Has usado ${usadas.length} de 6 herramientas clave` : 'Aún no has usado ninguna',
  });

  const experiencia = opcionElegida('experiencia', r);
  dims.push({ id: 'experiencia', score: experiencia?.n ?? 15, nota: experiencia?.l ?? '' });

  const horas = opcionElegida('horas', r);
  dims.push({ id: 'tiempo', score: horas?.n ?? 15, nota: `${horas?.l ?? ''} horas por semana` });

  const capital = opcionElegida('capital', r);
  const scoreCapital = [15, 45, 75, 95][capital?.n ?? 0] - (r.capital === 'atado' ? 15 : 0);
  dims.push({ id: 'capital', score: clamp(scoreCapital), nota: capital?.l ?? '' });

  const plazo = opcionElegida('plazo', r);
  let scorePlazo = plazo?.n ?? 45;
  const nivelCapital = capital?.n ?? 0;
  const conAfan = r.plazo === '1m' || r.plazo === '3m';
  if (conAfan && nivelCapital === 0) scorePlazo -= 15;
  if (conAfan && (r.horas === 'menos_5' || r.horas === '5_10')) scorePlazo -= 10;
  dims.push({ id: 'expectativas', score: clamp(scorePlazo), nota: `Esperas ingresos ${plazo?.l.toLowerCase() ?? ''}` });

  return {
    dims,
    metricas: [],
    faltantes: [],
    pesos: { capacidades: 1.2, herramientas: 0.8, experiencia: 1, tiempo: 1.2, capital: 1, expectativas: 1 },
    facturacion: 0,
  };
}

function diagnosticar(r: Respuestas): Diagnostico {
  const rama = ramaDe(r) ?? 'nuevo';
  const res = rama === 'operador' ? evaluarOperador(r) : evaluarNuevo(r);
  const { dims, pesos } = res;

  const sumaPesos = dims.reduce((acc, d) => acc + (pesos[d.id] ?? 1), 0);
  const global = clamp(dims.reduce((acc, d) => acc + d.score * (pesos[d.id] ?? 1), 0) / sumaPesos);

  // Menor puntaje primero; en empate, gana la dimensión de mayor peso.
  const ordenadas = [...dims].sort((a, b) => a.score - b.score || (pesos[b.id] ?? 1) - (pesos[a.id] ?? 1));
  const cuello = ordenadas[0];
  const segundo = ordenadas[1];

  const obstaculo = typeof r.obstaculo === 'string' ? r.obstaculo : '';
  const idDeclarado = OBSTACULO_A_DIMENSION[obstaculo] ?? null;
  const dimDeclarada = dims.find((d) => d.id === idDeclarado);
  const coincide = !dimDeclarada || idDeclarado === cuello.id || dimDeclarada.score - cuello.score <= 10;
  const capital = opcionElegida('capital', r)?.n ?? 0;

  let tier: Tier;
  if (r.edad === 'menos_18') {
    tier = 'MENOR';
  } else if (rama === 'operador' && (r.etapa === 'consolidado' || res.facturacion >= CONFIG.facturacionEscalaUSD)) {
    tier = 'ESCALA';
  } else if (rama === 'operador') {
    const pauta = opcionElegida('pauta', r)?.n ?? 0;
    const tieneRecursos = capital >= 1 || pauta >= 300;
    tier = tieneRecursos && global >= 45 ? 'A' : tieneRecursos ? 'B' : 'C';
  } else {
    const tiempo = dims.find((d) => d.id === 'tiempo')?.score ?? 0;
    const expectativas = dims.find((d) => d.id === 'expectativas')?.score ?? 0;
    tier =
      capital >= 2 && tiempo >= 45 && expectativas >= 45 ? 'A' : capital >= 1 && tiempo >= 45 ? 'B' : tiempo >= 45 ? 'C' : 'D';
  }

  // Posición (1-5) en la ruta de 5 etapas.
  let etapaRuta = 1;
  if (rama === 'operador') {
    const porCuello: Record<string, number> = {
      trafico: 4, conversion: 3, eficiencia: 4, capacidades: 3, rentabilidad: 5, medicion: 4, operacion: 5,
    };
    etapaRuta = porCuello[cuello.id] ?? 3;
    if (cuello.id === 'conversion' && (opcionElegida('pedidos', r)?.n ?? 0) === 0) etapaRuta = 2;
  } else if (r.etapa === 'teoria' && (dims.find((d) => d.id === 'capacidades')?.score ?? 0) >= 50) {
    etapaRuta = 2;
  }

  return {
    rama,
    dims,
    global,
    cuello,
    segundo,
    declarado: dimDeclarada ? idDeclarado : null,
    coincide,
    metricas: res.metricas,
    faltantes: res.faltantes,
    tier,
    etapaRuta,
    capital,
  };
}

// Mensajes intermedios ("insights") que aparecen tras ciertas preguntas.
function insightTras(id: string, r: Respuestas): string[] | null {
  const rama = ramaDe(r);
  if (id === 'etapa') {
    return rama === 'operador'
      ? ['Ahora vienen tus números.', 'Aproximados está bien. Inventados no sirven.']
      : ['Vamos a medir tu punto de partida real.', 'No tu motivación: tus habilidades, tu tiempo y tu capital.'];
  }
  if (id === 'pedidos' && rama === 'operador') {
    const visitas = opcionElegida('visitas', r)?.n;
    const pedidos = opcionElegida('pedidos', r)?.n ?? 0;
    if (visitas === undefined) {
      return ['No medir tus visitas ya es un diagnóstico.', 'Sin ese número no sabes si tu problema es tráfico o conversión.'];
    }
    if (pedidos === 0) {
      return ['Visitas sin pedidos es una señal clara.', 'Casi nunca es solo el producto: suele ser oferta, creativo o página.'];
    }
    return [
      `Con ≈ ${num(visitas)} visitas y ${num(pedidos)} pedidos, tu tienda convierte cerca del ${pct(pedidos / visitas)}.`,
      'Guarda ese número. Lo vamos a cruzar con todo lo demás.',
    ];
  }
  if (id === 'pauta' && rama === 'operador') {
    const pedidos = opcionElegida('pedidos', r)?.n ?? 0;
    const pauta = opcionElegida('pauta', r)?.n ?? 0;
    const ticket = opcionElegida('ticket', r)?.n ?? 22;
    return pauta > 0 && pedidos > 0
      ? [
          `Estás pagando cerca de ${usd(pauta / pedidos)} de pauta por cada pedido.`,
          `Con tu ticket, eso es el ${pct(pauta / pedidos / ticket)} de lo que cobras.`,
        ]
      : null;
  }
  if (id === 'entrega' && rama === 'operador') {
    const entrega = opcionElegida('entrega', r)?.n;
    return entrega !== undefined && entrega < 0.8
      ? [`De cada 100 pedidos, solo ${Math.round(entrega * 100)} se vuelven plata.`, 'Los otros te cuestan flete de ida y de vuelta.']
      : null;
  }
  if (id === 'habilidades') {
    return ['Listo tu mapa de habilidades.', 'No saber algo no es el problema. Ignorarlo, sí.'];
  }
  return null;
}

// ---------- Contenido de dimensiones ----------

const DIMENSIONES_OPERADOR: Record<string, InfoDimension> = {
  trafico: {
    nombre: 'Tráfico',
    mide: 'Volumen de visitas y variedad de fuentes',
    perfil: 'La tienda sin audiencia',
    perfilLinea: 'Tu tienda existe, pero casi nadie la ve. Antes de tocar nada más, necesitas volumen.',
    idea: 'Con pocas visitas no hay datos para decidir. Antes de cambiar la tienda o el producto necesitas suficiente volumen para que los números signifiquen algo.',
    noHacer: 'No cambies la tienda ni el producto por lo que pasó con 200 visitas. Eso es ruido, no información.',
    acciones: [
      'Fija un presupuesto diario por 7 días y no lo toques. La meta es llegar a 1.000 visitas medibles.',
      'Lanza de 3 a 5 creativos distintos para el mismo producto y deja que la plataforma elija.',
      'Suma una segunda fuente de tráfico, como TikTok u orgánico, para no depender de una sola cuenta.',
    ],
  },
  conversion: {
    nombre: 'Conversión',
    mide: 'Qué porcentaje de visitas termina en pedido',
    perfil: 'La vitrina que no convierte',
    perfilLinea: 'El tráfico llega. Lo que falla es lo que pasa entre el clic y el pedido.',
    idea: 'Casi nunca es solo el producto. Suele ser la oferta, una promesa del anuncio que la página no cumple, o una landing lenta o confusa en el celular.',
    noHacer: 'No subas presupuesto esperando que se arregle. Más tráfico a una página que no convierte solo acelera la pérdida.',
    acciones: [
      'Abre tu landing en el celular con datos móviles. Si tarda más de 3 segundos en cargar, eso va primero.',
      'Haz que el titular de la página repita la promesa exacta del anuncio que más clics trae.',
      'Prueba una oferta de 1, 2 o 3 unidades con el ahorro visible justo encima del botón.',
    ],
  },
  eficiencia: {
    nombre: 'Eficiencia de pauta',
    mide: 'Cuánto pagas en anuncios por cada pedido',
    perfil: 'El que compra ventas caras',
    perfilLinea: 'Vendes, pero la pauta se está comiendo el margen antes de que llegue a tu bolsillo.',
    idea: 'Cuando la pauta se come una parte grande del ticket, el negocio no aguanta devoluciones, fletes ni costo de producto. Vender más así es perder más.',
    noHacer: 'No apagues y prendas campañas todos los días. Borras el aprendizaje y cada venta te sale más cara.',
    acciones: [
      'Calcula tu CPA máximo: precio de venta menos producto, flete y devoluciones promedio. Ese es tu techo.',
      'Apaga los anuncios que gasten el equivalente a 2 CPA máximos sin traer una venta.',
      'Concentra el presupuesto en los 2 o 3 creativos que ya vendieron en vez de repartirlo en muchos.',
    ],
  },
  rentabilidad: {
    nombre: 'Rentabilidad y entrega',
    mide: 'Pedidos que se vuelven plata y utilidad real por pedido',
    perfil: 'El que factura pero no gana',
    perfilLinea: 'Hay movimiento, pero entre devoluciones y costos que no ves, la utilidad se evapora.',
    idea: 'Facturar y ganar son dos negocios distintos. Si no controlas entregas y utilidad por pedido, puedes estar trabajando para la transportadora y el proveedor.',
    noHacer: 'No escales nada hasta tener el número neto real por pedido entregado, con devoluciones incluidas.',
    acciones: [
      'Arma una hoja con cada pedido: venta, producto, flete, pauta asignada y estado final. Una semana basta para ver la verdad.',
      'Confirma cada pedido por WhatsApp antes de despachar y no envíes los que no respondan.',
      'Revisa la tasa de entrega por ciudad y transportadora. Casi siempre hay 2 o 3 zonas que te hunden.',
    ],
  },
  medicion: {
    nombre: 'Medición y herramientas',
    mide: 'Qué tanto de tu operación está medido y conectado',
    perfil: 'El operador sin tablero',
    perfilLinea: 'Tomas decisiones importantes con información incompleta, y la plataforma optimiza a ciegas.',
    idea: 'Sin píxel bien configurado, UTMs y control por pedido, la plataforma no sabe a quién mostrar tus anuncios y tú decides por intuición.',
    noHacer: 'No compres más herramientas antes de configurar bien las básicas. Diez apps mal conectadas miden peor que tres bien puestas.',
    acciones: [
      'Verifica que el píxel reciba compras también por API de Conversiones y que los eventos no se dupliquen.',
      'Pon UTMs en todos tus anuncios para saber qué creativo trae ventas, no solo clics.',
      'Conecta tu proveedor para que los estados de los pedidos se actualicen solos.',
    ],
  },
  capacidades: {
    nombre: 'Capacidades digitales',
    mide: 'Creativos, textos, campañas, métricas y landings',
    perfil: 'El ejecutor sin método',
    perfilLinea: 'Le pones horas, pero hay habilidades clave que hoy frenan todo lo demás.',
    idea: 'No necesitas dominarlo todo, pero sí saber qué aprender primero y qué delegar. El negocio se frena justo en tu habilidad más débil.',
    noHacer: 'No intentes aprender las cinco cosas a la vez. Elige la más débil que más mueve tu número principal.',
    acciones: [
      'Dedica 30 minutos diarios esta semana a tu habilidad más baja, con un solo recurso y no con diez.',
      'Si son creativos: graba 5 ganchos distintos del mismo producto con el celular y pruébalos.',
      'Si son métricas: cada lunes anota CTR, CPC, CPA y ROAS de la semana y escribe una decisión por número.',
    ],
  },
  operacion: {
    nombre: 'Operación y escala',
    mide: 'Ritmo de testeo y capacidad del equipo',
    perfil: 'El cuello de botella eres tú',
    perfilLinea: 'El negocio depende de tus manos y testea poco. Así crecer solo hace el desorden más caro.',
    idea: 'Sin un ritmo semanal de creativos nuevos y sin procesos que otra persona pueda ejecutar, cada paso de crecimiento te cuesta más horas a ti.',
    noHacer: 'No contrates antes de escribir cómo se hace lo que hoy solo vive en tu cabeza.',
    acciones: [
      'Fija un ritmo mínimo de 4 creativos nuevos por semana, todas las semanas.',
      'Escribe en una página cómo se procesa un pedido, de la venta a la entrega, para poder delegarlo.',
      'Delega primero lo repetitivo, como confirmaciones y novedades, y quédate con creativos y decisiones.',
    ],
  },
};

const DIMENSIONES_NUEVO: Record<string, InfoDimension> = {
  capacidades: {
    nombre: 'Capacidades digitales',
    mide: 'Creativos, textos, campañas, métricas y landings',
    perfil: 'El que empieza desde cero técnico',
    perfilLinea: 'Tienes la intención. Lo que falta son las habilidades básicas del modelo, y eso se entrena.',
    idea: 'Hoy no dominas las habilidades con las que se opera una tienda: crear anuncios, escribir ofertas y leer métricas. Es normal al empezar, y define por dónde arrancar.',
    noHacer: 'No abras tienda ni pagues pauta todavía. Primero una habilidad, después la siguiente.',
    acciones: [
      'Aprende qué significan CTR, CPC, CPA y ROAS con un ejemplo real de números.',
      'Graba 3 videos cortos de un producto que tengas en casa, como si lo estuvieras vendiendo.',
      'Escribe 5 titulares distintos para ese producto y pregunta a 3 personas cuál les haría comprar.',
    ],
  },
  herramientas: {
    nombre: 'Herramientas',
    mide: 'Qué herramientas del modelo ya has usado',
    perfil: 'El que aún no toca las herramientas',
    perfilLinea: 'Todavía no has entrado a los lugares donde pasa el negocio. Eso se resuelve rápido y sin plata.',
    idea: 'Conocer las herramientas no te hace vender, pero no conocerlas te frena en cada paso. Casi todas tienen versión gratis o de prueba.',
    noHacer: 'No pagues suscripciones antes de saber qué necesitas de verdad.',
    acciones: [
      'Crea tu portafolio comercial en Meta y recorre el administrador de anuncios sin lanzar nada.',
      'Abre una prueba gratis de Shopify y arma una página de producto de práctica.',
      'Edita en Canva o CapCut un video de 15 segundos para ese producto.',
    ],
  },
  experiencia: {
    nombre: 'Experiencia comercial',
    mide: 'Si ya le has vendido algo a alguien',
    perfil: 'El que nunca ha vendido',
    perfilLinea: 'La técnica se aprende. Lo que más pesa al inicio es entender por qué alguien compra.',
    idea: 'Vender es entender objeciones, confianza y urgencia. Sin haber vivido una venta, es fácil elegir productos que te gustan a ti y no a tu cliente.',
    noHacer: 'No asumas que un producto se vende solo porque te parece bueno.',
    acciones: [
      'Vende algo esta semana a alguien conocido, aunque sea usado, y anota qué preguntas te hace.',
      'Lee 50 comentarios en anuncios de productos parecidos y anota las objeciones que se repiten.',
      'Escribe en una frase qué problema resuelve el producto y para quién exactamente.',
    ],
  },
  tiempo: {
    nombre: 'Tiempo disponible',
    mide: 'Horas reales por semana',
    perfil: 'El que no tiene horas',
    perfilLinea: 'Las ganas están, pero tu semana todavía no tiene espacio para esto.',
    idea: 'Al inicio el tiempo pesa más que el capital. Con pocas horas cualquier método avanza lento y la frustración llega antes que los resultados.',
    noHacer: 'No te comprometas con un plan de 20 horas semanales si tienes 5. Vas a abandonar.',
    acciones: [
      'Bloquea en tu calendario 3 franjas fijas de una hora esta semana.',
      'Cambia una actividad de consumo, como redes o series, por una de esas franjas.',
      'Define una sola tarea concreta antes de sentarte en cada franja.',
    ],
  },
  capital: {
    nombre: 'Capital',
    mide: 'Lo que puedes invertir sin endeudarte',
    perfil: 'El que tiene ganas pero no caja',
    perfilLinea: 'Tienes con qué empezar a aprender, todavía no con qué testear en serio.',
    idea: 'Testear productos con pauta cuesta, y entrar sin ese colchón es la forma más rápida de frustrarse y quemar lo poco que hay.',
    noHacer: 'No pidas prestado ni uses la tarjeta de crédito para arrancar. Nunca es el camino.',
    acciones: [
      'Calcula cuánto puedes apartar cada mes sin tocar tus gastos básicos.',
      'Mientras juntas capital, practica con contenido orgánico en TikTok e Instagram, que no cobran por publicar.',
      'Define la cifra mínima para tu primer test y ponle una fecha.',
    ],
  },
  expectativas: {
    nombre: 'Expectativas',
    mide: 'Qué tan realista es tu plazo frente a tus recursos',
    perfil: 'El que tiene afán',
    perfilLinea: 'Tu plazo no cuadra con tus recursos, y el afán es el que más dinero quema.',
    idea: 'Esperar ingresos en pocas semanas con poco capital o poco tiempo empuja a malas decisiones: productos virales sin validar, presupuestos que no aguantan y abandono temprano.',
    noHacer: 'No persigas productos "virales" para recuperar rápido lo invertido.',
    acciones: [
      'Cambia tu meta: primer pedido en 60 días, no ingresos en 30.',
      'Define un presupuesto de aprendizaje que puedas perder sin que te duela.',
      'Escribe qué harás si en 3 meses aún no hay utilidad. Tener ese plan te quita presión.',
    ],
  },
};

function infoDimension(rama: Rama, id: string): InfoDimension {
  return (rama === 'operador' ? DIMENSIONES_OPERADOR : DIMENSIONES_NUEVO)[id] ?? DIMENSIONES_OPERADOR[id] ?? DIMENSIONES_NUEVO[id];
}

function nivelGlobal(score: number): { label: string; linea: string } {
  if (score >= 85) return { label: 'Listo para escalar', linea: 'Tu base es sólida. El trabajo ahora es estructura y volumen.' };
  if (score >= 65) return { label: 'Sólido', linea: 'Tienes una base que funciona, con un punto concreto que te frena.' };
  if (score >= 40) return { label: 'En desarrollo', linea: 'Hay piezas que funcionan y otras que te están costando dinero o tiempo.' };
  return { label: 'Base en construcción', linea: 'Antes de acelerar, hay que armar las piezas que faltan.' };
}

const RUTA: [string, string][] = [
  ['Mentalidad y finanzas', 'Ordenar la cabeza y el dinero antes de mover un peso.'],
  ['Producto', 'Encontrar y validar un producto con método, no por intuición.'],
  ['Tienda y creativos', 'Montar la página y los anuncios que venden.'],
  ['Tráfico y métricas', 'Pautar, leer los números y corregir cada semana.'],
  ['Rentabilidad y escala', 'Logística, utilidad neta y llevar lo que funciona a más presupuesto.'],
];

interface Cta {
  titulo: string;
  texto: string;
  label: string;
  url: string;
  destino: string;
  secundario?: { label: string; url: string; destino: string };
}

function siguientePaso(d: Diagnostico): Cta {
  const info = infoDimension(d.rama, d.cuello.id);
  const links = CONFIG.links;
  switch (d.tier) {
    case 'ESCALA':
      return {
        titulo: 'Tu negocio ya funciona. Ahora necesita estructura.',
        texto: `Facturas de forma constante y tu punto más débil es ${info.nombre.toLowerCase()}. En esta etapa lo que más rinde es una revisión con datos de tus cuentas, tu estructura de costos y tus procesos, para crecer sin que todo dependa de ti.`,
        label: 'Agendar una sesión de escala',
        url: urlContacto(),
        destino: 'escala_whatsapp',
        secundario: { label: 'Ver cómo trabajo con operadores', url: links.escala, destino: 'escala_pagina' },
      };
    case 'MENOR':
      return {
        titulo: 'Tu siguiente paso empieza en casa.',
        texto:
          'No trabajo con menores de edad sin sus padres en la conversación. Este negocio requiere capital y decisiones que hoy no son solo tuyas. Muéstrales este diagnóstico, y si quieren entender de qué se trata, hablamos todos juntos.',
        label: 'Hablar con Samuel junto a mis padres',
        url: urlContacto(),
        destino: 'menor_whatsapp',
      };
    case 'A':
      return {
        titulo: 'Tienes con qué avanzar. Te falta método en un punto concreto.',
        texto: `Tus números muestran recursos para crecer y un freno claro en ${info.nombre.toLowerCase()}. Escríbeme con este resultado: reviso tu caso y te digo con honestidad si el acompañamiento tiene sentido para ti.`,
        label: 'Hablar con Samuel',
        url: urlContacto(),
        destino: 'a_whatsapp',
      };
    case 'B':
      return {
        titulo: 'Estás cerca. Arregla tu cuello de botella antes de invertir más.',
        texto:
          'Aplica las acciones de arriba durante 14 días y mide otra vez. Si quieres hacerlo con alguien que revise tus números cada semana, mira cómo funciona el acompañamiento.',
        label: 'Ver cómo funciona el acompañamiento',
        url: links.mentoria,
        destino: 'b_mentoria',
        secundario: { label: '¿Prefieres hablar directo? Escríbeme aquí.', url: urlContacto(), destino: 'b_whatsapp' },
      };
    case 'C':
      return {
        titulo: 'Todavía no es momento de pagar acompañamiento 1:1.',
        texto:
          'Hoy el capital no alcanza para ejecutar el método completo con pauta, y entrar a algo que no puedes ejecutar frustra. Aplica las acciones de 14 días, aprende con contenido en orden y vuelve a hacer el diagnóstico cuando cambien tus números.',
        label: 'Aprender con mi contenido',
        url: links.blog,
        destino: 'c_blog',
        secundario: { label: 'Recurso gratis: checklist de Google Ads', url: links.checklist, destino: 'c_checklist' },
      };
    default:
      return {
        titulo: 'Tu siguiente paso no es comprar nada. Es preparar el terreno.',
        texto:
          'Hoy no tienes el tiempo o las condiciones para ejecutar esto bien, y prefiero decírtelo a que pierdas dinero. Empieza por las acciones de 14 días y vuelve a hacer el diagnóstico cuando las termines.',
        label: 'Leer el blog',
        url: links.blog,
        destino: 'd_blog',
      };
  }
}

// ---------- Utilidades de navegador ----------

function leerStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function guardarStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento disponible */
  }
}

function track(evento: string, params: Record<string, unknown> = {}): void {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  try {
    w.gtag?.('event', evento, { event_category: 'ruta_clara', ...params });
  } catch {
    /* gtag no disponible */
  }
}

function utmsActuales(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(window.location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'fbclid'].forEach((k) => {
      const v = params.get(k);
      if (v) out[k] = v;
    });
  } catch {
    /* noop */
  }
  return out;
}

const esExterno = (url: string) => /^https?:\/\//.test(url);

// ---------- Piezas de UI ----------

const ESTADOS: Record<Estado, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
  bueno: { label: 'Bien', cls: 'text-signal-teal border-signal-teal/30 bg-signal-teal/10', Icon: CheckCircle2 },
  atencion: { label: 'Atención', cls: 'text-signal-amber border-signal-amber/30 bg-signal-amber/10', Icon: AlertTriangle },
  critico: { label: 'Crítico', cls: 'text-[#FF8A8A] border-[#FF8A8A]/30 bg-[#FF8A8A]/10', Icon: XCircle },
};

function EstadoBadge({ estado }: { estado: Estado }) {
  const { label, cls, Icon } = ESTADOS[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${cls}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function Etiqueta({ children }: { children: ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">{children}</p>;
}

function Anillo({ score }: { score: number }) {
  const circ = 2 * Math.PI * 52;
  return (
    <svg viewBox="0 0 128 128" className="w-32 h-32 shrink-0" role="img" aria-label={`Puntaje global ${score} de 100`}>
      <circle cx="64" cy="64" r={52} fill="none" stroke="#122048" strokeWidth="10" />
      <circle
        cx="64"
        cy="64"
        r={52}
        fill="none"
        stroke="#3E7BFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - score / 100)}
        transform="rotate(-90 64 64)"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
      <text x="64" y="66" textAnchor="middle" fill="#F4F7FF" fontSize="30" fontWeight="800" fontFamily="Montserrat, sans-serif">
        {score}
      </text>
      <text x="64" y="86" textAnchor="middle" fill="#8B9BC7" fontSize="11" fontFamily="Montserrat, sans-serif">
        de 100
      </text>
    </svg>
  );
}

function Pantalla({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-space-950 text-frost overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(27,46,102,.9), transparent 70%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(127,168,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(127,168,255,.06) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 75%)',
        }}
      />
      <div
        className={`relative z-10 max-w-2xl mx-auto px-5 sm:px-6 py-12 ${
          center ? 'min-h-[calc(100vh-4rem)] flex flex-col justify-center' : ''
        }`}
      >
        {children}
      </div>
      <style>{'@keyframes fadein{from{opacity:.001;transform:translateY(8px)}to{opacity:1;transform:none}}'}</style>
    </div>
  );
}

const CLS_OPCION =
  'w-full text-left grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-star-light';
const CLS_OPCION_OFF = 'border-star-light/15 bg-space-800/80 hover:border-star-light/45 hover:translate-x-0.5';
const CLS_OPCION_ON = 'border-star bg-star/15 shadow-star';
const CLS_INPUT =
  'w-full rounded-xl bg-space-900 border border-star-light/15 px-4 py-3.5 text-frost placeholder-muted focus:border-star-light/60 focus:outline-none transition-colors';

function EnlaceCta({ url, className, children, onClick }: { url: string; className: string; children: ReactNode; onClick?: () => void }) {
  const externo = esExterno(url);
  return (
    <a href={url} className={className} onClick={onClick} {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}

// ---------- Componente principal ----------

type Vista = 'intro' | 'quiz' | 'captura' | 'cargando' | 'resultado';

interface EstadoGuardado {
  pantalla: Vista;
  idx: number;
  r: Respuestas;
}

interface RutaClaraDiagnosticoProps {
  /**
   * Se llama al enviar el formulario de datos (antes de mostrar el resultado).
   * Conecta aquí EmailJS, un webhook o un CRM. Si falla, el usuario igual ve su diagnóstico.
   */
  onLead?: (lead: RutaClaraLead) => Promise<unknown> | void;
}

export default function RutaClaraDiagnostico({ onLead }: RutaClaraDiagnosticoProps = {}) {
  const guardado = useMemo(() => leerStorage<EstadoGuardado>(STORAGE_KEY), []);
  const [vista, setVista] = useState<Vista>(
    guardado && (guardado.pantalla === 'quiz' || guardado.pantalla === 'captura') ? guardado.pantalla : 'intro',
  );
  const [idx, setIdx] = useState<number>(guardado?.idx ?? 0);
  const [respuestas, setRespuestas] = useState<Respuestas>(guardado?.r ?? {});
  const [insight, setInsight] = useState<string[] | null>(null);
  const [nombre, setNombre] = useState('');
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const avanzarRef = useRef<(() => void) | null>(null);

  const visibles = preguntasVisibles(respuestas);
  const pregunta = visibles[Math.min(idx, visibles.length - 1)];

  useEffect(() => {
    document.title = `${CONFIG.marca} | Samuel González`;
  }, []);

  useEffect(() => {
    guardarStorage(STORAGE_KEY, { pantalla: vista, idx, r: respuestas });
  }, [vista, idx, respuestas]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [vista, idx]);

  const avanzar = useCallback((r: Respuestas, id: string) => {
    const lista = preguntasVisibles(r);
    const pos = lista.findIndex((p) => p.id === id);
    const siguiente = () => {
      if (avanzarRef.current !== siguiente) return;
      avanzarRef.current = null;
      setInsight(null);
      if (pos + 1 >= lista.length) setVista('captura');
      else setIdx(pos + 1);
    };
    track('rc_pregunta', { pregunta: id, numero: pos + 1 });
    const mensaje = insightTras(id, r);
    avanzarRef.current = siguiente;
    if (mensaje) {
      setInsight(mensaje);
      window.setTimeout(siguiente, 2800);
    } else {
      siguiente();
    }
  }, []);

  function responder(p: Pregunta, valor: string) {
    const nuevas: Respuestas = { ...respuestas, [p.id]: valor };
    // Si cambia la etapa, el obstáculo previo puede no existir en la nueva rama.
    if (p.id === 'etapa' && respuestas.etapa !== valor) delete nuevas.obstaculo;
    if (p.tipo === 'pais') {
      if (valor === 'colombia') {
        nuevas.pais = 'Colombia';
      } else if (!(valor === 'latam' ? PAISES_LATAM : PAISES_FUERA).includes(String(respuestas.pais))) {
        delete nuevas.pais;
      }
    }
    setRespuestas(nuevas);
    // Para "latam"/"fuera" se espera a que elija el país en el selector.
    if (!(p.tipo === 'pais' && valor !== 'colombia')) {
      window.setTimeout(() => avanzar(nuevas, p.id), 260);
    }
  }

  function alternar(p: Pregunta, valor: string) {
    const actual = lista(p.id, respuestas);
    let siguiente: string[];
    if (valor === 'ninguna') {
      siguiente = actual.includes('ninguna') ? [] : ['ninguna'];
    } else {
      siguiente = actual.includes(valor) ? actual.filter((v) => v !== valor) : [...actual.filter((v) => v !== 'ninguna'), valor];
    }
    setRespuestas({ ...respuestas, [p.id]: siguiente });
  }

  function calificar(p: Pregunta, fila: string, nivel: number) {
    setRespuestas({ ...respuestas, [p.id]: { ...mapa(p.id, respuestas), [fila]: nivel } });
  }

  // Atajos de teclado A, B, C... para preguntas de opción única.
  useEffect(() => {
    if (vista !== 'quiz' || insight || !pregunta || pregunta.tipo !== 'single') return;
    const opciones = opcionesDe(pregunta, respuestas);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /INPUT|SELECT|TEXTAREA/.test(target.tagName)) return;
      const i = e.key.toUpperCase().charCodeAt(0) - 65;
      if (e.key.length === 1 && i >= 0 && i < opciones.length) {
        e.preventDefault();
        responder(pregunta, opciones[i].v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function atras() {
    if (idx === 0) setVista('intro');
    else setIdx(idx - 1);
  }

  function reiniciar() {
    setRespuestas({});
    setIdx(0);
    setDiagnostico(null);
    setVista('intro');
  }

  // ----- Intro -----
  if (vista === 'intro') {
    return (
      <Pantalla center>
        <div className="space-y-8">
          <span className="eyebrow">{CONFIG.marca}</span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-[1.05]">
            Descubre qué está frenando <span className="glow">tu tienda</span>, con tus propios números.
          </h1>
          <p className="text-lg text-ice max-w-xl">
            Respondes sobre tus visitas, ventas, pauta, entregas, herramientas y habilidades. El diagnóstico calcula tu
            conversión, tu costo por pedido y tu retorno, y te dice dónde está tu cuello de botella real.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ['12 a 16 preguntas', 'según tu etapa'],
              ['4 minutos', 'con números aproximados'],
              ['Plan de 14 días', 'para tu punto más débil'],
            ].map(([titulo, sub]) => (
              <div key={titulo} className="rounded-2xl border border-star-light/15 bg-space-800/70 px-4 py-3">
                <p className="font-extrabold text-frost">{titulo}</p>
                <p className="text-sm text-muted">{sub}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              className="btn-star"
              onClick={() => {
                track('rc_inicio', utmsActuales());
                setIdx(0);
                setVista('quiz');
              }}
            >
              Empezar mi diagnóstico <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-sm text-muted">Sirve si ya vendes y también si apenas vas a empezar.</p>
          </div>
          <p className="text-xs text-muted border-t border-star-light/10 pt-6">
            Construido por Samuel González con más de 10 años en Meta, Google, TikTok y Microsoft Ads y una maestría en
            Data Science. Sin promesas de cifras: si no es tu momento, el resultado te lo dice.
          </p>
        </div>
      </Pantalla>
    );
  }

  // ----- Quiz -----
  if (vista === 'quiz' && pregunta) {
    if (insight) {
      return (
        <Pantalla center>
          <button className="text-left space-y-3" onClick={() => avanzarRef.current?.()} aria-live="polite">
            {insight.map((linea, i) => (
              <p
                key={linea}
                className={`text-2xl md:text-3xl font-extrabold leading-tight animate-[fadein_.5s_ease-out_both] ${
                  i === 1 ? 'text-star-light' : ''
                }`}
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                {linea}
              </p>
            ))}
            <p className="text-xs text-muted pt-4">Toca para continuar</p>
          </button>
        </Pantalla>
      );
    }

    const opciones = opcionesDe(pregunta, respuestas);
    const valor = respuestas[pregunta.id];
    const total = visibles.length;
    const pideSelector = pregunta.tipo === 'pais' && (valor === 'latam' || valor === 'fuera');

    return (
      <Pantalla>
        <div className="flex gap-1" aria-hidden="true">
          {visibles.map((p, i) => (
            <span
              key={p.id + i}
              className={`h-1 flex-1 rounded-full transition-colors ${i <= idx ? 'bg-star' : 'bg-space-700'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <button onClick={atras} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-frost py-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Atrás
          </button>
          <span className="text-xs text-muted">
            Pregunta {idx + 1} de {total}
          </span>
        </div>

        <div key={pregunta.id} className="mt-8 animate-[fadein_.4s_ease-out_both]">
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-balance">{pregunta.texto}</h2>
          {pregunta.ayuda && <p className="mt-2 text-muted">{pregunta.ayuda}</p>}

          <div className="mt-7 space-y-2.5">
            {(pregunta.tipo === 'single' || pregunta.tipo === 'pais') &&
              opciones.map((o, i) => {
                const activa = valor === o.v;
                return (
                  <button key={o.v} onClick={() => responder(pregunta, o.v)} className={`${CLS_OPCION} ${activa ? CLS_OPCION_ON : CLS_OPCION_OFF}`}>
                    <span
                      className={`text-xs font-bold w-7 h-7 grid place-items-center rounded-lg border ${
                        activa ? 'bg-star border-star text-frost' : 'border-star-light/20 text-muted'
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-[15px] leading-snug">{o.l}</span>
                  </button>
                );
              })}

            {pideSelector && (
              <div className="pt-2 space-y-3">
                <label htmlFor="rc-pais" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                  ¿En qué país?
                </label>
                <select
                  id="rc-pais"
                  className={CLS_INPUT}
                  value={typeof respuestas.pais === 'string' ? respuestas.pais : ''}
                  onChange={(e) => setRespuestas({ ...respuestas, pais: e.target.value })}
                >
                  <option value="">Selecciona tu país</option>
                  {(valor === 'latam' ? PAISES_LATAM : PAISES_FUERA).map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <button
                  className="btn-star w-full justify-center disabled:opacity-40"
                  disabled={!respuestas.pais}
                  onClick={() => avanzar(respuestas, pregunta.id)}
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {pregunta.tipo === 'multi' && (
              <>
                {opciones.map((o) => {
                  const activa = lista(pregunta.id, respuestas).includes(o.v);
                  return (
                    <button
                      key={o.v}
                      onClick={() => alternar(pregunta, o.v)}
                      aria-pressed={activa}
                      className={`${CLS_OPCION} ${activa ? CLS_OPCION_ON : CLS_OPCION_OFF}`}
                    >
                      <span
                        className={`w-6 h-6 grid place-items-center rounded-md border ${
                          activa ? 'bg-star border-star' : 'border-star-light/25'
                        }`}
                      >
                        {activa && <Check className="w-4 h-4" />}
                      </span>
                      <span className="text-[15px] leading-snug">{o.l}</span>
                    </button>
                  );
                })}
                <button
                  className="btn-star w-full justify-center mt-3 disabled:opacity-40"
                  disabled={!estaRespondida(pregunta, respuestas)}
                  onClick={() => avanzar(respuestas, pregunta.id)}
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {pregunta.tipo === 'grid' && (
              <>
                {(pregunta.filas ?? []).map((fila) => {
                  const actual = mapa(pregunta.id, respuestas)[fila.id] ?? 0;
                  return (
                    <div key={fila.id} className="rounded-2xl border border-star-light/15 bg-space-800/80 p-4">
                      <p className="text-[15px] font-semibold mb-3" id={`rc-${fila.id}`}>
                        {fila.l}
                      </p>
                      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby={`rc-${fila.id}`}>
                        {NIVELES_HABILIDAD.map((nivel) => {
                          const activa = actual === nivel.n;
                          return (
                            <button
                              key={nivel.v}
                              role="radio"
                              aria-checked={activa}
                              onClick={() => calificar(pregunta, fila.id, nivel.n ?? 1)}
                              className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition-colors ${
                                activa
                                  ? 'border-star bg-star/20 text-frost'
                                  : 'border-star-light/15 text-muted hover:border-star-light/45 hover:text-frost'
                              }`}
                            >
                              {nivel.l}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <button
                  className="btn-star w-full justify-center mt-3 disabled:opacity-40"
                  disabled={!estaRespondida(pregunta, respuestas)}
                  onClick={() => avanzar(respuestas, pregunta.id)}
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {pregunta.tipo === 'single' && (
            <p className="mt-6 text-[11px] text-muted hidden sm:block">Puedes responder con las teclas A, B, C…</p>
          )}
        </div>
      </Pantalla>
    );
  }

  // ----- Captura de datos -----
  if (vista === 'captura') {
    return (
      <Captura
        respuestas={respuestas}
        onLead={onLead}
        onBack={() => {
          setIdx(visibles.length - 1);
          setVista('quiz');
        }}
        onDone={(n, d) => {
          setNombre(n);
          setDiagnostico(d);
          setVista('cargando');
        }}
      />
    );
  }

  if (vista === 'cargando') {
    return <Cargando onDone={() => setVista('resultado')} />;
  }

  if (vista === 'resultado') {
    const d = diagnostico ?? diagnosticar(respuestas);
    return <Resultado d={d} respuestas={respuestas} nombre={nombre} onReset={reiniciar} />;
  }

  return null;
}

// ---------- Captura ----------

function Captura({
  respuestas,
  onBack,
  onDone,
  onLead,
}: {
  respuestas: Respuestas;
  onBack: () => void;
  onDone: (nombre: string, d: Diagnostico) => void;
  onLead?: RutaClaraDiagnosticoProps['onLead'];
}) {
  const pais = typeof respuestas.pais === 'string' ? respuestas.pais : 'Colombia';
  const [nombre, setNombre] = useState('');
  const [indicativo, setIndicativo] = useState(INDICATIVO_POR_PAIS[pais] ?? '+57');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const digitos = telefono.replace(/\D/g, '');
    if (nombre.trim().length < 2) return setError('Escribe tu nombre.');
    if (digitos.length < 7 || digitos.length > 13) return setError('Revisa tu WhatsApp: debe tener entre 7 y 13 dígitos.');
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(correo.trim())) return setError('Revisa tu correo: parece que le falta algo.');
    if (!acepta) return setError('Necesito tu autorización para enviarte el diagnóstico.');
    setError(null);
    setEnviando(true);

    const d = diagnosticar(respuestas);
    const info = infoDimension(d.rama, d.cuello.id);
    const base = {
      nombre: nombre.trim(),
      whatsapp: `${indicativo}${digitos}`,
      email: correo.trim().toLowerCase(),
      rama: d.rama,
      puntaje_global: d.global,
      cuello: d.cuello.id,
      nivel: d.tier,
      dimensiones: Object.fromEntries(d.dims.map((x) => [x.id, x.score])),
      metricas: Object.fromEntries(d.metricas.map((m) => [m.id, m.valor])),
      ...utmsActuales(),
    };
    const mensaje = [
      `Nuevo diagnóstico ${CONFIG.marca}`,
      `Nombre: ${base.nombre} | WhatsApp: ${base.whatsapp} | País: ${pais}`,
      `Rama: ${d.rama} | Puntaje: ${d.global}/100 | Nivel: ${d.tier}`,
      `Cuello de botella: ${info.nombre} (${d.cuello.score})`,
      `Dimensiones: ${d.dims.map((x) => `${infoDimension(d.rama, x.id).nombre} ${x.score}`).join(' · ')}`,
      d.metricas.length ? `Métricas: ${d.metricas.map((m) => `${m.label}: ${m.valor}`).join(' · ')}` : '',
      `Obstáculo declarado: ${opcionElegida('obstaculo', respuestas)?.l ?? 'n/a'}`,
      '',
      `Respuestas: ${JSON.stringify(respuestas)}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (onLead) {
      await Promise.allSettled([Promise.resolve().then(() => onLead({ ...base, mensaje }))]);
    }
    track('rc_lead', { rama: d.rama, nivel: d.tier, puntaje: d.global, cuello: d.cuello.id });
    track('generate_lead', { form: 'ruta_clara' });
    setEnviando(false);
    onDone(base.nombre, d);
  }

  return (
    <Pantalla center>
      <form onSubmit={enviar} className="space-y-6" noValidate>
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-frost py-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Atrás
        </button>
        <span className="eyebrow">Diagnóstico listo</span>
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Tus números ya están cruzados.</h2>
        <p className="text-ice">
          Déjame tus datos para mostrarte el resultado y enviarte una copia, porque vas a querer volver a revisarlo.
        </p>
        <div className="space-y-3">
          <label htmlFor="rc-nombre" className="sr-only">Nombre</label>
          <input
            id="rc-nombre"
            className={CLS_INPUT}
            maxLength={60}
            placeholder="Tu nombre"
            autoComplete="given-name"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <div className="grid grid-cols-[7.5rem_1fr] gap-2">
            <label htmlFor="rc-cod" className="sr-only">Indicativo</label>
            <select id="rc-cod" className={CLS_INPUT} value={indicativo} onChange={(e) => setIndicativo(e.target.value)}>
              {INDICATIVOS.map(([cod, iso]) => (
                <option key={cod + iso} value={cod}>
                  {cod} {iso}
                </option>
              ))}
            </select>
            <label htmlFor="rc-tel" className="sr-only">WhatsApp</label>
            <input
              id="rc-tel"
              className={CLS_INPUT}
              inputMode="tel"
              maxLength={15}
              placeholder="WhatsApp"
              autoComplete="tel-national"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
          <label htmlFor="rc-mail" className="sr-only">Correo</label>
          <input
            id="rc-mail"
            className={CLS_INPUT}
            inputMode="email"
            maxLength={120}
            placeholder="Tu correo"
            autoComplete="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>
        <label htmlFor="rc-ok" className="flex items-start gap-3 text-sm text-muted cursor-pointer">
          <input
            id="rc-ok"
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-[#3E7BFF]"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
          />
          <span>
            Acepto recibir mi diagnóstico y mensajes de Samuel González por WhatsApp y correo. Puedo darme de baja cuando quiera.
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm font-semibold text-[#FF8A8A]">
            {error}
          </p>
        )}
        <button type="submit" disabled={enviando} className="btn-star w-full justify-center disabled:opacity-60">
          {enviando ? 'Un momento…' : 'Ver mi diagnóstico'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </Pantalla>
  );
}

// ---------- Cargando ----------

function Cargando({ onDone }: { onDone: () => void }) {
  const pasos = ['Calculando tus métricas', 'Puntuando cada dimensión', 'Comparando con lo que declaraste', 'Armando tu plan de 14 días'];
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const inicio = performance.now();
    const duracion = 4200;
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - inicio) / duracion);
      setProgreso(p);
      if (p < 1) frame = requestAnimationFrame(tick);
      else onDone();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  const actual = Math.floor(progreso * (pasos.length + 0.6));

  return (
    <Pantalla center>
      <div className="space-y-8">
        <div className="mx-auto">
          <Anillo score={Math.round(progreso * 100)} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold">Analizando tu caso</h2>
          <p className="text-muted">Sin plantillas genéricas. Esto sale de lo que acabas de responder.</p>
        </div>
        <ul className="space-y-3 max-w-sm mx-auto">
          {pasos.map((paso, i) => (
            <li
              key={paso}
              className={`flex items-center gap-3 text-sm transition-colors ${
                i < actual ? 'text-ice' : i === actual ? 'text-frost' : 'text-muted/50'
              }`}
            >
              <span
                className={`w-5 h-5 grid place-items-center rounded-full border text-[11px] ${
                  i < actual ? 'bg-star border-star' : i === actual ? 'border-star shadow-star' : 'border-star-light/20'
                }`}
              >
                {i < actual && <Check className="w-3 h-3" />}
              </span>
              {paso}
            </li>
          ))}
        </ul>
      </div>
    </Pantalla>
  );
}

// ---------- Resultado ----------

function Resultado({
  d,
  respuestas,
  nombre,
  onReset,
}: {
  d: Diagnostico;
  respuestas: Respuestas;
  nombre: string;
  onReset: () => void;
}) {
  const info = infoDimension(d.rama, d.cuello.id);
  const infoSegundo = infoDimension(d.rama, d.segundo.id);
  const nivel = nivelGlobal(d.global);
  const cta = siguientePaso(d);
  const infoDeclarada = d.declarado ? infoDimension(d.rama, d.declarado) : null;
  const obstaculoTexto = opcionElegida('obstaculo', respuestas)?.l;

  useEffect(() => {
    track('rc_resultado', { nivel: d.tier, puntaje: d.global, cuello: d.cuello.id });
  }, [d]);

  return (
    <Pantalla>
      <div className="space-y-12">
        {/* Perfil + puntaje */}
        <section className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1 space-y-3">
            <Etiqueta>{nombre ? `${nombre}, tu perfil` : 'Tu perfil'}</Etiqueta>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{info.perfil}</h1>
            <p className="text-ice">{info.perfilLinea}</p>
          </div>
          <div className="flex items-center gap-4 sm:flex-col sm:items-center">
            <Anillo score={d.global} />
            <div className="sm:text-center">
              <p className="font-extrabold">{nivel.label}</p>
              <p className="text-xs text-muted max-w-[12rem]">{nivel.linea}</p>
            </div>
          </div>
        </section>

        {/* Métricas calculadas (solo rama operador) */}
        {d.metricas.length > 0 && (
          <section className="space-y-4">
            <div>
              <Etiqueta>Tus números, calculados</Etiqueta>
              <p className="text-sm text-muted mt-1">
                Estimaciones con los rangos que marcaste. Sirven para dimensionar, no para contabilidad.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {d.metricas.map((m) => (
                <div key={m.id} className="rounded-2xl border border-star-light/15 bg-space-800/80 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-muted">{m.label}</p>
                    {m.estado && <EstadoBadge estado={m.estado} />}
                  </div>
                  <p className="mt-2 text-3xl font-extrabold tabular-nums">{m.valor}</p>
                  <p className="mt-1 text-xs text-muted">{m.detalle}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mapa por dimensión */}
        <section className="space-y-4">
          <Etiqueta>Tu mapa por dimensión</Etiqueta>
          <ul className="rounded-2xl border border-star-light/15 bg-space-800/60 divide-y divide-star-light/10">
            {d.dims.map((dim) => {
              const di = infoDimension(d.rama, dim.id);
              const esCuello = dim.id === d.cuello.id;
              return (
                <li key={dim.id} className="p-4 sm:p-5" title={`${di.nombre}: ${dim.score} de 100`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{di.nombre}</p>
                      {esCuello && (
                        <span className="rounded-md bg-signal-amber px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-space-950">
                          Cuello de botella
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm tabular-nums text-frost">{dim.score}</span>
                      <EstadoBadge estado={estadoDeScore(dim.score)} />
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-space-700 overflow-hidden" aria-hidden="true">
                    <div
                      className="h-full rounded-full bg-star transition-[width] duration-700"
                      style={{ width: `${Math.max(3, dim.score)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">{dim.nota}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Obstáculo declarado vs. real */}
        {infoDeclarada && obstaculoTexto && (
          <section
            className={`rounded-2xl border p-5 sm:p-6 ${
              d.coincide ? 'border-signal-teal/30 bg-signal-teal/5' : 'border-signal-amber/40 bg-signal-amber/5'
            }`}
          >
            <Etiqueta>Lo que dices vs. lo que dicen tus respuestas</Etiqueta>
            {d.coincide ? (
              <p className="mt-3 text-ice">
                Marcaste "<strong className="text-frost">{obstaculoTexto.toLowerCase()}</strong>" y tus respuestas coinciden: el
                freno principal está en <strong className="text-frost">{info.nombre.toLowerCase()}</strong>. Estás mirando el
                problema correcto; ahora falta atacarlo con método.
              </p>
            ) : (
              <p className="mt-3 text-ice">
                Marcaste "<strong className="text-frost">{obstaculoTexto.toLowerCase()}</strong>", que apunta a{' '}
                {infoDeclarada.nombre.toLowerCase()}. Pero tus respuestas muestran un freno más fuerte en{' '}
                <strong className="text-frost">{info.nombre.toLowerCase()}</strong> ({d.cuello.score} de 100). Atacar lo primero
                sin resolver lo segundo probablemente no mueva tu número.
              </p>
            )}
          </section>
        )}

        {/* Cuello de botella + plan de 14 días */}
        <section className="card-galaxy !transform-none p-6 sm:p-7 space-y-5">
          <div>
            <Etiqueta>Tu cuello de botella #1</Etiqueta>
            <h2 className="mt-2 text-2xl font-extrabold">{info.nombre}</h2>
            <p className="text-sm text-muted">{info.mide}</p>
          </div>
          <p className="text-ice">{info.idea}</p>
          {d.cuello.id === 'capacidades' && (
            <p className="text-sm text-ice">
              Tu habilidad más baja hoy: <strong className="text-frost">{habilidadMasBaja(respuestas)}</strong>.
            </p>
          )}
          <div className="rounded-xl border border-dashed border-[#FF8A8A]/50 bg-[#FF8A8A]/5 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF8A8A]">Lo que NO deberías hacer ahora</p>
            <p className="mt-2 text-sm text-frost">{info.noHacer}</p>
          </div>
          <div>
            <p className="label-mono">Tu plan para los próximos 14 días</p>
            <ol className="mt-3 space-y-3">
              {info.acciones.map((accion, i) => (
                <li key={accion} className="grid grid-cols-[auto_1fr] gap-3">
                  <span className="w-7 h-7 grid place-items-center rounded-full bg-star/15 border border-star/40 text-xs font-bold text-star-light">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ice leading-relaxed pt-1">{accion}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm text-muted border-t border-star-light/10 pt-4">
            Después de eso, tu siguiente frente es <strong className="text-ice">{infoSegundo.nombre.toLowerCase()}</strong> (
            {d.segundo.score} de 100).
          </p>
        </section>

        {/* Piezas faltantes del sistema (solo operador) */}
        {d.faltantes.length > 0 && (
          <section className="space-y-4">
            <Etiqueta>Lo que le falta a tu sistema</Etiqueta>
            <ul className="space-y-2.5">
              {d.faltantes.map((f) => {
                const [titulo, ...resto] = f.split(':');
                return (
                  <li key={f} className="rounded-xl border border-star-light/15 bg-space-800/60 px-4 py-3 text-sm text-ice">
                    <strong className="text-frost">{titulo}:</strong>
                    {resto.join(':')}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Ruta de 5 etapas */}
        <section className="space-y-5">
          <Etiqueta>Dónde estás en la ruta</Etiqueta>
          <ol>
            {RUTA.map(([titulo, descripcion], i) => {
              const n = i + 1;
              const actual = n === d.etapaRuta;
              const pasada = n < d.etapaRuta;
              return (
                <li key={titulo} className="grid grid-cols-[22px_1fr] gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-1.5 w-3 h-3 rounded-full shrink-0 ${
                        actual ? 'bg-signal-amber shadow-[0_0_0_5px_rgba(255,178,94,.2)]' : pasada ? 'bg-muted' : 'bg-space-700'
                      }`}
                    />
                    {n < 5 && <span className="w-px flex-1 bg-star-light/15 my-1" />}
                  </div>
                  <div className={`pb-6 ${actual ? '' : 'opacity-60'}`}>
                    {actual && (
                      <span className="inline-block mb-1.5 rounded-md bg-signal-amber px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-space-950">
                        Estás aquí
                      </span>
                    )}
                    <p className="font-bold">
                      {n}. {titulo}
                    </p>
                    <p className="text-sm text-muted">
                      {actual
                        ? descripcion
                        : pasada
                          ? 'Etapa que ya deberías tener resuelta.'
                          : 'Tiene su propio paso a paso. Llegará cuando te toque.'}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Siguiente paso (CTA según tier) */}
        <section className="rounded-card border border-star/60 bg-gradient-to-br from-star/15 to-nebula/30 p-6 sm:p-7 space-y-4 shadow-star">
          <Etiqueta>Tu siguiente paso</Etiqueta>
          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">{cta.titulo}</h2>
          <p className="text-ice">{cta.texto}</p>
          <EnlaceCta
            url={cta.url}
            className="btn-star w-full justify-center"
            onClick={() => track('rc_cta', { destino: cta.destino, nivel: d.tier })}
          >
            {cta.label} <ArrowRight className="w-4 h-4" />
          </EnlaceCta>
          {cta.secundario && (
            <EnlaceCta
              url={cta.secundario.url}
              className="block text-center text-sm text-muted underline underline-offset-4 hover:text-frost"
              onClick={() => track('rc_cta', { destino: cta.secundario?.destino, nivel: d.tier })}
            >
              {cta.secundario.label}
            </EnlaceCta>
          )}
        </section>

        <footer className="border-t border-star-light/10 pt-8 text-center space-y-4">
          <p className="text-muted">
            Depende de ti. Nos vemos en la cima.
            <br />
            <span className="font-bold text-frost">Samuel González</span>
          </p>
          <button onClick={onReset} className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-frost">
            <RotateCcw className="w-3.5 h-3.5" /> Volver a hacer el diagnóstico
          </button>
        </footer>
      </div>
    </Pantalla>
  );
}
