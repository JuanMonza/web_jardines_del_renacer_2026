"use client";

import { FlaskConical } from "lucide-react";

export default function TrainingEnvironmentBanner() {
  if (process.env.NEXT_PUBLIC_APP_ENV !== "training") return null;
  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[2147483000] sm:bottom-5 sm:right-5" role="status" aria-label="Modo prueba activo">
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-100/95 px-3 py-2 text-emerald-950 shadow-[0_12px_35px_-12px_rgba(5,100,45,.35)] backdrop-blur-md sm:px-4 sm:py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <FlaskConical className="h-4 w-4" />
        </span>
        <p className="text-[11px] font-extrabold uppercase tracking-[.12em] sm:text-xs">Modo prueba activo</p>
      </div>
    </div>
  );
}
