import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CONTACTO } from '../data/contacto';

const ACTUALIZADO = '26 de septiembre de 2026';

function Canal() {
  return CONTACTO.email ? (
    <>
      el correo <a href={`mailto:${CONTACTO.email}`}>{CONTACTO.email}</a> o el{' '}
      <Link to="/#contacto">formulario de contacto</Link>
    </>
  ) : (
    <Link to="/#contacto">el formulario de contacto del sitio</Link>
  );
}

function Layout({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="bg-space-950 text-frost">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <p className="label-mono mb-4">Legal</p>
        <h1 className="display-xl text-4xl sm:text-5xl md:text-6xl mb-4">{titulo}</h1>
        <p className="text-muted text-sm mb-12">Última actualización: {ACTUALIZADO}</p>
        <div className="prose-galaxy legal-page">{children}</div>
      </div>
    </div>
  );
}

export function PoliticaPrivacidad() {
  return (
    <Layout titulo="Política de Privacidad">
      <p>
        Esta política explica cómo se recolectan, usan y protegen los datos personales de quienes
        visitan {CONTACTO.sitio} o usan sus formularios y herramientas, conforme a la Ley 1581 de
        2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y demás normas
        colombianas sobre protección de datos personales.
      </p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        {CONTACTO.responsable}, con domicilio en {CONTACTO.ciudad}. Canal de atención: <Canal />.
      </p>

      <h2>2. Datos que se recolectan</h2>
      <p>
        Formulario de contacto: nombre, correo electrónico y el mensaje que escribas. Formularios de
        la Mentoría de Dropshipping: nombre, correo, país, número de WhatsApp y horario elegido para
        la llamada. Diagnóstico para Dropshippers: nombre, correo, WhatsApp, las respuestas y
        métricas de tu tienda que ingreses, y los parámetros de campaña (UTM) con los que llegaste.
        Navegación: datos técnicos y de uso recogidos por Google Analytics mediante cookies, solo si
        las aceptas.
      </p>

      <h2>3. Para qué se usan</h2>
      <p>
        Responder tus mensajes y solicitudes; entregarte el resultado del diagnóstico o el recurso
        que pediste; contactarte por correo o WhatsApp para dar seguimiento a la mentoría o a los
        servicios sobre los que preguntaste; enviarte contenido relacionado si así lo autorizaste; y
        medir el uso del sitio para mejorarlo. Tus datos no se venden ni se ceden a terceros para
        fines propios de ellos.
      </p>

      <h2>4. Encargados y transferencias</h2>
      <p>
        Para operar el sitio se usan proveedores que pueden almacenar datos fuera de Colombia:
        Netlify (alojamiento y recepción de formularios) y Google (Google Analytics). Los pagos,
        cuando existen, se procesan en la pasarela Bold, que maneja los datos de pago bajo su propia
        política; este sitio no almacena datos de tarjetas.
      </p>

      <h2>5. Cookies</h2>
      <p>
        El sitio usa cookies de analítica de Google Analytics únicamente después de que las aceptas en
        el banner de cookies. Si las rechazas, Google Analytics funciona sin almacenar cookies en tu
        navegador. Puedes cambiar tu decisión borrando las cookies y el almacenamiento del sitio en tu
        navegador; el banner volverá a aparecer.
      </p>

      <h2>6. Tus derechos</h2>
      <p>
        Como titular puedes conocer, actualizar y rectificar tus datos; solicitar prueba de la
        autorización otorgada; ser informado sobre el uso que se les ha dado; revocar la autorización
        o pedir que se supriman cuando no exista un deber legal o contractual de conservarlos; acceder
        a ellos de forma gratuita; y presentar quejas ante la Superintendencia de Industria y Comercio
        una vez agotado el trámite de consulta o reclamo aquí descrito.
      </p>

      <h2>7. Cómo ejercerlos</h2>
      <p>
        Escribe a través de <Canal /> indicando tu nombre, el dato o la solicitud concreta y un medio
        de respuesta. Las consultas se responden en un máximo de diez (10) días hábiles y los reclamos
        en un máximo de quince (15) días hábiles, prorrogables en los términos de la ley.
      </p>

      <h2>8. Conservación y seguridad</h2>
      <p>
        Los datos se conservan mientras sean necesarios para las finalidades descritas o mientras
        exista una relación contigo, y se protegen con medidas razonables de seguridad técnicas y
        administrativas. Ningún sistema en internet es infalible, por lo que no es posible garantizar
        una seguridad absoluta.
      </p>

      <h2>9. Menores de edad</h2>
      <p>El sitio y sus servicios están dirigidos a personas mayores de 18 años.</p>

      <h2>10. Cambios</h2>
      <p>
        Esta política puede actualizarse. La versión vigente es siempre la publicada en esta página,
        con su fecha de última actualización.
      </p>
    </Layout>
  );
}

export function TerminosCondiciones() {
  return (
    <Layout titulo="Términos y Condiciones">
      <p>
        Al navegar {CONTACTO.sitio} o usar sus herramientas y formularios aceptas estos términos. Si
        no estás de acuerdo con ellos, te pido no usar el sitio.
      </p>

      <h2>1. Quién ofrece el sitio</h2>
      <p>
        El sitio es operado por {CONTACTO.responsable}, con domicilio en {CONTACTO.ciudad}. Contacto:{' '}
        <Canal />.
      </p>

      <h2>2. Contenido informativo</h2>
      <p>
        Los artículos del blog, los casos y las herramientas gratuitas (Documentos Fundacionales,
        Diagnóstico para Dropshippers, checklists) tienen un fin educativo e informativo. No
        constituyen asesoría financiera, legal ni tributaria, y los resultados que se mencionan no son
        una promesa de que obtendrás los mismos: dependen de tu producto, tu inversión, tu mercado y tu
        ejecución.
      </p>

      <h2>3. Herramientas gratuitas</h2>
      <p>
        Las herramientas se ofrecen tal como están, sin garantía de disponibilidad continua ni de
        exactitud del resultado. Las recomendaciones que generan son orientativas y la decisión de
        aplicarlas es tuya.
      </p>

      <h2>4. Servicios y productos de pago</h2>
      <p>
        La mentoría, el Blueprint y los servicios profesionales tienen condiciones específicas
        (alcance, precio, fechas y forma de pago) que se informan antes de cada compra o se acuerdan
        por escrito. Los pagos en línea se procesan a través de Bold. Lo acordado en cada caso
        prevalece sobre estos términos generales, sin perjuicio de los derechos que te reconoce el
        Estatuto del Consumidor (Ley 1480 de 2011) cuando apliquen.
      </p>

      <h2>5. Propiedad intelectual</h2>
      <p>
        Los textos, diseños, herramientas, código y material del sitio pertenecen a{' '}
        {CONTACTO.responsable} o se usan con autorización. Puedes compartir enlaces y citar
        fragmentos breves mencionando la fuente; cualquier otro uso requiere autorización previa. Las
        marcas y logos de clientes y empresas que aparecen en el sitio pertenecen a sus titulares y se
        muestran solo como referencia de experiencia profesional.
      </p>

      <h2>6. Uso adecuado</h2>
      <p>
        No está permitido usar el sitio para enviar spam o contenido ilícito, intentar vulnerar su
        seguridad, ni extraer su contenido de forma automatizada.
      </p>

      <h2>7. Responsabilidad</h2>
      <p>
        En la medida que la ley lo permita, no me hago responsable por daños derivados del uso del
        contenido o de las herramientas gratuitas, de interrupciones del sitio, ni del contenido de
        sitios externos enlazados.
      </p>

      <h2>8. Datos personales</h2>
      <p>
        El tratamiento de tus datos se rige por la{' '}
        <Link to="/privacidad">Política de Privacidad</Link>.
      </p>

      <h2>9. Ley aplicable</h2>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Cualquier controversia se
        intentará resolver primero de forma directa y, de no lograrse, ante los jueces competentes de
        Cali.
      </p>

      <h2>10. Cambios</h2>
      <p>
        Estos términos pueden actualizarse. La versión vigente es la publicada en esta página.
      </p>
    </Layout>
  );
}
