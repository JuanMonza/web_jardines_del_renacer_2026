"use client";
import { useState } from "react";
import HistoricalEdit from "@/components/vacantes/HistoricalEdit";

export default function HistoricalRecordActions({ id, rawData, onSaved }: { id: number; rawData: string; onSaved: () => void }) {
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  let fields: Record<string, unknown> = {};
  try { fields = JSON.parse(rawData || "{}"); } catch {}
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/vacantes/historial-hv/traslado", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, destination, notes }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setMessage("Traslado registrado en el historial y la auditoría."); setDestination(""); setNotes(""); onSaved();
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
      <h3 className="font-bold text-violet-900">Registrar cambio de cargo</h3>
      <p className="text-sm">Se añadirá un movimiento con el origen de esta ficha, el destino y el motivo.</p>
      <label className="block text-sm">Cargo destino<input required maxLength={255} value={destination} onChange={e => setDestination(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <label className="block text-sm">Motivo y observaciones<textarea required maxLength={10000} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label>
      <button disabled={busy} className="rounded-lg bg-violet-700 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Guardando..." : "Registrar traslado"}</button>
      <p role="status" className="text-sm">{message}</p>
    </form>
  </div>;
}
