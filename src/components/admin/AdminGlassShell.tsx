'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DashboardSidebar, { type AdminNavigationItem } from '@/components/admin/DashboardSidebar';
import { buildAdminGreeting } from '@/lib/adminGreeting';
import { Menu, X, LogOut } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="admin-liquid-bg relative min-h-screen overflow-hidden p-2 sm:p-3">
      <div className="pointer-events-none absolute -top-32 right-[15%] h-[30rem] w-[30rem] rounded-full bg-[#94b9e8]/35 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-[18%] h-[28rem] w-[28rem] rounded-full bg-[#d3e1f3]/70 blur-3xl" />
      <DashboardSidebar user={user} greeting={greeting} workspace={workspace} navigation={allowedNavigation} onLogout={handleLogout} />
      <header className="relative z-10 mb-2 rounded-2xl border border-white/60 bg-white/60 px-3 py-3 shadow-[0_12px_40px_-28px_rgba(8,37,88,0.7)] backdrop-blur-xl lg:ml-[18.5rem] lg:hidden">
        <div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#52749d]">{workspace}</p><p className="truncate text-sm font-bold text-[#173c70]">{greeting}</p></div><button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menú" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#214b86] text-white shadow-md"><Menu className="h-5 w-5"/></button></div>
      </header>
      {mobileMenuOpen && <div className="fixed inset-0 z-[2147483647] bg-[#07182e]/55 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenuOpen(false)}><aside className="h-full w-[min(19rem,86vw)] border-r border-white/70 bg-[#f8fbff] p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-3 rounded-2xl bg-gradient-to-br from-[#173f73] to-[#5f8bc0] p-4 text-white"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-blue-100">{workspace}</p><p className="mt-1 truncate font-bold">{user?.name || 'Equipo Jardines'}</p><p className="mt-1 truncate text-xs text-blue-100">{greeting}</p></div><button type="button" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/10"><X size={18}/></button></div><nav className="mt-5 space-y-1.5" aria-label={`Navegación móvil ${workspace}`}>{allowedNavigation.map(({ href, label, icon: Icon, external }) => <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#31547d] transition hover:bg-[#eaf1fb] hover:text-[#173c70]"><Icon className="h-[18px] w-[18px] text-[#5680b5]"/>{label}{external && <span className="ml-auto text-xs">↗</span>}</Link>)}</nav><div className="mt-6 border-t border-[#dbe5f3] pt-3"><button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-[#8c3345] hover:bg-red-50"><LogOut className="h-[18px] w-[18px]"/>Cerrar sesión</button></div></aside></div>}
      <main className="relative z-10 min-w-0 lg:ml-[18.5rem]">
        <div className="admin-liquid-main-card min-h-[calc(100vh-1rem)] overflow-hidden rounded-[22px] sm:min-h-[calc(100vh-1.5rem)] sm:rounded-[28px]">{children}</div>
      </main>
    </div>
  );
}
