"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Archive, ArrowRightLeft, CheckCircle2, ChevronDown, Copy, FileText, Loader2, Search, Users, X } from "lucide-react";
import type { JobVacancy } from "@/config/vacancies";
import TrainingHint from "@/components/training/TrainingHint";
import ScreenDialog from "@/components/ui/ScreenDialog";

type Application = {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  status: string;
  observation: string | null;
  appliedAt: string;
};
type ClosedVacancy = JobVacancy & {
  closedAt: string;
  applications: Application[];
};

const statusTone: Record<string, string> = {
  Contratado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "No seleccionado": "bg-red-50 text-red-700 border-red-200",
  "En revisión": "bg-amber-50 text-amber-800 border-amber-200",
  "Entrevista RH": "bg-violet-50 text-violet-700 border-violet-200",
  "Prueba técnica": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function VacancyHistoryPage() {
  const [vacancies, setVacancies] = useState<ClosedVacancy[]>([]);
  const [activeVacancies, setActiveVacancies] = useState<JobVacancy[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState<{ application: Application; sourceVacancy: ClosedVacancy } | null>(null);
  const [targetVacancyId, setTargetVacancyId] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; title: string; text: string } | null>(null);

  const loadHistory = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes/historial`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "No fue posible cargar el historial.");
    setVacancies(result.data ?? []);
  };

  useEffect(() => {
    void Promise.all([
      loadHistory(),
      fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes?admin=1`, { cache: "no-store" })
        .then(response => response.ok ? response.json() : [])
        .then(result => setActiveVacancies(Array.isArray(result) ? result.filter(item => item.status === "Publicada") : [])),
    ])
      .catch(() => setVacancies([]))
      .finally(() => setLoading(false));
  }, []);

  const openTransfer = (application: Application, sourceVacancy: ClosedVacancy) => {
    setTransfer({ application, sourceVacancy });
    setTargetVacancyId("");
    setTransferNotes("");
    setNotice(null);
  };

  const submitTransfer = async () => {
    if (!transfer || !targetVacancyId || transferNotes.trim().length < 5 || transferring) return;
    setTransferring(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes/postulaciones/${transfer.application.id}/trasladar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetVacancyId, notes: transferNotes.trim() }),
      });
      const result = await response.json() as { success?: boolean; message?: string; data?: { vacancyTitle?: string; internalNotificationSent?: boolean } };
      if (!response.ok || !result.success) throw new Error(result.message || "No fue posible trasladar al postulante.");
      await loadHistory();
      setTransfer(null);
      setNotice({
        tone: "success",
        title: "Postulante trasladado",
        text: `${transfer.application.name} quedó registrado en “${result.data?.vacancyTitle || "la nueva vacante"}”. El proceso anterior permanece en el historial y la acción quedó auditada.`,
      });
    } catch (error) {
      setNotice({ tone: "error", title: "No fue posible trasladar", text: error instanceof Error ? error.message : "Intenta nuevamente." });
    } finally {
      setTransferring(false);
    }
  };
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vacancies;
    return vacancies.filter(
      (vacancy) =>
        vacancy.title.toLowerCase().includes(query) ||
        vacancy.city.toLowerCase().includes(query) ||
        vacancy.applications.some(
          (application) =>
            application.name.toLowerCase().includes(query) ||
            application.document.includes(query) ||
            application.email.toLowerCase().includes(query),
        ),
    );
  }, [vacancies, search]);
  return (
    <div className="space-y-6 p-5 md:p-8">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#173f73] via-[#315d98] to-[#79a2d0] p-7 text-white shadow-[0_20px_50px_rgba(20,57,106,.22)]">
        <Archive className="absolute -bottom-8 -right-4 h-40 w-40 text-white/10" />
        <p className="relative text-xs font-bold uppercase tracking-[.18em] text-blue-100">
          Archivo operativo
        </p>
        <h1 className="relative mt-2 text-3xl font-bold">
          Historial de vacantes
        </h1>
        <p className="relative mt-2 max-w-2xl text-sm leading-6 text-blue-50">
          Consulta vacantes cerradas y el detalle de cada postulación conservada
          para trazabilidad.
        </p>
      </section>
      <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
        {notice && <div role="status" className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 ${notice.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-red-200 bg-red-50 text-red-900"}`}>
          {notice.tone === "success" ? <CheckCircle2 className="mt-0.5 shrink-0" size={20}/> : <span className="font-black">!</span>}
          <div><p className="font-bold">{notice.title}</p><p className="mt-1 text-sm">{notice.text}</p></div>
        </div>}
        <TrainingHint text="Busca entre vacantes cerradas por cargo, ciudad, nombre, cédula o correo de una persona postulada. El archivo original no se modifica."><label className="relative block">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-textLight" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar vacante, nombre, documento o correo..."
            className="w-full rounded-xl border border-border py-3 pl-10 pr-4 outline-none focus:border-primary"
          />
        </label></TrainingHint>
        <p className="mt-3 text-sm text-textLight">
          {visible.length} vacante(s) cerrada(s). El historial no se elimina.
        </p>
        <div className="mt-5 space-y-4">
          {loading ? (
            <p className="py-10 text-center text-textLight">
              Cargando historial...
            </p>
          ) : (
            visible.map((vacancy) => {
              const isExpanded = expanded === vacancy.id;
              const selected = vacancy.applications.filter(
                (item) => item.status === "Contratado",
              ).length;
              return (
                <article
                  key={vacancy.id}
                  className="overflow-hidden rounded-2xl border border-[#dbe5f3] bg-[#fbfdff]"
                >
                  <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <TrainingHint text="Despliega la vacante cerrada para consultar quiénes se postularon, sus estados finales, observaciones y fechas." className="min-w-0 flex-1">
                  <button type="button" onClick={() => setExpanded(isExpanded ? null : vacancy.id)} className="flex w-full min-w-0 items-center justify-between gap-4 text-left">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.15em] text-primary">
                        Cerrada ·{" "}
                        {new Date(vacancy.closedAt).toLocaleDateString("es-CO")}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-text">
                        {vacancy.title}
                      </h2>
                      <p className="mt-1 text-sm text-textLight">
                        {vacancy.city}, {vacancy.department} ·{" "}
                        {vacancy.applications.length} postulación(es) ·{" "}
                        {selected} seleccionado(s)
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-primary transition ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  </TrainingHint>
                  <TrainingHint text="Copia los datos de esta vacante cerrada a un formulario nuevo y editable. El proceso histórico queda intacto."><Link href={`/dashboard-vacantes/vacantes?reuse=${encodeURIComponent(vacancy.id)}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary bg-white px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-blue-50"><Copy size={16}/>Usar como nueva</Link></TrainingHint>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-[#dbe5f3] bg-white p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
                        <Users size={16} className="text-primary" /> Postulantes
                        de esta vacante
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-sm">
                          <thead className="bg-[#f5f8fd] text-xs uppercase tracking-wider text-textLight">
                            <tr>
                              <th className="p-3">Postulante</th>
                              <th className="p-3">Documento</th>
                              <th className="p-3">Contacto</th>
                              <th className="p-3">Estado final</th>
                              <th className="p-3">Observación</th>
                              <th className="p-3">Fecha</th>
                              <th className="p-3 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vacancy.applications.map((application) => (
                              <tr
                                key={application.id}
                                className="border-t border-[#edf2f8]"
                              >
                                <td className="p-3 font-bold text-text">
                                  {application.name}
                                </td>
                                <td className="p-3">
                                  {application.document || "No registrado"}
                                </td>
                                <td className="p-3">
                                  <p>{application.email}</p>
                                  <p className="mt-1 text-xs text-textLight">
                                    {application.phone || "No registrado"}
                                  </p>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone[application.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                                  >
                                    {application.status}
                                  </span>
                                </td>
                                <td className="max-w-xs p-3 text-textLight">
                                  {application.observation || "Sin observación"}
                                </td>
                                <td className="p-3 text-textLight">
                                  {new Date(
                                    application.appliedAt,
                                  ).toLocaleDateString("es-CO")}
                                </td>
                                <td className="p-3 text-center">
                                  <TrainingHint text="Traslada este mismo perfil a otra vacante publicada. El proceso cerrado no se borra y el movimiento queda registrado en la trazabilidad.">
                                    <button type="button" onClick={() => openTransfer(application, vacancy)} className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800 transition hover:bg-violet-100">
                                      <ArrowRightLeft size={15}/> Trasladar
                                    </button>
                                  </TrainingHint>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
          {!loading && !visible.length && (
            <div className="rounded-2xl border border-dashed border-[#c8d8ee] p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-primary/50" />
              <p className="mt-3 font-bold text-text">
                No hay vacantes cerradas para mostrar
              </p>
            </div>
          )}
        </div>
      </section>
      {transfer && <ScreenDialog ariaLabel="Trasladar postulante a otra vacante" onClose={() => !transferring && setTransfer(null)}>
        <section onClick={event => event.stopPropagation()} className="relative w-full max-w-xl overflow-hidden rounded-[30px] border border-white/80 bg-white/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-primary to-sky-400"/>
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-violet-700">Movimiento interno</p><h2 className="mt-2 text-2xl font-bold text-text">Trasladar a otra vacante</h2></div>
            <button type="button" disabled={transferring} onClick={() => setTransfer(null)} className="rounded-xl border border-border bg-white p-2 text-textLight disabled:opacity-50"><X size={19}/></button>
          </div>
          <div className="mt-5 rounded-2xl border border-[#dbe5f3] bg-[#f5f8fd]/80 p-4">
            <p className="font-bold text-text">{transfer.application.name}</p>
            <p className="mt-1 text-sm text-textLight">C.C. {transfer.application.document} · desde “{transfer.sourceVacancy.title}”</p>
          </div>
          {notice?.tone === "error" && <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><p className="font-bold">{notice.title}</p><p className="mt-1">{notice.text}</p></div>}
          <label className="mt-5 block text-sm font-bold text-text">Vacante destino
            <select autoFocus value={targetVacancyId} onChange={event => setTargetVacancyId(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
              <option value="">Seleccionar vacante publicada</option>
              {activeVacancies.filter(item => String(item.id) !== String(transfer.sourceVacancy.id)).map(item => <option key={item.id} value={item.id}>{item.title} · {item.city}</option>)}
            </select>
          </label>
          {!activeVacancies.length && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">No hay vacantes publicadas disponibles para recibir el traslado.</p>}
          <label className="mt-5 block text-sm font-bold text-text">Observación del traslado
            <textarea value={transferNotes} maxLength={1000} onChange={event => setTransferNotes(event.target.value)} rows={4} placeholder="Ej.: El perfil también cumple los requisitos de la nueva vacante. Se confirmó disponibilidad por llamada." className="mt-2 w-full resize-none rounded-xl border border-border bg-white p-4 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"/>
          </label>
          <p className="mt-2 text-xs leading-5 text-textLight">La vacante anterior y sus observaciones se conservarán. Se creará una nueva postulación y el movimiento quedará en auditoría.</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" disabled={transferring} onClick={() => setTransfer(null)} className="rounded-xl border border-border bg-white px-5 py-3 font-bold text-text disabled:opacity-50">Cancelar</button>
            <button type="button" disabled={transferring || !targetVacancyId || transferNotes.trim().length < 5} onClick={() => void submitTransfer()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-lg disabled:opacity-50">{transferring?<><Loader2 className="animate-spin" size={18}/>Trasladando...</>:<><ArrowRightLeft size={18}/>Confirmar traslado</>}</button>
          </div>
        </section>
      </ScreenDialog>}
    </div>
  );
}
