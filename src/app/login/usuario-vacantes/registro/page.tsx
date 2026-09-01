'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

function RegistroPostulanteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ documentNumber: '', firstName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/postulantes/registro', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, documentNumber: form.documentNumber.replace(/\D/g, ''), email: form.email.trim().toLowerCase() }) });
      const result = await response.json() as { success?: boolean; message?: string };
      if (!response.ok || !result.success) throw new Error(result.message || 'No fue posible crear la cuenta.');
      const next = searchParams.get('next');
      router.replace(next?.startsWith('/') ? next : '/servicios/trabaja-con-nosotros/postulante/dashboard'); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No fue posible crear la cuenta.'); } finally { setLoading(false); }
  };
  return <AuthLoginLayout title="Crea tu cuenta con correo" subtitle="Tu correo será tu acceso para postularte y consultar el estado de tu proceso." sectionLabel="Portal de postulantes"><form onSubmit={submit} className="space-y-4"><LoginTextField label="Documento" value={form.documentNumber} onChange={(e) => update('documentNumber', e.target.value)} required /><LoginTextField label="Nombre completo" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required /><div><LoginTextField label="Correo electrónico" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /><p className="mt-2 text-xs leading-relaxed text-white/75">Usaremos este correo para que ingreses nuevamente y recibas novedades de tu postulación.</p></div><LoginTextField label="Teléfono" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} required /><LoginTextField label="Crea una contraseña" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />{error && <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition hover:bg-black/85 disabled:opacity-60">{loading ? 'Creando cuenta...' : 'Crear cuenta con correo'}</button><Link href="/login/usuario-vacantes" className="block text-center text-sm text-[#2f5bd6] hover:underline">Ya tengo una cuenta</Link></form></AuthLoginLayout>;
}

export default function RegistroPostulantePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b2852]" />}>
      <RegistroPostulanteForm />
    </Suspense>
  );
}
