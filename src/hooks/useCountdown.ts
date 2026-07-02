'use client';

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para calcular el tiempo restante hasta una fecha objetivo.
 * Se actualiza cada segundo.
 * @param targetDate - La fecha objetivo en formato ISO string.
 * @returns Un objeto con días, horas, minutos y segundos restantes, o null si la fecha ya pasó.
 */
export function useCountdown(targetDate?: string) {
  const getTimeRemaining = (target: string) => {
    const difference = new Date(target).getTime() - new Date().getTime();

    if (difference <= 0) {
      return null;
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeRemaining, setTimeRemaining] = useState(() =>
    targetDate ? getTimeRemaining(targetDate) : null
  );

  useEffect(() => {
    if (!targetDate) return;

    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeRemaining;
}