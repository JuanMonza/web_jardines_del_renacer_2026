'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
}

function resolveNextPath(value: string | null) {
  if (value && value.startsWith('/')) {
    return value;
  }
  return '/servicios/trabaja-con-nosotros/postulante/dashboard';
}

function VacantesUserLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNextPath(searchParams.get('next'));

  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const normalizedDocument = normalizeDocumentNumber(documentNumber);
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedDocument.length < 6 || normalizedDocument.length > 15) {
      setError('Ingresa un documento valido.');
      setLoading(false);
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Ingresa el correo usado en tu postulacion.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/postulantes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentNumber: normalizedDocument,
          email: normalizedEmail,
        }),
      });
      const result = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !result.success) {
        setError(result.message || 'No pudimos validar tus datos.');
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError('No pudimos iniciar sesion. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLoginLayout
      title="Portal de postulantes"
      subtitle="Ingresa con el documento y correo registrados en tu postulacion."
      sectionLabel="Ingreso Usuarios Vacantes"
    >
      <form onSubmit={handleLoginSubmit} className="space-y-6">
        <LoginTextField
          label="Documento"
          type="text"
          value={documentNumber}
          onChange={(event) => {
            setDocumentNumber(event.target.value);
            setError('');
          }}
          placeholder="Ingresa tu documento"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.42 0 4.696.607 6.688 1.68M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <LoginTextField
          label="Correo de postulacion"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError('');
          }}
          placeholder="correo@ejemplo.com"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
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
          {loading ? 'Validando...' : 'Ingresar al portal'}
        </button>

        <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
          Si olvidaste tus datos de acceso, usa el documento y correo con los que enviaste tu
          hoja de vida. La recuperacion con contraseña requiere una tabla de candidatos que aun
          no existe en el esquema actual.
        </div>

        <div className="text-center text-sm text-black/75 space-y-2">
          <Link
            href="/servicios/trabaja-con-nosotros"
            className="block hover:text-[#2f5bd6] transition-colors"
          >
            Ver vacantes disponibles
          </Link>
          <Link href="/" className="block hover:text-[#2f5bd6] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}

export default function VacantesUserLoginPage() {
  return (
    <Suspense fallback={null}>
      <VacantesUserLoginContent />
    </Suspense>
  );
}
