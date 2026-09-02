"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChevronRight,
  FileLock2,
  Mail,
  Save,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import {
  APPLICATION_STATUS_OPTIONS,
  type ApplicationStatus,
} from "@/config/candidates";

type Settings = {
  notificationsEnabled: boolean;
  notificationStatuses: ApplicationStatus[];
  retentionMonths: number;
};
type Smtp = { configured: boolean; sender: string };
const defaults: Settings = {
  notificationsEnabled: true,
  notificationStatuses: [...APPLICATION_STATUS_OPTIONS],
  retentionMonths: 24,
};
const flowStatusStyle: Record<
  ApplicationStatus,
  { label: string; active: string; inactive: string; dot: string }
> = {
  Recibida: {
    label: "Recibida",
    active: "border-sky-200 bg-sky-50 text-sky-700",
    inactive: "border-sky-100 bg-white text-sky-700",
    dot: "bg-sky-500",
  },
  "En revision": {
    label: "En revisión",
    active: "border-amber-200 bg-amber-50 text-amber-800",
    inactive: "border-amber-100 bg-white text-amber-800",
    dot: "bg-amber-500",
  },
  Entrevista: {
    label: "Entrevista",
    active: "border-violet-200 bg-violet-50 text-violet-700",
    inactive: "border-violet-100 bg-white text-violet-700",
    dot: "bg-violet-500",
  },
  "Prueba tecnica": {
    label: "Prueba técnica",
    active: "border-orange-200 bg-orange-50 text-orange-700",
    inactive: "border-orange-100 bg-white text-orange-700",
    dot: "bg-orange-500",
  },
  Seleccionado: {
    label: "Seleccionado",
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    inactive: "border-emerald-100 bg-white text-emerald-700",
    dot: "bg-emerald-500",
  },
  "No continua": {
    label: "No continúa",
    active: "border-red-200 bg-red-50 text-red-700",
    inactive: "border-red-100 bg-white text-red-700",
    dot: "bg-red-500",
  },
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

export default function Page() {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [smtp, setSmtp] = useState<Smtp>({
    configured: false,
    sender: "Verificando configuración...",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/vacantes/configuracion");
        const result = await response.json();
        if (!response.ok || !result.success)
          throw new Error(
            result.message || "No fue posible cargar la configuración.",
          );
        setSettings({
          ...defaults,
          ...result.data,
          notificationStatuses: Array.isArray(result.data?.notificationStatuses)
            ? result.data.notificationStatuses
            : defaults.notificationStatuses,
        });
        setSmtp(result.smtp || { configured: false, sender: "No configurado" });
      } catch (error) {
        setNotice({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "No fue posible cargar la configuración.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const activeStages = useMemo(
    () => settings.notificationStatuses.length,
    [settings.notificationStatuses],
  );
  const toggleStatus = (status: ApplicationStatus) =>
    setSettings((current) => ({
      ...current,
      notificationStatuses: current.notificationStatuses.includes(status)
        ? current.notificationStatuses.filter((item) => item !== status)
        : [...current.notificationStatuses, status],
    }));
  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/vacantes/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(
          result.message || "No fue posible guardar la configuración.",
        );
      setSettings(result.data);
      setSmtp(result.smtp || smtp);
      setNotice({
        type: "success",
        text: result.message || "Configuración guardada correctamente.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "No fue posible guardar la configuración.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#143860] via-[#24558f] to-[#7199c7] p-7 text-white shadow-[0_20px_50px_rgba(20,57,106,.22)] md:p-8">
        <div className="absolute -right-8 -top-10 h-44 w-44 rounded-full border-[18px] border-white/10" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-100">
            Talento humano
          </p>
          <h1 className="mt-2 text-3xl font-bold">Centro de control</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50">
            Configura comunicaciones, etapas y protección de la información del
            módulo de vacantes.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              <p className="mt-2 text-sm font-bold">Módulo operativo</p>
              <p className="text-xs text-blue-100">Auditoría activa</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <Mail
                className={`h-5 w-5 ${smtp.configured ? "text-emerald-300" : "text-amber-200"}`}
              />
              <p className="mt-2 text-sm font-bold">Correo SMTP</p>
              <p className="truncate text-xs text-blue-100">
                {smtp.configured ? smtp.sender : "Pendiente de configuración"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <p className="mt-2 text-sm font-bold">Trazabilidad</p>
              <p className="text-xs text-blue-100">Movimientos registrados</p>
            </div>
          </div>
        </div>
      </section>
      {notice && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-medium ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"}`}
        >
          {notice.text}
        </div>
      )}
      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-[24px] border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.07)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="rounded-xl bg-blue-50 p-3 text-primary">
                <BellRing className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-text">
                  Notificaciones automáticas
                </h2>
                <p className="mt-1 text-sm text-textLight">
                  Envía correos cuando cambia el estado del candidato.
                </p>
              </div>
            </div>
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={() =>
                setSettings((current) => ({
                  ...current,
                  notificationsEnabled: !current.notificationsEnabled,
                }))
              }
              label="Activar notificaciones automáticas"
            />
          </div>
          <div className="mt-5 rounded-xl border border-[#dbe5f3] bg-[#f8fbff] p-4">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-primary">
              Remitente
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-text">
              {smtp.sender}
            </p>
            <p
              className={`mt-1 text-xs font-medium ${smtp.configured ? "text-emerald-700" : "text-amber-700"}`}
            >
              {smtp.configured
                ? "SMTP configurado para enviar."
                : "SMTP aún no está configurado."}
            </p>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-textLight">
            <span className="font-bold text-text">
              Vista previa — No continúa:
            </span>{" "}
            “Agradecemos tu postulación. Conservaremos tu información para
            futuras vacantes que se ajusten a tu perfil.”
          </div>
        </article>
        <article className="rounded-[24px] border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.07)]">
          <div className="flex gap-3">
            <span className="rounded-xl bg-blue-50 p-3 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-text">Flujo de selección</h2>
              <p className="mt-1 text-sm text-textLight">
                Selecciona las etapas que disparan un correo automático.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {APPLICATION_STATUS_OPTIONS.map((status, index) => {
              const style = flowStatusStyle[status];
              const active = settings.notificationStatuses.includes(status);
              return (
                <div key={status} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleStatus(status)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-bold transition ${active ? style.active : style.inactive}`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${style.dot} ${active ? "" : "opacity-40"}`}
                    />
                    {style.label}
                  </button>
                  {index < APPLICATION_STATUS_OPTIONS.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-sm text-textLight">
            <span className="font-bold text-text">{activeStages} etapas</span>{" "}
            enviarán comunicación cuando las notificaciones estén activas.
          </p>
        </article>
        <article className="rounded-[24px] border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.07)]">
          <div className="flex gap-3">
            <span className="rounded-xl bg-blue-50 p-3 text-primary">
              <FileLock2 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-bold text-text">Privacidad y retención</h2>
              <p className="mt-1 text-sm text-textLight">
                Los CV permanecen visibles solo para usuarios autorizados.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="rounded-xl border border-[#dbe5f3] p-4 text-sm font-semibold text-text">
              Conservación de perfiles
              <select
                value={settings.retentionMonths}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    retentionMonths: Number(event.target.value),
                  }))
                }
                className="mt-2 w-full rounded-lg border border-[#dbe5f3] bg-white px-3 py-2 text-sm font-normal outline-none"
              >
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
                <option value={36}>36 meses</option>
                <option value={60}>60 meses</option>
              </select>
            </label>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-900">
                Eliminación lógica activa
              </p>
              <p className="mt-1 text-xs leading-5 text-emerald-800">
                Las bajas conservan su trazabilidad para auditoría.
              </p>
            </div>
          </div>
        </article>
        <article className="rounded-[24px] border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.07)]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-text">Seguridad y auditoría</h2>
                <p className="mt-1 text-sm text-textLight">
                  Cada creación, cambio de estado, notificación y eliminación
                  queda registrado con el usuario responsable.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard-vacantes/analitica"
              className="rounded-xl border border-primary px-4 py-2 text-center text-sm font-bold text-primary transition hover:bg-blue-50"
            >
              Ver reporte de auditoría
            </Link>
          </div>
        </article>
      </section>
      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="button"
          disabled={loading || saving}
          onClick={() => void save()}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar configuración"}
        </button>
      </div>
    </div>
  );
}
