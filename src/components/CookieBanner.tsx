import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Banner de cookies con Google Consent Mode v2. index.html arranca GA4
// con todo en "denied"; aquí el visitante decide y se guarda su
// elección para no volver a preguntarle.
const STORAGE_KEY = 'cookie-consent';

function readChoice(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveChoice(value: 'granted' | 'denied') {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* modo privado: la elección solo dura esta visita */
  }
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readChoice() === null);
  }, []);

  const decide = (value: 'granted' | 'denied') => {
    window.gtag?.('consent', 'update', {
      analytics_storage: value,
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
    });
    saveChoice(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferencias de cookies"
      className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:max-w-md rounded-card border border-star-light/25 bg-space-900/95 backdrop-blur-md p-5 shadow-star"
    >
      <p className="text-sm text-ice leading-relaxed mb-4">
        Uso cookies de analítica para entender cómo se usa el sitio y mejorarlo. Puedes aceptarlas
        o rechazarlas. Más detalles en la{' '}
        <Link to="/privacidad" className="text-star-light underline hover:text-frost">
          Política de Privacidad
        </Link>
        .
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={() => decide('granted')} className="btn-star !py-2.5 !px-5 text-xs">
          Aceptar
        </button>
        <button type="button" onClick={() => decide('denied')} className="btn-ghost !py-2.5 !px-5 text-xs">
          Rechazar
        </button>
      </div>
    </div>
  );
}
