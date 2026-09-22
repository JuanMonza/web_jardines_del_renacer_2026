"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Gift,
  LockKeyhole,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserRoundCheck,
  X,
} from "lucide-react";
import TrainingHint from "@/components/training/TrainingHint";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

type Winner = {
  id: number;
  posicion: number;
  nombre: string;
  numero_contrato: string;
  validado: boolean;
};
type Sorteo = {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_sorteo: string;
  premio: string | null;
  ganadores_esperados: number;
  imagen: string | null;
  terminos_url: string | null;
  live_visualizaciones: number | null;
  live_plataformas: string | null;
  estado: string;
  deleted_at: string | null;
  participantes: { total: number; habilitados: number };
  ganadores: Winner[];
  trazabilidad: {
    accion: string;
    detalle: string | null;
    created_at: string;
    administrador: string | null;
  }[];
};
const empty = {
  titulo: "",
  descripcion: "",
  fechaSorteo: "",
  premio: "",
  ganadoresEsperados: "1",
  estado: "BORRADOR",
  terminosUrl: "",
  liveVisualizaciones: "",
  livePlataformas: "",
  imagen: null as string | null,
};
function readImage(
  event: ChangeEvent<HTMLInputElement>,
  done: (value: string) => void,
) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 2_000_000) {
    alert("La imagen debe ser JPG, PNG o WEBP y pesar máximo 2 MB.");
    return;
  }
  const r = new FileReader();
  r.onload = () => done(String(r.result));
  r.readAsDataURL(file);
}
const emptyWinner = {
  id: null as number | null,
  nombre: "",
  numeroContrato: "",
};
type WinnerDraft = typeof emptyWinner;
type Notice = {
  title: string;
  description: string;
  variant: "success" | "error" | "info";
};
export default function DashboardSorteosPage() {
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Sorteo | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [winnerFor, setWinnerFor] = useState<Sorteo | null>(null);
  const [winnerForm, setWinnerForm] = useState(emptyWinner);
  const [additionalWinners, setAdditionalWinners] = useState<WinnerDraft[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Sorteo | null>(null);
  const [winnerDeleteTarget, setWinnerDeleteTarget] = useState<{
    sorteo: Sorteo;
    winner: Winner;
  } | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [detail, setDetail] = useState<Sorteo | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [showTrash, setShowTrash] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [adminPassword, setAdminPassword] = useState("");
  const [reportFrom, setReportFrom] = useState("");
  const [reportTo, setReportTo] = useState("");
  const [reportMonth, setReportMonth] = useState("");
  const [exporting, setExporting] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/admin/sorteos?includeDeleted=1`);
      const p = await r.json();
      if (!r.ok) throw Error(p.message);
      setSorteos(p.data);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "No fue posible cargar los incentivos.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const visibleSorteos = sorteos.filter((s) => !s.deleted_at);
  const active = visibleSorteos.filter((s) =>
    ["PROGRAMADO", "CERRADO", "PAUSADO"].includes(s.estado),
  ).length;
  const participants = visibleSorteos.reduce(
    (n, s) => n + s.participantes.habilitados,
    0,
  );
  const filteredSorteos = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("es");
    return sorteos.filter((s) => {
      if (showTrash !== Boolean(s.deleted_at)) return false;
      if (statusFilter === "ACTIVOS" && !["PROGRAMADO","PAUSADO","CERRADO"].includes(s.estado)) return false;
      if (!['TODOS','ACTIVOS'].includes(statusFilter) && s.estado !== statusFilter) return false;
      return !normalized || `${s.titulo} ${s.premio || ""}`.toLocaleLowerCase("es").includes(normalized);
    });
  }, [search, showTrash, sorteos, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredSorteos.length / pageSize));
  const paginatedSorteos = filteredSorteos.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [search, statusFilter, showTrash, pageSize]);
  const request = async (action: string, body: Record<string, unknown>) => {
    setMessage("");
    const r = await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/admin/sorteos`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const p = await r.json();
    if (!r.ok) {
      setNotice({ title: "No fue posible completar la acción", description: p.message || "Revisa la información e intenta nuevamente.", variant: "error" });
      return false;
    }
    setSorteos(p.data);
    return true;
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const wasEditing = Boolean(editing);
    if (await request("save", { id: editing?.id, ...form, adminPassword })) {
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      setAdminPassword("");
      setNotice({
        title: wasEditing
          ? "Sorteo actualizado con éxito"
          : "Sorteo creado con éxito",
        description: wasEditing
          ? "La información y la imagen del sorteo quedaron actualizadas."
          : "El nuevo sorteo quedó guardado y listo para continuar su gestión.",
        variant: "success",
      });
    }
  };
  const saveWinner = async (event: FormEvent) => {
    event.preventDefault();
    if (!winnerFor) return;
    const drafts = [winnerForm, ...additionalWinners].filter(
      (winner) => winner.nombre.trim() && winner.numeroContrato.trim(),
    );
    let saved = 0;
    for (const winner of drafts) {
      const ok = await request("winner", {
        sorteoId: winnerFor.id,
        winnerId: winner.id,
        nombre: winner.nombre,
        numeroContrato: winner.numeroContrato,
        adminPassword,
      });
      if (!ok) return;
      saved += 1;
    }
    if (saved > 0) {
      setWinnerFor(null);
      setWinnerForm(emptyWinner);
      setAdditionalWinners([]);
      setAdminPassword("");
      setNotice({
        title: saved > 1 ? "Ganadores guardados con éxito" : "Ganador guardado con éxito",
        description: `${saved > 1 ? `${saved} ganadores quedaron registrados` : "El ganador quedó registrado"}. Valida la información antes de publicarla.`,
        variant: "success",
      });
    }
  };
  const validate = async (s: Sorteo) => {
    if (await request("validate", { id: s.id, sorteoId: s.id }))
      setNotice({
        title: "Validado y publicado con éxito",
        description: "Los ganadores confirmados ya pueden mostrarse en la página pública.",
        variant: "success",
      });
  };
  const removeWinner = async (s: Sorteo, winner: Winner) => {
    const removed = await request("remove_winner", {
        sorteoId: s.id,
        winnerId: winner.id,
        adminPassword,
      });
    if (removed) {
      setWinnerDeleteTarget(null);
      setAdminPassword("");
      setNotice({
        title: "Ganador retirado",
        description: `${winner.nombre} fue retirado del sorteo. Los demás ganadores se conservaron.`,
        variant: "success",
      });
    }
  };
  const removeSorteo = async (s: Sorteo) => {
    if (await request("delete", { id: s.id, adminPassword })) {
      setDeleteTarget(null);
      setAdminPassword("");
      setNotice({
        title: "Sorteo eliminado",
        description: `“${s.titulo}” dejó de mostrarse en el panel y en la página pública.`,
        variant: "success",
      });
    }
  };
  const updateStatus = async (s: Sorteo, estado: string) => {
    if (await request("status", { id: s.id, estado }))
      setNotice({ title: "Estado actualizado", description: `“${s.titulo}” ahora está ${estado.toLocaleLowerCase("es")}.`, variant: "success" });
  };
  const restoreSorteo = async (s: Sorteo) => {
    if (await request("restore", { id: s.id }))
      setNotice({ title: "Sorteo recuperado", description: `“${s.titulo}” volvió como borrador.`, variant: "success" });
  };
  const downloadReport = async () => {
    if (reportFrom && reportTo && reportFrom > reportTo) {
      setNotice({ title: "Rango de fechas inválido", description: "La fecha inicial no puede ser posterior a la fecha final.", variant: "error" });
      return;
    }
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (reportFrom) params.set("from", reportFrom);
      if (reportTo) params.set("to", reportTo);
      const response = await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/admin/sorteos/reporte?${params}`, { cache: "no-store" });
      if (!response.ok) throw Error((await response.json()).message || "No fue posible generar el informe.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `informe-mercadeo-${reportFrom || "inicio"}-${reportTo || "actual"}.xlsx`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ title: "Informe descargado", description: "El Excel incluye resumen, sorteos, ganadores, datos del live y trazabilidad.", variant: "success" });
    } catch (error) {
      setNotice({ title: "Excel no generado", description: error instanceof Error ? error.message : "Intenta nuevamente.", variant: "error" });
    } finally { setExporting(false); }
  };
  const selectReportMonth = (value: string) => {
    setReportMonth(value);
    if (!value) return;
    const [year, month] = value.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    setReportFrom(`${value}-01`);
    setReportTo(`${value}-${String(lastDay).padStart(2, "0")}`);
  };
  return (
    <div className="p-5 md:p-8">
      <TrainingHint text="Aquí ves cuántos incentivos, participantes y ganadores existen. Nuevo incentivo crea una actividad ficticia con fecha, premio, términos e imagen." className="block">
      <section className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white/80 via-white/55 to-[#dceafb]/65 p-6 shadow-[0_22px_65px_-45px_rgba(12,57,117,.8)] backdrop-blur-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#436da7]">
          Promoción transparente
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#173c70] md:text-5xl">
              Mercadeo
            </h1>
            <p className="mt-2 max-w-2xl text-[#5d7698]">
              Administra la programación, registro directo, validación y
              publicación de ganadores con trazabilidad.
            </p>
          </div>
          <TrainingHint
            text="Crea un incentivo o sorteo nuevo. Podrás definir nombre, premio, fecha, estado, descripción, términos e imagen."
            className="inline-flex"
          >
          <button
            onClick={() => {
              setEditing(null);
              setForm(empty);
              setAdminPassword("");
              setShowForm(true);
            }}
            className="rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white shadow-lg shadow-[#234d8d]/25"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Nuevo incentivo
          </button>
          </TrainingHint>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="Incentivos activos" value={active} onClick={()=>{setShowTrash(false);setStatusFilter("ACTIVOS");document.getElementById("sorteos")?.scrollIntoView({behavior:"smooth"});}} />
          <Metric label="Registros de participación" value={participants} onClick={()=>{setShowTrash(false);setStatusFilter("TODOS");document.getElementById("sorteos")?.scrollIntoView({behavior:"smooth"});}} />
          <Metric
            label="Ganadores publicados"
            value={visibleSorteos.filter((s) => s.estado === "PUBLICADO").length}
            onClick={()=>{setShowTrash(false);setStatusFilter("PUBLICADO");document.getElementById("sorteos")?.scrollIntoView({behavior:"smooth"});}}
          />
        </div>
      </section>
      </TrainingHint>
      <section className="mt-5 grid gap-4 rounded-[24px] border border-white/80 bg-white/70 p-5 shadow-sm backdrop-blur-xl xl:grid-cols-[1fr_auto]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#557aa8]">Consulta operativa</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <label className="relative min-w-[16rem] flex-1">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-[#6d88aa]" />
              <input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Buscar sorteo o premio" className="w-full rounded-xl border border-[#cbdcf3] bg-white py-3 pl-10 pr-3 text-sm" />
            </label>
            <select value={statusFilter} onChange={(event)=>setStatusFilter(event.target.value)} className="rounded-xl border border-[#cbdcf3] bg-white px-4 py-3 text-sm font-semibold text-[#31547d]">
              {["TODOS","ACTIVOS","BORRADOR","PROGRAMADO","PAUSADO","CERRADO","PUBLICADO","CANCELADO"].map(value=><option key={value} value={value}>{value === "TODOS" ? "Todos los estados" : value}</option>)}
            </select>
            <button type="button" onClick={()=>setShowTrash(value=>!value)} className={`rounded-xl border px-4 py-3 text-sm font-bold ${showTrash?"border-rose-300 bg-rose-50 text-rose-700":"border-[#cbdcf3] bg-white text-[#31547d]"}`}>
              <Trash2 className="mr-1.5 inline h-4 w-4" />{showTrash?"Ver activos":"Papelera"}
            </button>
          </div>
        </div>
        <label className="self-end text-sm font-bold text-[#31547d]">Mostrar
          <select value={pageSize} onChange={(event)=>setPageSize(Number(event.target.value))} className="ml-2 rounded-xl border border-[#cbdcf3] bg-white px-3 py-3 font-normal">
            {[10,25,50,100].map(value=><option key={value}>{value}</option>)}
          </select>
        </label>
      </section>
      <section className="mt-5 rounded-[24px] border border-[#cbdcf3] bg-gradient-to-r from-white to-[#edf5ff] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#557aa8]">Informe mensual o por período</p>
            <h2 className="mt-1 text-xl font-black text-[#173c70]">Descargar operación de Mercadeo</h2>
            <p className="mt-1 text-sm text-[#607a9d]">Incluye ganadores, participantes, trazabilidad, visualizaciones del live y plataformas de transmisión.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Mes" type="month" value={reportMonth} onChange={selectReportMonth} />
            <Field label="Desde" type="date" value={reportFrom} onChange={(value)=>{setReportFrom(value);setReportMonth("");}} />
            <Field label="Hasta" type="date" value={reportTo} onChange={(value)=>{setReportTo(value);setReportMonth("");}} />
            <button type="button" disabled={exporting} onClick={()=>void downloadReport()} className="rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white shadow-lg disabled:opacity-50">
              <Download className="mr-1.5 inline h-4 w-4" />{exporting?"Generando...":"Descargar Excel"}
            </button>
          </div>
        </div>
      </section>
      {message && (
        <div className="mt-4 rounded-xl border border-[#8fb2e3] bg-white/80 px-4 py-3 text-sm font-semibold text-[#234d8d]">
          {message}
        </div>
      )}
      {loading ? (
        <div className="py-16 text-center text-[#5d7698]">
          Cargando información protegida…
        </div>
      ) : (
        <TrainingHint text="Cada tarjeta permite editar el incentivo, revisar participantes, registrar un ganador y, después de verificarlo, publicar el resultado." className="block">
        <div id="sorteos" className="mt-6 grid gap-5 xl:grid-cols-2">
          {paginatedSorteos.map((s) => (
            <article
              key={s.id}
              className={`flex min-h-[25rem] flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_18px_40px_-35px_rgba(12,57,117,.7)] backdrop-blur-xl ${s.deleted_at?"opacity-75 grayscale-[.2]":""}`}
            >
              <div className="flex min-h-36 gap-4 p-5">
                {s.imagen ? (
                  <img
                    src={s.imagen}
                    alt=""
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                ) : (
                  <div className="grid h-24 w-24 place-items-center rounded-xl bg-[#e8f1ff] text-[#2e63af]">
                    <Gift className="h-9 w-9" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <h2 className="text-lg font-bold text-[#193d70]">
                      {s.titulo}
                    </h2>
                    <State value={s.estado} />
                  </div>
                  <p className="mt-1 text-sm text-[#5d7698]">
                    {new Date(s.fecha_sorteo).toLocaleString("es-CO", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {s.premio || "Premio por definir"}
                  </p>
                  {!s.deleted_at && <p className="mt-2 text-xs font-semibold text-[#54749b]">{dateStatus(s.fecha_sorteo)}</p>}
                </div>
              </div>
              <div className="flex flex-1 flex-col border-t border-[#dbe7f6] bg-white/45 p-5">
                <div className="grid grid-cols-3 gap-3">
                  <Mini
                    label="Registros asociados"
                    value={s.participantes.total}
                  />
                  <Mini
                    label="Habilitados"
                    value={s.participantes.habilitados}
                  />
                  <Mini label="Ganadores" value={`${s.ganadores.length}/${s.ganadores_esperados}`} />
                </div>
                {s.ganadores.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {s.ganadores.map((winner) => (
                      <div
                        key={winner.id}
                        className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <b>Ganador {winner.posicion}:</b> {winner.nombre}
                            <br />
                            <span className="text-xs">
                              Contrato {winner.numero_contrato} · {winner.validado
                                ? "Validado y publicado"
                                : "Pendiente de validación"}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <TrainingHint
                              text="Corrige el nombre o el contrato de este ganador sin modificar los demás."
                              className="inline-flex"
                            >
                              <button
                                onClick={() => {
                                  setWinnerFor(s);
                                  setWinnerForm({
                                    id: winner.id,
                                    nombre: winner.nombre,
                                    numeroContrato: winner.numero_contrato,
                                  });
                                  setAdditionalWinners([]);
                                  setAdminPassword("");
                                }}
                                className="rounded-lg border border-amber-200 bg-white px-2 py-1 text-xs font-bold text-amber-800"
                              >
                                Editar
                              </button>
                            </TrainingHint>
                            <TrainingHint
                              text="Retira solamente este ganador; los demás permanecen registrados."
                              className="inline-flex"
                            >
                              <button
                                onClick={() => {
                                  setAdminPassword("");
                                  setWinnerDeleteTarget({ sorteo: s, winner });
                                }}
                                className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-bold text-rose-700"
                              >
                                Quitar
                              </button>
                            </TrainingHint>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <button onClick={()=>setDetail(s)} className="rounded-lg border border-[#a7c1e7] bg-white px-3 py-2 text-sm font-bold text-[#28569a]"><Eye className="mr-1 inline h-3.5 w-3.5"/>Ver detalles</button>
                  {s.deleted_at ? (
                    <button onClick={()=>void restoreSorteo(s)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white"><RotateCcw className="mr-1 inline h-3.5 w-3.5"/>Recuperar</button>
                  ) : <>
                  <TrainingHint
                    text="Editar permite corregir los datos del incentivo, cambiar o quitar su imagen y actualizar su estado."
                    className="inline-flex"
                  >
                  <button
                    onClick={() => {
                      setEditing(s);
                      setAdminPassword("");
                      setForm({
                        titulo: s.titulo,
                        descripcion: s.descripcion || "",
                        fechaSorteo: s.fecha_sorteo.slice(0, 16),
                        premio: s.premio || "",
                        ganadoresEsperados: String(s.ganadores_esperados || 1),
                        estado: s.estado,
                        terminosUrl: s.terminos_url || "",
                        liveVisualizaciones: s.live_visualizaciones == null ? "" : String(s.live_visualizaciones),
                        livePlataformas: s.live_plataformas || "",
                        imagen: s.imagen,
                      });
                      setShowForm(true);
                    }}
                    className="rounded-lg border border-[#a7c1e7] px-3 py-2 text-sm font-bold text-[#28569a]"
                  >
                    <Pencil className="mr-1 inline h-3.5 w-3.5" />
                    Editar
                  </button>
                  </TrainingHint>
                  <TrainingHint
                    text="Agrega uno o varios ganadores. Cada registro conserva su nombre, contrato, posición y validación."
                    className="inline-flex"
                  >
                    <button
                      onClick={() => {
                        setWinnerFor(s);
                        setWinnerForm(emptyWinner);
                        setAdditionalWinners([]);
                        setAdminPassword("");
                      }}
                    disabled={s.ganadores.length >= s.ganadores_esperados}
                    className="rounded-lg bg-[#234d8d] px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <UserRoundCheck className="mr-1 inline h-3.5 w-3.5" />
                      {s.ganadores.length ? "Agregar otro ganador" : "Registrar ganador"}
                    </button>
                  </TrainingHint>
                  {s.estado === "PROGRAMADO" ? <button onClick={()=>void updateStatus(s,"PAUSADO")} className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800"><Pause className="mr-1 inline h-3.5 w-3.5"/>Pausar</button> : s.estado === "PAUSADO" ? <button onClick={()=>void updateStatus(s,"PROGRAMADO")} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><Play className="mr-1 inline h-3.5 w-3.5"/>Reanudar</button> : null}
                  {["BORRADOR","CANCELADO"].includes(s.estado) && <button onClick={()=>void updateStatus(s,"PROGRAMADO")} className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800"><Play className="mr-1 inline h-3.5 w-3.5"/>Programar</button>}
                  {["BORRADOR","PROGRAMADO","PAUSADO"].includes(s.estado) && <button onClick={()=>void updateStatus(s,"CERRADO")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700">Cerrar</button>}
                  {!['CANCELADO','PUBLICADO'].includes(s.estado) && <button onClick={()=>void updateStatus(s,"CANCELADO")} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">Cancelar</button>}
                  {s.ganadores.some((winner) => !winner.validado) && (
                    <TrainingHint
                      text="Confirma que el ganador cumple las condiciones y publica el resultado en la sección pública."
                      className="inline-flex"
                    >
                    <button
                      onClick={() => validate(s)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
                    >
                      <BadgeCheck className="mr-1 inline h-3.5 w-3.5" />
                      Validar y publicar
                    </button>
                    </TrainingHint>
                  )}
                  <TrainingHint
                    text="Elimina el incentivo del panel y evita que continúe visible públicamente. Solicita confirmación antes de hacerlo."
                    className="inline-flex"
                  >
                  <button
                    onClick={() => { setAdminPassword(""); setDeleteTarget(s); }}
                    className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                    Eliminar
                  </button>
                  </TrainingHint>
                  </>}
                </div>
              </div>
            </article>
          ))}
          {!paginatedSorteos.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-[#a7c1e7] bg-white/55 p-12 text-center text-[#5d7698]">
              Aún no hay incentivos. Crea el primero para comenzar.
            </div>
          )}
        </div>
        {filteredSorteos.length > 0 && <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/80 bg-white/65 px-4 py-3 text-sm text-[#58718f]">
          <span>Página {page} de {totalPages} · {filteredSorteos.length} resultado(s)</span>
          <div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(value=>Math.max(1,value-1))} className="rounded-lg border bg-white p-2 disabled:opacity-40" aria-label="Página anterior"><ChevronLeft className="h-4 w-4"/></button><button disabled={page>=totalPages} onClick={()=>setPage(value=>Math.min(totalPages,value+1))} className="rounded-lg border bg-white p-2 disabled:opacity-40" aria-label="Página siguiente"><ChevronRight className="h-4 w-4"/></button></div>
        </div>}
        </TrainingHint>
      )}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="¿Eliminar sorteo?"
        description={deleteTarget ? `“${deleteTarget.titulo}” dejará de mostrarse y pasará a la papelera recuperable. Confirma tu identidad para continuar.` : ""}
        confirmLabel="Sí, eliminar sorteo"
        onCancel={() => { setDeleteTarget(null); setAdminPassword(""); }}
        onConfirm={() => {
          const target = deleteTarget;
          if (target) void removeSorteo(target);
        }}
      ><label className="block text-sm font-bold text-[#31547d]"><LockKeyhole className="mr-1 inline h-4 w-4"/>Contraseña administrativa<input type="password" autoComplete="current-password" value={adminPassword} onChange={(event)=>setAdminPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal" /></label></ConfirmDialog>
      <ConfirmDialog
        open={Boolean(winnerDeleteTarget)}
        title="¿Quitar ganador?"
        description={winnerDeleteTarget ? `${winnerDeleteTarget.winner.nombre} será retirado de “${winnerDeleteTarget.sorteo.titulo}”. Los demás ganadores se conservarán.` : ""}
        confirmLabel="Sí, quitar ganador"
        onCancel={() => { setWinnerDeleteTarget(null); setAdminPassword(""); }}
        onConfirm={() => {
          const target = winnerDeleteTarget;
          if (target) void removeWinner(target.sorteo, target.winner);
        }}
      >{winnerDeleteTarget?.sorteo.estado === "PUBLICADO" && <label className="block text-sm font-bold text-[#31547d]"><LockKeyhole className="mr-1 inline h-4 w-4"/>Contraseña administrativa<input type="password" autoComplete="current-password" value={adminPassword} onChange={(event)=>setAdminPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal" /></label>}</ConfirmDialog>
      <ConfirmDialog
        open={Boolean(notice)}
        title={notice?.title ?? ""}
        description={notice?.description ?? ""}
        confirmLabel="Entendido"
        showCancel={false}
        variant={notice?.variant}
        onCancel={() => setNotice(null)}
        onConfirm={() => setNotice(null)}
      />
      {detail && createPortal(
        <div className="fixed inset-0 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" style={{zIndex:2147483646}} onMouseDown={(event)=>{if(event.currentTarget===event.target)setDetail(null);}}>
          <section className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/70 bg-[#f7fbff] p-6 shadow-2xl">
            <button type="button" onClick={()=>setDetail(null)} className="float-right rounded-xl p-2 text-slate-500 hover:bg-white"><X/></button>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#557aa8]">Detalle y trazabilidad</p>
            <h2 className="mt-2 pr-12 text-2xl font-black text-[#173c70]">{detail.titulo}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <Mini label="Estado" value={detail.deleted_at?"ELIMINADO":detail.estado}/><Mini label="Participantes" value={detail.participantes.total}/><Mini label="Habilitados" value={detail.participantes.habilitados}/><Mini label="Ganadores" value={`${detail.ganadores.length}/${detail.ganadores_esperados}`}/>
            </div>
            <div className="mt-5 grid gap-4 rounded-2xl border border-[#d7e4f5] bg-white p-5 sm:grid-cols-2">
              <div><p className="text-xs font-bold uppercase text-[#6481a5]">Fecha</p><p className="mt-1 font-semibold text-[#294e7e]"><CalendarDays className="mr-1.5 inline h-4 w-4"/>{new Date(detail.fecha_sorteo).toLocaleString("es-CO",{dateStyle:"long",timeStyle:"short"})}</p></div>
              <div><p className="text-xs font-bold uppercase text-[#6481a5]">Premio</p><p className="mt-1 font-semibold text-[#294e7e]">{detail.premio||"Sin definir"}</p></div>
              <div className="sm:col-span-2"><p className="text-xs font-bold uppercase text-[#6481a5]">Descripción</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#58718f]">{detail.descripcion||"Sin descripción"}</p></div>
              {detail.terminos_url && <a href={detail.terminos_url} target="_blank" rel="noreferrer" className="sm:col-span-2 text-sm font-bold text-[#28569a] underline">Abrir términos y condiciones</a>}
            </div>
            <h3 className="mt-6 text-lg font-black text-[#173c70]">Movimientos recientes</h3>
            <div className="mt-3 space-y-2">
              {detail.trazabilidad.length?detail.trazabilidad.map((item,index)=><div key={`${item.created_at}-${index}`} className="rounded-xl border border-[#dbe6f4] bg-white p-3"><div className="flex flex-wrap justify-between gap-2"><b className="text-sm text-[#294e7e]">{item.accion.replaceAll("_"," ")}</b><span className="text-xs text-[#6b83a1]">{new Date(item.created_at).toLocaleString("es-CO")}</span></div><p className="mt-1 text-sm text-[#58718f]">{item.detalle||"Sin detalle"}</p><p className="mt-1 text-xs font-semibold text-[#7189a7]">{item.administrador||"Sistema"}</p></div>):<p className="rounded-xl bg-white p-4 text-sm text-[#607a9d]">Aún no hay movimientos registrados.</p>}
            </div>
          </section>
        </div>,document.body
      )}
      {showForm && createPortal(
        <div className="fixed inset-0 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" style={{ zIndex: 2147483646 }}>
          <form
            onSubmit={submit}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/70 bg-[#f7fbff] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="float-right p-2 text-slate-500"
            >
              <X />
            </button>
            <h2 className="text-2xl font-black text-[#173c70]">
              {editing ? "Editar incentivo" : "Nuevo incentivo"}
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field
                label="Nombre del incentivo"
                value={form.titulo}
                onChange={(v) => setForm({ ...form, titulo: v })}
                required
              />
              <Field
                label="Premio"
                value={form.premio}
                onChange={(v) => setForm({ ...form, premio: v })}
              />
              <Field
                label="Fecha y hora"
                type="datetime-local"
                value={form.fechaSorteo}
                onChange={(v) => setForm({ ...form, fechaSorteo: v })}
                required
              />
              <Field
                label="Cantidad de ganadores"
                type="number"
                min="1"
                max="100"
                value={form.ganadoresEsperados}
                onChange={(v) => setForm({ ...form, ganadoresEsperados: v })}
                required
              />
              <label className="text-sm font-bold text-[#31547d]">
                Estado
                <select
                  className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                >
                  {[
                    "BORRADOR",
                    "PROGRAMADO",
                    "PAUSADO",
                    "CERRADO",
                    "PUBLICADO",
                    "CANCELADO",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                Descripción
                <textarea
                  className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                />
              </label>
              <Field
                label="Enlace de términos y condiciones"
                type="url"
                value={form.terminosUrl}
                onChange={(v) => setForm({ ...form, terminosUrl: v })}
              />
              <div className="flex items-end text-xs leading-5 text-[#607a9d]">
                Opcional. Permite conservar el enlace oficial aplicable al incentivo.
              </div>
              {editing?.estado === "PUBLICADO" && <label className="md:col-span-2 block text-sm font-bold text-[#31547d]"><LockKeyhole className="mr-1 inline h-4 w-4"/>Contraseña administrativa<input required type="password" autoComplete="current-password" value={adminPassword} onChange={(event)=>setAdminPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"/><span className="mt-1 block text-xs font-normal text-[#607a9d]">Requerida para proteger un sorteo ya publicado.</span></label>}
              <div className="md:col-span-2 rounded-2xl border border-[#d7e4f5] bg-[#edf5ff] p-4">
                <p className="text-sm font-extrabold text-[#173d70]">Datos internos para el informe Excel</p>
                <p className="mt-1 text-xs text-[#607a9d]">No se publican en el sitio web.</p>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <Field label="Visualizaciones del live" type="number" min="0" value={form.liveVisualizaciones} onChange={(v)=>setForm({...form,liveVisualizaciones:v})}/>
                  <Field label="Plataformas de transmisión" value={form.livePlataformas} onChange={(v)=>setForm({...form,livePlataformas:v})}/>
                </div>
              </div>
              <TrainingHint
                text="Selecciona una imagen para agregarla o reemplazar la actual. Admite JPG, PNG o WEBP de máximo 2 MB."
                className="md:col-span-2 block"
              >
              <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                Imagen del premio (máx. 2 MB)
                <input
                  className="mt-1 block w-full cursor-pointer text-sm"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    readImage(e, (v) => setForm({ ...form, imagen: v }))
                  }
                />
              </label>
              </TrainingHint>
              {form.imagen && (
                <div className="md:col-span-2 overflow-hidden rounded-2xl border border-[#d8e3f5] bg-white/70 p-3 shadow-sm">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-extrabold text-[#173d70]">
                        Vista previa de la imagen
                      </p>
                      <p className="text-xs text-[#607a9d]">
                        Así se verá el premio antes de guardarlo.
                      </p>
                    </div>
                    <TrainingHint
                      text="Retira la imagen actual. El cambio queda definitivo al guardar el incentivo."
                      className="inline-flex"
                    >
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imagen: null })}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      Quitar imagen
                    </button>
                    </TrainingHint>
                  </div>
                  <img
                    src={form.imagen}
                    alt="Vista previa del premio del incentivo"
                    className="h-52 w-full rounded-xl border border-white object-cover shadow-sm"
                  />
                  <p className="mt-2 text-xs text-[#607a9d]">
                    La imagen se guardará en la base de datos al presionar
                    “Guardar incentivo”.
                  </p>
                </div>
              )}
            </div>
            <TrainingHint
              text="Guarda todos los cambios del incentivo, incluida la imagen agregada, reemplazada o retirada."
              className="mt-5 inline-flex"
            >
            <button className="rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white">
              Guardar incentivo
            </button>
            </TrainingHint>
          </form>
        </div>,
        document.body,
      )}
      {winnerFor && createPortal(
        <div className="fixed inset-0 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" style={{ zIndex: 2147483646 }}>
          <form
            onSubmit={saveWinner}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-[28px] border border-white/70 bg-[#f7fbff] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                setWinnerFor(null);
                setAdditionalWinners([]);
              }}
              className="float-right p-2 text-slate-500"
            >
              <X />
            </button>
            <h2 className="text-xl font-black text-[#173c70]">
              {winnerForm.id ? "Editar ganador" : "Registrar ganador"}
            </h2>
            <p className="mt-2 text-sm text-[#5d7698]">
              Ingresa los datos confirmados para <b>{winnerFor.titulo}</b>. El
              registro quedará auditado y podrás validarlo antes de publicarlo.
            </p>
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Nombre completo"
                value={winnerForm.nombre}
                onChange={(nombre) => setWinnerForm({ ...winnerForm, nombre })}
                required
              />
              <Field
                label="Número de contrato"
                value={winnerForm.numeroContrato}
                onChange={(numeroContrato) =>
                  setWinnerForm({ ...winnerForm, numeroContrato })
                }
                required
              />
              </div>
              {!winnerForm.id && additionalWinners.map((winner, index) => (
                <div key={index} className="rounded-2xl border border-[#d7e4f5] bg-white/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="font-bold text-[#31547d]">Ganador {index + 2}</p>
                    <button
                      type="button"
                      onClick={() => setAdditionalWinners((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-700"
                    >
                      Quitar
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Nombre completo"
                      value={winner.nombre}
                      onChange={(nombre) => setAdditionalWinners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, nombre } : item))}
                      required
                    />
                    <Field
                      label="Número de contrato"
                      value={winner.numeroContrato}
                      onChange={(numeroContrato) => setAdditionalWinners((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, numeroContrato } : item))}
                      required
                    />
                  </div>
                </div>
              ))}
              {winnerFor.estado === "PUBLICADO" && <label className="block text-sm font-bold text-[#31547d]"><LockKeyhole className="mr-1 inline h-4 w-4"/>Contraseña administrativa<input required type="password" autoComplete="current-password" value={adminPassword} onChange={(event)=>setAdminPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"/><span className="mt-1 block text-xs font-normal text-[#607a9d]">Requerida porque el resultado ya está publicado.</span></label>}
            </div>
            {!winnerForm.id && winnerFor.ganadores.length + 1 + additionalWinners.length < winnerFor.ganadores_esperados && (
              <button
                type="button"
                onClick={() => setAdditionalWinners((current) => [...current, { ...emptyWinner }])}
                className="mt-4 w-full rounded-xl border border-[#9ebbe2] bg-white px-4 py-3 text-sm font-bold text-[#28569a] hover:bg-[#edf5ff]"
              >
                <Plus className="mr-1.5 inline h-4 w-4" />
                Agregar otro ganador
              </button>
            )}
            <TrainingHint
              text="Guarda el ganador o sus correcciones. El resultado no será público hasta usar Validar y publicar."
              className="mt-5 block"
            >
              <button className="w-full rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white shadow-lg shadow-[#234d8d]/25">
                Guardar ganador
              </button>
            </TrainingHint>
          </form>
        </div>,
        document.body,
      )}
    </div>
  );
}
function Metric({ label, value, onClick }: { label: string; value: number; onClick?:()=>void }) {
  return (
    <button type="button" onClick={onClick} className="rounded-2xl border border-white/80 bg-white/65 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#9ebbe2] hover:bg-white hover:shadow-md">
      <p className="text-xs font-bold uppercase tracking-[.13em] text-[#6584aa]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-[#173c70]">{value}</p>
    </button>
  );
}
function Mini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-[#eff5fd] p-3">
      <p className="text-xs text-[#6584aa]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#173c70]">{value}</p>
    </div>
  );
}
function State({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${value === "PUBLICADO" ? "bg-emerald-100 text-emerald-700" : value === "CANCELADO" ? "bg-red-100 text-red-700" : value === "PAUSADO" ? "bg-amber-100 text-amber-800" : value === "CERRADO" ? "bg-slate-200 text-slate-700" : "bg-[#e8f1ff] text-[#28569a]"}`}
    >
      {value}
    </span>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
}) {
  return (
    <label className="text-sm font-bold text-[#31547d]">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
      />
    </label>
  );
}
function dateStatus(value:string){
  const difference=new Date(value).getTime()-Date.now();
  const days=Math.ceil(Math.abs(difference)/(1000*60*60*24));
  if(difference<0)return `Fecha cumplida hace ${days} día(s)`;
  if(days===0)return "Programado para hoy";
  return `Faltan ${days} día(s)`;
}
