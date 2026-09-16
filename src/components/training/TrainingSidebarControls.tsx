"use client";

import { BookOpen, FlaskConical } from "lucide-react";

export default function TrainingSidebarControls({ onOpenGuide }: { onOpenGuide: () => void }) {
  if (process.env.NEXT_PUBLIC_APP_ENV !== "training") return null;

  return (
    <div className="mt-2 grid grid-cols-2 gap-2" aria-label="Herramientas del modo de prueba">
      <div role="status" className="flex min-h-12 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-100 px-2 text-[11px] font-extrabold leading-tight text-emerald-900">
        <FlaskConical className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Modo prueba activo</span>
      </div>
      <button type="button" onClick={onOpenGuide} className="flex min-h-12 items-center gap-1.5 rounded-xl border border-[#27e86d] bg-[#65ff94] px-2 text-left text-[11px] font-extrabold leading-tight text-[#073c20] shadow-[0_0_14px_rgba(49,255,118,.4)] transition hover:bg-[#8bffae] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087b3a]">
        <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>Guía paso a paso</span>
      </button>
    </div>
  );
}
