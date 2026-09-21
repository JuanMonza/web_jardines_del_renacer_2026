'use client';

import { useEffect, useState } from 'react';

const training = process.env.NEXT_PUBLIC_APP_ENV === 'training';
const basePath = process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || '';

function leavesTraining(rawUrl: string) {
  if (!rawUrl || rawUrl.startsWith('#')) return false;
  try {
    const url = new URL(rawUrl, window.location.href);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
    if (url.origin !== window.location.origin) return true;
    return Boolean(basePath && url.pathname !== basePath && !url.pathname.startsWith(`${basePath}/`));
  } catch {
    return true;
  }
}

export default function TrainingExternalActionGuard() {
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    if (!training) return;

    const blockExternalLink = (event: MouseEvent) => {
      const target = event.target;
      const anchor = target instanceof Element ? target.closest('a[href]') : null;
      const href = anchor?.getAttribute('href');
      if (!href || !leavesTraining(href)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setNotice(true);
    };

    const originalOpen = window.open;
    window.open = ((url?: string | URL, target?: string, features?: string) => {
      if (url && leavesTraining(String(url))) {
        setNotice(true);
        return null;
      }
      return originalOpen.call(window, url, target, features);
    }) as typeof window.open;

    document.addEventListener('click', blockExternalLink, true);
    document.addEventListener('auxclick', blockExternalLink, true);
    return () => {
      document.removeEventListener('click', blockExternalLink, true);
      document.removeEventListener('auxclick', blockExternalLink, true);
      window.open = originalOpen;
    };
  }, []);

  if (!training || !notice) return null;
  return (
    <div role="status" className="fixed bottom-6 left-1/2 z-[200] w-[min(90vw,420px)] -translate-x-1/2 rounded-2xl border border-emerald-300 bg-emerald-950 px-5 py-4 text-center text-sm font-semibold text-white shadow-2xl">
      Los enlaces externos, pagos y canales reales están deshabilitados en el modo de prueba.
      <button type="button" onClick={() => setNotice(false)} className="ml-3 underline underline-offset-2">Cerrar</button>
    </div>
  );
}
