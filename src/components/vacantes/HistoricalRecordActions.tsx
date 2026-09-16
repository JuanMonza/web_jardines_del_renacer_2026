"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import HistoricalEdit from "@/components/vacantes/HistoricalEdit";
import TrainingHint from "@/components/training/TrainingHint";

export default function HistoricalRecordActions({ id, rawData, onSaved }: { id: number; rawData: string; onSaved: () => void }) {
  const [destination, setDestination] = useState("");
  const [targetVacancyId, setTargetVacancyId] = useState("");
  const [vacancies, setVacancies] = useState<{ id: string; title: string; status?: string }[]>([]);
  const [assignedVacancyId, setAssignedVacancyId] = useState("");
  const [candidateDocument, setCandidateDocument] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  let fields: Record<string, unknown> = {};
  try { fields = JSON.parse(rawData || "{}"); } catch {}
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_ENV !== "training") return;
    let active = true;
    void Promise.all([fetch("/api/vacantes?admin=1", { cache: "no-store" }), fetch(`/api/vacantes/historial-hv/editar?id=${id}`, { cache: "no-store" })]).then(async ([vacancyResponse, profileResponse]) => {
      if (!vacancyResponse.ok || !profileResponse.ok) throw new Error();
      const data = await vacancyResponse.json();
      const profile = await profileResponse.json();
      if (active) {
        setVacancies(Array.isArray(data) ? data.filter((item: { status?: string }) => item.status === "Publicada") : []);
        setCandidateDocument(String(profile.documento || "").replace(/\D/g, ""));
        setCandidateEmail(String(profile.correo || ""));
      }
    }).catch(() => { if (active) setMessage("No fue posible cargar las vacantes o el contacto del perfil."); });
    return () => { active = false; };
  }, [id]);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/vacantes/historial-hv/traslado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, destination, targetVacancyId, candidateDocument, candidateEmail, notes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMessage(result.applicationId
        ? `Postulación creada en “${result.vacancyTitle}” y vinculada al historial. ${result.internalNotificationSent ? "Gestión Humana recibió el aviso interno." : "El aviso interno quedó pendiente."}`
        : result.internalNotificationSent
          ? "Traslado registrado en el historial y la auditoría. Gestión Humana fue notificada por correo."
          : "Traslado registrado en el historial y la auditoría. El aviso interno por correo quedó pendiente.");
      setAssignedVacancyId(result.applicationId ? targetVacancyId : "");
      setDestination(""); setTargetVacancyId(""); setNotes(""); onSaved();
    } catch (error) { setMessage(error instanceof Error ? error.message : "No fue posible guardar."); }
    finally { setBusy(false); }
  }
  return <div className="mt-6 space-y-6">
    <HistoricalEdit id={id} onSaved={onSaved}/>
    <section><h3 className="font-bold text-primary">Información completa del registro</h3>
      {Object.entries(fields).map(([label, value]) => <div key={label} className="mt-3 rounded-xl border border-border bg-white p-4">
        <p className="text-xs font-bold uppercase text-textLight">{label}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{String(value ?? "")}</p>
      </div>)}
      {!Object.keys(fields).length && <p className="mt-2 text-sm">Vuelve a importar el archivo para completar las notas de este registro.</p>}
    </section>
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4">
      <h3 className="font-bold text-violet-900">{process.env.NEXT_PUBLIC_APP_ENV === "training" ? "Trasladar a una vacante activa" : "Registrar cambio de cargo"}</h3>
      <p className="text-sm">{process.env.NEXT_PUBLIC_APP_ENV === "training" ? "Creará una postulación en la vacante seleccionada y conservará el historial anterior. No enviará correo automático a la persona; avísale por llamada." : "Se añadirá un movimiento con el origen de esta ficha, el destino y el motivo."}</p>
      {process.env.NEXT_PUBLIC_APP_ENV === "training" ? <TrainingHint text="Elige una vacante publicada. Las pausadas y cerradas no reciben traslados. Al guardar, la persona aparecerá en las postulaciones de esa vacante para continuar el proceso."><label className="block text-sm">Vacante destino<select required value={targetVacancyId} onChange={event=>setTargetVacancyId(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3"><option value="">Seleccionar vacante activa</option>{vacancies.map(vacancy=><option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>)}</select></label></TrainingHint>
        : <TrainingHint text="Escribe el nuevo cargo al que se trasladó esta persona, tal como debe quedar en su historial."><label className="block text-sm">Cargo destino<input required maxLength={255} value={destination} onChange={e => setDestination(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label></TrainingHint>}
      {process.env.NEXT_PUBLIC_APP_ENV === "training"&&<div className="grid gap-3 sm:grid-cols-2">
        <TrainingHint text="Confirma la cédula de la ficha histórica. Si falta o está mal, corrígela antes de crear la postulación; no se duplicará una cuenta con esta cédula."><label className="block text-sm">Cédula<input required inputMode="numeric" minLength={6} maxLength={20} pattern="[0-9]{6,20}" value={candidateDocument} onChange={event=>setCandidateDocument(event.target.value.replace(/\D/g,""))} className="mt-1 w-full rounded-lg border bg-white p-3" /></label></TrainingHint>
        <TrainingHint text="Confirma un correo real para el perfil. No se enviará un correo automático por este traslado; el equipo deberá notificar por llamada."><label className="block text-sm">Correo del perfil<input required type="email" maxLength={180} value={candidateEmail} onChange={event=>setCandidateEmail(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-3" /></label></TrainingHint>
      </div>}
      <TrainingHint text="Explica por qué se realizó el cambio y quién lo acordó. Esta observación queda vinculada al movimiento y a la auditoría."><label className="block text-sm">Motivo y observaciones<textarea required maxLength={10000} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label></TrainingHint>
      <TrainingHint text="Guarda el traslado y su observación. En capacitación se crea una postulación en la vacante activa sin borrar el historial de origen; se intentará enviar un aviso solo al equipo interno."><button disabled={busy} className="rounded-lg bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Guardando..." : process.env.NEXT_PUBLIC_APP_ENV === "training" ? "Trasladar a vacante" : "Registrar traslado"}</button></TrainingHint>
      <p role="status" className="text-sm">{message}</p>
      {assignedVacancyId&&<Link href={`/dashboard-vacantes/vacantes?vacancy=${encodeURIComponent(assignedVacancyId)}`} className="inline-flex rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-bold text-violet-800">Ver postulaciones de la vacante</Link>}
    </form>
  </div>;
}
