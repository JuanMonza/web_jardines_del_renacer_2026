'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';

export default function ClienteDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'cliente') {
      router.push('/login');
      return;
    }
    
    setUser(parsedUser);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-textLight">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-background via-primary/5 to-background">
      <Container>
        <FadeIn>
          {/* Header */}
          <div className="glass rounded-2xl p-8 mb-8 border border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-2xl text-white">👤</span>
                </div>
                <div>
                  <h1 className="text-3xl font-display text-text mb-1">
                    Bienvenido, {user?.name}
                  </h1>
                  <p className="text-textLight flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Cuenta Activa
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-fit"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </Button>
            </div>
          </div>

          <SectionTitle
            title="Mi Portal de Cliente"
            subtitle="Accede a toda la información de tu cuenta"
            align="left"
          />

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Mi Plan */}
            <div className="glass rounded-2xl p-6 border border-primary/20 hover:border-primary/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Mi Plan</h3>
                  <p className="text-xs text-textLight">Estado: Activo</p>
                </div>
              </div>
              <p className="text-sm text-textLight mb-4">
                Plan Familiar Premium
              </p>
              <Link href="/planes">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Detalles
                </Button>
              </Link>
            </div>

            {/* Documentos */}
            <div className="glass rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Documentos</h3>
                  <p className="text-xs text-textLight">Contratos y facturas</p>
                </div>
              </div>
              <p className="text-sm text-textLight mb-4">
                3 documentos disponibles
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Próximamente
              </Button>
            </div>

            {/* Pagos */}
            <div className="glass rounded-2xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text">Mis Pagos</h3>
                  <p className="text-xs text-textLight">Historial y métodos</p>
                </div>
              </div>
              <p className="text-sm text-textLight mb-4">
                Todos los pagos al día
              </p>
              <Link href="/pagar-plan">
                <Button variant="outline" size="sm" className="w-full">
                  Realizar Pago
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <h2 className="text-2xl font-display text-text mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/contacto">
                <div className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group border border-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text group-hover:text-primary transition-colors">
                        Contactar Soporte
                      </h3>
                      <p className="text-sm text-textLight">
                        Estamos aquí para ayudarte
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              <Link href="/agendar-visita">
                <div className="glass rounded-2xl p-6 hover:border-primary/50 transition-all cursor-pointer group border border-transparent">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-text group-hover:text-purple-500 transition-colors">
                        Agendar Visita
                      </h3>
                      <p className="text-sm text-textLight">
                        Conoce nuestras instalaciones
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-12 glass rounded-2xl p-6 border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-lg font-semibold text-text mb-2">Portal en Desarrollo</h3>
                <p className="text-sm text-textLight leading-relaxed">
                  Estamos trabajando para ofrecerte más funcionalidades en tu portal de cliente. 
                  Próximamente podrás acceder a documentos digitales, historial de pagos detallado, 
                  y servicios adicionales. Si necesitas ayuda, no dudes en{' '}
                  <Link href="/contacto" className="text-primary hover:underline font-medium">
                    contactarnos
                  </Link>.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
