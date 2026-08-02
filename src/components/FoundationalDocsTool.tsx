import { useState, useEffect, useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight, ArrowLeft, Copy, Check, Download, RotateCcw } from 'lucide-react';

// ============================================================
// Foundational Docs Tool
// Formulario estilo Typeform (una pregunta a la vez) que recoge
// la información necesaria para el framework de 4 Documentos
// Fundacionales (Deep Research, Avatar, Offer, Necessary Beliefs
// Doc — "Mark Builds Brands") y al final entrega UN prompt único
// listo para pegar en un Proyecto de Claude.
// ============================================================

type FieldKey =
  | 'brandName'
  | 'industry'
  | 'websiteOrSocial'
  | 'offering'
  | 'competitors'
  | 'differentiator'
  | 'priceRange'
  | 'marketTrend'
  | 'avatarDemo'
  | 'painPoint'
  | 'triedBefore'
  | 'desiredOutcome'
  | 'whereTheyHang'
  | 'offerName'
  | 'whatsIncluded'
  | 'pricing'
  | 'guarantee'
  | 'uniqueMechanism'
  | 'bonuses'
  | 'mainDoubt'
  | 'proof'
  | 'commonObjections'
  | 'whyTrustYou';

type Step =
  | { type: 'chapter'; key: string; index: number; total: number; title: string; description: string }
  | { type: 'question'; field: FieldKey; label: string; placeholder: string; optional?: boolean; rows?: number }
  | { type: 'result' };

const STEPS: Step[] = [
  {
    type: 'chapter',
    key: 'intro',
    index: 0,
    total: 4,
    title: 'Tus Documentos Fundacionales',
    description:
      'Responde estas preguntas cortas sobre tu marca. Al final vas a recibir un solo prompt, listo para pegar en un Proyecto de Claude, que le pide generar tus 4 Documentos Fundacionales: Deep Research, Avatar, Offer y Necessary Beliefs Doc.',
  },
  { type: 'question', field: 'brandName', label: '¿Cómo se llama tu marca o negocio?', placeholder: 'Ej. Berberina Premium 1500' },
  { type: 'question', field: 'industry', label: '¿A qué industria o nicho pertenece?', placeholder: 'Ej. suplementos para control de glucosa y peso' },
  {
    type: 'question',
    field: 'websiteOrSocial',
    label: '¿Tienes sitio web o redes sociales? (opcional)',
    placeholder: 'Ej. instagram.com/tumarca',
    optional: true,
  },

  {
    type: 'chapter',
    key: 'research',
    index: 1,
    total: 4,
    title: '1 — Deep Research Doc',
    description: 'Mercado y competencia: qué vendes, contra quién compites y por qué eres distinto.',
  },
  { type: 'question', field: 'offering', label: '¿Qué producto o servicio principal ofreces?', placeholder: 'Describe qué vendes en una o dos frases' },
  {
    type: 'question',
    field: 'competitors',
    label: '¿Quiénes son tus 2-3 competidores directos más fuertes?',
    placeholder: 'Nombres de marcas, tiendas o personas',
  },
  {
    type: 'question',
    field: 'differentiator',
    label: '¿Qué haces diferente o mejor que ellos?',
    placeholder: 'Tu ventaja real, no genérica ("mejor calidad" no cuenta)',
  },
  {
    type: 'question',
    field: 'priceRange',
    label: '¿En qué rango de precio te mueves frente a la competencia?',
    placeholder: 'Ej. premium, precio medio, el más económico del nicho',
  },
  {
    type: 'question',
    field: 'marketTrend',
    label: '¿Alguna tendencia o cambio reciente en tu mercado que debamos considerar? (opcional)',
    placeholder: 'Ej. nuevo algoritmo, cambio regulatorio, moda emergente',
    optional: true,
  },

  {
    type: 'chapter',
    key: 'avatar',
    index: 2,
    total: 4,
    title: '2 — Avatar Doc',
    description: 'Tu cliente ideal: quién es, qué le duele y qué transformación busca.',
  },
  {
    type: 'question',
    field: 'avatarDemo',
    label: 'Describe a tu cliente ideal',
    placeholder: 'Edad, género, ubicación, ocupación o nivel de ingreso aproximado',
    rows: 4,
  },
  {
    type: 'question',
    field: 'painPoint',
    label: '¿Cuál es el dolor o problema #1 que tiene antes de comprarte?',
    placeholder: 'Lo que le quita el sueño relacionado con tu categoría',
  },
  {
    type: 'question',
    field: 'triedBefore',
    label: '¿Qué ha intentado antes que no le funcionó?',
    placeholder: 'Otras soluciones, productos o métodos que ya probó',
  },
  {
    type: 'question',
    field: 'desiredOutcome',
    label: '¿Qué transformación o resultado final busca?',
    placeholder: 'Cómo se ve su vida cuando el problema ya está resuelto',
  },
  {
    type: 'question',
    field: 'whereTheyHang',
    label: '¿Dónde pasa tiempo online?',
    placeholder: 'Redes, grupos, comunidades o creadores que sigue',
  },

  {
    type: 'chapter',
    key: 'offer',
    index: 3,
    total: 4,
    title: '3 — Offer Doc',
    description: 'Tu oferta: qué incluye, cuánto cuesta y por qué funciona.',
  },
  {
    type: 'question',
    field: 'offerName',
    label: 'Nombre de tu producto, servicio o programa',
    placeholder: 'Ej. Mentoría 1:1 de Growth · Berberina Premium 1500',
  },
  {
    type: 'question',
    field: 'whatsIncluded',
    label: '¿Qué incluye exactamente?',
    placeholder: 'Componentes, entregables, sesiones, unidades, soporte incluido',
    rows: 4,
  },
  { type: 'question', field: 'pricing', label: 'Precio y forma de pago', placeholder: 'Ej. $97 USD pago único, o 3 cuotas de $150.000 COP' },
  {
    type: 'question',
    field: 'guarantee',
    label: '¿Tienes garantía? ¿Cuál?',
    placeholder: 'Ej. 30 días de devolución sin preguntas, o "sin garantía"',
  },
  {
    type: 'question',
    field: 'uniqueMechanism',
    label: '¿Por qué esto funciona cuando otras soluciones no?',
    placeholder: 'Tu método, ingrediente, sistema o enfoque único',
    rows: 3,
  },
  {
    type: 'question',
    field: 'bonuses',
    label: '¿Bonos o extras que incluyes? (opcional)',
    placeholder: 'Ej. guía PDF, acceso a comunidad, sesión extra',
    optional: true,
  },

  {
    type: 'chapter',
    key: 'beliefs',
    index: 4,
    total: 4,
    title: '4 — Necessary Beliefs Doc',
    description: 'Las creencias que tu cliente necesita tener para decidirse a comprar.',
  },
  {
    type: 'question',
    field: 'mainDoubt',
    label: '¿Cuál es la duda o excusa #1 que escuchas antes de que alguien compre?',
    placeholder: 'La objeción más repetida, en sus propias palabras si puedes',
  },
  {
    type: 'question',
    field: 'proof',
    label: '¿Qué evidencia tienes de que funciona?',
    placeholder: 'Testimonios, resultados, casos de éxito, certificaciones, estudios',
    rows: 3,
  },
  {
    type: 'question',
    field: 'commonObjections',
    label: '¿Qué otras objeciones específicas debes resolver?',
    placeholder: 'Ej. "es muy caro", "no tengo tiempo", "ya lo intenté y no funcionó"',
  },
  {
    type: 'question',
    field: 'whyTrustYou',
    label: '¿Por qué deberían confiar en ti o en tu marca sobre otras opciones?',
    placeholder: 'Tu credibilidad, trayectoria, o lo que te hace la opción segura',
  },

  { type: 'result' },
];

const QUESTION_STEPS = STEPS.filter((s) => s.type === 'question') as Extract<Step, { type: 'question' }>[];

function buildPrompt(data: Record<FieldKey, string>) {
  const v = (key: FieldKey, fallback = '(sin información)') => (data[key]?.trim() ? data[key].trim() : fallback);

  return `Actúa como un estratega senior de marca y research de mercado, especializado en el framework de 4 Documentos Fundacionales (Deep Research Doc, Avatar Doc, Offer Doc y Necessary Beliefs Doc) que se usan como base de evidencia para escribir anuncios, landing pages y emails.

Con la información que te doy a continuación sobre mi marca, genera los 4 documentos completos, uno por uno, cada uno como una sección con su propio encabezado (##). No inventes datos que no te doy: si falta información para completar bien un documento, dilo explícitamente y dime qué necesitas para completarlo, en vez de rellenar con genéricos.

=== INFORMACIÓN DE MI MARCA ===
Marca o negocio: ${v('brandName')}
Industria o nicho: ${v('industry')}
Sitio web o redes: ${v('websiteOrSocial', 'no proporcionado')}

=== 1. DEEP RESEARCH DOC (mercado y competencia) ===
Producto o servicio principal: ${v('offering')}
Competidores directos: ${v('competitors')}
Qué hago diferente o mejor: ${v('differentiator')}
Rango de precio frente a la competencia: ${v('priceRange')}
Tendencia relevante del mercado: ${v('marketTrend', 'no proporcionada')}

=== 2. AVATAR DOC (cliente ideal) ===
Descripción del cliente ideal: ${v('avatarDemo')}
Dolor o problema #1 antes de comprar: ${v('painPoint')}
Qué ha intentado antes sin éxito: ${v('triedBefore')}
Transformación o resultado que busca: ${v('desiredOutcome')}
Dónde pasa tiempo online: ${v('whereTheyHang')}

=== 3. OFFER DOC (mi oferta) ===
Nombre del producto/servicio: ${v('offerName')}
Qué incluye exactamente: ${v('whatsIncluded')}
Precio y forma de pago: ${v('pricing')}
Garantía: ${v('guarantee', 'sin garantía definida')}
Mecanismo único (por qué funciona): ${v('uniqueMechanism')}
Bonos o extras: ${v('bonuses', 'ninguno')}

=== 4. NECESSARY BELIEFS DOC (creencias necesarias para comprar) ===
Duda o excusa #1 más común: ${v('mainDoubt')}
Evidencia o prueba social que tengo: ${v('proof')}
Objeciones específicas a resolver: ${v('commonObjections')}
Por qué deberían confiar en mí: ${v('whyTrustYou')}

=== INSTRUCCIONES DE FORMATO ===
Para cada documento:
1. Usa encabezados claros con ## y sub-bullets donde ayude a escanear rápido.
2. Sé específico y accionable — cada punto debe poder usarse directamente para escribir un anuncio, una landing page o un email, no como teoría de marketing genérica.
3. En el Necessary Beliefs Doc, conecta cada creencia necesaria con al menos un elemento concreto del Offer Doc o del Avatar Doc que la sustente — no la dejes abstracta.
4. Al final de los 4 documentos, agrega una sección "Huecos de información" con lo que te recomendaría conseguir para fortalecerlos (ej. testimonios reales, data de competencia, entrevistas a clientes).`;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  return (
    <div className="fixed top-16 left-0 right-0 h-1 bg-space-800 z-40">
      <div
        className="h-full bg-gradient-to-r from-star to-star-light transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function FoundationalDocsTool() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const step = STEPS[stepIndex];
  const answeredCount = QUESTION_STEPS.filter((q) => data[q.field]?.trim()).length;

  useEffect(() => {
    if (step.type === 'question') {
      inputRef.current?.focus();
    }
  }, [stepIndex, step.type]);

  const goNext = useCallback(() => {
    setStepIndex((i: number) => Math.min(i + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    setStepIndex((i: number) => Math.max(i - 1, 0));
  }, []);

  const canAdvance = step.type === 'question' ? step.optional || !!data[step.field]?.trim() : true;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canAdvance) goNext();
    }
  };

  const prompt = buildPrompt(data);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('No se pudo copiar al portapapeles:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([prompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.brandName || 'documentos-fundacionales').toLowerCase().replace(/\s+/g, '-')}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setData({} as Record<FieldKey, string>);
    setStepIndex(0);
  };

  return (
    <div className="min-h-screen bg-space-950 text-frost">
      {step.type !== 'result' && <ProgressBar current={answeredCount} total={QUESTION_STEPS.length} />}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% -10%, #1B2E66, transparent 70%)',
        }}
      />

      <div className="relative max-w-2xl mx-auto px-6 pt-24 pb-16 min-h-screen flex flex-col">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-frost transition-colors mb-10">
          <ChevronLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="flex-1 flex flex-col justify-center">
          {step.type === 'chapter' && (
            <div className="text-center">
              <p className="label-mono mb-6">
                Capítulo {step.index} de {step.total}
              </p>
              <h1 className="display-xl text-4xl sm:text-5xl md:text-6xl mb-6">{step.title}</h1>
              <p className="text-ice text-lg max-w-lg mx-auto mb-10">{step.description}</p>
              <button onClick={goNext} className="btn-star mx-auto">
                {stepIndex === 0 ? 'Comenzar' : 'Continuar'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step.type === 'question' && (
            <div>
              <p className="eyebrow mb-6">
                Pregunta {QUESTION_STEPS.findIndex((q) => q.field === step.field) + 1} de {QUESTION_STEPS.length}
                {step.optional ? ' · opcional' : ''}
              </p>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-6 leading-snug">{step.label}</h2>
              <textarea
                ref={inputRef}
                value={data[step.field] ?? ''}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setData((d: Record<FieldKey, string>) => ({ ...d, [step.field]: e.target.value }))
                }
                onKeyDown={handleKeyDown}
                placeholder={step.placeholder}
                rows={step.rows ?? 2}
                className="w-full rounded-xl bg-space-800 border border-star-light/15 px-5 py-4 text-frost text-lg placeholder-muted focus:border-star-light/45 focus:outline-none transition-colors resize-y mb-4"
              />
              <p className="text-xs text-muted mb-8">
                Presiona <kbd className="px-1.5 py-0.5 rounded bg-space-800 border border-star-light/15 font-bold">Enter ↵</kbd> para
                continuar, <kbd className="px-1.5 py-0.5 rounded bg-space-800 border border-star-light/15 font-bold">Shift+Enter</kbd>{' '}
                para salto de línea.
              </p>
              <div className="flex items-center gap-4">
                <button onClick={goNext} disabled={!canAdvance} className="btn-star disabled:opacity-40 disabled:cursor-not-allowed">
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
                {stepIndex > 0 && (
                  <button onClick={goBack} className="text-sm font-semibold text-muted hover:text-frost transition-colors inline-flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /> Atrás
                  </button>
                )}
                {step.optional && (
                  <button onClick={goNext} className="text-sm font-semibold text-muted hover:text-frost transition-colors">
                    Saltar esta pregunta →
                  </button>
                )}
              </div>
            </div>
          )}

          {step.type === 'result' && (
            <div>
              <p className="label-mono mb-4 text-center">Listo</p>
              <h1 className="display-xl text-3xl sm:text-4xl md:text-5xl mb-4 text-center">
                Tu <span className="glow">prompt</span> está listo
              </h1>
              <p className="text-ice text-center max-w-lg mx-auto mb-10">
                Cópialo y pégalo como primer mensaje en un Proyecto nuevo de Claude para generar tus 4 Documentos Fundacionales.
              </p>

              <div className="card-galaxy p-6 mb-6">
                <textarea
                  readOnly
                  value={prompt}
                  rows={14}
                  className="w-full bg-transparent text-ice text-sm leading-relaxed resize-y focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-4 justify-center mb-14">
                <button onClick={handleCopy} className="btn-star">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '¡Copiado!' : 'Copiar prompt'}
                </button>
                <button onClick={handleDownload} className="btn-ghost">
                  <Download className="w-4 h-4" /> Descargar .txt
                </button>
                <button onClick={handleReset} className="btn-ghost">
                  <RotateCcw className="w-4 h-4" /> Empezar de nuevo
                </button>
              </div>

              <div className="card-galaxy p-8 max-w-xl mx-auto">
                <h3 className="text-lg font-extrabold mb-4">Cómo usarlo</h3>
                <ol className="space-y-3 text-sm text-muted">
                  <li>
                    <span className="text-star-light font-bold">1.</span> Ve a{' '}
                    <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-star-light underline">
                      claude.ai
                    </a>{' '}
                    y crea un Proyecto nuevo.
                  </li>
                  <li>
                    <span className="text-star-light font-bold">2.</span> Pega este prompt como el primer mensaje dentro del Proyecto.
                  </li>
                  <li>
                    <span className="text-star-light font-bold">3.</span> Si tienes testimonios, capturas de pantalla o data adicional,
                    súbelos como archivos del Proyecto antes de enviar el mensaje — Claude los va a usar como evidencia extra.
                  </li>
                  <li>
                    <span className="text-star-light font-bold">4.</span> Revisa los 4 documentos que te entregue y pide ajustes
                    específicos donde falte precisión.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
