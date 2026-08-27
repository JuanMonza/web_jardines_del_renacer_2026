'use client';

import { Gift, LayoutDashboard, UsersRound } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

export default function DashboardSorteosLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin-sorteos" workspace="Sorteos e incentivos" requiredPermission="dashboard.sorteos.view" navigation={[
    { href: '/dashboard-sorteos', label: 'Panel de sorteos', icon: LayoutDashboard },
    { href: '/dashboard-sorteos#sorteos', label: 'Sorteos', icon: Gift },
    { href: '/dashboard-sorteos#participantes', label: 'Participantes', icon: UsersRound },
  ]}>{children}</AdminGlassShell>;
}
