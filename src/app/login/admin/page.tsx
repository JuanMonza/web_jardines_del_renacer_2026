'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cedula: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateCedula = (cedula: string): boolean => {
    const cleanCedula = cedula.replace(/[\s-]/g, '');
    if (!/^\d{6,10}$/.test(cleanCedula)) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateCedula(formData.cedula)) {
      setError('Por favor ingresa una cédula válida (6-10 dígitos)');
      setLoading(false);
      return;
    }

    if (formData.password.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres');
      setLoading(false);
      return;
    }

    try {
      // Credenciales de admin de obituarios
      // Cédula: 1234567890
      // Contraseña: admin123
      
      if (formData.cedula === '1234567890' && formData.password === 'admin123') {
        localStorage.setItem('adminUser', JSON.stringify({
          cedula: formData.cedula,
          role: 'admin',
          name: 'Administrador de Obituarios',
        }));
        
        router.push('/dashboard');
      } else {
        setError('Cédula o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-background via-primary/5 to-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <Container>
        <FadeIn>
          <div className="max-w-md mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-24 h-24 mx-auto rounded-full glass border-2 border-primary/30 flex items-center justify-center">
                  <svg 
                    className="w-12 h-12 text-primary" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-display text-text mb-3 bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                Acceso Administrativo
              </h1>
              <p className="text-textLight text-lg">
                Panel de Gestión de Obituarios
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-xs text-textLight font-medium">Acceso Restringido - Solo Administradores</span>
              </div>
            </div>

            {/* Login Card */}
            <div className="glass border-2 border-primary/20 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/30 rounded-br-3xl"></div>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="group">
                  <label 
                    htmlFor="cedula" 
                    className="text-sm font-semibold text-text mb-3 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Cédula Administrativa
                  </label>
                  <div className="relative">
                    <Input
                      id="cedula"
                      name="cedula"
                      type="text"
                      placeholder="Ingrese su cédula de administrador"
                      value={formData.cedula}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 h-12 text-lg border-2 border-transparent focus:border-red-500/50 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-600/50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-textLight flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Solo personal autorizado
                  </p>
                </div>

                <div className="group">
                  <label 
                    htmlFor="password" 
                    className="text-sm font-semibold text-text mb-3 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 h-12 text-lg border-2 border-transparent focus:border-primary/50 transition-all"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary/30 animate-shake">
                    <p className="text-sm text-primary flex items-center gap-2 font-medium">
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20">
                  <p className="text-xs font-bold text-primary mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                    </svg>
                    CREDENCIALES DE PRUEBA
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                      <span className="text-xs text-textLight font-medium">Cédula:</span>
                      <span className="text-sm font-mono font-bold text-primary">1234567890</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                      <span className="text-xs text-textLight font-medium">Contraseña:</span>
                      <span className="text-sm font-mono font-bold text-primary">admin123</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-red-600 hover:bg-red-700"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Acceder al Panel Administrativo
                    </span>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link 
                    href="/contacto" 
                    className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium inline-flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Solicitar acceso administrativo
                  </Link>
                </div>
              </form>
            </div>

            <div className="text-center mt-8">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-textLight hover:text-primary transition-colors font-medium group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al inicio
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
