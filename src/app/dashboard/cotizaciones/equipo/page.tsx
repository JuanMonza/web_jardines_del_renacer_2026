'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CotizacionesTeamManager from '@/components/cotizar/CotizacionesTeamManager';

export default function EquipoCotizacionesPage() {
  const router = useRouter();
  useEffect(() => { fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/iam/admin/session`).then((response) => response.ok ? response.json() : { user: { permissions: [] } }).then((payload: { user?: { permissions?: string[] } }) => { if (!payload.user?.permissions?.includes('quotes.view.all')) router.replace('/dashboard/cotizaciones'); }); }, [router]);
  return <CotizacionesTeamManager />;
}
