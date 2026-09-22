'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, FlaskConical, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';

function safeDestination(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default function TrainingAccessForm({ nextPath }: { nextPath: string | null }) {
  const basePath = process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || '';
  const [username, setUsername] = useState('capacitacion');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError('Completa el usuario y la contraseña.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${basePath}/api/training/access`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const payload = await response.json().catch(() => ({})) as { message?: string };
      if (!response.ok) {
        setError(payload.message || 'No fue posible validar el acceso.');
        return;
      }
      window.location.assign(`${basePath}${safeDestination(nextPath)}`);
    } catch {
      setError('No fue posible conectar con el ambiente. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#06162d] px-4 py-10">
      <Image src={`${basePath}/fondos_login.jpg`} alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(3,17,37,.94),rgba(19,60,110,.72),rgba(2,18,39,.92))]" />
      <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-300/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-[470px] overflow-hidden rounded-[32px] border border-white/25 bg-[#0b294e]/75 p-7 text-white shadow-[0_32px_100px_rgba(0,0,0,.55)] backdrop-blur-2xl sm:p-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-300 via-green-400 to-cyan-300" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg">
            <Image src={`${basePath}/logos_jr_favico.png`} alt="Jardines del Renacer" width={38} height={38} className="brightness-0 invert" />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-300/15 px-3 py-1.5 text-xs font-bold text-emerald-100">
            <FlaskConical className="h-4 w-4" /> Modo prueba
          </span>
        </div>

        <p className="mt-7 text-xs font-bold uppercase tracking-[.22em] text-blue-200">Acceso protegido</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Ambiente de capacitación</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">Ingresa las credenciales generales antes de acceder a los paneles y ejercicios.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-white/85">Usuario</span>
            <span className="flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 transition focus-within:border-cyan-200/70 focus-within:bg-white/15">
              <UserRound className="h-5 w-5 shrink-0 text-blue-200" />
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" maxLength={60} className="min-w-0 flex-1 bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/35" placeholder="Usuario de capacitación" />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-white/85">Contraseña</span>
            <span className="flex items-center rounded-2xl border border-white/20 bg-white/10 px-4 transition focus-within:border-cyan-200/70 focus-within:bg-white/15">
              <LockKeyhole className="h-5 w-5 shrink-0 text-blue-200" />
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" maxLength={128} className="min-w-0 flex-1 bg-transparent px-3 py-4 text-white outline-none placeholder:text-white/35" placeholder="Ingresa la contraseña" />
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white" aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </span>
          </label>

          {error && <p role="alert" className="rounded-2xl border border-red-300/35 bg-red-950/35 px-4 py-3 text-sm font-semibold text-red-100">{error}</p>}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#49f28b] to-[#2adca9] px-5 py-4 font-black text-[#073326] shadow-[0_16px_36px_rgba(41,225,151,.22)] transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-wait disabled:opacity-60">
            <ShieldCheck className="h-5 w-5" /> {loading ? 'Validando acceso…' : 'Ingresar al ambiente'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-white/50">Entorno aislado para formación. Las acciones realizadas aquí no afectan la información de producción.</p>
      </section>
    </main>
  );
}
