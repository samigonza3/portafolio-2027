// Herramientas gratuitas del sitio. Para publicar una nueva: agrégala aquí
// (aparece en el menú, el footer y la página /herramientas) y súmale su
// <Route> en App y su entrada en src/data/seo.ts.
// `grupo: 'otras'` la manda al submenú "Otras" del menú Herramientas.
export type Herramienta = {
  nombre: string;
  descripcion: string;
  to: string;
  externo?: boolean;
  grupo?: 'principal' | 'otras';
};

export const herramientas: Herramienta[] = [
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
    grupo: 'otras',
  },
  {
    nombre: 'Lector de Texto',
    descripcion: 'Convierte cualquier texto a voz con controles de reproducción.',
    to: '/herramientas/text-reader',
    grupo: 'otras',
  },
];

export const herramientasPrincipales = herramientas.filter((h) => h.grupo !== 'otras');
export const herramientasOtras = herramientas.filter((h) => h.grupo === 'otras');

// SG Academy: plataforma de cursos en su propio subdominio.
export const ACADEMY_URL = 'https://academy.samuelgonzalez.org';
