'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

function RestablecerAliadoForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch('/api/iam/ally/password-reset/confirm', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: params.get('token'), password }),
    });
    const payload = await response.json() as { message: string };
    setMessage(payload.message);
    setLoading(false);
    if (response.ok) setTimeout(() => router.replace('/login/aliado'), 1200);
  }

  return (
    <AuthLoginLayout title="Nueva contraseña" subtitle="Crea una contraseña segura para tu acceso de aliado." sectionLabel="Recuperación de acceso">
      <form onSubmit={submit} className="space-y-5">
        <LoginTextField label="Nueva contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 10 caracteres" required />
        <button className="w-full rounded-xl bg-white py-3 font-bold text-[#17355f]" disabled={loading}>
          {loading ? 'Actualizando…' : 'Actualizar contraseña'}
        </button>
        {message && <p className="text-sm text-white/80">{message}</p>}
      </form>
    </AuthLoginLayout>
  );
}

export default function RestablecerAliadoPage() {
  return <Suspense fallback={null}><RestablecerAliadoForm /></Suspense>;
}
