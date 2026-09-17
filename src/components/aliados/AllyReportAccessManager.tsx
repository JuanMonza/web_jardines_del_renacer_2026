'use client';

import { useEffect, useState } from 'react';
import { FileSpreadsheet, ShieldCheck } from 'lucide-react';

type Person = { id: number; name: string; active: number; canView: number; canExport: number; hasAllyPanel: number; isPrincipal: number };

export default function AllyReportAccessManager() {
  const [people, setPeople] = useState<Person[]>([]);
  const [userId, setUserId] = useState('');
  const [canView, setCanView] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  async function load() {
    const response = await fetch('/api/iam/admin/ally-report-access', { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || 'No fue posible cargar permisos.');
    setPeople(body.data || []);
  }
  useEffect(() => { void load().catch(cause => { setError(true); setMessage(cause instanceof Error ? cause.message : 'No fue posible cargar permisos.'); }); }, []);

  async function save() {
    if (!userId) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/iam/admin/ally-report-access', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: Number(userId), canView, canExport }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'No fue posible guardar el permiso.');
      await load();
      setError(false); setMessage('Permisos del informe actualizados y auditados.');
    } catch (cause) { setError(true); setMessage(cause instanceof Error ? cause.message : 'No fue posible guardar el permiso.'); }
    finally { setSaving(false); }
  }

  const eligible = people.filter(person => person.active && person.hasAllyPanel && !person.isPrincipal);
  const granted = eligible.filter(person => person.canView || person.canExport);
  return <section className="mt-5 rounded-[26px] border border-[#cbdcf1] bg-white/75 p-5 shadow-[0_20px_54px_-38px_rgba(13,54,109,.72)] md:p-6">
    <div className="flex items-start gap-3"><span className="rounded-xl bg-[#e7f0fc] p-2.5 text-[#315fa8]"><FileSpreadsheet className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-[#426da4]">Permiso individual</p><h2 className="mt-1 text-xl font-bold text-[#173861]">Informe de trazabilidad de aliados</h2><p className="mt-1 text-sm text-[#607997]">Elige quién puede ver el informe y quién puede descargar su Excel. El administrador principal conserva acceso. Solo se muestran cuentas con acceso al panel Aliados.</p></div></div>
    <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto] lg:items-end">
      <label className="text-sm font-semibold text-[#345477]">Administrador<select value={userId} onChange={event => { const id = event.target.value; const person = eligible.find(item => String(item.id) === id); setUserId(id); setCanView(Boolean(person?.canView)); setCanExport(Boolean(person?.canExport)); setMessage(''); }} className="mt-1 block w-full rounded-xl border border-[#cbd9e8] bg-white px-3 py-3"><option value="">Seleccionar usuario</option>{eligible.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
      <label className="flex items-center gap-2 rounded-xl border border-[#cbd9e8] bg-white px-4 py-3 text-sm font-semibold text-[#345477]"><input type="checkbox" checked={canView} onChange={event => { setCanView(event.target.checked); if (!event.target.checked) setCanExport(false); }} disabled={!userId} className="h-4 w-4 accent-[#315fa8]" /> Ver informe</label>
      <label className="flex items-center gap-2 rounded-xl border border-[#cbd9e8] bg-white px-4 py-3 text-sm font-semibold text-[#345477]"><input type="checkbox" checked={canExport} onChange={event => { setCanExport(event.target.checked); if (event.target.checked) setCanView(true); }} disabled={!userId} className="h-4 w-4 accent-[#315fa8]" /> Descargar Excel</label>
      <button type="button" onClick={() => void save()} disabled={!userId || saving} className="rounded-xl bg-[#244f8a] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar permiso'}</button>
    </div>
    {message && <p role="status" className={`mt-3 text-sm ${error ? 'text-red-700' : 'text-emerald-700'}`}>{message}</p>}
    <div className="mt-5 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1 rounded-full bg-[#e7f0fc] px-3 py-1 text-xs font-bold text-[#315fa8]"><ShieldCheck className="h-3.5 w-3.5" /> Accesos actuales</span>{granted.length ? granted.map(person => <span key={person.id} className="rounded-full border border-[#cbd9e8] bg-white px-3 py-1 text-xs text-[#345477]">{person.name}: {person.canExport ? 'Ver y descargar' : 'Solo ver'}</span>) : <span className="text-xs text-[#607997]">Ningún usuario adicional autorizado.</span>}</div>
  </section>;
}
