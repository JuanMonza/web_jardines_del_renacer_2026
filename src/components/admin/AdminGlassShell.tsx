'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardSidebar, { type AdminNavigationItem } from '@/components/admin/DashboardSidebar';
import { buildAdminGreeting } from '@/lib/adminGreeting';

type AdminGlassShellProps = {
  children: ReactNode;
  loginPath: string;
  workspace: string;
  requiredPermission?: string;
  navigation?: AdminNavigationItem[];
};

type SessionUser = { name?: string; email?: string; permissions?: string[] };

export default function AdminGlassShell({ children, loginPath, workspace, navigation, requiredPermission }: AdminGlassShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    fetch('/api/iam/admin/session')
      .then(async (response) => {
        if (!response.ok) throw new Error('No autorizado');
        return response.json() as Promise<{ user: SessionUser }>;
      })
      .then(({ user: authenticatedUser }) => {
        if (requiredPermission && !authenticatedUser.permissions?.includes(requiredPermission)) throw new Error('Sin permiso');
        setUser(authenticatedUser);
        setCheckingAccess(false);
      })
      .catch(() => router.replace(loginPath));
  }, [loginPath, requiredPermission, router]);

  const handleLogout = () => {
    fetch('/api/iam/admin/logout', { method: 'POST' }).finally(() => router.replace(loginPath));
  };

  if (checkingAccess) {
    return <div className="admin-liquid-bg flex min-h-screen items-center justify-center"><div className="h-11 w-11 animate-spin rounded-full border-2 border-white/50 border-t-[#234d8d]" /></div>;
  }

  const greeting = buildAdminGreeting(user?.name);
  const allowedNavigation: AdminNavigationItem[] = (navigation ?? ([
    { href: '/dashboard', label: 'Resumen', icon: () => null },
    { href: '/dashboard/obituarios', label: 'Homenajes', icon: () => null },
    { href: '/dashboard/sedes', label: 'Sedes', icon: () => null },
  ] as AdminNavigationItem[])).filter((item) => !item.permission || user?.permissions?.includes(item.permission));
  return (
    <div className="admin-liquid-bg relative min-h-screen overflow-hidden p-3">
      <div className="pointer-events-none absolute -top-32 right-[15%] h-[30rem] w-[30rem] rounded-full bg-[#94b9e8]/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[18%] h-[28rem] w-[28rem] rounded-full bg-[#d3e1f3]/70 blur-3xl" />
      <DashboardSidebar user={user} greeting={greeting} workspace={workspace} navigation={allowedNavigation} onLogout={handleLogout} />
      <header className="relative z-10 mb-3 rounded-2xl border border-white/60 bg-white/45 px-4 py-3 shadow-[0_12px_40px_-28px_rgba(8,37,88,0.7)] backdrop-blur-xl lg:ml-[18.5rem] lg:hidden">
        <div className="flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#52749d]">{workspace}</p><p className="text-sm font-bold text-[#173c70]">{greeting}</p></div><button onClick={handleLogout} className="rounded-lg bg-white/75 px-3 py-2 text-xs font-bold text-[#8c3345]">Salir</button></div>
        <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label={`Navegación móvil ${workspace}`}>
          {allowedNavigation.filter((item) => !item.external).map((item) => <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-lg border border-white/70 bg-white/55 px-3 py-2 text-xs font-semibold text-[#31547d]">{item.label}</Link>)}
        </nav>
      </header>
      <main className="relative z-10 min-w-0 lg:ml-[18.5rem]">
        <div className="admin-liquid-main-card min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[28px]">{children}</div>
      </main>
    </div>
  );
}
