'use client';

import { Gift, LayoutDashboard, UsersRound } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

export default function DashboardSorteosLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin-sorteos" workspace="Programa de incentivos" requiredPermission="dashboard.sorteos.view" navigation={[
    { href: '/dashboard-sorteos', label: 'Panel de incentivos', icon: LayoutDashboard },
    { href: '/dashboard-sorteos#sorteos', label: 'Incentivos', icon: Gift },
    { href: '/dashboard-sorteos#participantes', label: 'Participantes', icon: UsersRound },
  ]}>{children}</AdminGlassShell>;
}
