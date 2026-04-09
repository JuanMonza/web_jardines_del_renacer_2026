'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type CookieDecision = 'all' | 'essential';

const COOKIE_CONSENT_KEY = 'jdr.cookie-consent.v1';

function saveCookieDecision(decision: CookieDecision) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({
      decision,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const existing = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    setVisible(!existing);
  }, []);

  const handleAcceptAll = () => {
    saveCookieDecision('all');
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    saveCookieDecision('essential');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70]">
      <div className="mx-auto max-w-4xl rounded-2xl border border-primary/20 bg-white/95 shadow-[0_20px_45px_-30px_rgba(11,45,110,0.65)] backdrop-blur-md">
        <div className="p-4 md:p-5">
          <p className="text-sm text-text leading-relaxed">
            Usamos cookies esenciales para operar este sitio y cookies opcionales para analitica y
            mejora de experiencia. Puedes aceptar todas o continuar solo con esenciales.
          </p>
          <p className="text-xs text-textLight mt-2">
            Consulta la{' '}
            <Link href="/legal/privacidad" className="text-primary font-semibold hover:underline">
              Politica de Privacidad
            </Link>{' '}
            y la{' '}
            <Link href="/legal/cookies" className="text-primary font-semibold hover:underline">
              Politica de Cookies
            </Link>
            .
          </p>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleEssentialOnly}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-text hover:border-primary/40 hover:bg-primary/5 transition-all"
            >
              Solo esenciales
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-all"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
