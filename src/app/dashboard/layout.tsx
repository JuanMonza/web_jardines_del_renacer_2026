'use client';

import { usePathname } from 'next/navigation';
import { MessageSquare, UsersRound } from 'lucide-react';
import AdminGlassShell from '@/components/admin/AdminGlassShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isQuotesDashboard = pathname?.startsWith('/dashboard/cotizaciones');
  const quotesNavigation = [{ href: '/dashboard/cotizaciones', label: 'Cotizaciones', icon: MessageSquare }, { href: '/dashboard/cotizaciones/equipo', label: 'Equipo', icon: UsersRound, permission: 'quotes.view.all' }];
  return <AdminGlassShell loginPath={isQuotesDashboard ? '/login/cotizaciones' : '/login/admin'} workspace={isQuotesDashboard ? 'Cotizaciones' : 'Administración general'} requiredPermission={isQuotesDashboard ? 'quotes.view' : undefined} navigation={isQuotesDashboard ? quotesNavigation : undefined}>{children}</AdminGlassShell>;
}
