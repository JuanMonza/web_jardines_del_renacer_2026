'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { buildAdminGreeting } from '@/lib/adminGreeting';
import {
  BookHeart,
  Users,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/iam/admin/session')
      .then(async (response) => {
        if (!response.ok) throw new Error('No autorizado');
        return response.json() as Promise<{ user: { name: string; email: string } }>;
      })
      .then(({ user: authenticatedUser }) => {
        setUser(authenticatedUser);
        setLoading(false);
      })
      .catch(() => router.replace('/login/admin'));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Homenajes',
      value: '1,254',
      icon: BookHeart,
      href: '/dashboard/obituarios',
      change: '+12.5%',
      changeType: 'increase',
    },
    {
      label: 'Sedes Activas',
      value: '72',
      icon: Users,
      href: '/dashboard/sedes',
      change: '+2',
      changeType: 'increase',
    },
    {
      label: 'Visitas al Sitio',
      value: '28,791',
      icon: BarChart3,
      href: '#',
      change: '+21.3%',
      changeType: 'increase',
    },
    {
      label: 'Nuevos Afiliados (Mes)',
      value: '186',
      icon: TrendingUp,
      href: '#',
      change: '-3.1%',
      changeType: 'decrease',
    },
  ];
  return (
    <div className="min-h-screen p-5 md:p-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-[#a9c2df]/45 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#54759e]">Centro de operaciones</p>
          <h1 className="font-display text-3xl text-[#163861] md:text-4xl">Panel de control</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#57718f] md:text-base">Vista general de métricas y operaciones de Jardines del Renacer.</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/45 px-4 py-3 text-sm text-[#3e608a] shadow-sm backdrop-blur">Información protegida por rol</div>
      </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <div className="group rounded-2xl border border-white/70 bg-white/50 p-5 shadow-[0_16px_35px_-28px_rgba(8,37,88,0.65)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#7fa7d6] hover:bg-white/70">
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-medium text-textLight uppercase tracking-wider">
                      {stat.label}
                    </h3>
                    <StatIcon className="w-6 h-6 text-primary/70 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="mt-4">
                    <p className="text-3xl font-bold text-text md:text-4xl">{stat.value}</p>
                    <div
                      className={`text-xs flex items-center gap-1 mt-1 ${
                        stat.changeType === 'increase'
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>{stat.change} desde el mes pasado</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Columna Izquierda: Accesos Rápidos */}
          <div className="space-y-3 lg:col-span-1">
            <h2 className="text-lg font-semibold text-[#23476f]">Accesos rápidos</h2>
            <QuickAccessCard
              href="/dashboard/obituarios"
              icon={BookHeart}
              title="Gestionar Homenajes"
              subtitle="Crear, editar y buscar por cédula"
            />
            <QuickAccessCard
              href="/dashboard/sedes"
              icon={Users}
              title="Administrar Sedes"
              subtitle="Editar puntos de atención y administradores"
            />
          </div>

          {/* Columna Derecha: Actividad Reciente */}
          <div className="rounded-2xl border border-white/70 bg-white/48 p-5 shadow-[0_16px_35px_-28px_rgba(8,37,88,0.65)] backdrop-blur-xl md:p-6 lg:col-span-2">
            <h2 className="mb-5 text-lg font-semibold text-[#23476f]">
              Actividad reciente
            </h2>
            <div className="space-y-4">
              {[
                { action: 'Nuevo homenaje creado', time: 'Hace 2 horas', user: 'Admin', icon: BookHeart },
                { action: 'Sede "Cali" actualizada', time: 'Hace 5 horas', user: 'Admin', icon: Users },
                { action: 'Taller de duelo "Cometa" activado', time: 'Ayer', user: 'Admin', icon: TrendingUp },
              ].map((activity, index) => {
                const ActivityIcon = activity.icon;
                return (
                  <div key={index} className="flex flex-col items-start justify-between gap-3 border-b border-border/60 py-3 last:border-0 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <ActivityIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-text font-medium">{activity.action}</p>
                        <p className="text-sm text-textLight">{activity.user}</p>
                      </div>
                    </div>
                    <span className="text-sm text-textLight">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

    </div>
  );
}

function QuickAccessCard({ href, icon: Icon, title, subtitle }: any) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 rounded-2xl border border-white/70 bg-white/45 p-4 shadow-sm backdrop-blur-sm transition-all hover:border-[#7fa7d6] hover:bg-white/70">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-text transition-colors group-hover:text-primary md:text-lg">
            {title}
          </h3>
          <p className="text-sm leading-snug text-textLight">{subtitle}</p>
        </div>
        <ArrowUpRight className="ml-auto h-5 w-5 shrink-0 text-textLight transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
      </div>
    </Link>
  );
}
