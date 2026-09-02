'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BellRing, CheckCircle2, Mail, Send, UserRound } from 'lucide-react';

type Audit = { createdAt: string; action: string; description: string };
const formatDate = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' });
const statusStyle: Record<string, { label: string; dot: string; badge: string }> = {
  Recibida: { label: 'Recibida', dot: 'bg-sky-500', badge: 'border-sky-200 bg-sky-50 text-sky-700' },
  'En revision': { label: 'En revisión', dot: 'bg-amber-500', badge: 'border-amber-200 bg-amber-50 text-amber-800' },
  Entrevista: { label: 'Entrevista', dot: 'bg-violet-500', badge: 'border-violet-200 bg-violet-50 text-violet-700' },
  'Prueba tecnica': { label: 'Prueba técnica', dot: 'bg-orange-500', badge: 'border-orange-200 bg-orange-50 text-orange-700' },
  Seleccionado: { label: 'Seleccionado', dot: 'bg-emerald-500', badge: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  'No continua': { label: 'No continúa', dot: 'bg-red-500', badge: 'border-red-200 bg-red-50 text-red-700' },
};

function notificationStatus(description: string) {
  const value = description.match(/Estado informado:\s*([^.]*)/i)?.[1]?.trim();
  return value && statusStyle[value] ? value : null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Audit[]>([]);
  useEffect(() => { void fetch('/api/vacantes/auditoria').then((response) => response.json()).then((result) => setNotifications((result.data ?? []).filter((item: Audit) => item.action === 'POSTULANTE_NOTIFICADO'))).catch(() => undefined); }, []);

  return <div className="space-y-6 p-4 md:p-8">
    <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#173f73] via-[#315d98] to-[#79a2d0] p-7 text-white shadow-[0_20px_50px_rgba(20,57,106,.22)]"><BellRing className="absolute -right-5 -bottom-7 h-40 w-40 text-white/10" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-100">Comunicación RRHH</p><h1 className="mt-2 text-3xl font-bold">Notificaciones de selección</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">Cada avance o decisión del proceso puede ser comunicado al postulante y queda registrado para seguimiento.</p></div></section>
    <section className="grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
      <article className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={22} /></div><h2 className="mt-4 text-xl font-bold text-text">Envío automático</h2><p className="mt-2 text-sm leading-6 text-textLight">Al cambiar el estado de un postulante, el sistema guarda el seguimiento, envía el correo desde no-reply y registra el movimiento en auditoría.</p><Link href="/dashboard-vacantes/postulantes" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"><Send size={16} /> Gestionar postulantes</Link></article>
      <article className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]"><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Semáforo del proceso</p><h2 className="mt-2 text-lg font-bold text-text">Estado informado en cada correo</h2><p className="mt-1 text-sm text-textLight">La etiqueta aparece junto a cada notificación enviada.</p><div className="mt-5 flex flex-wrap gap-2">{Object.entries(statusStyle).map(([key, style]) => <span key={key} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${style.badge}`}><span className={`h-2.5 w-2.5 rounded-full ${style.dot}`} />{style.label}</span>)}</div><div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-800"><span className="font-bold">No continúa:</span> se marca en rojo y conserva el mensaje respetuoso de futuras oportunidades.</div></article>
    </section>
    <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Trazabilidad</p><h2 className="mt-1 text-xl font-bold text-text">Últimos correos enviados</h2></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{notifications.length} registro(s)</span></div><div className="mt-5 space-y-3">{notifications.length ? notifications.slice(0, 20).map((item, index) => { const status = notificationStatus(item.description || ''); const style = status ? statusStyle[status] : null; return <article key={`${item.createdAt}-${index}`} className="flex gap-3 rounded-2xl border border-slate-100 p-4"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style ? style.badge : 'bg-blue-50 text-primary'}`}><Mail size={18} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-text">Notificación enviada</p>{style && <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${style.badge}`}><span className={`h-2 w-2 rounded-full ${style.dot}`} />{style.label}</span>}</div><p className="mt-1 text-sm leading-5 text-textLight">{item.description || 'Sin detalle disponible.'}</p><p className="mt-1 text-xs font-semibold text-primary">{formatDate.format(new Date(item.createdAt))}</p></div></article>; }) : <div className="rounded-2xl border border-dashed border-[#c8d8ee] bg-[#f7faff] p-8 text-center"><UserRound className="mx-auto h-8 w-8 text-primary/60" /><p className="mt-3 font-bold text-text">Aún no hay notificaciones enviadas</p><p className="mt-1 text-sm text-textLight">Se registrarán aquí cuando actualices el estado de una postulación.</p></div>}</div></section>
  </div>;
}
