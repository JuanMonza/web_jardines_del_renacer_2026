'use client';

import { useEffect, useState } from 'react';

type Application = {
    id: string;
    candidateName: string;
    candidateEmail: string;
    vacancyTitle: string;
    status: string;
    appliedAt: string;
};

export default function PostulantesAdminPanel() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [note, setNote] = useState('');
    const [candidateDetail, setCandidateDetail] = useState<Record<string, string> | null>(null);
    const [candidateHistory, setCandidateHistory] = useState<Array<{ accion:string; descripcion:string; created_at:string }>>([]);

    const updateStatus = async (id: string, status: string, notes?: string) => {
        setUpdatingId(id);
        try {
            const response = await fetch(`/api/vacantes/postulaciones/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status, notes }) });
            if (!response.ok) throw new Error();
            setApplications((current) => current.map((item) => item.id === id ? { ...item, status } : item));
        } finally { setUpdatingId(null); }
    };

    useEffect(() => {
        async function loadApplications() {
            try {
                const response = await fetch('/api/vacantes/postulaciones');
                const json = await response.json();
                if (json.success) {
                    setApplications(Array.isArray(json.data) ? json.data : []);
                } else {
                    setApplications([]);
                }
            } catch (error) {
                console.error('Error cargando postulaciones:', error);
                setApplications([]);
            } finally {
                setLoading(false);
            }
        }
        loadApplications();
    }, []);
    const filteredApplications = (applications ?? []).filter((application) => {
        const matchesSearch =
            application.candidateName
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            application.candidateEmail
                ?.toLowerCase()
                .includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === 'todos' || statusFilter === 'proceso' && ['En revision','Entrevista','Prueba tecnica'].includes(application.status) ||
            application.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    const statusCount = (status: string) => applications.filter((item) => item.status === status).length;
    return (
        <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#163c70] via-[#285a96] to-[#6e94c2] p-7 text-white shadow-[0_20px_50px_rgba(20,57,106,0.22)]">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Talento humano</p><h1 className="mt-2 text-3xl font-bold">Gestión de Postulantes</h1><p className="mt-2 text-blue-50">Centraliza candidatos, etapas y decisiones del proceso de selección.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[{ label: 'Total', value: applications.length, tone: 'text-primary', filter: 'todos' }, { label: 'Recibidas', value: statusCount('Recibida'), tone: 'text-blue-700', filter: 'Recibida' }, { label: 'En proceso', value: applications.filter((item) => ['En revision','Entrevista','Prueba tecnica'].includes(item.status)).length, tone: 'text-amber-700', filter: 'proceso' }, { label: 'Seleccionados', value: statusCount('Seleccionado'), tone: 'text-emerald-700', filter: 'Seleccionado' }].map((item) => <button type="button" key={item.label} onClick={() => setStatusFilter(item.filter)} className="rounded-2xl border border-white/80 bg-white/65 p-4 text-left shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-[11px] font-bold uppercase tracking-wider text-textLight">{item.label}</p><p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p><span className="mt-2 block text-xs font-semibold text-primary">Ver candidatos</span></button>)}</div>
            <div className="rounded-3xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-xl">
                <div className="grid md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Buscar candidato..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-border px-4 py-3"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-border px-4 py-3"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="proceso">En proceso</option>
                        <option value="Recibida">Recibida</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Entrevista">Entrevista</option>
                        <option value="Contratado">Contratado</option>
                        <option value="No seleccionado">No seleccionado</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto rounded-3xl border border-white/80 bg-white/65 shadow-sm backdrop-blur-xl">
                {loading ? (
                    <div className="py-20 text-center">
                        Cargando postulantes...
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="bg-primary/5">
                                <th className="p-4 text-left">Candidato</th>
                                <th className="p-4 text-left">Vacante</th>
                                <th className="p-4 text-left">Estado</th>
                                <th className="p-4 text-left">Fecha</th>
                                <th className="p-4 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-20 text-center text-textLight"
                                    >
                                        No hay postulaciones registradas.
                                    </td>
                                </tr>
                            ) : (
                                filteredApplications.map((application) => (
                                    <tr
                                        key={application.id}
                                        className="border-t hover:bg-primary/5 transition-colors"
                                    >
                                        <td className="p-4">
                                            <p className="font-semibold">
                                                {application.candidateName}
                                            </p>

                                            <p className="text-sm text-textLight">
                                                {application.candidateEmail}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            {application.vacancyTitle}
                                        </td>
                                        <td className="p-4">
                                            <select value={application.status} disabled={updatingId === application.id} onChange={(event) => void updateStatus(application.id, event.target.value)} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-text outline-none">
                                                <option value="Recibida">Recibida</option><option value="En revision">En revisión</option><option value="Entrevista">Entrevista</option><option value="Prueba tecnica">Prueba técnica</option><option value="Seleccionado">Seleccionado</option><option value="No continua">No continúa</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            {application.appliedAt
                                                ? new Date(application.appliedAt).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button type="button" onClick={() => { setSelectedApplication(application); setCandidateDetail(null); setCandidateHistory([]); void fetch(`/api/vacantes/postulaciones/${application.id}/candidate`).then(r=>r.json()).then(j=>{setCandidateDetail(j.data||null);setCandidateHistory(j.history||[])}); }} className="rounded-xl bg-primary px-4 py-2 text-white hover:bg-primary-hover transition-colors">
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            <details className="rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-xl"><summary className="cursor-pointer list-none text-sm font-bold text-primary">Ver embudo visual por etapas</summary><section className="mt-4 grid gap-3 md:grid-cols-3">{[['Recibida','bg-blue-50 border-blue-100'],['En revision','bg-amber-50 border-amber-100'],['Seleccionado','bg-emerald-50 border-emerald-100']].map(([stage,style])=><article key={stage} className={`rounded-2xl border p-4 ${style}`}><div className="flex items-center justify-between"><h2 className="text-sm font-bold text-text">{stage}</h2><span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-primary">{applications.filter(a=>a.status===stage).length}</span></div><div className="mt-3 space-y-2">{applications.filter(a=>a.status===stage).slice(0,3).map(a=><button type="button" onClick={()=>setSelectedApplication(a)} key={a.id} className="block w-full rounded-xl bg-white p-3 text-left text-xs shadow-sm"><span className="block font-bold text-text">{a.candidateName}</span><span className="mt-1 block truncate text-textLight">{a.vacancyTitle}</span></button>)}{applications.filter(a=>a.status===stage).length===0&&<p className="py-3 text-xs text-textLight">Sin candidatos</p>}</div></article>)}</section></details>
            {selectedApplication && <div className="fixed inset-0 z-[2147483647] flex justify-end bg-[#07182e]/45 backdrop-blur-sm" onClick={() => setSelectedApplication(null)}><aside className="h-full w-full max-w-md overflow-y-auto bg-[#f8fbff] p-7 shadow-[-20px_0_60px_rgba(4,22,52,.3)]" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Ficha de candidato</p><h2 className="mt-1 text-2xl font-bold text-text">{selectedApplication.candidateName}</h2></div><button type="button" onClick={() => setSelectedApplication(null)} className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-bold">Cerrar</button></div><div className="mt-6 space-y-4 rounded-2xl border border-border bg-white p-5 text-sm"><div><p className="text-xs font-bold uppercase text-textLight">Correo</p><p className="mt-1 font-semibold text-text">{selectedApplication.candidateEmail}</p></div><div><p className="text-xs font-bold uppercase text-textLight">Vacante</p><p className="mt-1 font-semibold text-text">{selectedApplication.vacancyTitle}</p></div><div><p className="text-xs font-bold uppercase text-textLight">Estado</p><p className="mt-1 font-semibold text-primary">{selectedApplication.status}</p></div>{candidateDetail&&<><div><p className="text-xs font-bold uppercase text-textLight">Perfil profesional</p><p className="mt-1 font-semibold text-text">{candidateDetail.profesion||'No registrado'}</p></div><div><p className="text-xs font-bold uppercase text-textLight">Ubicación</p><p className="mt-1 font-semibold text-text">{candidateDetail.ciudad||''}, {candidateDetail.departamento||''}</p></div>{candidateDetail.cv_url&&<a href={candidateDetail.cv_url} target="_blank" className="block rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white">Abrir hoja de vida</a>}</>}</div><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Nota interna para el proceso" className="mt-4 w-full rounded-xl border border-border bg-white p-3 text-sm" rows={3}/><button type="button" onClick={() => void updateStatus(selectedApplication.id, selectedApplication.status, note)} className="mt-3 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">Guardar nota en trazabilidad</button></aside></div>}
        </div>
    );
}
