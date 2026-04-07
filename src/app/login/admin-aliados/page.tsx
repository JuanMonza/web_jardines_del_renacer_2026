'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

export default function AdminAliadosLoginPage() {
  const router = useRouter();
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const cleanCedula = cedula.replace(/\D/g, '');
    const validCedula = cleanCedula.length >= 6 && cleanCedula.length <= 10;
    if (!validCedula) {
      setError('Ingresa una cedula valida.');
      setLoading(false);
      return;
    }

    if (cleanCedula === '2222222222' && password === 'aliados123') {
      localStorage.setItem(
        'alliesAdminUser',
        JSON.stringify({
          cedula: cleanCedula,
          role: 'admin_aliados',
          name: 'Administrador Aliados Comerciales',
        }),
      );
      router.push('/dashboard-aliados');
      return;
    }

    setError('Cedula o contrasena incorrectos para el panel de aliados.');
    setLoading(false);
  };

  return (
    <AuthLoginLayout
      title="Login"
      subtitle="Acceso administrativo para la gestion de aliados comerciales."
      sectionLabel="Admin Aliados"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <LoginTextField
          label="Cedula administrativa"
          type="text"
          value={cedula}
          onChange={(event) => {
            setCedula(event.target.value);
            setError('');
          }}
          placeholder="Ingresa tu cedula"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.42 0 4.696.607 6.688 1.68M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <LoginTextField
          label="Contrasena"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
          placeholder="••••••••••"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
            </svg>
          }
        />

        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-3.5 text-lg font-semibold hover:bg-black/85 transition-colors disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Login'}
        </button>

        <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
          <p className="font-semibold text-black mb-1">Credenciales de prueba</p>
          <p>Cedula: <span className="font-mono">2222222222</span></p>
          <p>Contrasena: <span className="font-mono">aliados123</span></p>
        </div>

        <div className="text-center text-sm text-black/75">
          <Link href="/" className="hover:text-[#2f5bd6] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}
