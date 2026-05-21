'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';
import { type CommercialAlly } from '@/config/allies';
import { ensureExcelAlliesSeeded } from '@/lib/allyExcelImport';
import { readCommercialAllies } from '@/lib/alliesStorage';

export default function AliadoLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [allies, setAllies] = useState<CommercialAlly[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ensureExcelAlliesSeeded()
      .then(setAllies)
      .catch(() => setAllies(readCommercialAllies()));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const normalizedLogin = loginId.trim().toUpperCase();
    const ally = allies.find(
      (item) =>
        item.loginId?.toUpperCase() === normalizedLogin &&
        item.loginPassword === password,
    );

    if (!ally) {
      setError('ID o contrasena de aliado incorrectos.');
      setLoading(false);
      return;
    }

    localStorage.setItem(
      'allyPortalUser',
      JSON.stringify({
        cedula: ally.loginId,
        role: 'ally_user',
        name: ally.name,
        allyId: ally.id,
        loginId: ally.loginId,
      }),
    );
    localStorage.removeItem('alliesAdminUser');
    router.push('/dashboard-aliado');
  };

  return (
    <AuthLoginLayout
      title="Login Aliado"
      subtitle="Acceso exclusivo para validar codigos de descuento y registrar consumos."
      sectionLabel="Aliado Comercial"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <LoginTextField
          label="ID del aliado"
          type="text"
          value={loginId}
          onChange={(event) => {
            setLoginId(event.target.value.toUpperCase());
            setError('');
          }}
          placeholder="Ej: AMM9198"
          required
        />

        <LoginTextField
          label="Contrasena"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
          placeholder="Ingresa tu contrasena"
          required
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
          {loading ? 'Validando...' : 'Ingresar al portal aliado'}
        </button>

        <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
          <p className="font-semibold text-black mb-1">Credencial ejemplo</p>
          <p>ID aliado: <span className="font-mono">AMM9198</span></p>
          <p>Contrasena: <span className="font-mono">JR9198</span></p>
        </div>

        <div className="text-center text-sm text-black/75 space-y-2">
          <Link href="/login/admin-aliados" className="block hover:text-[#2f5bd6] transition-colors">
            Ir al login administrativo
          </Link>
          <Link href="/" className="block hover:text-[#2f5bd6] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}

