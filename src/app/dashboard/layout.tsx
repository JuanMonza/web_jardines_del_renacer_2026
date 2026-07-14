'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from '../../components/admin/DashboardSidebar'; // Importamos el nuevo menú
import { buildAdminGreeting } from '@/lib/adminGreeting';

const ADMIN_STORAGE_KEY = 'adminUser';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const greeting = buildAdminGreeting(user?.name);

  return (
    <div className="relative flex min-h-screen admin-liquid-bg">
      {/* Blobs decorativos en su propio contenedor clipado para no romper position:fixed */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-28 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
      </div>

      {/* El nuevo menú lateral se integra aquí, reemplazando el anterior */}
      <DashboardSidebar user={user} greeting={greeting} />

      <div className="fixed inset-x-0 top-0 z-30 border-b border-border/60 bg-white/85 backdrop-blur lg:hidden">
        <div className="px-4 py-3">
          <p className="text-xs uppercase tracking-wider text-textLight/80">Panel Administrativo</p>
          <p className="text-sm font-semibold text-text">{greeting}</p>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <Link href="/dashboard" className="rounded-full border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-text whitespace-nowrap">
              Principal
            </Link>
            <Link href="/dashboard/obituarios" className="rounded-full border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-text whitespace-nowrap">
              Homenajes
            </Link>
            <Link href="/dashboard/sedes" className="rounded-full border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-text whitespace-nowrap">
              Sedes
            </Link>
            <Link href="/dashboard/talleres" className="rounded-full border border-border/70 bg-white px-3 py-1.5 text-xs font-medium text-text whitespace-nowrap">
              Talleres
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 min-w-0 p-3 pt-28 sm:p-4 sm:pt-28 lg:ml-72 lg:p-5 lg:pt-5">
        <div className="min-h-[calc(100vh-7.25rem)] rounded-2xl bg-white/80 lg:min-h-[calc(100vh-2.5rem)] lg:rounded-[30px]">
          {children}
        </div>
      </main>
    </div>
  );
}
