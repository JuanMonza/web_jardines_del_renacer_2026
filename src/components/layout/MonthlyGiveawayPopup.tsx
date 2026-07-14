'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { buildWhatsAppUrl } from '@/config/contact';
import { giveawaysData } from '@/content/giveaways';
import CountdownUnit from '@/components/ui/CountdownUnit';

const PRELOADER_DURATION_MS = 2000;
const POPUP_DELAY_MS = 500;
const AUTO_CLOSE_MS = 20000;

/**
 * Encuentra el próximo sorteo disponible basándose en la fecha actual.
 * @returns El objeto del próximo sorteo o null si no hay futuros.
 */
function getNextGiveaway() {
  const now = Date.now();
  return (
    giveawaysData.find((giveaway) => new Date(giveaway.date).getTime() > now) ||
    null
  );
}

function getTimeRemaining(targetDateIso: string) {
  const difference = new Date(targetDateIso).getTime() - Date.now();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function MonthlyGiveawayPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  // Obtiene dinámicamente el próximo sorteo
  const nextGiveaway = useMemo(() => getNextGiveaway(), []);

  const [timeRemaining, setTimeRemaining] = useState(() =>
    nextGiveaway ? getTimeRemaining(nextGiveaway.date) : null
  );

  // Formatea la fecha para mostrarla en el popup
  const nextGiveawayLabel = useMemo(() => {
    if (!nextGiveaway) return 'Próximamente';
    return new Date(nextGiveaway.date).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  }, [nextGiveaway]);
  const actionUrl = useMemo(
    () =>
      buildWhatsAppUrl(
        'Hola, quiero actualizar mis datos para participar en los sorteos de Jardines del Renacer.'
      ),
    []
  );

  useEffect(() => {
    if (!nextGiveaway) {
      return;
    }

    const startedAt = Date.now();
    const closeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, AUTO_CLOSE_MS);

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100);
      setProgress(nextProgress);
    }, 100);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearInterval(progressTimer);
    };
  }, [isVisible]);

  // Efecto para abrir el popup después de un retraso
  useEffect(() => {
    if (!nextGiveaway) {
      return;
    }
    const countdownTimer = window.setInterval(() => {
      setTimeRemaining(getTimeRemaining(nextGiveaway.date));
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [nextGiveaway]);

  // Si no hay próximos sorteos o el popup no es visible, no se muestra nada
  if (!nextGiveaway || !isVisible) return null;

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative flex w-full max-w-[min(92vw,28rem)] flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_35px_90px_rgba(0,0,0,0.38)] animate-in fade-in zoom-in-95 duration-500 max-h-[92vh]">
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-black/85"
          aria-label="Cerrar popup"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="overflow-y-auto px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="mx-auto w-full max-w-[16.5rem] sm:max-w-[18.5rem] md:max-w-[20.5rem]">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem] bg-slate-100 shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
              <Image
                src={nextGiveaway.image}
                alt="Sorteos mensuales de Jardines del Renacer"
                fill
                sizes="(max-width: 640px) 72vw, (max-width: 768px) 18.5rem, 20.5rem"
                className="object-contain object-center"
                priority
              />
              <div className="absolute bottom-0 w-full bg-primary/80 p-1.5 text-center text-[10px] font-semibold text-white backdrop-blur-sm">
                *Imagen de referencia. Aplican T&C.
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/10 bg-white p-4 sm:p-5">
          <div className="rounded-[1.35rem] border border-primary/10 bg-gradient-to-br from-white to-sky-50/80 p-4 shadow-[0_14px_35px_rgba(37,99,235,0.08)]">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-primary/70">
              Proximo sorteo
            </p>
            <p className="mt-2 text-center text-sm font-semibold text-slate-700">
              {nextGiveawayLabel}
            </p>

            {timeRemaining ? (
              <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                <CountdownUnit value={timeRemaining.days} label="Dias" className="min-w-[4.25rem] !text-2xl sm:!text-[1.75rem]" />
                <CountdownUnit value={timeRemaining.hours} label="Horas" className="min-w-[4.25rem] !text-2xl sm:!text-[1.75rem]" />
                <CountdownUnit value={timeRemaining.minutes} label="Min" className="min-w-[4.25rem] !text-2xl sm:!text-[1.75rem]" />
                <CountdownUnit value={timeRemaining.seconds} label="Seg" className="min-w-[4.25rem] !text-2xl sm:!text-[1.75rem]" />
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
                El sorteo ya inicio o la fecha configurada ya paso.
              </p>
            )}
          </div>

          <a
            href={actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-4 text-center font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-primary-hover"
          >
            Actualizarme para participar
          </a>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-textLight">
            Este mensaje se cierra automáticamente en 20 segundos
          </p>
        </div>

        <div className="h-1.5 w-full bg-primary/10">
          <div
            className="h-full bg-gradient-to-r from-primary via-sky-500 to-amber-400 transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
