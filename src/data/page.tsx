'use client';

import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sede } from '@/data/sedes';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import SedeFormModal from '@/data/SedeFormModal';
import { CONTACT_INFO } from '@/config/contact';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const DEFAULT_SEDE_IMAGE = '/logos_jr_favico.png';
const LINEA_NACIONAL = CONTACT_INFO.primaryLine.number;
const SEDES_PER_PAGE = 12;
type SedeActivity = { id: number; sede_name: string; event_type: string; admin_name: string; created_at: string };
const ACTIVITY_LABELS: Record<string, string> = { SEDE_CREATED: 'Sede creada', SEDE_UPDATED: 'Sede actualizada', SEDE_DEACTIVATED: 'Sede desactivada' };

export default function AdminSedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('todos');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [qualityFilter, setQualityFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [mapPreviewId, setMapPreviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [activity, setActivity] = useState<SedeActivity[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<Sede | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
  };

  const loadSedes = async () => {
    const response = await fetch('/api/sedes');
    const payload = await response.json() as { data?: Sede[]; message?: string };
    if (!response.ok) throw new Error(payload.message ?? 'No fue posible cargar las sedes.');
    setSedes(payload.data ?? []);
  };

  const loadActivity = async () => {
    const response = await fetch('/api/sedes/audit');
    const payload = response.ok ? await response.json() as { data?: SedeActivity[] } : { data: [] };
    setActivity(payload.data ?? []);
  };

  useEffect(() => {
    void loadSedes().catch((error) => showToast(false, error instanceof Error ? error.message : 'No fue posible cargar las sedes.'));
    void loadActivity().catch(() => setActivity([]));
  }, []);

  const filteredSedes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return sedes.filter((sede) => {
      const municipioMatches =
        selectedDepartamento === 'todos' || sede.departamento === selectedDepartamento;
      const statusMatches = selectedStatus === 'todos' || sede.estadoOperativo === selectedStatus;
      const qualityMatches = qualityFilter === 'todos'
        || (qualityFilter === 'requieren-atencion' && (!sede.fotoUrl || !sede.telefono || !sede.administradora || !sede.lat || !sede.lng))
        || (qualityFilter === 'sin-imagen' && !sede.fotoUrl)
        || (qualityFilter === 'sin-telefono' && !sede.telefono)
        || (qualityFilter === 'sin-administrador' && !sede.administradora)
        || (qualityFilter === 'sin-coordenadas' && (!sede.lat || !sede.lng));
      const queryMatches =
        !query ||
        sede.nombre.toLowerCase().includes(query) ||
        sede.ciudad.toLowerCase().includes(query) ||
        sede.departamento.toLowerCase().includes(query) ||
        sede.administradora.toLowerCase().includes(query);

      return municipioMatches && statusMatches && qualityMatches && queryMatches;
    });
  }, [sedes, searchQuery, selectedDepartamento, selectedStatus, qualityFilter]);

  const departamentos = useMemo(
    () => Array.from(new Set(sedes.map((sede) => sede.departamento))).sort((a, b) => a.localeCompare(b, 'es')),
    [sedes],
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, selectedDepartamento, selectedStatus, qualityFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredSedes.length / SEDES_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedSedes = filteredSedes.slice((safePage - 1) * SEDES_PER_PAGE, safePage * SEDES_PER_PAGE);

  const metrics = useMemo(() => ({
    active: sedes.filter((sede) => sede.estadoOperativo === 'Activa').length,
    departments: departamentos.length,
    review: sedes.filter((sede) => !sede.fotoUrl || !sede.telefono || !sede.administradora || !sede.lat || !sede.lng).length,
    incompleteCoordinates: sedes.filter((sede) => !sede.lat || !sede.lng).length,
  }), [sedes, departamentos]);
  const mapPreview = sedes.find((sede) => sede.id === mapPreviewId) ?? null;
  const mapQuery = mapPreview
    ? encodeURIComponent(mapPreview.lat && mapPreview.lng ? `${mapPreview.lat},${mapPreview.lng}` : `${mapPreview.direccion}, ${mapPreview.ciudad}, ${mapPreview.departamento}, Colombia`)
    : '';
  const activeFilters = [
    searchQuery ? { key: 'search', label: `Búsqueda: ${searchQuery}` } : null,
    selectedStatus !== 'todos' ? { key: 'status', label: selectedStatus } : null,
    selectedDepartamento !== 'todos' ? { key: 'department', label: selectedDepartamento } : null,
    qualityFilter !== 'todos' ? { key: 'quality', label: qualityFilter.replace('sin-', 'Sin ') } : null,
  ].filter((filter): filter is { key: string; label: string } => Boolean(filter));
  const clearFilter = (key: string) => {
    if (key === 'search') setSearchQuery('');
    if (key === 'status') setSelectedStatus('todos');
    if (key === 'department') setSelectedDepartamento('todos');
    if (key === 'quality') setQualityFilter('todos');
  };

  const exportSedes = () => {
    const headers = ['ID', 'Sede', 'Estado', 'Departamento', 'Ciudad', 'Dirección', 'Administradora', 'Teléfono', 'Latitud', 'Longitud', 'Imagen'];
    const quote = (value: string | number | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = filteredSedes.map((sede) => [sede.id, sede.nombre, sede.estadoOperativo ?? 'Activa', sede.departamento, sede.ciudad, sede.direccionVisible || sede.direccion, sede.administradora, sede.telefono, sede.lat, sede.lng, sede.fotoUrl]);
    const csv = `\uFEFF${headers.map(quote).join(';')}\n${rows.map((row) => row.map(quote).join(';')).join('\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = `sedes-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
    showToast(true, `Reporte exportado: ${rows.length} sedes.`);
  };

  const handleOpenModal = (sede: Sede | null) => {
    setSelectedSede(sede);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSede(null);
  };

  const handleSave = async (sedeToSave: Sede) => {
    try {
      const response = await fetch(selectedSede ? `/api/sedes/${selectedSede.id}` : '/api/sedes', { method: selectedSede ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sedeToSave) });
      const payload = await response.json() as { data?: Sede; message?: string };
      if (!response.ok || !payload.data) throw new Error(payload.message ?? 'No fue posible guardar la sede.');
      setSedes((current) => selectedSede ? current.map((item) => item.id === payload.data!.id ? payload.data! : item) : [payload.data!, ...current]);
      await loadActivity();
      if (typeof BroadcastChannel !== 'undefined') { const channel = new BroadcastChannel('jdr-sedes'); channel.postMessage({ type: 'updated' }); channel.close(); }
      handleCloseModal();
      showToast(true, selectedSede ? 'Sede actualizada correctamente.' : 'Nueva sede creada correctamente.');
    } catch (error) { showToast(false, error instanceof Error ? error.message : 'No fue posible guardar la sede.'); }
  };

  const handleDelete = (sedeId: string) => {
    setConfirmDeleteId(sedeId);
  };

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      try {
        const response = await fetch(`/api/sedes/${confirmDeleteId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('No fue posible desactivar la sede.');
        setSedes((current) => current.filter((sede) => sede.id !== confirmDeleteId));
        await loadActivity();
        if (typeof BroadcastChannel !== 'undefined') { const channel = new BroadcastChannel('jdr-sedes'); channel.postMessage({ type: 'updated' }); channel.close(); }
        showToast(true, 'Sede desactivada correctamente.');
      } catch (error) { showToast(false, error instanceof Error ? error.message : 'No fue posible desactivar la sede.'); }
    }
    setConfirmDeleteId(null);
  };

  return (
    <>
      <ConfirmDialog open={Boolean(toast)} title={toast?.ok ? 'Operación completada' : 'No fue posible completar la operación'} description={toast?.msg ?? ''} confirmLabel="Entendido" showCancel={false} variant={toast?.ok ? 'success' : 'error'} onConfirm={() => setToast(null)} onCancel={() => setToast(null)} />
      <ConfirmDialog open={Boolean(confirmDeleteId)} title="¿Desactivar sede?" description="La sede dejará de aparecer en Ubicaciones y puede recuperarse desde la base operativa." confirmLabel="Sí, desactivar" variant="danger" onCancel={() => setConfirmDeleteId(null)} onConfirm={() => void confirmDelete()} />
      {selectedDetail && createPortal(<div className="fixed inset-0 flex justify-end bg-[#07182e]/40 backdrop-blur-sm" style={{ zIndex: 2147483647 }} onClick={() => setSelectedDetail(null)} role="dialog" aria-modal="true" aria-label={`Detalle de ${selectedDetail.nombre}`}><aside className="h-full w-full max-w-lg overflow-y-auto bg-[#f8fbff] p-5 shadow-[-24px_0_70px_rgba(4,22,52,0.3)] sm:p-7" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Detalle de sede</p><h2 className="mt-1 text-2xl font-bold text-text">{selectedDetail.nombre}</h2><p className="mt-1 text-sm text-textLight">{selectedDetail.id}</p></div><button type="button" onClick={() => setSelectedDetail(null)} className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold text-textLight">Cerrar</button></div><div className="mt-6 overflow-hidden rounded-2xl border border-white bg-white shadow-sm"><img src={selectedDetail.fotoUrl || DEFAULT_SEDE_IMAGE} alt={selectedDetail.nombre} className="h-48 w-full object-cover" onError={(event) => { event.currentTarget.src = DEFAULT_SEDE_IMAGE; }} /><div className="grid grid-cols-2 gap-px bg-border"><div className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-textLight">Estado</p><p className="mt-1 font-bold text-emerald-700">{selectedDetail.estadoOperativo ?? 'Activa'}</p></div><div className="bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-textLight">Ubicación</p><p className="mt-1 text-sm font-semibold text-text">{selectedDetail.ciudad}, {selectedDetail.departamento}</p></div></div></div><dl className="mt-6 space-y-4 rounded-2xl border border-border bg-white p-5"><div><dt className="text-[10px] font-bold uppercase tracking-wider text-textLight">Dirección</dt><dd className="mt-1 text-sm font-semibold text-text">{selectedDetail.direccionVisible || selectedDetail.direccion || 'Sin dirección registrada'}</dd></div><div><dt className="text-[10px] font-bold uppercase tracking-wider text-textLight">Administradora</dt><dd className="mt-1 text-sm font-semibold text-text">{selectedDetail.administradora || 'Sin asignar'}</dd></div><div><dt className="text-[10px] font-bold uppercase tracking-wider text-textLight">Contacto</dt><dd className="mt-1 text-sm font-semibold text-text">{selectedDetail.telefono || LINEA_NACIONAL}</dd></div><div><dt className="text-[10px] font-bold uppercase tracking-wider text-textLight">Georreferenciación</dt><dd className="mt-1 text-sm font-semibold text-text">{selectedDetail.lat && selectedDetail.lng ? `${selectedDetail.lat}, ${selectedDetail.lng}` : 'Pendiente de coordenadas'}</dd></div></dl><div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => { setSelectedDetail(null); handleOpenModal(selectedDetail); }} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20">Editar sede</button><button type="button" onClick={() => { setSelectedDetail(null); setMapPreviewId(selectedDetail.id); }} className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">Ver mapa</button><button type="button" onClick={() => { setSelectedDetail(null); handleDelete(selectedDetail.id); }} className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">Desactivar sede</button></div></aside></div>, document.body)}
      <Container className="py-10">
        <section className="relative mb-7 overflow-hidden rounded-[28px] border border-[#2c5c96] px-6 py-7 text-white shadow-[0_22px_55px_rgba(26,66,119,0.24)] md:px-8" style={{ background: 'linear-gradient(125deg, #12345f 0%, #1f528f 54%, #4c7caf 100%)' }}>
          <div className="pointer-events-none absolute -right-14 -top-20 h-64 w-64 rounded-full border-[22px] border-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-24 h-28 w-28 rounded-full bg-sky-200/20 blur-2xl" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-100">Operación territorial</p><h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Gestión de Sedes</h1><p className="mt-2 max-w-xl text-sm leading-6 text-blue-50/90 md:text-base">Administra los {sedes.length} puntos de atención, su información operativa y su presencia en Ubicaciones.</p></div>
            <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-md"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100">Cobertura actual</p><p className="mt-1 text-lg font-bold">{metrics.departments} departamentos</p></div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[{ label: 'Sedes activas', value: metrics.active, tone: 'border-l-emerald-500 text-emerald-700', onClick: () => { setSelectedStatus('Activa'); setQualityFilter('todos'); } }, { label: 'Departamentos', value: metrics.departments, tone: 'border-l-blue-500 text-blue-700', onClick: () => { setSelectedDepartamento('todos'); } }, { label: 'Requieren atención', value: metrics.review, tone: 'border-l-amber-500 text-amber-700', onClick: () => { setQualityFilter('requieren-atencion'); setSelectedStatus('todos'); } }, { label: 'Sin coordenadas', value: metrics.incompleteCoordinates, tone: 'border-l-rose-500 text-rose-700', onClick: () => { setQualityFilter('sin-coordenadas'); setSelectedStatus('todos'); } }].map(({ label, value, tone, onClick }) => <button type="button" key={label} onClick={onClick} className={`rounded-2xl border border-white/80 border-l-4 ${tone} bg-white/75 p-5 text-left shadow-[0_10px_28px_rgba(35,79,132,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(35,79,132,0.16)] focus:outline-none focus:ring-2 focus:ring-primary/35`}><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-textLight">{label}</p><div className="mt-4 flex items-end justify-between"><p className="text-3xl font-bold">{value}</p><span className="text-xs font-semibold text-textLight">Ver registros</span></div></button>)}
        </section>

        <section className="mb-8 rounded-[24px] border border-white/80 bg-white/60 p-5 shadow-[0_10px_28px_rgba(35,79,132,0.08)] backdrop-blur-xl"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Control operativo</p><h2 className="mt-1 text-xl font-bold text-text">Actividad reciente</h2></div><span className="rounded-full border border-primary/10 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">Auditoría de cambios</span></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{activity.length ? activity.slice(0, 4).map((entry) => <div key={entry.id} className="group flex gap-3 rounded-2xl border border-border/70 bg-white/65 p-4 transition hover:border-primary/25 hover:bg-white"><span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" /><div className="min-w-0"><p className="text-sm font-bold text-text">{ACTIVITY_LABELS[entry.event_type] ?? entry.event_type}</p><p className="mt-1 truncate text-xs text-textLight">{entry.sede_name}</p><p className="mt-3 text-[11px] text-textLight">{entry.admin_name} · {new Date(entry.created_at).toLocaleDateString('es-CO')}</p></div></div>) : <p className="text-sm text-textLight">Los próximos cambios de sedes aparecerán aquí.</p>}</div></section>

        <section className="mb-8 rounded-[24px] border border-white/80 bg-white/60 p-4 shadow-[0_10px_28px_rgba(35,79,132,0.08)] backdrop-blur-xl"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Explorar y administrar</p><p className="mt-1 text-sm text-textLight">Filtra la operación antes de editar o exportar.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-textLight">{filteredSedes.length} resultados</span></div>{activeFilters.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-textLight">Filtros activos:</span>{activeFilters.map((filter) => <button key={filter.key} type="button" onClick={() => clearFilter(filter.key)} className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/10">{filter.label} <span aria-hidden="true">×</span></button>)}<button type="button" onClick={() => { setSearchQuery(''); setSelectedStatus('todos'); setSelectedDepartamento('todos'); setQualityFilter('todos'); }} className="px-2 text-xs font-semibold text-textLight underline underline-offset-2">Limpiar todos</button></div>}<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_210px_210px_210px] xl:items-end">
          <div className="w-full">
            <Input
              type="search"
              placeholder="Buscar por nombre, ciudad, admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full"><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-textLight">Estado</label><select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="w-full rounded-xl border border-border bg-white/75 px-4 py-3 text-sm text-text outline-none"><option value="todos">Todos</option><option value="Activa">Activas</option><option value="Cerrada temporalmente">Cerradas temporalmente</option><option value="Próxima apertura">Próximas aperturas</option><option value="En revisión">En revisión</option></select></div>
          <div className="w-full"><label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-textLight">Calidad de datos</label><select value={qualityFilter} onChange={(event) => setQualityFilter(event.target.value)} className="w-full rounded-xl border border-border bg-white/75 px-4 py-3 text-sm text-text outline-none"><option value="todos">Todo completo</option><option value="requieren-atencion">Requieren atención</option><option value="sin-imagen">Sin imagen</option><option value="sin-telefono">Sin teléfono</option><option value="sin-administrador">Sin administrador</option><option value="sin-coordenadas">Sin coordenadas</option></select></div>
          <div className="w-full">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-textLight">
              Departamento
            </label>
            <select
              value={selectedDepartamento}
              onChange={(event) => setSelectedDepartamento(event.target.value)}
              className="w-full rounded-xl border border-border bg-white/75 px-4 py-3 text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
            >
              <option value="todos">Todos</option>
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
        </div><div className="mt-4 flex flex-col gap-3 border-t border-primary/10 pt-4 sm:flex-row sm:justify-end"><Button onClick={exportSedes} variant="secondary">Descargar Excel</Button><Button onClick={() => handleOpenModal(null)} variant="primary">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nueva Sede
          </Button></div></section>

        {mapPreview && <section className="mb-8 overflow-hidden rounded-2xl border border-primary/15 bg-white/65 shadow-[0_12px_30px_rgba(35,79,132,0.1)] backdrop-blur-xl"><div className="flex flex-wrap items-start justify-between gap-4 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Verificación geográfica</p><h2 className="mt-1 text-xl font-bold text-text">{mapPreview.nombre}</h2><p className="mt-1 text-sm text-textLight">{mapPreview.direccionVisible || mapPreview.direccion || `${mapPreview.ciudad}, ${mapPreview.departamento}`}</p><p className="mt-1 text-xs text-textLight">{mapPreview.lat && mapPreview.lng ? `Coordenadas: ${mapPreview.lat}, ${mapPreview.lng}` : 'Sin coordenadas: revisa la ubicación antes de publicar.'}</p></div><button type="button" onClick={() => setMapPreviewId(null)} className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-textLight">Cerrar mapa</button></div><iframe title={`Mapa de ${mapPreview.nombre}`} src={`https://www.google.com/maps?q=${mapQuery}&output=embed`} className="h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></section>}

        <div className="overflow-x-auto rounded-2xl border border-border bg-white/60 shadow-[0_12px_30px_rgba(35,79,132,0.08)] backdrop-blur">
          <table className="min-w-[1260px] w-full table-fixed divide-y divide-border">
            <colgroup>
              <col className="w-[260px]" />
              <col className="w-[190px]" />
              <col className="w-[200px]" />
              <col className="w-[160px]" />
              <col className="w-[170px]" />
              <col className="w-[280px]" />
            </colgroup>
            <thead className="bg-black/5">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Administrador(a)
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">Estado</th>
                <th className="border-l border-border bg-[#f5f7fa] px-5 py-3 text-right text-xs font-semibold text-textLight uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {paginatedSedes.map((sede) => (
                  <motion.tr
                    key={sede.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setSelectedDetail(sede)}
                    className="cursor-pointer transition-colors hover:bg-primary/[0.025]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                            src={sede.fotoUrl || DEFAULT_SEDE_IMAGE}
                            alt={sede.nombre}
                            onError={(event) => {
                              if (event.currentTarget.dataset.fallbackApplied === 'true') {
                                return;
                              }
                              event.currentTarget.dataset.fallbackApplied = 'true';
                              event.currentTarget.src = DEFAULT_SEDE_IMAGE;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text">
                            {sede.nombre}
                          </div>
                          <div className="text-xs text-textLight">{sede.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-textLight">
                      <span className="block truncate">{sede.ciudad}, {sede.departamento}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-textLight">
                      <span className="block truncate">{sede.administradora || <span className="italic opacity-60">No asignado</span>}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-textLight">
                      <span className="block truncate" title={sede.telefono || LINEA_NACIONAL}>{sede.telefono || (
                        <span className="font-medium text-primary">{LINEA_NACIONAL}</span>
                      )}</span>
                    </td>
                    <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${sede.estadoOperativo === 'Activa' ? 'bg-emerald-500/10 text-emerald-700' : sede.estadoOperativo === 'Cerrada temporalmente' ? 'bg-rose-500/10 text-rose-700' : 'bg-amber-500/10 text-amber-700'}`}>{sede.estadoOperativo ?? 'Activa'}</span></td>
                    <td className="border-l border-border bg-[#fcfdff] px-5 py-4 text-right text-sm font-medium">
                      <div className="inline-flex min-w-max items-center gap-2" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(sede)}
                          className="whitespace-nowrap rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                        >
                          Ver detalle
                        </button>
                        <div className="relative"><button type="button" aria-label={`Más acciones para ${sede.nombre}`} aria-expanded={actionMenuId === sede.id} onClick={() => setActionMenuId((current) => current === sede.id ? null : sede.id)} className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-bold text-textLight transition hover:bg-slate-50">•••</button>{actionMenuId === sede.id && <div className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-white py-1 text-left shadow-xl"><button type="button" onClick={() => { setActionMenuId(null); handleOpenModal(sede); }} className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-primary hover:bg-primary/5">Editar sede</button><button type="button" onClick={() => { setActionMenuId(null); setMapPreviewId(sede.id); }} className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-sky-700 hover:bg-sky-50">Ver en mapa</button><button type="button" onClick={() => { setActionMenuId(null); handleDelete(sede.id); }} className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50">Desactivar</button></div>}</div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredSedes.length === 0 && <p className="px-6 py-12 text-center text-sm text-textLight">No encontramos sedes con los filtros seleccionados.</p>}
          {filteredSedes.length > 0 && <div className="flex flex-col gap-3 border-t border-border bg-white/45 px-5 py-4 text-sm md:flex-row md:items-center md:justify-between"><p className="text-textLight">Mostrando {(safePage - 1) * SEDES_PER_PAGE + 1}–{Math.min(safePage * SEDES_PER_PAGE, filteredSedes.length)} de {filteredSedes.length} sedes</p><div className="flex items-center gap-2"><button type="button" disabled={safePage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} className="rounded-lg border border-primary/20 bg-white px-3 py-1.5 font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-40">Anterior</button><span className="rounded-lg bg-primary/10 px-3 py-1.5 font-semibold text-primary">{safePage} / {totalPages}</span><button type="button" disabled={safePage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} className="rounded-lg border border-primary/20 bg-white px-3 py-1.5 font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button></div></div>}
        </div>
      </Container>

      <SedeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        sede={selectedSede}
      />

    </>
  );
}
