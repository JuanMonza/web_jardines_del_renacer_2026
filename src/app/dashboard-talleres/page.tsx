"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { CalendarDays, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
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
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState<"talleres" | "galeria">("talleres");
  const [tallerForm, setTallerForm] = useState(blankTaller);
  const [albumForm, setAlbumForm] = useState(blankAlbum);
  const [editTaller, setEditTaller] = useState<Taller | null>(null);
  const [editAlbum, setEditAlbum] = useState<Album | null>(null);
  const [modal, setModal] = useState<"taller" | "album" | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationWorkshop, setRegistrationWorkshop] =
    useState<Taller | null>(null);
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
    setMessage("");
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
    setMessage("Cambios guardados correctamente.");
  };
  const openTaller = (item?: Taller) => {
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
    setModal("taller");
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
  const deleteItem = async (action: string, id: number) => {
    if (
      !confirm(
        "¿Deseas desactivar este registro? Podrás conservar la trazabilidad en la base de datos.",
      )
    )
      return;
    const r = await fetch("/api/admin/talleres", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, id }),
    });
    const p = await r.json();
    if (!r.ok) {
      setMessage(p.message);
      return;
    }
    setTalleres(p.data.talleres);
    setAlbums(p.data.albums);
    setMessage("Registro desactivado correctamente.");
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
    setRegistrations((current) =>
      current.map((item) =>
        item.id === registration.id ? { ...item, ...changes } : item,
      ),
    );
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
        <div className="mt-4 rounded-xl border border-[#8fb2e3] bg-white/80 px-4 py-3 text-sm font-semibold text-[#234d8d]">
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
                      onClick={() => void openRegistrations(t)}
                      className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700"
                    >
                      Inscritos ({t.confirmedCount || 0})
                    </button>
                    <button
                      onClick={() => deleteItem("delete-taller", t.id)}
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
      ) : (
        <div
          id="galeria"
          className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2"
        >
          {albums.map((a) => (
            <article
              key={a.id}
              className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-sm"
            >
              <div className="grid h-36 grid-cols-3 gap-1 bg-[#e9f1fb] p-1">
                {a.images.slice(0, 3).map((image, index) => (
                  <img
                    key={index}
                    src={image.imagen}
                    alt={image.alt}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ))}
                {a.images.length === 0 && (
                  <div className="col-span-3 grid place-items-center text-sm text-[#5d7698]">
                    Sin imágenes
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between gap-3">
                  <div>
                    <h2 className="font-bold text-[#193d70]">{a.titulo}</h2>
                    <p className="mt-1 text-sm text-[#5d7698]">
                      {a.fecha_label} · {a.images.length} imágenes
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">
                    {a.activo ? "Publicado" : "Oculto"}
                  </span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openAlbum(a)}
                    className="rounded-lg border border-[#a7c1e7] px-3 py-2 text-sm font-bold text-[#28569a]"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteItem("delete-album", a.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600"
                  >
                    Desactivar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/70 bg-[#f7fbff] p-6 shadow-2xl">
            <button
              onClick={() => setModal(null)}
              className="float-right rounded-full p-2 text-slate-500"
            >
              <X />
            </button>
            <h2 className="text-2xl font-black text-[#173c70]">
              {modal === "taller"
                ? editTaller
                  ? "Editar taller"
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
                  })
                }
                className="mt-5 grid gap-4 md:grid-cols-2"
              >
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
                  value={String(tallerForm.cupos)}
                  onChange={(v) =>
                    setTallerForm({
                      ...tallerForm,
                      cupos: Math.max(Number(v) || 1, 1),
                    })
                  }
                />
                <Field
                  label="Facilitador/a"
                  value={tallerForm.facilitador}
                  onChange={(v) =>
                    setTallerForm({ ...tallerForm, facilitador: v })
                  }
                />
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
                <Save />
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
                <Save />
              </form>
            )}
          </div>
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
function Save() {
  return (
    <button className="rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white">
      Guardar cambios
    </button>
  );
}
