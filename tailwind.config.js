/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Sistema tipográfico: solo 2 familias en todo el sitio.
      // 'sans' = texto/UI (Montserrat). 'display' = titulares grandes (Space Grotesk).
      // 'mono' apunta a Montserrat a propósito: si queda algún font-mono suelto
      // en algún componente, no introduce una tercera familia por accidente.
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['Montserrat', 'sans-serif'],
      },
      // Los colores se leen de variables CSS (src/index.css) para soportar
      // modo oscuro (por defecto) y modo claro sin duplicar clases.
      colors: {
        space: {
          950: 'rgb(var(--c-space-950) / <alpha-value>)',
          900: 'rgb(var(--c-space-900) / <alpha-value>)',
          800: 'rgb(var(--c-space-800) / <alpha-value>)',
          700: 'rgb(var(--c-space-700) / <alpha-value>)',
        },
        nebula: 'rgb(var(--c-nebula) / <alpha-value>)',
        star: {
          DEFAULT: '#3E7BFF',
          dark: '#2E5FE0',
          light: 'rgb(var(--c-star-light) / <alpha-value>)',
        },
        ice: 'rgb(var(--c-ice) / <alpha-value>)',
        frost: 'rgb(var(--c-frost) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        signal: {
          teal: 'rgb(var(--c-teal) / <alpha-value>)',
          amber: 'rgb(var(--c-amber) / <alpha-value>)',
        },
      },
      borderRadius: {
        card: '18px',
      },
      boxShadow: {
        star: '0 12px 30px -8px rgba(62,123,255,.55)',
        'star-lg': '0 16px 36px -6px rgba(62,123,255,.7)',
      },
    },
  },
  plugins: [],
};
