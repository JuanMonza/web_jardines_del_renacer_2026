'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import { buildAdminGreeting } from '@/lib/adminGreeting';
import {
  BookHeart,
  Users,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';

const ADMIN_STORAGE_KEY = 'adminUser';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!userData) {
      router.push('/login/admin');
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
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
    <div className="min-h-screen">
      <Container className="py-6 md:py-10">
        <SectionTitle
          title="Panel de Control"
          subtitle="Vista general de las métricas y operaciones de la plataforma."
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <Link key={stat.label} href={stat.href}>
                <div className="glass rounded-2xl p-6 border border-transparent hover:border-primary/30 transition-all duration-300 cursor-pointer group">
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

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izquierda: Accesos Rápidos */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-semibold text-text">Accesos Rápidos</h2>
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
          <div className="lg:col-span-2 glass rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-text mb-6">
              Actividad Reciente
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

      </Container>
    </div>
  );
}

function QuickAccessCard({ href, icon: Icon, title, subtitle }: any) {
  return (
    <Link href={href}>
      <div className="group flex items-center gap-4 rounded-2xl border border-transparent bg-white/45 p-5 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-white/70">
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
