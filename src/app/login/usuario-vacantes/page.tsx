'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

function resolveNextPath(value: string | null) {
  return value?.startsWith('/') ? value : '/servicios/trabaja-con-nosotros/postulante/dashboard';
}

type AccessMethod = 'code' | 'password';

function VacantesUserLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNextPath(searchParams.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [method, setMethod] = useState<AccessMethod>('code');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [rememberUser, setRememberUser] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedAccess = window.localStorage.getItem('jdr.remember.vacantes.user');
    if (!savedAccess) return;
    try {
      const parsed = JSON.parse(savedAccess) as { email?: string };
      if (parsed.email) { setEmail(parsed.email); setRememberUser(true); }
    } catch { window.localStorage.removeItem('jdr.remember.vacantes.user'); }
  }, []);

  const rememberEmail = (value: string) => {
    if (rememberUser) window.localStorage.setItem('jdr.remember.vacantes.user', JSON.stringify({ email: value }));
    else window.localStorage.removeItem('jdr.remember.vacantes.user');
  };

  const selectMethod = (nextMethod: AccessMethod) => {
    setMethod(nextMethod); setStep('email'); setCode(''); setPassword(''); setError(''); setNotice('');
  };

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setNotice('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@')) { setError('Ingresa el correo de tu cuenta.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/postulantes/acceso-correo/solicitar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: normalizedEmail }) });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || 'No pudimos enviar el código.');
      setEmail(normalizedEmail); setStep('code'); setNotice(result.message || 'Revisa tu correo para continuar.');
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'No pudimos enviar el código. Intenta nuevamente.'); } finally { setLoading(false); }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (code.replace(/\D/g, '').length !== 6) { setError('Ingresa el código de 6 dígitos que enviamos a tu correo.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/postulantes/acceso-correo/verificar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: normalizedEmail, code }) });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || 'No pudimos validar el código.');
      rememberEmail(normalizedEmail); router.push(nextPath); router.refresh();
    } catch (verifyError) { setError(verifyError instanceof Error ? verifyError.message : 'No pudimos validar el código.'); } finally { setLoading(false); }
  };

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || password.length < 8) { setError('Ingresa tu correo y contraseña.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/postulantes/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: normalizedEmail, password }) });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || 'No pudimos iniciar sesión.');
      rememberEmail(normalizedEmail); router.push(nextPath); router.refresh();
    } catch (loginError) { setError(loginError instanceof Error ? loginError.message : 'No pudimos iniciar sesión.'); } finally { setLoading(false); }
  };

  const emailField = <LoginTextField label="Correo electrónico" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); }} placeholder="tucorreo@ejemplo.com" required />;
  const rememberCheckbox = <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={rememberUser} onChange={(event) => setRememberUser(event.target.checked)} className="h-4 w-4 accent-white" />Recordar mi correo en este dispositivo</label>;
  const feedback = <>{error && <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}{notice && <p className="rounded-xl border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}</>;

  return <AuthLoginLayout title="Portal de postulantes" subtitle="Ingresa con la opción que prefieras para gestionar tu perfil y postulaciones." sectionLabel="Ingreso Usuarios Vacantes">
    {step === 'email' && <div className="mb-5"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/65">Elige cómo ingresar</p><div className="grid grid-cols-2 rounded-2xl border border-white/20 bg-black/10 p-1.5"><button type="button" onClick={() => selectMethod('code')} className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${method === 'code' ? 'bg-white text-[#173c73] shadow-sm' : 'text-white/80 hover:bg-white/10'}`}>Código por correo</button><button type="button" onClick={() => selectMethod('password')} className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${method === 'password' ? 'bg-white text-[#173c73] shadow-sm' : 'text-white/80 hover:bg-white/10'}`}>Contraseña</button></div></div>}

    {method === 'code' && step === 'email' && <form onSubmit={handleRequestCode} className="space-y-5">{emailField}{rememberCheckbox}{feedback}<button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition hover:bg-black/85 disabled:opacity-60">{loading ? 'Enviando código...' : 'Continuar con correo'}</button><p className="text-center text-xs leading-relaxed text-white/70">Te enviaremos una clave temporal de un solo uso. No necesitas recordar tu contraseña.</p></form>}

    {method === 'password' && step === 'email' && <form onSubmit={handlePasswordLogin} className="space-y-5">{emailField}<LoginTextField label="Contraseña" type="password" value={password} onChange={(event) => { setPassword(event.target.value); setError(''); }} placeholder="Tu contraseña" required />{rememberCheckbox}{feedback}<button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition hover:bg-black/85 disabled:opacity-60">{loading ? 'Ingresando...' : 'Ingresar con contraseña'}</button><Link href={`/login/usuario-vacantes/recuperar?next=${encodeURIComponent(nextPath)}`} className="block text-center text-sm font-semibold text-white underline decoration-white/50 underline-offset-4">¿Olvidaste tu contraseña?</Link></form>}

    {method === 'code' && step === 'code' && <form onSubmit={handleVerifyCode} className="space-y-5"><div className="rounded-2xl border border-emerald-300/40 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900"><p className="font-bold">Código enviado</p><p className="mt-1">Revisa <strong>{email}</strong>. El código vence en 10 minutos.</p></div><LoginTextField label="Código temporal" type="text" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, '').slice(0, 6)); setError(''); }} placeholder="000000" required />{rememberCheckbox}{feedback}<button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition hover:bg-black/85 disabled:opacity-60">{loading ? 'Verificando...' : 'Ingresar al portal'}</button><div className="flex justify-between gap-3 text-sm"><button type="button" onClick={() => { setStep('email'); setCode(''); setError(''); }} className="font-semibold text-white underline decoration-white/50 underline-offset-4">Cambiar correo</button><button type="button" onClick={() => selectMethod('password')} className="font-semibold text-white underline decoration-white/50 underline-offset-4">Usar contraseña</button></div></form>}

    {step === 'email' && <div className="mt-6 space-y-2 text-center text-sm text-white/90"><Link href={`/login/usuario-vacantes/registro?next=${encodeURIComponent(nextPath)}`} className="block font-semibold underline decoration-white/50 underline-offset-4">Crear cuenta con correo</Link><Link href="/servicios/trabaja-con-nosotros" className="block hover:text-white">Ver vacantes disponibles</Link><Link href="/" className="block hover:text-white">Volver al inicio</Link></div>}
  </AuthLoginLayout>;
}

export default function VacantesUserLoginPage() { return <Suspense fallback={null}><VacantesUserLoginContent /></Suspense>; }
