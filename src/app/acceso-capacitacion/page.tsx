import { notFound } from 'next/navigation';
import TrainingAccessForm from '@/components/training/TrainingAccessForm';
import { isTrainingEnvironment } from '@/lib/training-environment';

export const metadata = {
  title: 'Acceso a capacitación | Jardines del Renacer',
  robots: { index: false, follow: false },
};

export default function TrainingAccessPage({ searchParams }: { searchParams: { next?: string } }) {
  if (!isTrainingEnvironment()) notFound();
  return <TrainingAccessForm nextPath={searchParams.next || null} />;
}
