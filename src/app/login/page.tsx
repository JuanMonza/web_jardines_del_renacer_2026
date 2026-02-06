'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';

export default function ClientLoginPage() {
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
      if (formData.cedula === '9876543210' && formData.password === 'cliente123') {
        localStorage.setItem('user', JSON.stringify({
          cedula: formData.cedula,
          role: 'cliente',
          name: 'Cliente Jardines del Renacer',
        }));
        
        router.push('/cliente/dashboard');
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <Container>
        <FadeIn>
          <div className="max-w-md mx-auto relative z-10">
            <div className="text-center mb-10">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-24 h-24 mx-auto rounded-full glass border-2 border-primary/30 flex items-center justify-center">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-display text-text mb-3 bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                Portal de Clientes
              </h1>
              <p className="text-textLight text-lg">Accede a tu cuenta personal</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-textLight font-medium">Conexión segura y encriptada</span>
              </div>
            </div>

            <div className="glass border-2 border-primary/20 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary/30 rounded-tl-3xl"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary/30 rounded-br-3xl"></div>
              
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="group">
                  <label htmlFor="cedula" className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Cédula de Cliente
                  </label>
                  <div className="relative">
                    <Input id="cedula" name="cedula" type="text" placeholder="Ingrese su número de cédula" value={formData.cedula} onChange={handleChange} required className="w-full pl-12 h-12 text-lg border-2 border-transparent focus:border-primary/50 transition-all" />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-textLight flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Usa la cédula registrada en tu plan
                  </p>
                </div>

                <div className="group">
                  <label htmlFor="password" className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Input id="password" name="password" type="password" placeholder="••••••••••••" value={formData.password} onChange={handleChange} required className="w-full pl-12 h-12 text-lg border-2 border-transparent focus:border-primary/50 transition-all" />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/50">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border-2 border-red-500/30 animate-shake">
                    <p className="text-sm text-red-600 flex items-center gap-2 font-medium">
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
                      <span className="text-sm font-mono font-bold text-primary">9876543210</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/50">
                      <span className="text-xs text-textLight font-medium">Contraseña:</span>
                      <span className="text-sm font-mono font-bold text-primary">cliente123</span>
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="primary" disabled={loading} className="w-full h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group">
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Acceder a Mi Cuenta
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link href="/contacto" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium inline-flex items-center gap-1 group">
                    <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-primary/10">
                <div className="flex items-center justify-center gap-6 text-xs text-textLight">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>SSL Seguro</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Cifrado de datos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/" className="inline-flex items-center gap-2 text-textLight hover:text-primary transition-colors font-medium group">
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
