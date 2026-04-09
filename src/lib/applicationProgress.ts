import type { ApplicationStatus } from '@/config/candidates';

export const APPLICATION_PROGRESS_STEPS: Array<Exclude<ApplicationStatus, 'No continua'>> = [
  'Recibida',
  'En revision',
  'Entrevista',
  'Prueba tecnica',
  'Seleccionado',
];

export type ApplicationProgress = {
  activeIndex: number;
  percent: number;
  isRejected: boolean;
  isFinished: boolean;
};

export function getApplicationProgress(status: ApplicationStatus): ApplicationProgress {
  if (status === 'No continua') {
    return {
      activeIndex: -1,
      percent: 100,
      isRejected: true,
      isFinished: true,
    };
  }

  const activeIndex = APPLICATION_PROGRESS_STEPS.indexOf(status);
  const safeIndex = activeIndex < 0 ? 0 : activeIndex;
  const denominator = APPLICATION_PROGRESS_STEPS.length - 1;
  const percent = denominator > 0 ? Math.round((safeIndex / denominator) * 100) : 0;

  return {
    activeIndex: safeIndex,
    percent,
    isRejected: false,
    isFinished: status === 'Seleccionado',
  };
}
