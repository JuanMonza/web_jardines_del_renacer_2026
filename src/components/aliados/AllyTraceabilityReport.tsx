'use client';

import { useEffect, useState } from 'react';
import { Download, History, Search } from 'lucide-react';

type Event = { id: number; allyId: number; allyName: string; loginId: string; department: string; city: string; type: 'ALLY_CREATED' | 'ALLY_DEACTIVATED' | 'ALLY_UPDATED'; actor: string; changedFields: string; date: string };
type Report = { data: Event[]; summary: { created: number; deactivated: number; updated: number; updatedMovements: number }; pagination: { page: number; pageSize: number; total: number; totalPages: number }; access: { canExport: boolean } };
const status = {
  ALLY_CREATED: { label: 'Nuevo', color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  ALLY_DEACTIVATED: { label: 'Retirado', color: 'border-red-200 bg-red-50 text-red-800' },
  ALLY_UPDATED: { label: 'Actualizado', color: 'border-amber-200 bg-amber-50 text-amber-800' },
};

export default function AllyTraceabilityReport() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [report, setReport] = useState<Report | null>(null);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    setLoading(true);
    setError('');
    if (from && to && from > to) {
      setError('La fecha inicial no puede ser posterior a la final.');
      setLoading(false);
      return () => controller.abort();
    }
    void fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/aliados/trazabilidad?${params}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (response.status === 403) { setDenied(true); return; }
        const body = await response.json();
        if (!response.ok) throw new Error(body.message || 'No fue posible cargar el informe.');
        setDenied(false);
        setReport(body);
      })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No fue posible cargar el informe.'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [from, to, page, pageSize]);

  async function download() {
    if (!report?.access.canExport || downloading) return;
    setDownloading(true); setError('');
    try {
      const params = new URLSearchParams({ format: 'xlsx' });
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const response = await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/aliados/trazabilidad?${params}`, { cache: 'no-store' });
      if (!response.ok) { const body = await response.json(); throw new Error(body.message || 'No fue posible descargar el Excel.'); }
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `trazabilidad-aliados-${from || 'inicio'}-${to || 'actualidad'}.xlsx`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No fue posible descargar el Excel.'); }
    finally { setDownloading(false); }
  }

  if (denied) return null;
  return <section id="trazabilidad-aliados" className="mb-8 rounded-[28px] border border-[#cdddf0] bg-white/85 p-5 shadow-[0_18px_44px_-32px_rgba(16,54,105,.7)] md:p-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[#426da4]"><History className="h-4 w-4" /> Control de aliados</p><h2 className="mt-2 text-2xl font-bold text-[#173861]">Trazabilidad de altas, retiros y cambios</h2><p className="mt-1 text-sm text-[#607997]">Consulta quién entró, quién salió y qué aliados fueron actualizados. El historial no se borra al retirar un aliado.</p><p className="mt-1 text-xs text-[#7890aa]">Los conteos incluyen movimientos guardados desde que se activó la bitácora; los aliados cargados antes no se cuentan como altas nuevas.</p></div>
      {report?.access.canExport && <button type="button" onClick={() => void download()} disabled={downloading || loading || Boolean(from && to && from > to)} className="inline-flex items-center gap-2 rounded-xl bg-[#244f8a] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Download className="h-4 w-4" />{downloading ? 'Preparando Excel...' : 'Descargar Excel'}</button>}
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {[
        { label: 'Nuevos aliados', value: report?.summary.created ?? 0, color: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
        { label: 'Aliados retirados', value: report?.summary.deactivated ?? 0, color: 'border-red-200 bg-red-50 text-red-800' },
        { label: 'Aliados actualizados', value: report?.summary.updated ?? 0, color: 'border-amber-200 bg-amber-50 text-amber-800' },
      ].map(item => <div key={item.label} className={`rounded-2xl border p-4 ${item.color}`}><p className="text-xs font-bold uppercase tracking-wide">{item.label}</p><p className="mt-2 text-3xl font-extrabold">{item.value}</p></div>)}
    </div>
    <div className="mt-5 flex flex-wrap items-end gap-3">
      <label className="text-sm font-semibold text-[#345477]">Desde<input type="date" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }} className="mt-1 block rounded-xl border border-[#cbd9e8] bg-white px-3 py-2.5" /></label>
      <label className="text-sm font-semibold text-[#345477]">Hasta<input type="date" value={to} onChange={event => { setTo(event.target.value); setPage(1); }} className="mt-1 block rounded-xl border border-[#cbd9e8] bg-white px-3 py-2.5" /></label>
      <button type="button" onClick={() => { setFrom(''); setTo(''); setPage(1); }} className="rounded-xl border border-[#cbd9e8] px-4 py-2.5 text-sm font-semibold text-[#315d98]">Limpiar fechas</button>
      <span className="ml-auto inline-flex items-center gap-1 text-sm text-[#607997]"><Search className="h-4 w-4" />{report?.pagination.total ?? 0} movimientos</span>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dce7f4]"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-[#eef4fc] text-xs uppercase tracking-wide text-[#456688]"><tr><th className="p-3">Fecha</th><th className="p-3">Movimiento</th><th className="p-3">Aliado</th><th className="p-3">Ubicación</th><th className="p-3">Detalle</th><th className="p-3">Responsable</th></tr></thead><tbody>{report?.data.map(event => <tr key={event.id} className="border-t border-[#e8eef6]"><td className="p-3 whitespace-nowrap text-[#526b8b]">{new Date(event.date).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</td><td className="p-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status[event.type].color}`}>{status[event.type].label}</span></td><td className="p-3"><b className="text-[#173861]">{event.allyName}</b><p className="text-xs text-[#607997]">{event.loginId || `ID ${event.allyId}`}</p></td><td className="p-3 text-[#526b8b]">{[event.city, event.department].filter(Boolean).join(', ') || 'Sin ubicación'}</td><td className="p-3 text-[#526b8b]">{event.changedFields || '—'}</td><td className="p-3 text-[#526b8b]">{event.actor}</td></tr>)}</tbody></table>{loading && <p className="p-6 text-center text-[#607997]">Cargando movimientos...</p>}{!loading && !report?.data.length && <p className="p-6 text-center text-[#607997]">No hay movimientos en el período seleccionado.</p>}</div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#526b8b]"><label>Filas por página <select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }} className="ml-2 rounded-lg border border-[#cbd9e8] bg-white px-2 py-1.5"><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></label><div className="flex items-center gap-3"><button disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Anterior</button><span>Página {report?.pagination.page ?? 1} de {report?.pagination.totalPages ?? 1}</span><button disabled={loading || page >= (report?.pagination.totalPages ?? 1)} onClick={() => setPage(value => value + 1)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Siguiente</button></div></div>
  </section>;
}
