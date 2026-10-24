// Herramientas gratuitas del sitio. Para publicar una nueva: agrégala aquí
// (aparece en el menú, el footer y la página /herramientas) y súmale su
// <Route> en App y su entrada en src/data/seo.ts.
export const herramientas = [
  {
    nombre: 'Documentos Fundacionales',
    descripcion: 'Genera los 4 documentos de tu marca con IA.',
    to: '/herramientas/foundational-docs',
  },
  {
    nombre: 'Diagnóstico para Dropshippers',
    descripcion: 'Diagnóstico de tu tienda de dropshipping.',
    to: '/diagnostico',
  },
  {
    nombre: 'WiPi Converter',
    descripcion: 'Convierte tus imágenes a WebP gratis.',
    to: 'https://webp-converter.samuelgonzalez.org/',
    externo: true,
  },
  {
    nombre: 'Lector de Texto',
    descripcion: 'Convierte cualquier texto a voz con controles de reproducción.',
    to: '/herramientas/text-reader',
  },
];
