'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

function resolveNextPath(value: string | null) {
  return value?.startsWith('/') ? value : '/servicios/trabaja-con-nosotros/postulante/dashboard';
}

function RecuperarContrasenaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNextPath(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) { setError('Ingresa el correo asociado a tu cuenta.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/postulantes/acceso-correo/solicitar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: normalizedEmail }) });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || 'No pudimos enviar el código.');
      setEmail(normalizedEmail); setStep('code'); setMessage('Si el correo está registrado como postulante, recibirás un código de seguridad. Revisa también Spam y Promociones.');
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No pudimos enviar el código.'); } finally { setLoading(false); }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (code.length !== 6) { setError('Ingresa el código de 6 dígitos.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/postulantes/acceso-correo/verificar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, purpose: 'password_reset' }) });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || 'No pudimos validar el código.');
      router.replace(`/login/usuario-vacantes/restablecer?next=${encodeURIComponent(nextPath)}`); router.refresh();
    } catch (verifyError) { setError(verifyError instanceof Error ? verifyError.message : 'No pudimos validar el código.'); } finally { setLoading(false); }
  };

  return <AuthLoginLayout title="Recupera tu contraseña" subtitle="Confirma tu correo con un código de seguridad y crea una nueva contraseña." sectionLabel="Portal de postulantes">
    {step === 'email' ? <form onSubmit={requestCode} className="space-y-5">
      <LoginTextField label="Correo electrónico" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tucorreo@ejemplo.com" required />
      {error && <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition hover:bg-black/85 disabled:opacity-60">{loading ? 'Enviando código...' : 'Enviar código de seguridad'}</button>
      <Link href={`/login/usuario-vacantes?next=${encodeURIComponent(nextPath)}`} className="block text-center text-sm font-semibold text-white underline decoration-white/50 underline-offset-4">Volver al ingreso</Link>
    </form> : <form onSubmit={verifyCode} className="space-y-5">
      <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900"><p className="font-bold">Solicitud recibida</p><p className="mt-1">Revisa <strong>{email}</strong>. {message}</p></div>
      <LoginTextField label="Código de seguridad" type="text" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" required />
      {error && <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition hover:bg-black/85 disabled:opacity-60">{loading ? 'Validando...' : 'Continuar para cambiar contraseña'}</button>
      <button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }} className="block w-full text-center text-sm font-semibold text-white underline decoration-white/50 underline-offset-4">Cambiar correo</button>
    </form>}
  </AuthLoginLayout>;
}

export default function RecuperarContrasenaPage() { return <Suspense fallback={null}><RecuperarContrasenaContent /></Suspense>; }
