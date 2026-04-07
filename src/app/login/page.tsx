'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

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
    return /^\d{6,10}$/.test(cleanCedula);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!validateCedula(formData.cedula)) {
      setError('Por favor ingresa una cedula valida (6-10 digitos).');
      setLoading(false);
      return;
    }

    if (formData.password.length < 4) {
      setError('La contrasena debe tener al menos 4 caracteres.');
      setLoading(false);
      return;
    }

    try {
      if (formData.cedula === '9876543210' && formData.password === 'cliente123') {
        localStorage.setItem(
          'user',
          JSON.stringify({
            cedula: formData.cedula,
            role: 'cliente',
            name: 'Cliente Jardines del Renacer',
          }),
        );
        router.push('/cliente/dashboard');
      } else {
        setError('Cedula o contrasena incorrectos.');
      }
    } catch {
      setError('Error al iniciar sesion. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    setError('');
  };

  return (
    <AuthLoginLayout
      title="Login"
      subtitle="Ingresa al portal de clientes con tu cedula y contrasena."
      sectionLabel="Ingreso Clientes"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <LoginTextField
          label="Cedula"
          name="cedula"
          type="text"
          value={formData.cedula}
          onChange={handleChange}
          placeholder="Ingresa tu cedula"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <LoginTextField
          label="Contrasena"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••••"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
            </svg>
          }
        />

        <div className="flex items-center justify-between text-sm text-black/70">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-[#2f5bd6]" />
            Recordarme
          </label>
          <Link href="/contacto" className="hover:text-[#2f5bd6] transition-colors">
            Olvide mi contrasena
          </Link>
        </div>

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
          <p>Cedula: <span className="font-mono">9876543210</span></p>
          <p>Contrasena: <span className="font-mono">cliente123</span></p>
        </div>

        <div className="text-center text-sm text-black/70 pt-1">
          <Link href="/" className="hover:text-[#2f5bd6] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}
