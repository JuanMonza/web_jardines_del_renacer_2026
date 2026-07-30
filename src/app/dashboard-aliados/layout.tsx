'use client';

import { Building2, ExternalLink } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

const navigation = [
  { href: '/dashboard-aliados', label: 'Panel de aliados', icon: Building2 },
  { href: '/aliados-comerciales', label: 'Ver portal público', icon: ExternalLink, external: true },
];

export default function DashboardAliadosLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin-aliados" workspace="Aliados comerciales" navigation={navigation} requiredPermission="dashboard.aliados.view">{children}</AdminGlassShell>;
}
