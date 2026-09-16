"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ApplicationFollowup from "@/components/vacantes/ApplicationFollowup";
import InternalCandidate from "@/components/vacantes/InternalCandidate";
import Link from "next/link";
import {
  Eye,
  ArrowRightLeft,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import TrainingHint from "@/components/training/TrainingHint";

type Application = {
  id: string;
  vacancyId?: string;
  candidateName: string;
  candidateEmail: string;
  candidateDocument?: string;
  city?: string;
  vacancyTitle: string;
  status: string;
  appliedAt: string;
};

export default function PostulantesAdminPanel() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [cityFilter, setCityFilter] = useState("todas");
  const [vacancyFilter, setVacancyFilter] = useState("todas");
  const [dateFilter, setDateFilter] = useState("todos");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [note, setNote] = useState("");
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    application: Application;
    status: string;
  } | null>(null);
  const [statusReason, setStatusReason] = useState("");
  const [candidateDetail, setCandidateDetail] = useState<Record<
    string,
    string
  > | null>(null);
  const [candidateHistory, setCandidateHistory] = useState<
    Array<{ accion: string; descripcion: string; created_at: string }>
  >([]);
  const [notice, setNotice] = useState<{
    title: string;
    description: string;
    variant: "success" | "error";
  } | null>(null);
  const [candidateToDelete, setCandidateToDelete] =
    useState<Application | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [availableVacancies, setAvailableVacancies] = useState<Array<{ id: string; title: string; status?: "Publicada" | "Pausada" | "Cerrada" }>>([]);
  const [transferTargetId, setTransferTargetId] = useState("");
  const [transferNotes, setTransferNotes] = useState("");
  const [transferring, setTransferring] = useState(false);

  const openCandidateDetail = (application: Application) => {
    setSelectedApplication(application);
    setCandidateDetail(null);
    setCandidateHistory([]);
    setTransferTargetId("");
    setTransferNotes("");
    void fetch(`/api/vacantes/postulaciones/${application.id}/candidate`)
      .then((response) => response.json())
      .then((result) => {
        setCandidateDetail(result.data || null);
        setCandidateHistory(result.history || []);
      });
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    setUpdatingId(id);
    let statusSaved = false;
    try {
      const response = await fetch(`/api/vacantes/postulaciones/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error();
      statusSaved = true;
      setApplications((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item)),
      );
      const target = applications.find((item) => item.id === id);
      if (target?.candidateEmail) {
        const notification = await fetch("/api/vacantes/notificar-estado", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            applicationId: target.id,
            candidateName: target.candidateName,
            candidateEmail: target.candidateEmail,
            candidateDocument: target.candidateDocument,
            vacancyTitle: target.vacancyTitle,
            trackingCode: `JDR-${target.id.padStart(6, "0")}`,
            status,
            notes,
          }),
        });
        const notificationResult = (await notification.json()) as {
          ok?: boolean;
          sent?: boolean;
          message?: string;
        };
        if (!notification.ok || !notificationResult.ok)
          throw new Error(
            notificationResult.message ||
              "El estado se guardó, pero no fue posible enviar el correo.",
          );
        if (notificationResult.sent === false) {
          setNotice({
            title: "Proceso actualizado",
            description:
              notificationResult.message ||
              "El correo automático está desactivado para esta etapa.",
            variant: "success",
          });
          return;
        }
      }
      setNotice({
        title: "Proceso actualizado y notificado",
        description:
          "El estado quedó registrado y enviamos una comunicación al correo del postulante.",
        variant: "success",
      });
    } catch (error) {
      setNotice(
        statusSaved
          ? {
              title: "Proceso actualizado; correo pendiente",
              description:
                error instanceof Error
                  ? error.message
                  : "El estado se guardó, pero no fue posible enviar el correo.",
              variant: "error",
            }
          : {
              title: "No fue posible guardar",
              description:
                "Intenta nuevamente. Si el problema continúa, verifica la conexión con la base de datos.",
              variant: "error",
            },
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteCandidate = async () => {
    if (!candidateToDelete || !deletePassword) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/vacantes/postulaciones/${candidateToDelete.id}`,
        {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ password: deletePassword }),
        },
      );
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { email?: string };
      };
      if (!response.ok || !result.success)
        throw new Error(
          result.message || "No fue posible eliminar el postulante.",
        );
      const email = result.data?.email ?? candidateToDelete.candidateEmail;
      setApplications((current) =>
        current.filter((application) => application.candidateEmail !== email),
      );
      setSelectedApplication(null);
      setCandidateToDelete(null);
      setDeletePassword("");
      setNotice({
        title: "Postulante eliminado",
        description:
          "La cuenta y sus postulaciones fueron desactivadas. La acción quedó registrada en auditoría.",
        variant: "success",
      });
    } catch (error) {
      setNotice({
        title: "No fue posible eliminar",
        description:
          error instanceof Error
            ? error.message
            : "Verifica la contraseña e intenta nuevamente.",
        variant: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    async function loadApplications() {
      try {
        const response = await fetch("/api/vacantes/postulaciones");
        const json = await response.json();
        if (json.success) {
          setApplications(Array.isArray(json.data) ? json.data : []);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("Error cargando postulaciones:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    }
    const refreshApplications = () => void loadApplications();
    refreshApplications();
    window.addEventListener("candidate-application-created", refreshApplications);
    return () => window.removeEventListener("candidate-application-created", refreshApplications);
  }, []);
  useEffect(() => {
    void Promise.all([
      fetch("/api/vacantes?admin=1", { cache: "no-store" }),
      fetch("/api/vacantes/historial", { cache: "no-store" }),
    ])
      .then(async ([activeResponse, closedResponse]) => {
        const active = await activeResponse.json();
        const closed = await closedResponse.json();
        setAvailableVacancies([
          ...(Array.isArray(active) ? active : []),
          ...((closed.data ?? []).map((item: { id: string; title: string }) => ({ id: String(item.id), title: item.title, status: "Cerrada" as const }))),
        ]);
      })
      .catch(() => setAvailableVacancies([]));
  }, []);

  const transferInternally = async () => {
    if (!selectedApplication || !transferTargetId || !transferNotes.trim()) return;
    setTransferring(true);
    try {
      const response = await fetch(`/api/vacantes/postulaciones/${selectedApplication.id}/trasladar`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetVacancyId: transferTargetId, notes: transferNotes }),
      });
      const result = await response.json() as { success?: boolean; code?: string; message?: string; data?: { vacancyTitle?: string; internalNotificationSent?: boolean } };
      if (!response.ok || !result.success) {
        if (result.code === "VACANCY_PAUSED" || result.code === "VACANCY_CLOSED") {
          setNotice({ title: result.code === "VACANCY_PAUSED" ? "Vacante pausada" : "Vacante cerrada", description: result.message || "La vacante no puede recibir el traslado.", variant: "error" });
          return;
        }
        throw new Error(result.message || "No fue posible trasladar al postulante.");
      }
      setApplications((current) => current.map((item) => item.id === selectedApplication.id ? { ...item, status: "Trasladado" } : item));
      setCandidateHistory((current) => [{ accion: "POSTULANTE_TRASLADADO_INTERNO", descripcion: `Trasladado internamente a “${result.data?.vacancyTitle || "vacante destino"}”. Sin correo automático; notificación pendiente por llamada. Observación: ${transferNotes}`, created_at: new Date().toISOString() }, ...current]);
      setTransferTargetId("");
      setTransferNotes("");
      setNotice({ title: "Traslado interno registrado", description: result.data?.internalNotificationSent ? "El postulante fue llevado a la nueva vacante sin correo automático. Se envió el aviso interno de prueba y queda pendiente notificarlo por llamada." : "El postulante fue llevado a la nueva vacante sin correo automático. La trazabilidad deja constancia de que debe notificarse por llamada; el aviso interno no pudo enviarse.", variant: "success" });
    } catch (error) {
      setNotice({ title: "No fue posible trasladar", description: error instanceof Error ? error.message : "Intenta nuevamente.", variant: "error" });
    } finally {
      setTransferring(false);
    }
  };
  useEffect(() => {
    setIsModalMounted(true);
  }, []);
  const filteredApplications = (applications ?? []).filter((application) => {
    const matchesSearch =
      application.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
      application.candidateEmail?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "proceso" &&
        ["En revision", "Entrevista", "Prueba tecnica"].includes(
          application.status,
        )) ||
      application.status === statusFilter;
    const matchesCity =
      cityFilter === "todas" || application.city === cityFilter;
    const matchesVacancy =
      vacancyFilter === "todas" || application.vacancyTitle === vacancyFilter;
    const appliedAt = new Date(application.appliedAt).getTime();
    const now = Date.now();
    const matchesDate =
      dateFilter === "todos" ||
      (dateFilter === "hoy" &&
        new Date(application.appliedAt).toDateString() ===
          new Date().toDateString()) ||
      (dateFilter === "7dias" && appliedAt >= now - 7 * 24 * 60 * 60 * 1000) ||
      (dateFilter === "30dias" && appliedAt >= now - 30 * 24 * 60 * 60 * 1000);
    return (
      matchesSearch &&
      matchesStatus &&
      matchesCity &&
      matchesVacancy &&
      matchesDate
    );
  });
  const statusCount = (status: string) =>
    applications.filter((item) => item.status === status).length;
  const cities = Array.from(
    new Set(applications.map((item) => item.city).filter(Boolean)),
  ).sort() as string[];
  const vacancyTitles = Array.from(
    new Set(applications.map((item) => item.vacancyTitle).filter(Boolean)),
  ).sort();
  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "P";
  const statusStyle: Record<
    string,
    { label: string; badge: string; dot: string }
  > = {
    Recibida: {
      label: "Recibida",
      badge: "border-sky-200 bg-sky-50 text-sky-700",
      dot: "bg-sky-500",
    },
    "En revision": {
      label: "En revisión",
      badge: "border-amber-200 bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
    },
    Entrevista: {
      label: "Entrevista",
      badge: "border-violet-200 bg-violet-50 text-violet-700",
      dot: "bg-violet-500",
    },
    "Prueba tecnica": {
      label: "Prueba técnica",
      badge: "border-orange-200 bg-orange-50 text-orange-700",
      dot: "bg-orange-500",
    },
    Seleccionado: {
      label: "Seleccionado",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    "No continua": {
      label: "No continúa",
      badge: "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
    Trasladado: {
      label: "Trasladado",
      badge: "border-violet-200 bg-violet-50 text-violet-700",
      dot: "bg-violet-500",
    },
  };
  const historyStatus = (description: string) =>
    description
      .match(/(?:Estado informado:|estado a)\s*([^.]*)/i)?.[1]
      ?.trim() || "";
  const renderStatusPill = (status: string) => {
    const style = statusStyle[status];
    if (!style)
      return (
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
          {status || "Sin estado"}
        </span>
      );
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${style.badge}`}
      >
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        {style.label}
      </span>
    );
  };
  const progress = (status: string) =>
    status === "Recibida"
      ? 1
      : status === "En revision" || status === "Prueba tecnica"
        ? 2
        : status === "Entrevista"
          ? 3
          : 4;
  return (
    <>
      <ConfirmDialog
        open={Boolean(notice)}
        title={notice?.title ?? ""}
        description={notice?.description ?? ""}
        confirmLabel="Entendido"
        showCancel={false}
        variant={notice?.variant}
        onConfirm={() => setNotice(null)}
        onCancel={() => setNotice(null)}
      />
      <div className="space-y-6">
        <InternalCandidate/>
        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#163c70] via-[#285a96] to-[#6e94c2] p-7 text-white shadow-[0_20px_50px_rgba(20,57,106,0.22)]">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
            Talento humano
          </p>
          <h1 className="mt-2 text-3xl font-bold">Gestión de Postulantes</h1>
          <p className="mt-2 text-blue-50">
            Centraliza candidatos, etapas y decisiones del proceso de selección.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            {
              label: "Total",
              value: applications.length,
              tone: "text-primary",
              filter: "todos",
            },
            {
              label: "Recibidas",
              value: statusCount("Recibida"),
              tone: "text-blue-700",
              filter: "Recibida",
            },
            {
              label: "En proceso",
              value: applications.filter((item) =>
                ["En revision", "Entrevista", "Prueba tecnica"].includes(
                  item.status,
                ),
              ).length,
              tone: "text-amber-700",
              filter: "proceso",
            },
            {
              label: "Seleccionados",
              value: statusCount("Seleccionado"),
              tone: "text-emerald-700",
              filter: "Seleccionado",
            },
          ].map((item) => (
            <TrainingHint key={item.label} text={`Muestra las postulaciones de ${item.label.toLowerCase()}. Al seleccionarlo, la tabla se filtra sin cambiar los registros.`} className="h-full">
            <button
              type="button"
              onClick={() => setStatusFilter(item.filter)}
              className="h-full w-full rounded-2xl border border-white/80 bg-white/65 p-4 text-left shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-textLight">
                {item.label}
              </p>
              <p className={`mt-2 text-3xl font-bold ${item.tone}`}>
                {item.value}
              </p>
              <span className="mt-2 block text-xs font-semibold text-primary">
                Ver candidatos
              </span>
            </button>
            </TrainingHint>
          ))}
        </div>
        <div className="sticky top-3 z-20 rounded-3xl border border-[#dbe5f3] bg-white p-5 shadow-[0_12px_30px_rgba(32,69,113,.12)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <SlidersHorizontal size={17} />
              </span>
              <div>
                <h2 className="font-bold text-text">Filtros de selección</h2>
                <p className="text-xs text-textLight">
                  {filteredApplications.length} resultado(s) de{" "}
                  {applications.length}
                </p>
              </div>
            </div>
            <TrainingHint text="Quita los filtros de texto, estado, ciudad, vacante y fecha para volver a ver todas las postulaciones.">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("todos");
                setCityFilter("todas");
                setVacancyFilter("todas");
                setDateFilter("todos");
              }}
              className="text-sm font-bold text-primary underline underline-offset-4"
            >
              Limpiar filtros
            </button>
            </TrainingHint>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <TrainingHint text="Escribe parte del nombre o correo del candidato para reducir la tabla mientras escribes."><label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-textLight" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border py-3 pl-10 pr-4 outline-none focus:border-primary"
              />
            </label></TrainingHint>
            <TrainingHint text="Filtra por la etapa actual del proceso: recibida, revisión, entrevista, prueba, selección o no continúa."><select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            >
              <option value="todos">Todos los estados</option>
              <option value="proceso">En proceso</option>
              <option value="Recibida">Recibida</option>
              <option value="En revision">En revisión</option>
              <option value="Entrevista">Entrevista</option>
              <option value="Prueba tecnica">Prueba técnica</option>
              <option value="Seleccionado">Seleccionado</option>
              <option value="No continua">No continúa</option>
            </select></TrainingHint>
            <TrainingHint text="Muestra solo candidatos de la ciudad seleccionada."><select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            >
              <option value="todas">Todas las ciudades</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select></TrainingHint>
            <TrainingHint text="Muestra únicamente las personas postuladas a una vacante concreta."><select
              value={vacancyFilter}
              onChange={(e) => setVacancyFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            >
              <option value="todas">Todas las vacantes</option>
              {vacancyTitles.map((vacancy) => (
                <option key={vacancy} value={vacancy}>
                  {vacancy}
                </option>
              ))}
            </select></TrainingHint>
            <TrainingHint text="Limita los resultados a postulaciones recibidas hoy, en los últimos 7 días o en los últimos 30 días."><select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:border-primary"
            >
              <option value="todos">Cualquier fecha</option>
              <option value="hoy">Hoy</option>
              <option value="7dias">Últimos 7 días</option>
              <option value="30dias">Últimos 30 días</option>
            </select></TrainingHint>
          </div>
        </div>
        <div className="overflow-x-auto rounded-3xl border border-[#dbe5f3] bg-white shadow-[0_10px_28px_rgba(32,69,113,.08)]">
          {loading ? (
            <div className="py-20 text-center">Cargando postulantes...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#f5f8fd] text-xs uppercase tracking-wider text-textLight">
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
                    <td colSpan={5} className="py-16 text-center">
                      <UserRound className="mx-auto h-9 w-9 text-primary/50" />
                      <p className="mt-3 font-bold text-text">
                        Aún no hay postulantes para mostrar
                      </p>
                      <p className="mt-1 text-sm text-textLight">
                        Publica una vacante o ajusta los filtros para continuar.
                      </p>
                      <Link
                        href="/dashboard-vacantes/vacantes"
                        className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white"
                      >
                        Publicar una vacante
                      </Link>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr
                      key={application.id}
                      className="border-t border-[#edf2f8] transition-colors hover:bg-[#f7faff]"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf1fb] text-sm font-bold text-primary">
                            {initials(application.candidateName)}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-text">
                              {application.candidateName}
                            </p>
                            <p className="truncate text-sm text-textLight">
                              {application.candidateEmail}
                            </p>
                            {application.city && (
                              <p className="mt-0.5 text-xs font-semibold text-primary/75">
                                {application.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-text">
                          {application.vacancyTitle}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          {[1, 2, 3, 4].map((step) => (
                            <span
                              key={step}
                              className={`h-1.5 w-7 rounded-full ${step <= progress(application.status) ? "bg-primary" : "bg-slate-200"}`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-textLight">
                          Recibida · Revisión · Entrevista · Decisión
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <TrainingHint text="Selecciona la nueva etapa del postulante. Antes de guardar, deberás escribir el motivo; el movimiento quedará en el historial y podrá generar correo según la configuración.">
                          <select
                            value={application.status}
                            disabled={updatingId === application.id}
                            onChange={(event) => {
                              const status = event.target.value;
                              if (status === application.status) return;
                              setPendingStatusChange({ application, status });
                              setStatusReason("");
                            }}
                            className={`block rounded-full border px-3 py-2 text-xs font-bold outline-none ${statusStyle[application.status]?.badge || "border-slate-200 bg-white text-text"}`}
                          >
                            <option value="Recibida">Recibida</option>
                            <option value="En revision">En revisión</option>
                            <option value="Entrevista">Entrevista</option>
                            <option value="Prueba tecnica">
                              Prueba técnica
                            </option>
                            <option value="Seleccionado">Seleccionado</option>
                            <option value="No continua">No continúa</option>
                          </select>
                          </TrainingHint>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-textLight">
                        {application.appliedAt
                          ? new Date(application.appliedAt).toLocaleDateString(
                              "es-CO",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <TrainingHint text="Abre la ficha para consultar los datos, hoja de vida, seguimiento y movimientos de esta postulación.">
                          <button
                            type="button"
                            aria-label={`Ver ${application.candidateName}`}
                            onClick={() => openCandidateDetail(application)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-hover"
                          >
                            <Eye size={17} />
                          </button>
                          </TrainingHint>
                          <TrainingHint text="Abre la ficha para trasladar internamente a esta persona a otra vacante publicada. Se debe registrar la observación y realizar la llamada; no se envía correo al postulante.">
                          <button
                            type="button"
                            aria-label={`Trasladar ${application.candidateName}`}
                            title="Trasladar a otra vacante"
                            onClick={() => openCandidateDetail(application)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-700 transition hover:bg-violet-100"
                          >
                            <ArrowRightLeft size={16} />
                          </button>
                          </TrainingHint>
                          <TrainingHint text="Solicita la baja lógica de esta cuenta y sus postulaciones activas. Exige contraseña y deja auditoría; úsalo solo cuando corresponda.">
                          <button
                            type="button"
                            aria-label={`Eliminar ${application.candidateName}`}
                            onClick={() => {
                              setCandidateToDelete(application);
                              setDeletePassword("");
                            }}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                          </TrainingHint>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {pendingStatusChange && (
          <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#07182e]/55 p-4 backdrop-blur-sm"
            onClick={() => setPendingStatusChange(null)}
          >
            <section
              className="w-full max-w-lg rounded-[28px] border border-white/80 bg-[#f8fbff] p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
                Trazabilidad del proceso
              </p>
              <h2 className="mt-2 text-xl font-bold text-text">
                Registrar cambio de etapa
              </h2>
              <p className="mt-2 text-sm leading-6 text-textLight">
                <strong>{pendingStatusChange.application.candidateName}</strong>{" "}
                pasará a{" "}
                <strong>
                  {statusStyle[pendingStatusChange.status]?.label ||
                    pendingStatusChange.status}
                </strong>
                . Explica el motivo: quedará en el historial, auditoría y Excel.
              </p>
              <TrainingHint text="Escribe una razón concreta y respetuosa para el cambio de etapa: evidencia revisada, resultado de entrevista o motivo de la decisión. Quedará en historial, auditoría y Excel.">
              <textarea
                autoFocus
                value={statusReason}
                onChange={(event) => setStatusReason(event.target.value)}
                rows={4}
                placeholder="Ej.: Cumple el perfil comercial y la experiencia requerida; se agenda entrevista con RR. HH."
                className="mt-5 w-full rounded-xl border border-border bg-white p-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              </TrainingHint>
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs leading-5 text-primary">
                Esta observación es obligatoria para conservar una trazabilidad
                clara.
              </div>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPendingStatusChange(null)}
                  className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-bold text-textLight"
                >
                  Cancelar
                </button>
                <TrainingHint text="Confirma el cambio de etapa y guarda la observación. El correo se intentará enviar si esta etapa tiene notificación habilitada.">
                <button
                  type="button"
                  disabled={!statusReason.trim() || updatingId !== null}
                  onClick={() => {
                    const change = pendingStatusChange;
                    setPendingStatusChange(null);
                    void updateStatus(
                      change.application.id,
                      change.status,
                      statusReason,
                    );
                  }}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Guardar y notificar
                </button>
                </TrainingHint>
              </div>
            </section>
          </div>
        )}
        {candidateToDelete && (
          <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#07182e]/55 p-4 backdrop-blur-sm"
            onClick={() => !deleting && setCandidateToDelete(null)}
          >
            <section
              className="w-full max-w-md rounded-[28px] border border-white/80 bg-[#f8fbff] p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-xl font-bold text-red-700">
                !
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[.16em] text-red-600">
                Acción restringida
              </p>
              <h2 className="mt-1 text-xl font-bold text-text">
                Eliminar postulante
              </h2>
              <p className="mt-3 text-sm leading-6 text-textLight">
                Eliminarás la cuenta de{" "}
                <strong>{candidateToDelete.candidateName}</strong> y todas sus
                postulaciones activas. Los datos no se borran físicamente: la
                acción queda registrada para auditoría.
              </p>
              <TrainingHint text="Introduce tu contraseña administrativa para confirmar la baja lógica. No se borra la trazabilidad histórica de la acción."><label className="mt-5 block text-sm font-bold text-text">
                Confirma tu contraseña de administrador
                <input
                  autoFocus
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-red-300"
                  placeholder="Tu contraseña"
                />
              </label></TrainingHint>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    setCandidateToDelete(null);
                    setDeletePassword("");
                  }}
                  className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-bold text-textLight"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={deleting || !deletePassword}
                  onClick={() => void deleteCandidate()}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting ? "Eliminando..." : "Eliminar y registrar acción"}
                </button>
              </div>
            </section>
          </div>
        )}
        {isModalMounted &&
          selectedApplication &&
          createPortal(
            <div
              className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#07182e]/55 p-4 backdrop-blur-sm"
              onClick={() => setSelectedApplication(null)}
            >
              <section
                className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[30px] border border-[#dbe5f3] bg-[#f8fbff] shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <header className="flex shrink-0 items-start justify-between border-b border-[#dbe5f3] bg-white px-6 py-5 md:px-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
                      Ficha de candidato
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-text">
                      {selectedApplication.candidateName}
                    </h2>
                    <p className="mt-1 text-sm text-textLight">
                      {selectedApplication.vacancyTitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold"
                  >
                    Cerrar
                  </button>
                </header>
                <div className="grid overflow-y-auto p-6 md:grid-cols-[1.05fr_.95fr] md:gap-6 md:p-8">
                  <ApplicationFollowup key={selectedApplication.id} id={selectedApplication.id} />
                  <div className="space-y-4 rounded-2xl border border-border bg-white p-5 text-sm">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase text-textLight">
                          Correo
                        </p>
                        <p className="mt-1 break-all font-semibold text-text">
                          {selectedApplication.candidateEmail}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-textLight">
                          Estado
                        </p>
                        <div className="mt-2">
                          {renderStatusPill(selectedApplication.status)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-textLight">
                          Título o profesión
                        </p>
                        <p className="mt-1 font-semibold text-text">
                          {candidateDetail?.profesion || "No registrado"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-textLight">
                          Ubicación
                        </p>
                        <p className="mt-1 font-semibold text-text">
                          {candidateDetail?.ciudad || "No registrada"}
                          {candidateDetail?.departamento
                            ? `, ${candidateDetail.departamento}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    {candidateDetail?.cv_url && (
                      <TrainingHint text="Abre la hoja de vida adjunta por el postulante para revisar formación y experiencia antes de tomar una decisión.">
                      <a
                        href={candidateDetail.cv_url}
                        target="_blank"
                        className="mt-2 block rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white"
                      >
                        Abrir hoja de vida
                      </a>
                      </TrainingHint>
                    )}
                    <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                      <div className="flex items-start gap-2">
                        <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-violet-700" />
                        <div>
                          <p className="text-sm font-bold text-violet-950">Traslado interno a otra vacante</p>
                          <p className="mt-1 text-xs leading-5 text-violet-800">No envía correo al postulante. Úsalo después de revisar su perfil y realizar la llamada de notificación.</p>
                        </div>
                      </div>
                      <TrainingHint text="Selecciona una vacante publicada diferente de la actual. Las pausadas y cerradas aparecen para consulta, pero no aceptan traslados.">
                      <select
                        value={transferTargetId}
                        onChange={(event) => setTransferTargetId(event.target.value)}
                        className="mt-3 w-full rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-violet-300"
                      >
                        <option value="">Selecciona vacante destino</option>
                        {availableVacancies
                          .filter((vacancy) => vacancy.id !== selectedApplication.vacancyId)
                          .map((vacancy) => <option key={vacancy.id} value={vacancy.id} disabled={vacancy.status === "Pausada" || vacancy.status === "Cerrada"}>{vacancy.title}{vacancy.status === "Pausada" ? " · Pausada" : vacancy.status === "Cerrada" ? " · Cerrada" : " · Publicada"}</option>)}
                      </select>
                      </TrainingHint>
                      <p className="mt-2 text-xs text-violet-800">Las vacantes pausadas y cerradas aparecen como referencia, pero no permiten recibir traslados.</p>
                      <TrainingHint text="Explica la revisión del perfil y deja constancia de la llamada de notificación. El traslado es interno y no genera correo automático al postulante.">
                      <textarea
                        value={transferNotes}
                        onChange={(event) => setTransferNotes(event.target.value)}
                        rows={3}
                        placeholder="Observación obligatoria: revisión del perfil y llamada realizada..."
                        className="mt-3 w-full rounded-xl border border-violet-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                      />
                      </TrainingHint>
                      <TrainingHint text="Registra una nueva postulación interna a la vacante destino y conserva el origen, responsable y observación en auditoría.">
                      <button
                        type="button"
                        disabled={transferring || !transferTargetId || !transferNotes.trim()}
                        onClick={() => void transferInternally()}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ArrowRightLeft size={16} />
                        {transferring ? "Trasladando..." : "Trasladar sin notificar por correo"}
                      </button>
                      </TrainingHint>
                    </div>
                    <TrainingHint text="Escribe información interna útil para el seguimiento, sin cambiar el estado del postulante.">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Nota interna para el proceso"
                      className="mt-5 w-full rounded-xl border border-border bg-[#fbfdff] p-3 text-sm"
                      rows={4}
                    />
                    </TrainingHint>
                    <TrainingHint text="Añade la nota al historial y a la auditoría sin mover a la persona de etapa.">
                    <button
                      type="button"
                      onClick={() =>
                        void updateStatus(
                          selectedApplication.id,
                          selectedApplication.status,
                          note,
                        )
                      }
                      className="mt-3 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"
                    >
                      Guardar nota en trazabilidad
                    </button>
                    </TrainingHint>
                  </div>
                  <section className="mt-5 rounded-2xl border border-border bg-white p-5 md:mt-0">
                    <TrainingHint text="Aquí ves cada movimiento registrado con su fecha, responsable, estado y observación. Es el historial de esta postulación, no de otras vacantes.">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary">
                      Historial del proceso
                    </p>
                    </TrainingHint>
                    <div className="mt-4 space-y-3">
                      {candidateHistory.length ? (
                        candidateHistory.map((item, index) => {
                          const status = historyStatus(item.descripcion || "");
                          return (
                            <article
                              key={`${item.created_at}-${index}`}
                              className="border-l-2 border-primary/30 pl-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-bold text-text">
                                  {item.accion.replaceAll("_", " ")}
                                </p>
                                {status && renderStatusPill(status)}
                              </div>
                              <p className="mt-1 text-xs leading-5 text-textLight">
                                {item.descripcion || "Sin detalle."}
                              </p>
                              <p className="mt-1 text-[11px] text-primary">
                                {item.created_at
                                  ? new Date(item.created_at).toLocaleString(
                                      "es-CO",
                                    )
                                  : ""}
                              </p>
                            </article>
                          );
                        })
                      ) : (
                        <p className="text-sm text-textLight">
                          Cargando movimientos o sin historial disponible.
                        </p>
                      )}
                    </div>
                  </section>
                </div>
              </section>
            </div>,
            document.body,
          )}
      </div>
    </>
  );
}
