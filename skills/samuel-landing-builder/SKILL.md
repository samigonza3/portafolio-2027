---
name: samuel-landing-builder
description: >
  Construye landing pages HTML completas y listas para deployar (Netlify drag and drop) para la marca personal de Samuel, con su sistema de diseño azul galaxia: fondos azul espacial profundo, acento azul estelar, tipografía Montserrat, campo de estrellas animado en el hero y formulario de captura funcional vía FormSubmit hacia samigonza3@gmail.com. SIEMPRE activa cuando Samuel pida "hazme una landing", "landing para mi taller", "página de registro", "landing de captura", "página para mi webinar/curso/mentoría/lead magnet", "landing estilo galaxia", "una landing como la del taller de IA", o cualquier solicitud de página de ventas o captura para su marca personal — incluso si solo describe el evento o producto sin decir la palabra "landing". NO aplica a landings de productos de dropshipping (para eso está atidcoa-landing-builder); aplica a todo lo que Samuel promociona bajo su nombre: talleres, webinars, cursos, mentorías, casos de estudio y lead magnets.
---

# Samuel Landing Builder

Genera landing pages de captura para la marca personal de Samuel siguiendo un sistema de diseño fijo (azul galaxia) y una estructura de funnel probada. El output es SIEMPRE un archivo HTML autocontenido más un zip con index.html listo para arrastrar a Netlify.

---

## Paso 0: Información mínima

Antes de construir, obtén de la conversación (o pregunta solo lo que falte):

1. Qué se promociona (taller, webinar, curso, mentoría, caso de estudio, lead magnet)
2. La promesa central (el resultado que obtiene el asistente)
3. El contenido o método que se enseña (si Samuel comparte un framework, úsalo como sección central)
4. Fecha y hora si existen (si no, usar "Cupos limitados" sin fecha)

Si Samuel referencia un framework de otro chat, búscalo en el historial de conversaciones antes de preguntar.

---

## Sistema de diseño (NO negociable)

### Paleta azul galaxia

```
--space-950:#040817   fondo base
--space-900:#070D22   fondo secciones alternas
--space-800:#0B1533   fondo de tarjetas
--space-700:#122048   detalle
--nebula:#1B2E66      radial del hero
--star-blue:#3E7BFF   acento principal (botones, bordes activos)
--star-light:#7FA8FF  acento claro (eyebrows, glow)
--ice:#C9D9FF         texto secundario claro
--white:#F4F7FF       texto principal
--muted:#8B9BC7       texto terciario
```

### Tipografía

Montserrat para TODO (Google Fonts, pesos 300 a 900). Titulares en 800, eyebrows en 700 con letter-spacing .22em y uppercase, cuerpo en 400. Nunca otra fuente.

### Elementos de firma

- Canvas de estrellas animadas en el hero (parpadeo sutil, densidad w*h/9000, respeta prefers-reduced-motion)
- Hero con radial-gradient de nebulosa desde arriba
- Palabra clave del H1 envuelta en span con glow azul (text-shadow rgba(62,123,255,.55))
- Botones pill con gradiente star-blue a #2E5FE0 y sombra azul difusa
- Tarjetas con borde rgba(127,168,255,.14) que sube a .45 en hover con translateY(-4px)
- Border-radius 18px en tarjetas, 999px en botones y eyebrows

### Reglas de copy

- Español, tuteo o formas impersonales. NUNCA "vos". NUNCA em dashes.
- Tono directo, sin relleno, orientado a resultado
- Hero: promesa concreta, no nombre del producto
- Subtítulo del hero: el contraste "lo que hace la mayoría vs lo que vas a hacer tú"

---

## Estructura de la página (en este orden)

1. **Hero**: eyebrow (formato del evento + urgencia), H1 con promesa y palabra glow, subtítulo de contraste, CTA anclado a #registro, nota de valor ("100% práctico...")
2. **Filtro "Esto es para ti solo si..."**: 4 a 5 tarjetas que califican al lead (situación actual, dolor, disposición)
3. **El método**: la sección central. Si hay un framework, desglosarlo en etapas con stage-labels, tarjetas de documentos/componentes y pasos numerados con círculos con glow. Cerrar con un diff-banner: "Por qué esto te diferencia de verdad"
4. **Agenda**: bloques del evento con qué construye el asistente en cada uno
5. **Mentor**: bio de Samuel. Base fija: Paid Media & Data Analyst, más de 10 años en Google Ads, Meta Ads, TikTok Ads y Microsoft Advertising, Máster en Ciencia de Datos, profesor universitario en Cali. Cierre de credibilidad: "no es teoría, es el sistema que aplico todos los días"
6. **Formulario de registro** (id="registro"): ver sección siguiente
7. **Footer**: disclaimer de Meta, disclaimer de resultados no garantizados, copyright del año actual

---

## Formulario (funcional, obligatorio)

- Campos: Nombre completo, Correo electrónico, Selecciona tu país (select con los 20 países LATAM + España + USA, Colombia primero), WhatsApp sin indicativo
- Envío por fetch al endpoint AJAX de FormSubmit:

```js
const ENDPOINT = 'https://formsubmit.co/ajax/samigonza3@gmail.com';
// payload incluye: _subject con el nombre del evento, _template:'table', _captcha:'false',
// y los campos con claves legibles en español + 'Origen' con el nombre de la landing
```

- Botón deshabilitado con texto "Enviando..." durante el request
- Mensaje de éxito verde y de error rojo en un div.form-status con role="status"
- form.reset() tras éxito
- Nota de privacidad debajo del botón

SIEMPRE recordarle a Samuel al entregar: el primer envío dispara un correo de activación de FormSubmit a samigonza3@gmail.com que debe confirmar una sola vez, y el fetch funciona en el dominio publicado, no siempre en preview local.

---

## Calidad técnica

- Un solo archivo HTML autocontenido (CSS y JS inline)
- Responsive hasta 360px (media query a 640px: padding reducido, agenda en columna)
- focus-visible en botones y CTA, scroll-behavior smooth, prefers-reduced-motion detiene el canvas
- Sin librerías externas salvo Google Fonts

---

## Entrega

1. Guardar el HTML en /mnt/user-data/outputs/<slug>.html
2. Crear zip para Netlify: copiar como index.html a una carpeta temporal y comprimir en /mnt/user-data/outputs/<slug>-netlify.zip
3. Presentar ambos archivos con present_files
4. Resumen corto en prosa: qué contiene la página, recordatorio de activación de FormSubmit, instrucción de drag and drop en app.netlify.com

## Variaciones permitidas

Samuel puede pedir ajustes de contenido (secciones extra como testimonios, FAQ, countdown) manteniendo el sistema de diseño intacto. Si pide otro color o fuente explícitamente, su instrucción del momento gana sobre este skill.
