"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, FileDown, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import * as XLSX from "xlsx-js-style";

type Taller = {
  id: number;
  titulo: string;
  fecha_label: string;
  fecha: string | null;
  lugar: string;
  descripcion: string | null;
  imagen: string | null;
  activo: boolean;
  city?: string;
  modality?: "Presencial" | "Virtual" | "Híbrido";
  capacity?: number;
  facilitator?: string;
  duration?: string;
  category?: string;
  instructions?: string;
  connectionUrl?: string;
  confirmedCount?: number;
  waitingCount?: number;
};
type AlbumImage = {
  id?: number;
  imagen: string;
  alt: string;
  descripcion?: string | null;
};
type Album = {
  id: number;
  taller_id: number;
  titulo: string;
  fecha_label: string;
  fecha: string | null;
  descripcion: string | null;
  activo: boolean;
  images: AlbumImage[];
};
type Registration = {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  estado: string;
  asistencia: string;
  observaciones?: string | null;
  correo_estado: "PENDIENTE" | "ENVIADO" | "ERROR";
  correo_enviado_at?: string | null;
  created_at: string;
};
type PendingDelete = { action: "delete-taller" | "delete-album"; id: number; label: string };
type AuditWorkshop = { id: number; title: string; date: string; dateISO: string | null; place: string; active: boolean; deletedAt: string | null; createdAt: string; updatedAt: string; capacity: number; confirmed: number; waiting: number; cancelled: number; attended: number; absent: number };
type AuditMovement = { id: number; taller_id: number; taller: string; accion: string; detalle: string | null; administrador: string | null; created_at: string };
type AuditRegistration = { taller_id: number; taller: string; nombre: string; email: string; telefono: string; estado: string; asistencia: string; observaciones: string | null; correo_estado: string; created_at: string; updated_at: string };
const blankTaller = {
  titulo: "",
  fechaLabel: "",
  fecha: "",
  lugar: "",
  descripcion: "",
  activo: true,
  imagen: null as string | null,
  ciudad: "",
  modalidad: "Presencial" as "Presencial" | "Virtual" | "Híbrido",
  cupos: 20,
  facilitador: "",
  duracion: "",
  categoria: "Acompañamiento en duelo",
  instrucciones: "",
  urlConexion: "",
};
const blankAlbum = {
  tallerId: "",
  titulo: "",
  fechaLabel: "",
  fecha: "",
  descripcion: "",
  activo: true,
  images: [] as AlbumImage[],
};

function readImage(
  event: ChangeEvent<HTMLInputElement>,
  callback: (image: AlbumImage) => void,
) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (!file.type.startsWith("image/") || file.size > 2_000_000) {
    alert("Selecciona una imagen JPG, PNG o WEBP de máximo 2 MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = () =>
    callback({
      imagen: String(reader.result),
      alt: file.name.replace(/\.[^.]+$/, ""),
    });
  reader.readAsDataURL(file);
}

export default function DashboardTalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"talleres" | "galeria" | "trazabilidad">("talleres");
  const [tallerForm, setTallerForm] = useState(blankTaller);
  const [albumForm, setAlbumForm] = useState(blankAlbum);
  const [editTaller, setEditTaller] = useState<Taller | null>(null);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [modal, setModal] = useState<"taller" | "album" | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationWorkshop, setRegistrationWorkshop] =
    useState<Taller | null>(null);
  const [galleryViewer, setGalleryViewer] = useState<Album | null>(null);
  const [manualRegistration, setManualRegistration] = useState({ nombre: "", telefono: "", email: "" });
  const [capacityInput, setCapacityInput] = useState("20");
  const [facilitatorNames, setFacilitatorNames] = useState<string[]>([""]);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [postponing, setPostponing] = useState(false);
  const [auditWorkshops, setAuditWorkshops] = useState<AuditWorkshop[]>([]);
  const [auditMovements, setAuditMovements] = useState<AuditMovement[]>([]);
  const [auditRegistrations, setAuditRegistrations] = useState<AuditRegistration[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/talleres");
      const p = await r.json();
      if (!r.ok) throw new Error(p.message);
      setTalleres(p.data.talleres);
      setAlbums(p.data.albums);
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "No fue posible cargar los talleres.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 6000);
    return () => window.clearTimeout(timer);
  }, [message]);
  const loadAudit = async () => {
    setLoadingAudit(true);
    try {
      const response = await fetch("/api/admin/talleres/auditoria");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message);
      setAuditWorkshops(payload.data.workshops || []);
      setAuditMovements(payload.data.movements || []);
      setAuditRegistrations(payload.data.registrations || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "No fue posible cargar la trazabilidad."); }
    finally { setLoadingAudit(false); }
  };
  useEffect(() => { if (tab === "trazabilidad") void loadAudit(); }, [tab]);
  const active = talleres.filter((t) => t.activo).length;
  const confirmedRegistrations = talleres.reduce(
    (total, workshop) => total + (workshop.confirmedCount || 0),
    0,
  );
  const waitingRegistrations = talleres.reduce(
    (total, workshop) => total + (workshop.waitingCount || 0),
    0,
  );
  const availableSeats = talleres
    .filter((workshop) => workshop.activo)
    .reduce(
      (total, workshop) =>
        total +
        Math.max(0, (workshop.capacity || 20) - (workshop.confirmedCount || 0)),
      0,
    );
  const next = useMemo(
    () =>
      talleres
        .filter(
          (t) =>
            t.activo &&
            (!t.fecha || t.fecha >= new Date().toISOString().slice(0, 10)),
        )
        .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))[0],
    [talleres],
  );
  const submit = async (
    event: FormEvent,
    action: string,
    body: Record<string, unknown>,
  ) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const r = await fetch("/api/admin/talleres", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const p = await r.json();
      if (!r.ok) {
        setMessage(p.message || "No fue posible guardar.");
        return;
      }
      setTalleres(p.data.talleres);
      setAlbums(p.data.albums);
      setModal(null);
      setPostponing(false);
      setMessage("Cambios guardados correctamente.");
    } catch {
      setMessage("No fue posible guardar. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };
  const openTaller = (item?: Taller) => {
    setPostponing(false);
    setEditTaller(item || null);
    setTallerForm(
      item
        ? {
            titulo: item.titulo,
            fechaLabel: item.fecha_label,
            fecha: item.fecha || "",
            lugar: item.lugar,
            descripcion: item.descripcion || "",
            activo: item.activo,
            imagen: item.imagen,
            ciudad: item.city || "",
            modalidad: item.modality || "Presencial",
            cupos: item.capacity || 20,
            facilitador: item.facilitator || "",
            duracion: item.duration || "",
            categoria: item.category || "Acompañamiento en duelo",
            instrucciones: item.instructions || "",
            urlConexion: item.connectionUrl || "",
          }
        : blankTaller,
    );
    setCapacityInput(String(item?.capacity ?? 20));
    setFacilitatorNames(
      (item?.facilitator || "")
        .split(/[,\n]+/)
        .map((name) => name.trim())
        .filter(Boolean)
        .slice(0, 10)
        .concat((item?.facilitator || "").trim() ? [] : [""]),
    );
    setModal("taller");
  };
  const openPostpone = (item: Taller) => {
    openTaller(item);
    setPostponing(true);
  };
  const openAlbum = (item?: Album) => {
    setEditAlbum(item || null);
    setAlbumForm(
      item
        ? {
            tallerId: String(item.taller_id),
            titulo: item.titulo,
            fechaLabel: item.fecha_label,
            fecha: item.fecha || "",
            descripcion: item.descripcion || "",
            activo: item.activo,
            images: item.images,
          }
        : blankAlbum,
    );
    setModal("album");
  };
  const deleteItem = (action: PendingDelete["action"], id: number, label: string) => {
    setPendingDelete({ action, id, label });
  };
  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    try {
      const r = await fetch("/api/admin/talleres", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: pendingDelete.action, id: pendingDelete.id }),
      });
      const p = await r.json().catch(() => ({}));
      if (!r.ok) {
        setMessage(p.message || "No fue posible desactivar el registro.");
        return;
      }
      setTalleres(p.data.talleres);
      setAlbums(p.data.albums);
      setMessage(`${pendingDelete.action === "delete-taller" ? "Taller" : "Álbum"} desactivado correctamente.`);
      setPendingDelete(null);
    } catch {
      setMessage("No fue posible conectar con el servidor. Intenta nuevamente.");
    } finally {
      setDeleting(false);
    }
  };
  const openRegistrations = async (taller: Taller) => {
    setRegistrationWorkshop(taller);
    setRegistrations([]);
    const response = await fetch(
      `/api/admin/talleres/${taller.id}/inscripciones`,
    );
    const result = await response.json();
    if (response.ok && result.success) setRegistrations(result.data || []);
    else setMessage(result.message || "No fue posible cargar los inscritos.");
  };
  const updateRegistration = async (
    registration: Registration,
    changes: Partial<Registration>,
  ) => {
    if (!registrationWorkshop) return;
    const response = await fetch(
      `/api/admin/talleres/${registrationWorkshop.id}/inscripciones`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: registration.id,
          attendance: changes.asistencia ?? registration.asistencia,
          status: changes.estado ?? registration.estado,
          notes: changes.observaciones ?? registration.observaciones,
        }),
      },
    );
    if (!response.ok) {
      setMessage("No fue posible actualizar el registro.");
      return;
    }
    const result = await response.json();
    setRegistrations((current) =>
      current.map((item) =>
        item.id === registration.id ? { ...item, ...changes } : item,
      ),
    );
    setMessage(result.message || "Registro actualizado correctamente.");
  };
  const addManualRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!registrationWorkshop) return;
    const response = await fetch(`/api/admin/talleres/${registrationWorkshop.id}/inscripciones`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(manualRegistration),
    });
    const result = await response.json();
    if (!response.ok || !result.success) { setMessage(result.message || "No fue posible agregar la persona."); return; }
    setManualRegistration({ nombre: "", telefono: "", email: "" });
    setMessage(result.message || "Persona agregada correctamente.");
    void openRegistrations(registrationWorkshop);
    void load();
  };
  const exportRegistrations = () => {
    if (!registrationWorkshop) return;
    const workbook = XLSX.utils.book_new();
    const rows = registrations.map((registration) => ({
      "Nombre completo": registration.nombre,
      Correo: registration.email,
      Teléfono: registration.telefono,
      "Estado del cupo": registration.estado,
      Asistencia: registration.asistencia,
      "Correo de confirmación": registration.correo_estado,
      "Fecha de envío": registration.correo_enviado_at
        ? new Date(registration.correo_enviado_at).toLocaleString("es-CO")
        : "",
      "Fecha de inscripción": registration.created_at
        ? new Date(registration.created_at).toLocaleString("es-CO")
        : "",
      Observaciones: registration.observaciones || "",
    }));
    const sheet = XLSX.utils.json_to_sheet(
      rows.length
        ? rows
        : [
            {
              "Nombre completo": "Sin inscripciones",
            },
          ],
    );
    const range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
    for (let column = range.s.c; column <= range.e.c; column += 1) {
      const address = XLSX.utils.encode_cell({ r: 0, c: column });
      if (sheet[address])
        sheet[address].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "173F73" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
    }
    sheet["!autofilter"] = { ref: sheet["!ref"] || "A1:A1" };
    sheet["!freeze"] = { xSplit: 0, ySplit: 1 };
    sheet["!cols"] = [
      { wch: 28 },
      { wch: 34 },
      { wch: 18 },
      { wch: 18 },
      { wch: 16 },
      { wch: 24 },
      { wch: 24 },
      { wch: 24 },
      { wch: 44 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, "Inscritos");
    XLSX.writeFile(
      workbook,
      `inscritos-${registrationWorkshop.titulo.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };
  const exportAudit = () => {
    const workbook = XLSX.utils.book_new();
    const summary = XLSX.utils.json_to_sheet(auditWorkshops.map((workshop) => ({ Taller: workshop.title, Fecha: workshop.date, Lugar: workshop.place, Semáforo: workshop.deletedAt ? "ROJO · Cancelado" : "VERDE · Activo", Cupos: workshop.capacity, Confirmados: workshop.confirmed, "Lista de espera": workshop.waiting, "Registros cancelados": workshop.cancelled, Asistieron: workshop.attended, "No asistieron": workshop.absent, "Última actualización": workshop.updatedAt })));
    const records = XLSX.utils.json_to_sheet(auditRegistrations.map((registration) => ({ Taller: registration.taller, Participante: registration.nombre, Correo: registration.email, Teléfono: registration.telefono, "Estado del registro": registration.estado, Asistencia: registration.asistencia, "Correo enviado": registration.correo_estado, Observación: registration.observaciones || "", "Fecha de registro": registration.created_at, "Última actualización": registration.updated_at })));
    const movements = XLSX.utils.json_to_sheet(auditMovements.map((movement) => ({ Fecha: movement.created_at, Taller: movement.taller, Acción: movement.accion, Semáforo: movement.accion.includes("DESACTIVADO") ? "ROJO" : movement.accion.includes("APLAZADO") ? "AMARILLO" : "VERDE", Administrador: movement.administrador || "Sistema", Detalle: movement.detalle || "" })));
    [[summary, "Resumen semáforo"], [records, "Registros"], [movements, "Movimientos"]].forEach(([sheet, name]) => { const worksheet = sheet as XLSX.WorkSheet; const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1"); for (let column = range.s.c; column <= range.e.c; column += 1) { const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: column })]; if (cell) cell.s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "173F73" } } }; } worksheet["!autofilter"] = { ref: worksheet["!ref"] || "A1:A1" }; XLSX.utils.book_append_sheet(workbook, worksheet, name as string); });
    XLSX.writeFile(workbook, `trazabilidad-talleres-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };
  return (
    <div className="p-5 md:p-8">
      <section className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white/80 via-white/55 to-[#dceafb]/65 p-6 shadow-[0_22px_65px_-45px_rgba(12,57,117,.8)] backdrop-blur-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#436da7]">
          Acompañamiento humano
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#173c70] md:text-5xl">
              Talleres de duelo
            </h1>
            <p className="mt-2 max-w-2xl text-[#5d7698]">
              Programa experiencias de acompañamiento, publica talleres activos
              y administra sus galerías fotográficas en una sola vista.
            </p>
          </div>
          <button
            onClick={() => openTaller()}
            className="rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white shadow-lg shadow-[#234d8d]/25 transition hover:-translate-y-0.5"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Nuevo taller
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-6">
          <Metric label="Talleres registrados" value={talleres.length} />
          <Metric label="Publicados" value={active} />
          <Metric
            label="Inscripciones confirmadas"
            value={confirmedRegistrations}
          />
          <Metric label="En lista de espera" value={waitingRegistrations} />
          <Metric label="Cupos disponibles" value={availableSeats} />
          <Metric label="Álbumes fotográficos" value={albums.length} />
        </div>
      </section>
      {message && (
        <div role="status" className={`fixed right-5 top-5 z-[200] max-w-md animate-[slide-in_0.25s_ease-out] rounded-2xl border px-5 py-4 text-sm font-semibold shadow-2xl ${message.startsWith("No fue posible") ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-white text-emerald-800"}`}>
          {message}
        </div>
      )}
      {next && (
        <article className="mt-5 rounded-2xl border border-emerald-200/70 bg-emerald-50/65 p-5">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">
            Próximo encuentro
          </p>
          <h2 className="mt-1 text-xl font-bold text-[#183e74]">
            {next.titulo}
          </h2>
          <p className="mt-1 text-sm text-[#536d8d]">
            {next.fecha_label} · {next.lugar}
          </p>
        </article>
      )}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("talleres")}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === "talleres" ? "bg-[#234d8d] text-white" : "bg-white/65 text-[#436da7]"}`}
        >
          Programación
        </button>
        <button
          onClick={() => setTab("galeria")}
          className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === "galeria" ? "bg-[#234d8d] text-white" : "bg-white/65 text-[#436da7]"}`}
        >
          Galería
        </button>
        <button onClick={() => setTab("trazabilidad")} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === "trazabilidad" ? "bg-[#234d8d] text-white" : "bg-white/65 text-[#436da7]"}`}><Clock3 className="mr-1 inline h-4 w-4" />Trazabilidad</button>
        {tab === "galeria" && (
          <button
            onClick={() => openAlbum()}
            className="ml-auto rounded-xl border border-[#7ea5dc] bg-white/80 px-4 py-2 text-sm font-bold text-[#234d8d]"
          >
            <ImagePlus className="mr-1 inline h-4 w-4" />
            Nuevo álbum
          </button>
        )}
      </div>
      {loading ? (
        <div className="py-16 text-center text-[#5d7698]">
          Cargando información protegida…
        </div>
      ) : tab === "talleres" ? (
        <div
          id="programacion"
          className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2"
        >
          {talleres.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-white/80 bg-white/70 p-5 shadow-[0_18px_40px_-35px_rgba(12,57,117,.7)] backdrop-blur-xl"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e4effd] text-[#2e63af]">
                  <CalendarDays />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-[#193d70]">
                      {t.titulo}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${t.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {t.activo ? "Publicado" : "Oculto"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#5d7698]">
                    {t.fecha_label} · {t.lugar}
                  </p>
                  {t.descripcion && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">
                      {t.descripcion}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                      {t.modality || "Presencial"}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      {t.confirmedCount || 0}/{t.capacity || 20} cupos
                    </span>
                    {(t.waitingCount || 0) > 0 && (
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">
                        {t.waitingCount} en espera
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => openTaller(t)}
                      className="rounded-lg border border-[#a7c1e7] px-3 py-2 text-sm font-bold text-[#28569a]"
                    >
                      <Pencil className="mr-1 inline h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => openPostpone(t)}
                      className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800"
                    >
                      Aplazar
                    </button>
                    <button
                      onClick={() => void openRegistrations(t)}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700"
                    >
                      Inscritos ({t.confirmedCount || 0})
                    </button>
                    <button
                      onClick={() => deleteItem("delete-taller", t.id, t.titulo)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600"
                    >
                      <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                      Desactivar
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : tab === "galeria" ? (
        <div
          id="galeria"
          className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          {albums.map((a) => (
            <article
              key={a.id}
              className="overflow-hidden rounded-2xl border border-[#dce8f7] bg-white shadow-[0_18px_40px_-30px_rgba(21,60,112,.55)]"
            >
              <button
                type="button"
                onClick={() => setGalleryViewer(a)}
                className="group grid h-48 w-full grid-cols-3 gap-1 bg-[#e9f1fb] p-1 text-left"
                aria-label={`Abrir álbum ${a.titulo}`}
              >
                {a.images.slice(0, 3).map((image, index) => (
                  <div key={index} className="relative overflow-hidden rounded-lg">
                    <img src={image.imagen} alt={image.alt} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    {index === 2 && a.images.length > 3 && <span className="absolute inset-0 grid place-items-center bg-[#173f73]/70 text-lg font-black text-white">+{a.images.length - 3}</span>}
                  </div>
                ))}
                {a.images.length === 0 && (
                  <div className="col-span-3 grid place-items-center text-sm text-[#5d7698]">
                    Sin imágenes
                  </div>
                )}
              </button>
              <div className="p-5">
                <div className="flex justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-[#193d70]">{a.titulo}</h2>
                    <p className="mt-1 text-sm text-[#5d7698]">
                      {a.fecha_label} · {a.images.length} imágenes
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${a.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {a.activo ? "Publicado" : "Oculto"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setGalleryViewer(a)} className="rounded-lg bg-[#edf4ff] px-3 py-2 text-sm font-bold text-[#28569a]">Ver fotos</button>
                  <button
                    onClick={() => openAlbum(a)}
                    className="rounded-lg border border-[#a7c1e7] px-3 py-2 text-sm font-bold text-[#28569a]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteItem("delete-album", a.id, a.titulo)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600"
                  >
                    Desactivar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {tab === "trazabilidad" && (
        <section className="mt-5 space-y-5">
          <div className="flex flex-col gap-4 rounded-3xl border border-[#dce8f7] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#436da7]">Control operativo</p><h2 className="mt-1 text-2xl font-black text-[#173c70]">Historial completo de eventos</h2><p className="mt-1 text-sm text-[#5d7698]">Incluye talleres activos, cancelados, aplazados, asistentes y correos de reserva.</p></div><button onClick={exportAudit} disabled={loadingAudit} className="rounded-xl bg-[#234d8d] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"><FileDown className="mr-2 inline h-4 w-4" />Descargar Excel</button></div>
          {loadingAudit ? <div className="py-12 text-center text-textLight">Cargando trazabilidad…</div> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><AuditMetric label="Eventos activos" value={auditWorkshops.filter((workshop) => workshop.active).length} tone="green" /><AuditMetric label="Eventos cancelados" value={auditWorkshops.filter((workshop) => workshop.deletedAt).length} tone="red" /><AuditMetric label="Eventos aplazados" value={auditMovements.filter((movement) => movement.accion === "TALLER_APLAZADO").length} tone="yellow" /><AuditMetric label="Registros confirmados" value={auditRegistrations.filter((registration) => registration.estado === "CONFIRMADA").length} tone="green" /></div><div className="overflow-x-auto rounded-3xl border border-[#dce8f7] bg-white"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-[#f4f8fd] text-xs font-bold uppercase tracking-wider text-[#557190]"><tr><th className="p-4">Evento</th><th className="p-4">Fecha y lugar</th><th className="p-4">Semáforo</th><th className="p-4">Asistentes y cupos</th><th className="p-4">Actualización</th></tr></thead><tbody>{auditWorkshops.map((workshop) => <tr key={workshop.id} className="border-t border-[#edf2f8]"><td className="p-4 font-bold text-[#173c70]">{workshop.title}</td><td className="p-4 text-[#5d7698]">{workshop.date}<br />{workshop.place}</td><td className="p-4"><StatusLight label={workshop.deletedAt ? "Cancelado" : "Activo"} tone={workshop.deletedAt ? "red" : "green"} /></td><td className="p-4"><strong>{workshop.confirmed}/{workshop.capacity}</strong> confirmados · {workshop.waiting} espera<br /><span className="text-xs text-[#5d7698]">{workshop.attended} asistieron · {workshop.absent} no asistieron</span></td><td className="p-4 text-xs text-[#5d7698]">{new Date(workshop.updatedAt).toLocaleString("es-CO")}</td></tr>)}</tbody></table></div><div className="rounded-3xl border border-[#dce8f7] bg-white p-6"><h3 className="text-lg font-black text-[#173c70]">Últimos movimientos</h3><div className="mt-4 space-y-3">{auditMovements.slice(0, 15).map((movement) => <div key={movement.id} className="border-l-2 border-[#a9c5ee] pl-4"><div className="flex flex-wrap items-center gap-2"><StatusLight label={movement.accion.replaceAll("_", " ")} tone={movement.accion.includes("DESACTIVADO") ? "red" : movement.accion.includes("APLAZADO") ? "yellow" : "green"} /><span className="font-bold text-[#173c70]">{movement.taller}</span></div><p className="mt-1 text-sm text-[#5d7698]">{movement.detalle || "Sin detalle"}</p><p className="mt-1 text-xs text-[#7890ad]">{movement.administrador || "Sistema"} · {new Date(movement.created_at).toLocaleString("es-CO")}</p></div>)}{!auditMovements.length && <p className="text-sm text-textLight">Aún no hay movimientos registrados.</p>}</div></div></>}</section>
      )}
      {modal && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/70 bg-[#f7fbff] p-6 shadow-2xl">
            <button
              onClick={() => { setModal(null); setPostponing(false); }}
              className="float-right rounded-full p-2 text-slate-500"
            >
              <X />
            </button>
            <h2 className="text-2xl font-black text-[#173c70]">
              {modal === "taller"
                ? editTaller
                  ? postponing ? "Aplazar evento" : "Editar taller"
                  : "Nuevo taller"
                : editAlbum
                  ? "Editar álbum"
                  : "Nuevo álbum"}
            </h2>
            {modal === "taller" ? (
              <form
                onSubmit={(e) =>
                  submit(e, "save-taller", {
                    id: editTaller?.id,
                    ...tallerForm,
                    cupos: capacityInput,
                    facilitador: facilitatorNames.filter(Boolean).join(", "),
                    postponed: postponing,
                  })
                }
                className="mt-5 grid gap-4 md:grid-cols-2"
              >
                {postponing && <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Reprogramación del evento.</strong> Actualiza al menos la fecha, el horario visible o el lugar. Al guardar se notificará por correo a las personas inscritas.</div>}
                <Field
                  label="Título"
                  value={tallerForm.titulo}
                  onChange={(v) => setTallerForm({ ...tallerForm, titulo: v })}
                  required
                />
                <Field
                  label="Fecha visible"
                  value={tallerForm.fechaLabel}
                  onChange={(v) =>
                    setTallerForm({ ...tallerForm, fechaLabel: v })
                  }
                  required
                />
                <Field
                  label="Fecha calendario"
                  type="date"
                  value={tallerForm.fecha}
                  onChange={(v) => setTallerForm({ ...tallerForm, fecha: v })}
                />
                <Field
                  label="Lugar"
                  value={tallerForm.lugar}
                  onChange={(v) => setTallerForm({ ...tallerForm, lugar: v })}
                  required
                />
                <Field
                  label="Ciudad"
                  value={tallerForm.ciudad}
                  onChange={(v) => setTallerForm({ ...tallerForm, ciudad: v })}
                />
                <label className="text-sm font-bold text-[#31547d]">
                  Modalidad
                  <select
                    value={tallerForm.modalidad}
                    onChange={(e) =>
                      setTallerForm({
                        ...tallerForm,
                        modalidad: e.target.value as
                          "Presencial" | "Virtual" | "Híbrido",
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                  >
                    <option>Presencial</option>
                    <option>Virtual</option>
                    <option>Híbrido</option>
                  </select>
                </label>
                <Field
                  label="Cupos disponibles"
                  type="number"
                  value={capacityInput}
                  onChange={setCapacityInput}
                />
                <label className="text-sm font-bold text-[#31547d]">
                  Cantidad de facilitadores/as
                  <select value={facilitatorNames.length} onChange={(event) => setFacilitatorNames((current) => Array.from({ length: Number(event.target.value) }, (_, index) => current[index] || ""))} className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal">
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((quantity) => <option key={quantity} value={quantity}>{quantity} {quantity === 1 ? "facilitador/a" : "facilitadores/as"}</option>)}
                  </select>
                  <span className="mt-1 block text-xs font-normal text-[#6a82a3]">Selecciona la cantidad y escribe nombres y apellidos de cada persona.</span>
                </label>
                <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
                  {facilitatorNames.map((name, index) => <Field key={index} label={`Facilitador/a ${index + 1}`} value={name} onChange={(value) => setFacilitatorNames((current) => current.map((item, currentIndex) => currentIndex === index ? value : item))} />)}
                </div>
                <Field
                  label="Duración"
                  value={tallerForm.duracion}
                  onChange={(v) =>
                    setTallerForm({ ...tallerForm, duracion: v })
                  }
                />
                <Field
                  label="Tipo de taller"
                  value={tallerForm.categoria}
                  onChange={(v) =>
                    setTallerForm({ ...tallerForm, categoria: v })
                  }
                />
                {tallerForm.modalidad !== "Presencial" && (
                  <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                    Enlace para conectarse al taller
                    <input
                      type="url"
                      value={tallerForm.urlConexion}
                      onChange={(e) =>
                        setTallerForm({
                          ...tallerForm,
                          urlConexion: e.target.value,
                        })
                      }
                      placeholder="https://meet.google.com/..."
                      className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                    />
                    <span className="mt-1 block text-xs font-normal text-[#6a82a3]">
                      El participante verá el botón “Conectarme al taller” y lo
                      recibirá en el correo de confirmación.
                    </span>
                  </label>
                )}
                <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                  Indicaciones para asistentes
                  <textarea
                    className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                    rows={2}
                    value={tallerForm.instrucciones}
                    onChange={(e) =>
                      setTallerForm({
                        ...tallerForm,
                        instrucciones: e.target.value,
                      })
                    }
                  />
                  {tallerForm.imagen && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-[#cbdcf3] bg-white p-2">
                      <img src={tallerForm.imagen} alt="Vista previa de la imagen del taller" className="h-44 w-full rounded-xl object-cover" />
                      <button type="button" onClick={() => setTallerForm({ ...tallerForm, imagen: null })} className="mt-2 text-xs font-bold text-red-600">Quitar imagen</button>
                    </div>
                  )}
                </label>
                <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                  Descripción
                  <textarea
                    className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                    rows={3}
                    value={tallerForm.descripcion}
                    onChange={(e) =>
                      setTallerForm({
                        ...tallerForm,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                  Imagen principal (máx. 2 MB)
                  <input
                    className="mt-1 block w-full text-sm"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      readImage(e, (i) =>
                        setTallerForm({ ...tallerForm, imagen: i.imagen }),
                      )
                    }
                  />
                </label>
                <Toggle
                  checked={tallerForm.activo}
                  onChange={(v) => setTallerForm({ ...tallerForm, activo: v })}
                />
                <Save saving={saving} />
              </form>
            ) : (
              <form
                onSubmit={(e) =>
                  submit(e, "save-album", { id: editAlbum?.id, ...albumForm })
                }
                className="mt-5 grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm font-bold text-[#31547d]">
                  Taller relacionado
                  <select
                    className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                    value={albumForm.tallerId}
                    onChange={(e) =>
                      setAlbumForm({ ...albumForm, tallerId: e.target.value })
                    }
                    required
                  >
                    <option value="">Selecciona un taller</option>
                    {talleres.map((t) => (
                      <option value={t.id} key={t.id}>
                        {t.titulo}
                      </option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Título del álbum"
                  value={albumForm.titulo}
                  onChange={(v) => setAlbumForm({ ...albumForm, titulo: v })}
                  required
                />
                <Field
                  label="Fecha visible"
                  value={albumForm.fechaLabel}
                  onChange={(v) =>
                    setAlbumForm({ ...albumForm, fechaLabel: v })
                  }
                  required
                />
                <Field
                  label="Fecha calendario"
                  type="date"
                  value={albumForm.fecha}
                  onChange={(v) => setAlbumForm({ ...albumForm, fecha: v })}
                />
                <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                  Descripción
                  <textarea
                    className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
                    rows={2}
                    value={albumForm.descripcion}
                    onChange={(e) =>
                      setAlbumForm({
                        ...albumForm,
                        descripcion: e.target.value,
                      })
                    }
                  />
                </label>
                <label className="md:col-span-2 text-sm font-bold text-[#31547d]">
                  Agregar imagen (máx. 10, 2 MB cada una)
                  <input
                    className="mt-1 block w-full text-sm"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) =>
                      readImage(e, (i) =>
                        setAlbumForm({
                          ...albumForm,
                          images: [...albumForm.images, i],
                        }),
                      )
                    }
                  />
                </label>
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  {albumForm.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.imagen}
                        alt={image.alt}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAlbumForm({
                            ...albumForm,
                            images: albumForm.images.filter(
                              (_, i) => i !== index,
                            ),
                          })
                        }
                        className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Toggle
                  checked={albumForm.activo}
                  onChange={(v) => setAlbumForm({ ...albumForm, activo: v })}
                />
                <Save saving={saving} />
              </form>
            )}
          </div>
        </div>
      )}
      {pendingDelete && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <section className="w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">!</div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-red-600">Confirmar desactivación</p>
            <h2 id="delete-dialog-title" className="mt-2 text-2xl font-black text-[#173c70]">¿Desactivar este registro?</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#5d7698]">Se ocultará <strong className="text-[#173c70]">{pendingDelete.label}</strong> del sitio público. La información y trazabilidad se conservarán en el sistema.</p>
            <div className="mt-7 flex justify-end gap-3"><button type="button" disabled={deleting} onClick={() => setPendingDelete(null)} className="rounded-xl border border-[#cbdcf3] bg-white px-4 py-2.5 text-sm font-bold text-[#31547d]">Cancelar</button><button type="button" disabled={deleting} onClick={() => void confirmDelete()} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{deleting ? "Desactivando…" : "Sí, desactivar"}</button></div>
          </section>
        </div>
      )}
      {galleryViewer && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setGalleryViewer(null)}>
          <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Galería del taller</p><h2 className="mt-1 text-2xl font-black text-[#173c70]">{galleryViewer.titulo}</h2><p className="mt-1 text-sm text-textLight">{galleryViewer.fecha_label} · {galleryViewer.images.length} fotografías</p></div>
              <button onClick={() => setGalleryViewer(null)} className="rounded-xl border border-border bg-white p-2 text-slate-600" aria-label="Cerrar galería"><X /></button>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryViewer.images.map((image, index) => <figure key={`${image.imagen}-${index}`} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"><img src={image.imagen} alt={image.alt} className="h-56 w-full object-cover" /><figcaption className="p-3 text-sm text-textLight">{image.descripcion || image.alt}</figcaption></figure>)}
            </div>
          </section>
        </div>
      )}
      {registrationWorkshop && (
        <div className="fixed inset-0 z-[95] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] bg-[#f8fbff] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
                  Gestión de participantes
                </p>
                <h2 className="mt-1 text-2xl font-black text-[#173c70]">
                  {registrationWorkshop.titulo}
                </h2>
                <p className="mt-1 text-sm text-[#5d7698]">
                  {registrations.length} registro(s) · Solo el equipo autorizado
                  puede actualizar asistencia.
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={exportRegistrations}
                  className="rounded-xl bg-[#234d8d] px-4 py-2 text-sm font-bold text-white"
                >
                  Descargar Excel
                </button>
                <button
                  type="button"
                  onClick={() => setRegistrationWorkshop(null)}
                  className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold"
                >
                  Cerrar
                </button>
              </div>
            </div>
            <form onSubmit={addManualRegistration} className="mt-5 grid gap-3 rounded-2xl border border-[#dbe5f3] bg-white p-4 md:grid-cols-4">
              <p className="md:col-span-4 text-sm font-bold text-[#193d70]">Agregar persona manualmente</p>
              <input required value={manualRegistration.nombre} onChange={(event) => setManualRegistration({ ...manualRegistration, nombre: event.target.value })} placeholder="Nombre completo" className="rounded-xl border border-border px-3 py-2 text-sm" />
              <input required value={manualRegistration.telefono} onChange={(event) => setManualRegistration({ ...manualRegistration, telefono: event.target.value })} placeholder="Teléfono" className="rounded-xl border border-border px-3 py-2 text-sm" />
              <input required type="email" value={manualRegistration.email} onChange={(event) => setManualRegistration({ ...manualRegistration, email: event.target.value })} placeholder="Correo electrónico" className="rounded-xl border border-border px-3 py-2 text-sm" />
              <button type="submit" className="rounded-xl bg-[#234d8d] px-4 py-2 text-sm font-bold text-white">Agregar inscrito</button>
            </form>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-[#dbe5f3] bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f4f8fd] text-xs uppercase tracking-wider text-[#557190]">
                  <tr>
                    <th className="p-3">Participante</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">Cupo</th>
                    <th className="p-3">Notificación</th>
                    <th className="p-3">Asistencia</th>
                    <th className="p-3">Observación</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((registration) => (
                    <tr
                      key={registration.id}
                      className="border-t border-[#edf2f8]"
                    >
                      <td className="p-3 font-bold text-text">
                        {registration.nombre}
                      </td>
                      <td className="p-3">
                        <a
                          className="text-primary"
                          href={`mailto:${registration.email}`}
                        >
                          {registration.email}
                        </a>
                        <p className="mt-1 text-xs text-textLight">
                          {registration.telefono}
                        </p>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            registration.correo_estado === "ENVIADO"
                              ? "bg-emerald-100 text-emerald-700"
                              : registration.correo_estado === "ERROR"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {registration.correo_estado === "ENVIADO"
                            ? "Correo enviado"
                            : registration.correo_estado === "ERROR"
                              ? "Error al enviar"
                              : "Pendiente"}
                        </span>
                        {registration.correo_enviado_at && (
                          <p className="mt-1 text-xs text-textLight">
                            {new Date(
                              registration.correo_enviado_at,
                            ).toLocaleString("es-CO")}
                          </p>
                        )}
                      </td>
                      <td className="p-3">
                        <select
                          value={registration.estado}
                          onChange={(event) =>
                            void updateRegistration(registration, {
                              estado: event.target.value,
                            })
                          }
                          className="rounded-lg border border-border bg-white px-2 py-1"
                        >
                          <option value="CONFIRMADA">Confirmada</option>
                          <option value="LISTA_ESPERA">Lista de espera</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <select
                          value={registration.asistencia}
                          onChange={(event) =>
                            void updateRegistration(registration, {
                              asistencia: event.target.value,
                            })
                          }
                          className="rounded-lg border border-border bg-white px-2 py-1"
                        >
                          <option value="PENDIENTE">Pendiente</option>
                          <option value="ASISTIÓ">Asistió</option>
                          <option value="NO_ASISTIÓ">No asistió</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          value={registration.observaciones || ""}
                          onBlur={(event) =>
                            void updateRegistration(registration, {
                              observaciones: event.target.value,
                            })
                          }
                          onChange={(event) =>
                            setRegistrations((current) =>
                              current.map((item) =>
                                item.id === registration.id
                                  ? {
                                      ...item,
                                      observaciones: event.target.value,
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="w-44 rounded-lg border border-border px-2 py-1"
                          placeholder="Nota interna"
                        />
                      </td>
                    </tr>
                  ))}
                  {!registrations.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-textLight"
                      >
                        Aún no hay inscripciones para este taller.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/80 bg-white/65 p-4">
      <p className="text-xs font-bold uppercase tracking-[.13em] text-[#6584aa]">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-[#173c70]">{value}</p>
    </div>
  );
}
function AuditMetric({ label, value, tone }: { label: string; value: number; tone: "green" | "yellow" | "red" }) {
  const colors = { green: "border-emerald-200 bg-emerald-50 text-emerald-800", yellow: "border-amber-200 bg-amber-50 text-amber-800", red: "border-red-200 bg-red-50 text-red-800" };
  return <div className={`rounded-2xl border p-5 ${colors[tone]}`}><p className="text-xs font-bold uppercase tracking-[.14em]">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div>;
}
function StatusLight({ label, tone }: { label: string; tone: "green" | "yellow" | "red" }) {
  const colors = { green: "bg-emerald-100 text-emerald-800", yellow: "bg-amber-100 text-amber-800", red: "bg-red-100 text-red-800" };
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${colors[tone]}`}><span className={`h-2 w-2 rounded-full ${tone === "green" ? "bg-emerald-500" : tone === "yellow" ? "bg-amber-500" : "bg-red-500"}`} />{label}</span>;
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-bold text-[#31547d]">
      {label}
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
      />
    </label>
  );
}
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-bold text-[#31547d]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />{" "}
      Publicar inmediatamente
    </label>
  );
}
function Save({ saving }: { saving: boolean }) {
  return (
    <button disabled={saving} className="rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-60">
      {saving ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}
