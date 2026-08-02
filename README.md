# Samuel González | Data. Marketing. Code.

# Portafolio Personal

Este repositorio contiene el código de mi landing page personal, donde presento mi experiencia y servicios en **marketing digital, ciencia de datos y desarrollo web**.

🔹 Estrategia y optimización en marketing digital.
🔹 Análisis de datos y modelos predictivos.
🔹 Desarrollo y automatización web.

Visita la página en: https://samuel-gonzalez-portf.netlify.app/

Contacto: https://www.linkedin.com/in/samuelgonzalez/

## Design System (v2 — Azul Galaxia, 2027)

Paleta azul galaxia (space-950 `#040817` a star-blue `#3E7BFF`), tipografía Montserrat en toda la UI, JetBrains Mono para métricas y datos, bento grids, starfield animado en el hero y micro-interacciones con `prefers-reduced-motion` respetado. Los tokens viven en `tailwind.config.js` y `src/index.css`.

## Blog / Noticias

El blog usa una UI editorial con filtros por categoría. Todo el contenido vive en **`src/data/posts.ts`**: para publicar una entrada nueva (artículo propio o noticia curada con resumen) solo agrega un objeto al array `posts`. Los campos `type: 'noticia'`, `sourceName` y `sourceUrl` muestran el enlace a la fuente original.

## Desarrollo

```
npm install
npm run dev      # desarrollo
npm run build    # build de producción (dist/)
```

El formulario de contacto usa EmailJS: define `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` y `VITE_EMAILJS_PUBLIC_KEY` en un archivo `.env` (y en las variables de entorno de Netlify).
