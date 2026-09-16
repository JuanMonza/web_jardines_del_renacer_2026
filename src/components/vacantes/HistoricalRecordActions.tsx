"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HistoricalEdit from "@/components/vacantes/HistoricalEdit";
import TrainingHint from "@/components/training/TrainingHint";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const normalizeTitle = (value: string) => value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function HistoricalRecordActions({ id, rawData, status, onSaved }: { id: number; rawData: string; status: string; onSaved: () => void }) {
  const fields = useMemo<Record<string, unknown>>(() => {
    try { return JSON.parse(rawData || "{}"); } catch { return {}; }
  }, [rawData]);
  const pendingHistoricalTransfer = status === "Trasladado" && Boolean(fields["Cargo destino"]) && !fields["ID postulación"];
  const [targetVacancyId, setTargetVacancyId] = useState("");
  const [vacancies, setVacancies] = useState<{ id: string; title: string; city?: string; department?: string; status?: string }[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [profileVersion, setProfileVersion] = useState(0);
  const [assignedVacancyId, setAssignedVacancyId] = useState(/^\d+$/.test(String(fields["ID vacante"] || "")) ? String(fields["ID vacante"]) : "");
  const [candidateName, setCandidateName] = useState("");
  const [candidateDocument, setCandidateDocument] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [notes, setNotes] = useState(pendingHistoricalTransfer ? String(fields["Motivo"] || "") : "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([fetch("/api/vacantes?admin=1", { cache: "no-store" }), fetch(`/api/vacantes/historial-hv/editar?id=${id}`, { cache: "no-store" })]).then(async ([vacancyResponse, profileResponse]) => {
      if (!vacancyResponse.ok || !profileResponse.ok) throw new Error();
      const data = await vacancyResponse.json();
      const profile = await profileResponse.json();
      if (active) {
        const available = Array.isArray(data) ? data.filter((item: { status?: string }) => item.status === "Publicada") : [];
        setVacancies(available);
        if (pendingHistoricalTransfer) {
          const destination = normalizeTitle(String(fields["Cargo destino"]));
          const match = available.find((item: { title: string }) => normalizeTitle(item.title) === destination);
          if (match) setTargetVacancyId(current => current || match.id);
        }
        setCandidateName(String(profile.nombre || ""));
        setCandidateDocument(String(profile.documento || "").replace(/\D/g, ""));
        setCandidateEmail(String(profile.correo || ""));
      }
    }).catch(() => { if (active) { setHasError(true); setMessage("No fue posible cargar las vacantes o el contacto del perfil. Cierra y vuelve a abrir la ficha."); } })
      .finally(() => { if (active) setLoadingVacancies(false); });
    return () => { active = false; };
  }, [id, profileVersion, fields, pendingHistoricalTransfer]);
  async function submitTransfer() {
    if (busy) return;
    setConfirmTransfer(false);
    setBusy(true); setMessage(""); setHasError(false);
    try {
      const response = await fetch("/api/vacantes/historial-hv/traslado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, targetVacancyId, candidateDocument, candidateEmail, notes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMessage(`${result.linkedExistingTransfer ? "Traslado histórico vinculado" : "Postulación creada"} en “${result.vacancyTitle}”. Ya aparece entre las postulaciones de la vacante. ${result.internalNotificationSent ? "Gestión Humana recibió el aviso interno." : "El aviso interno quedó pendiente."}`);
      setAssignedVacancyId(targetVacancyId);
      setTargetVacancyId(""); setNotes(""); onSaved();
    } catch (error) { setHasError(true); setMessage(error instanceof Error ? error.message : "No fue posible guardar."); }
    finally { setBusy(false); }
  }
  const selectedVacancy = vacancies.find(vacancy => vacancy.id === targetVacancyId);
  return <div className="mt-6 space-y-6">
    <ConfirmDialog open={confirmTransfer} title="Confirmar traslado a vacante" description={`Se creará una postulación para ${candidateName || "esta persona"} (C.C. ${candidateDocument}) en “${selectedVacancy?.title || "la vacante seleccionada"}”. El historial anterior quedará intacto y se avisará solo al equipo interno.`} confirmLabel="Confirmar traslado" variant="info" onConfirm={() => void submitTransfer()} onCancel={() => setConfirmTransfer(false)} />
    <HistoricalEdit id={id} onSaved={() => { onSaved(); setProfileVersion(version => version + 1); }}/>
    <section><h3 className="font-bold text-primary">Información completa del registro</h3>
      {Object.entries(fields).map(([label, value]) => <div key={label} className="mt-3 rounded-xl border border-border bg-white p-4">
        <p className="text-xs font-bold uppercase text-textLight">{label}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{String(value ?? "")}</p>
      </div>)}
      {!Object.keys(fields).length && <p className="mt-2 text-sm">Vuelve a importar el archivo para completar las notas de este registro.</p>}
    </section>
    <form onSubmit={event => { event.preventDefault(); setConfirmTransfer(true); }} className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <h3 className="font-bold text-violet-900">Trasladar a una vacante activa</h3>
      <p className="text-sm">Selecciona la vacante publicada donde continuarás el proceso. Se conservará el historial anterior y no se enviará un correo automático al postulante; notifícale por llamada.</p>
      {pendingHistoricalTransfer && <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">Este cambio de cargo quedó solo en el historial. Confirma la vacante destino, la cédula y el correo para vincularlo a una postulación sin repetir el movimiento histórico.</p>}
      {assignedVacancyId && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Este registro ya está vinculado a una postulación. Puedes abrirla con el enlace inferior.</p>}
      <TrainingHint text="Elige una vacante publicada. Las pausadas y cerradas no reciben traslados. Al guardar, la persona aparecerá en las postulaciones de esa vacante para continuar el proceso."><label className="block text-sm">Vacante destino<select required disabled={loadingVacancies || busy || !vacancies.length} value={targetVacancyId} onChange={event=>setTargetVacancyId(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3 disabled:opacity-60"><option value="">Seleccionar vacante activa</option>{vacancies.map(vacancy=><option key={vacancy.id} value={vacancy.id}>{vacancy.title}{vacancy.city ? ` · ${vacancy.city}` : ""}{vacancy.department ? `, ${vacancy.department}` : ""}</option>)}</select></label></TrainingHint>
      {!loadingVacancies && !vacancies.length && <p className="text-sm text-amber-800">No hay vacantes publicadas disponibles. Publica o reanuda una vacante antes de trasladar.</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <TrainingHint text="Confirma la cédula de la ficha histórica. Si falta o está mal, corrígela antes de crear la postulación; no se duplicará una cuenta con esta cédula."><label className="block text-sm">Cédula<input required inputMode="numeric" minLength={6} maxLength={20} pattern="[0-9]{6,20}" value={candidateDocument} onChange={event=>setCandidateDocument(event.target.value.replace(/\D/g,""))} className="mt-1 w-full rounded-lg border bg-white p-3" /></label></TrainingHint>
        <TrainingHint text="Confirma el correo de la ficha. No se enviará un mensaje automático por el traslado; el equipo deberá notificar por llamada."><label className="block text-sm">Correo del perfil<input required type="email" maxLength={180} value={candidateEmail} onChange={event=>setCandidateEmail(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3" /></label></TrainingHint>
      </div>
      <TrainingHint text="Explica por qué se realizó el cambio y quién lo acordó. Esta observación queda vinculada al movimiento y a la auditoría."><label className="block text-sm">Motivo y observaciones<textarea required maxLength={10000} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label></TrainingHint>
      <TrainingHint text="Confirma el traslado. Se creará una postulación en la vacante seleccionada sin borrar el historial de origen; se intentará enviar un aviso solo al equipo interno."><button disabled={busy || loadingVacancies || !vacancies.length} className="rounded-lg bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Guardando..." : "Trasladar a vacante"}</button></TrainingHint>
      {message && <p role="status" className={`rounded-lg border px-3 py-2 text-sm ${hasError ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{message}</p>}
      {assignedVacancyId&&<Link href={`/dashboard-vacantes/vacantes?vacancy=${encodeURIComponent(assignedVacancyId)}`} className="inline-flex rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-bold text-violet-800">Ver postulaciones de la vacante</Link>}
    </form>
  </div>;
}
