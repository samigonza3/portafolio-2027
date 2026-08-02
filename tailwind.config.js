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
      colors: {
        space: {
          950: '#040817',
          900: '#070D22',
          800: '#0B1533',
          700: '#122048',
        },
        nebula: '#1B2E66',
        star: {
          DEFAULT: '#3E7BFF',
          dark: '#2E5FE0',
          light: '#7FA8FF',
        },
        ice: '#C9D9FF',
        frost: '#F4F7FF',
        muted: '#8B9BC7',
        signal: {
          teal: '#3EE7C4',
          amber: '#FFB25E',
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
