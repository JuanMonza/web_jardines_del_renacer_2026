'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('adminUser');
    if (!userData) {
      router.push('/login/admin');
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Obituarios', value: '45', icon: '', href: '/dashboard/obituarios' },
    { label: 'Obituarios Activos', value: '12', icon: '', href: '/dashboard/obituarios' },
    { label: 'Visitas al Sitio', value: '4,567', icon: '', href: '/dashboard/obituarios' },
    { label: 'Este Mes', value: '28', icon: '', href: '/dashboard/obituarios' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      <Container>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display text-text mb-2">
              Bienvenido, {user?.name || 'Administrador'}
            </h1>
            <p className="text-textLight">
              Panel de administración de Obituarios - Jardines del Renacer
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-fit">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </Button>
        </div>

        <SectionTitle
          title="Panel de Control"
          subtitle="Vista general del sistema de obituarios"
          align="left"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <div className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-text mb-1">{stat.value}</h3>
                <p className="text-textLight text-sm">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-display text-text mb-6">Gestión de Obituarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/dashboard/obituarios">
              <div className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
                      Administrar Obituarios
                    </h3>
                    <p className="text-sm text-textLight">
                      Crear, editar y buscar por cédula
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <div className="glass rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">
                    Sistema Operativo
                  </h3>
                  <p className="text-sm text-textLight">
                    Todas las funciones activas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 glass rounded-2xl p-8">
          <h3 className="text-2xl font-display mb-6 text-text">
            Actividad Reciente
          </h3>
          <div className="space-y-4">
            {[
              { action: 'Nuevo obituario creado', time: 'Hace 2 horas', user: 'Admin', icon: '' },
              { action: 'Obituario actualizado', time: 'Hace 3 horas', user: 'Sistema', icon: '' },
              { action: 'Búsqueda realizada', time: 'Hace 5 horas', user: 'Admin', icon: '' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{activity.icon}</span>
                  <div>
                    <p className="text-text font-medium">{activity.action}</p>
                    <p className="text-sm text-textLight">{activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-textLight">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
