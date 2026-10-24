// Preguntas frecuentes de las landings. Viven aquí para que las use tanto
// la página (React) como el prerender (datos estructurados FAQPage).
import { BLUEPRINT, MENTORIA } from './oferta';

const BLUEPRINT_PRICE = BLUEPRINT.precio;
const PRECIO = `${MENTORIA.precio} ${MENTORIA.periodo}`;

export const FAQS_DROPSHIPPING = [
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

export const FAQS_MENTORIA = [
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
