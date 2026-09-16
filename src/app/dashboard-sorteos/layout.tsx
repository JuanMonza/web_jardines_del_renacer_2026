'use client';

import { Gift, LayoutDashboard, UsersRound } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

export default function DashboardSorteosLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin-sorteos" workspace="Mercadeo" requiredPermission="dashboard.sorteos.view" navigation={[
    { href: '/dashboard-sorteos', label: 'Panel de Mercadeo', icon: LayoutDashboard },
    { href: '/dashboard-sorteos#sorteos', label: 'Incentivos y sorteos', icon: Gift },
    { href: '/dashboard-sorteos#sorteos', label: 'Participantes', icon: UsersRound },
  ]}>{children}</AdminGlassShell>;
}
