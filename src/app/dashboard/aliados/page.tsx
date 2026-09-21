import { redirect } from 'next/navigation';

export default function LegacyDashboardAliadosPage() {
  redirect(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ''}/dashboard-aliados`);
}
