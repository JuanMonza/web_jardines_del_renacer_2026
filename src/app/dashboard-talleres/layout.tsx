'use client';

import { CalendarHeart, Images, LayoutDashboard } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

export default function DashboardTalleresLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin-talleres" workspace="Talleres de duelo" requiredPermission="dashboard.talleres.view" navigation={[
    { href: '/dashboard-talleres', label: 'Panel de talleres', icon: LayoutDashboard },
    { href: '/dashboard-talleres#programacion', label: 'Programación', icon: CalendarHeart },
    { href: '/dashboard-talleres#galeria', label: 'Galería', icon: Images },
  ]}>{children}</AdminGlassShell>;
}
