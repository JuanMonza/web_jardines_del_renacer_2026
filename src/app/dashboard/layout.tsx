'use client';

import AdminGlassShell from '@/components/admin/AdminGlassShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminGlassShell loginPath="/login/admin" workspace="Administración general">{children}</AdminGlassShell>;
}
