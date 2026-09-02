"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  Clock3,
  Plus,
  Users,
} from "lucide-react";

type Application = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  vacancyTitle: string;
  status: string;
  appliedAt: string;
};
type Vacancy = {
  id: string;
  title: string;
  city: string;
  applicationCount?: number;
};
type Audit = { createdAt: string; action: string; description: string };
const date = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeZone: "America/Bogota",
});
function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "P"
  );
}
function auditLabel(action: string) {
  return (
    (
      {
        VACANTE_CREADA: "Vacante creada",
        VACANTE_ACTUALIZADA: "Vacante editada",
        VACANTE_ELIMINADA: "Vacante cerrada",
        POSTULANTE_ELIMINADO: "Postulante eliminado",
        POSTULANTE_NOTIFICADO: "Correo enviado",
        POSTULACION_ESTADO_ACTUALIZADO: "Seguimiento actualizado",
      } as Record<string, string>
    )[action] || action.replaceAll("_", " ")
  );
}
const statusSummaryStyle: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  Recibida: {
    label: "Recibidas",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
    dot: "bg-sky-500",
  },
  "En revision": {
    label: "En revisión",
    badge: "border-amber-200 bg-amber-50 text-amber-800",
    dot: "bg-amber-500",
  },
  Entrevista: {
    label: "Entrevistas",
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "bg-violet-500",
  },
  "Prueba tecnica": {
    label: "Pruebas técnicas",
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    dot: "bg-orange-500",
  },
  Seleccionado: {
    label: "Seleccionados",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  "No continua": {
    label: "No continúan",
    badge: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
};

export default function VacantesDashboardOverview() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [adminName, setAdminName] = useState("Administrador");
  useEffect(() => {
    void Promise.all([
      fetch("/api/vacantes/postulaciones"),
      fetch("/api/vacantes"),
      fetch("/api/vacantes/auditoria"),
      fetch("/api/iam/admin/session"),
    ])
      .then(
        async ([
          applicationsResponse,
          vacanciesResponse,
          auditResponse,
          sessionResponse,
        ]) => {
          const appData = await applicationsResponse.json();
          const auditData = await auditResponse.json();
          const sessionData = await sessionResponse.json();
          setApplications(appData.data ?? []);
          setVacancies(await vacanciesResponse.json());
          setAudit(auditData.data ?? []);
          setAdminName(sessionData.user?.name || "Administrador");
        },
      )
      .catch(() => undefined);
  }, []);
  const metrics = useMemo(
    () => ({
      active: vacancies.length,
      today: applications.filter(
        (item) =>
          new Date(item.appliedAt).toDateString() === new Date().toDateString(),
      ).length,
      review: applications.filter((item) => item.status === "En revision")
        .length,
      interviews: applications.filter((item) => item.status === "Entrevista")
        .length,
      closed: applications.filter(
        (item) =>
          item.status === "Seleccionado" || item.status === "No continua",
      ).length,
    }),
    [applications, vacancies],
  );
  const attention = applications
    .filter((item) => item.status === "Recibida")
    .slice(0, 4);
  const withoutMovement = vacancies
    .filter((item) => !item.applicationCount)
    .slice(0, 3);
  const statusSummary = Object.entries(statusSummaryStyle).map(
    ([status, style]) => ({
      ...style,
      value: applications.filter((item) => item.status === status).length,
    }),
  );
  return (
    <div className="space-y-6 p-5 md:p-8">
      <section className="relative overflow-hidden rounded-[30px] bg-[#173f73] p-7 text-white shadow-[0_22px_55px_rgba(20,57,106,.24)] md:p-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[22px] border-white/10" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-blue-100">
              Talento humano · Centro de control
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Hola, {adminName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">
              Aquí tienes el estado del proceso de selección y las acciones que
              necesitan atención.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard-vacantes/vacantes"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#173f73] shadow-sm"
            >
              <Plus size={17} /> Crear vacante
            </Link>
            <Link
              href="/dashboard-vacantes/postulantes"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white"
            >
              <Users size={17} /> Ver postulantes
            </Link>
            <Link
              href="/dashboard-vacantes/analitica"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm font-bold text-white"
            >
              <BarChart3 size={17} /> Analítica
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          [
            "Vacantes activas",
            metrics.active,
            BriefcaseBusiness,
            "text-[#1d4e89]",
          ],
          ["Nuevas hoy", metrics.today, Bell, "text-blue-700"],
          ["En revisión", metrics.review, Clock3, "text-amber-700"],
          ["Entrevistas", metrics.interviews, Users, "text-violet-700"],
          [
            "Procesos cerrados",
            metrics.closed,
            ClipboardCheck,
            "text-emerald-700",
          ],
        ].map(([label, value, Icon, tone]) => {
          const CardIcon = Icon as typeof BriefcaseBusiness;
          return (
            <article
              key={label as string}
              className="rounded-2xl border border-[#dbe5f3] bg-white p-5 shadow-[0_10px_28px_rgba(32,69,113,.08)]"
            >
              <CardIcon className={`h-5 w-5 ${tone as string}`} />
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                {label as string}
              </p>
              <p className={`mt-1 text-3xl font-bold ${tone as string}`}>
                {value as number}
              </p>
            </article>
          );
        })}
      </section>
      <section className="rounded-3xl border border-[#dbe5f3] bg-white p-5 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#315d98]">
              Semáforo del proceso
            </p>
            <h2 className="mt-1 text-lg font-bold text-text">
              Resumen por estado
            </h2>
          </div>
          <Link
            href="/dashboard-vacantes/postulantes"
            className="text-sm font-bold text-primary"
          >
            Gestionar procesos
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {statusSummary.map((item) => (
            <article
              key={item.label}
              className={`rounded-2xl border p-4 ${item.badge}`}
            >
              <span className="flex items-center gap-2 text-xs font-bold">
                <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                {item.label}
              </span>
              <p className="mt-3 text-3xl font-bold">{item.value}</p>
            </article>
          ))}
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#315d98]">
                Prioridad de hoy
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-800">
                Requieren atención
              </h2>
            </div>
            <Link
              href="/dashboard-vacantes/postulantes"
              className="text-sm font-bold text-[#315d98]"
            >
              Ver todos <ArrowRight className="inline h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {attention.length ? (
              attention.map((item) => (
                <Link
                  key={item.id}
                  href="/dashboard-vacantes/postulantes"
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf1fb] text-sm font-bold text-[#315d98]">
                    {initials(item.candidateName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-slate-800">
                      {item.candidateName}
                    </strong>
                    <span className="block truncate text-xs text-slate-500">
                      {item.vacancyTitle}
                    </span>
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    Nueva
                  </span>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#c8d8ee] bg-[#f7faff] p-6 text-center">
                <ClipboardCheck className="mx-auto h-7 w-7 text-[#315d98]" />
                <p className="mt-2 font-bold text-slate-700">
                  Todo está al día
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  No hay postulaciones nuevas pendientes de revisión.
                </p>
              </div>
            )}
          </div>
          {withoutMovement.length > 0 && (
            <div className="mt-5 rounded-2xl bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-900">
                Vacantes sin movimiento
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {withoutMovement.map((item) => item.title).join(" · ")}
              </p>
            </div>
          )}
        </section>
        <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-[#315d98]">
                Trazabilidad
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-800">
                Últimos movimientos
              </h2>
            </div>
            <Link
              href="/dashboard-vacantes/analitica"
              className="text-sm font-bold text-[#315d98]"
            >
              Ver Excel
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {audit.slice(0, 5).map((item, index) => (
              <article
                key={`${item.createdAt}-${index}`}
                className="border-l-2 border-[#b7cdea] pl-4"
              >
                <p className="text-sm font-bold text-slate-700">
                  {auditLabel(item.action)}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                  {item.description || "Movimiento histórico sin detalle."}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[#315d98]">
                  {date.format(new Date(item.createdAt))}
                </p>
              </article>
            ))}
            {!audit.length && (
              <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                Los movimientos realizados aparecerán aquí.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
