'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildAdminGreeting } from '@/lib/adminGreeting';

type VacanciesAdminUser = {
  cedula: string;
  role: string;
  name: string;
};

export default function DashboardVacantesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [user, setUser] = useState<VacanciesAdminUser | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('vacanciesAdminUser');
    if (!raw) {
      router.replace('/login/admin-vacantes');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as VacanciesAdminUser;
      if (parsed.role !== 'admin_vacantes') {
        localStorage.removeItem('vacanciesAdminUser');
        router.replace('/login/admin-vacantes');
        return;
      }

      setUser(parsed);
      setCheckingAccess(false);
    } catch {
      localStorage.removeItem('vacanciesAdminUser');
      router.replace('/login/admin-vacantes');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('vacanciesAdminUser');
    router.push('/');
  };

  const greeting = buildAdminGreeting(user?.name);

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden admin-liquid-bg">
      <div className="pointer-events-none absolute -top-28 -right-28 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />

      <aside className="fixed left-0 top-0 z-20 h-screen w-72 admin-liquid-sidebar border-r border-border/60">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-textLight font-medium mb-1">
                Administrador
              </p>
              <h3 className="text-text font-semibold text-base leading-tight">
                {user?.name || 'Admin Vacantes'}
              </h3>
              <p className="text-xs text-primary/90 mt-1">{greeting}</p>
            </div>
          </div>
        </div>

        <nav className="p-6 space-y-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-textLight font-semibold mb-4 px-3">
              Vacantes
            </p>
            <div className="space-y-1">

              <Link
                href="/dashboard-vacantes/vacantes"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-text hover:text-primary transition-all group"
              >
                <svg className="w-5 h-5 text-primary group-hover:scale-110 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l9-9 9 9M4 10v10h16V10" />

                </svg>
                <span className="font-medium">inicio</span>

              </Link>

              <Link
                href="/servicios/trabaja-con-nosotros"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-text hover:text-primary transition-all group"
              >
                <svg className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
                <span className="font-medium">Vista publica</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-xl border border-primary/25 text-primary font-semibold hover:bg-primary/10 transition-colors"
          >
            Cerrar sesion
          </button>
          <div className="glass rounded-xl p-4 border border-primary/20">
            <p className="text-xs text-primary font-medium mb-1">Jardines del Renacer</p>
            <p className="text-[10px] text-textLight">Centro de Gestión de Vacantes</p>
          </div>
        </div>
      </aside>

      <main className="ml-72 flex-1 p-5 relative z-10">
        <div className="admin-liquid-main-card rounded-[30px] min-h-[calc(100vh-2.5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
