'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildAdminGreeting } from '@/lib/adminGreeting';

type AllyPortalUser = { name: string; allyId: number; loginId: string };

export default function DashboardAliadoLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [user, setUser] = useState<AllyPortalUser | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/iam/ally/session')
      .then(async (response) => {
        if (!response.ok) throw new Error('Sesión no válida');
        return response.json() as Promise<{ user: AllyPortalUser }>;
      })
      .then((payload) => {
        if (!active) return;
        setUser(payload.user);
        setCheckingAccess(false);
      })
      .catch(() => router.replace('/login/aliado'));
    return () => { active = false; };
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/iam/ally/logout', { method: 'POST' });
    router.replace('/login/aliado');
  };

  const greeting = buildAdminGreeting(user?.name);
  if (checkingAccess) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>;

  return (
    <div className="relative flex min-h-screen overflow-hidden admin-liquid-bg">
      <div className="pointer-events-none absolute -top-28 -right-28 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 h-80 w-80 rounded-full bg-sky-300/30 blur-3xl" />
      <aside className="fixed left-0 top-0 z-20 h-screen w-72 border-r border-white/70 bg-gradient-to-b from-white/80 via-[#edf4fb]/74 to-[#dfeafa]/78 shadow-[18px_0_55px_rgba(34,76,125,0.1)] backdrop-blur-2xl">
        <div className="m-3 rounded-[24px] border border-white/85 bg-white/55 p-5 shadow-[0_12px_30px_rgba(34,76,125,0.08)]">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[19px] border border-white/40 bg-gradient-to-br from-[#4977b4] via-[#315d98] to-[#183b6d] text-xl font-bold text-white shadow-[0_12px_22px_rgba(25,61,112,0.28)]">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#6683a6]">Aliado</p><h3 className="mt-1 text-base font-bold leading-tight text-[#173861]">{user?.name || 'Aliado Comercial'}</h3><p className="mt-1 text-xs font-medium text-[#4c76ad]">{greeting}</p><p className="mt-1 truncate text-[11px] text-[#7189a4]">ID: <span className="font-mono">{user?.loginId}</span></p></div>
          </div>
        </div>
        <nav className="px-6 py-7"><div><p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#6e86a2]">Mi portal</p><div className="space-y-2"><Link href="/dashboard-aliado#inicio" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[#416b9f] transition hover:bg-white/60"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#315d98]/10 font-bold">⌂</span><span className="font-semibold">Inicio</span></Link><Link href="/dashboard-aliado#validar" className="group flex items-center gap-3 rounded-2xl border border-white/70 bg-gradient-to-r from-[#315d98] to-[#4e7db8] px-4 py-3.5 text-white shadow-[0_10px_20px_rgba(35,78,135,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_25px_rgba(35,78,135,0.27)]"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/15">✓</span><span className="font-semibold">Validar código</span></Link><Link href="/dashboard-aliado#perfil" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-[#416b9f] transition hover:bg-white/60"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#315d98]/10 font-bold">i</span><span className="font-semibold">Mi perfil</span></Link></div></div></nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/65 bg-white/25 p-5 backdrop-blur-xl"><button type="button" onClick={handleLogout} className="w-full rounded-2xl border border-[#b9cde4] bg-white/65 px-4 py-3 font-semibold text-[#315d98] shadow-sm transition hover:border-[#7ea2cc] hover:bg-white">Cerrar sesión</button><div className="mt-3 rounded-2xl border border-white/85 bg-white/55 p-4 shadow-sm"><p className="text-xs font-bold text-[#315d98]">Jardines del Renacer</p><p className="mt-1 text-[11px] text-[#7189a4]">Portal de Aliados</p></div></div>
      </aside>
      <main className="ml-72 flex-1 p-5 relative z-10"><div className="admin-liquid-main-card rounded-[30px] min-h-[calc(100vh-2.5rem)]">{children}</div></main>
    </div>
  );
}
