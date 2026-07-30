'use client';

import { BarChart3, Bell, BriefcaseBusiness, Settings, Users, ExternalLink } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

const navigation = [
  { href: '/dashboard-vacantes', label: 'Resumen', icon: BriefcaseBusiness },
  { href: '/dashboard-vacantes/vacantes', label: 'Vacantes', icon: BriefcaseBusiness },
  { href: '/dashboard-vacantes/postulantes', label: 'Postulantes', icon: Users },
  { href: '/dashboard-vacantes/analitica', label: 'Analítica', icon: BarChart3 },
  { href: '/dashboard-vacantes/notificaciones', label: 'Notificaciones', icon: Bell },
  { href: '/dashboard-vacantes/configuracion', label: 'Configuración', icon: Settings },
  { href: '/servicios/trabaja-con-nosotros', label: 'Ver portal público', icon: ExternalLink, external: true },
];

export default function DashboardVacantesLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin-vacantes" workspace="Talento humano" navigation={navigation} requiredPermission="dashboard.vacantes.view">{children}</AdminGlassShell>;
}
