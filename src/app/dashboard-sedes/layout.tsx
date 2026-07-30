'use client';

import { Building2, ExternalLink } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

const navigation = [
  { href: '/dashboard-sedes', label: 'Administrar sedes', icon: Building2 },
  { href: '/sedes', label: 'Ver directorio público', icon: ExternalLink, external: true },
];

export default function DashboardSedesLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin-sedes" workspace="Sedes y cobertura" navigation={navigation} requiredPermission="dashboard.sedes.view">{children}</AdminGlassShell>;
}
