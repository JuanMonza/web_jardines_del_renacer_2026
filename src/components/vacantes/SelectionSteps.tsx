"use client";
import { FOLLOWUP_FIELDS, selectionSteps, type FollowupKey } from "@/config/selection-followup";
export default function SelectionSteps({ value, onChange }: { value?: FollowupKey[]; onChange: (value: FollowupKey[]) => void }) {
  const selected = selectionSteps(value);
  return <fieldset className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
    <legend className="px-2 font-bold text-primary">Seguimiento de selección</legend>
    <p className="mb-3 text-sm">Marca los apartados que deberá completar el equipo en la ficha de cada postulación.</p>
    <div className="grid gap-3 sm:grid-cols-2">{Object.entries(FOLLOWUP_FIELDS).map(([key,label]) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(key as FollowupKey)} onChange={e=>onChange(e.target.checked ? [...selected,key as FollowupKey] : selected.filter(item=>item!==key))}/>{label}</label>)}</div>
  </fieldset>;
}
