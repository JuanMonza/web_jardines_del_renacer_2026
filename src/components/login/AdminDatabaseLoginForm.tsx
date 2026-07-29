'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';
type Props = { destination: '/dashboard' | '/dashboard-aliados' | '/dashboard-vacantes'; sectionLabel: string; subtitle: string };
export default function AdminDatabaseLoginForm({ destination, sectionLabel, subtitle }: Props) {
  const router = useRouter(); const [cedula, setCedula] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); const document = cedula.replace(/\D/g, ''); if (!/^\d{6,20}$/.test(document) || !password) { setError('Ingresa credenciales válidas.'); return; } setLoading(true); setError(''); try { const response = await fetch('/api/iam/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cedula: document, password, destination }) }); const payload = await response.json(); if (!response.ok) { setError(payload.message || 'No fue posible iniciar sesión.'); return; } router.replace(destination); router.refresh(); } catch { setError('No fue posible iniciar sesión. Intenta nuevamente.'); } finally { setLoading(false); } }
  return <AuthLoginLayout title="Login" subtitle={subtitle} sectionLabel={sectionLabel}><form onSubmit={submit} className="space-y-6"><LoginTextField label="Cédula administrativa" type="text" value={cedula} onChange={(event) => setCedula(event.target.value)} placeholder="Ingresa tu cédula" required /><LoginTextField label="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••" required />{error && <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition-colors hover:bg-black/85 disabled:opacity-60">{loading ? 'Validando…' : 'Ingresar'}</button><div className="text-center text-sm text-black/75"><Link href="/" className="transition-colors hover:text-[#2f5bd6]">Volver al inicio</Link></div></form></AuthLoginLayout>;
}
