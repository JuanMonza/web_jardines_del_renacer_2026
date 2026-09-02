'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

function ResetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) { setMessage('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/postulantes/cambiar-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: searchParams.get('token'), newPassword: password }),
      });
      const result = await response.json() as { message?: string };
      setMessage(result.message || (response.ok ? 'Contraseña actualizada. Redirigiendo al ingreso…' : 'No fue posible restablecer la contraseña.'));
      if (response.ok) setTimeout(() => router.replace('/login/usuario-vacantes'), 900);
    } finally { setLoading(false); }
  };

  return <AuthLoginLayout title="Crea una nueva contraseña" subtitle="Tu código de seguridad fue validado. Define una contraseña de al menos 8 caracteres." sectionLabel="Portal de postulantes">
    <form onSubmit={submit} className="space-y-5">
      <LoginTextField label="Nueva contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <LoginTextField label="Confirmar nueva contraseña" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
      {message && <p className="rounded-xl bg-white/15 p-3 text-sm text-white">{message}</p>}
      <button className="w-full rounded-xl bg-black py-3 font-bold text-white" disabled={loading}>{loading ? 'Actualizando...' : 'Guardar nueva contraseña'}</button>
    </form>
  </AuthLoginLayout>;
}

export default function ResetPage() { return <Suspense fallback={null}><ResetContent /></Suspense>; }
