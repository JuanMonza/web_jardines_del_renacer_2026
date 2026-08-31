"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Gift, Plus, UserRoundCheck, X } from "lucide-react";

type Winner = { nombre: string; numero_contrato: string; validado: boolean };
type Sorteo = {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_sorteo: string;
  premio: string | null;
  imagen: string | null;
  estado: string;
  participantes: { total: number; habilitados: number };
  ganadores: Winner[];
};
const empty = {
  titulo: "",
  descripcion: "",
  fechaSorteo: "",
  premio: "",
  estado: "BORRADOR",
  terminosUrl: "",
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
  nombres: "",
  apellidos: "",
  numeroContrato: "",
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
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/sorteos");
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
  const active = sorteos.filter((s) =>
    ["PROGRAMADO", "CERRADO"].includes(s.estado),
  ).length;
  const participants = sorteos.reduce(
    (n, s) => n + s.participantes.habilitados,
    0,
  );
  const request = async (action: string, body: Record<string, unknown>) => {
    setMessage("");
    const r = await fetch("/api/admin/sorteos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...body }),
    });
    const p = await r.json();
    if (!r.ok) {
      setMessage(p.message || "No fue posible guardar.");
      return false;
    }
    setSorteos(p.data);
    return true;
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await request("save", { id: editing?.id, ...form })) {
      setShowForm(false);
      setEditing(null);
      setForm(empty);
      setMessage("Incentivo guardado correctamente.");
    }
  };
  const saveWinner = async (event: FormEvent) => {
    event.preventDefault();
    if (!winnerFor) return;
    if (
      await request("winner", {
        sorteoId: winnerFor.id,
        nombre: `${winnerForm.nombres} ${winnerForm.apellidos}`.trim(),
        numeroContrato: winnerForm.numeroContrato,
      })
    ) {
      setWinnerFor(null);
      setWinnerForm(emptyWinner);
      setMessage(
        "Ganador registrado. Valida y publica cuando confirmes que cumple las condiciones.",
      );
    }
  };
  const validate = async (s: Sorteo) => {
    if (await request("validate", { id: s.id, sorteoId: s.id }))
      setMessage("Ganador validado y resultado publicado.");
  };
  return (
    <div className="p-5 md:p-8">
      <section className="rounded-[28px] border border-white/70 bg-gradient-to-br from-white/80 via-white/55 to-[#dceafb]/65 p-6 shadow-[0_22px_65px_-45px_rgba(12,57,117,.8)] backdrop-blur-xl md:p-8">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#436da7]">
          Promoción transparente
        </p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#173c70] md:text-5xl">
              Programa de incentivos
            </h1>
            <p className="mt-2 max-w-2xl text-[#5d7698]">
              Administra la programación, registro directo, validación y
              publicación de ganadores con trazabilidad.
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setForm(empty);
              setShowForm(true);
            }}
            className="rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white shadow-lg shadow-[#234d8d]/25"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Nuevo incentivo
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="Incentivos activos" value={active} />
          <Metric label="Registros de participación" value={participants} />
          <Metric
            label="Ganadores publicados"
            value={sorteos.filter((s) => s.estado === "PUBLICADO").length}
          />
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
        <div id="sorteos" className="mt-6 grid gap-5 xl:grid-cols-2">
          {sorteos.map((s) => (
            <article
              key={s.id}
              className="overflow-hidden rounded-2xl border border-white/80 bg-white/70 shadow-[0_18px_40px_-35px_rgba(12,57,117,.7)] backdrop-blur-xl"
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
                </div>
              </div>
              <div className="border-t border-[#dbe7f6] bg-white/45 p-5">
                <div className="grid grid-cols-2 gap-3">
                  <Mini
                    label="Registros asociados"
                    value={s.participantes.total}
                  />
                  <Mini
                    label="Habilitados"
                    value={s.participantes.habilitados}
                  />
                </div>
                {s.ganadores[0] ? (
                  <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
                    <b>Ganador:</b> {s.ganadores[0].nombre} · Contrato{" "}
                    {s.ganadores[0].numero_contrato}
                    <br />
                    <span className="text-xs">
                      {s.ganadores[0].validado
                        ? "Validado y publicado"
                        : "Pendiente de validación"}
                    </span>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setEditing(s);
                      setForm({
                        titulo: s.titulo,
                        descripcion: s.descripcion || "",
                        fechaSorteo: s.fecha_sorteo.slice(0, 16),
                        premio: s.premio || "",
                        estado: s.estado,
                        terminosUrl: "",
                        imagen: s.imagen,
                      });
                      setShowForm(true);
                    }}
                    className="rounded-lg border border-[#a7c1e7] px-3 py-2 text-sm font-bold text-[#28569a]"
                  >
                    Editar
                  </button>
                  {!s.ganadores[0] && (
                    <button
                      onClick={() => {
                        setWinnerFor(s);
                        setWinnerForm(emptyWinner);
                      }}
                      className="rounded-lg bg-[#234d8d] px-3 py-2 text-sm font-bold text-white disabled:opacity-40"
                    >
                      <UserRoundCheck className="mr-1 inline h-3.5 w-3.5" />
                      Registrar ganador
                    </button>
                  )}
                  {s.ganadores[0] && !s.ganadores[0].validado && (
                    <button
                      onClick={() => validate(s)}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
                    >
                      Validar y publicar
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
          {!sorteos.length && (
            <div className="col-span-full rounded-2xl border border-dashed border-[#a7c1e7] bg-white/55 p-12 text-center text-[#5d7698]">
              Aún no hay incentivos. Crea el primero para comenzar.
            </div>
          )}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
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
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imagen: null })}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      Quitar imagen
                    </button>
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
            <button className="mt-5 rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white">
              Guardar incentivo
            </button>
          </form>
        </div>
      )}
      {winnerFor && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveWinner}
            className="w-full max-w-lg rounded-[28px] border border-white/70 bg-[#f7fbff] p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setWinnerFor(null)}
              className="float-right p-2 text-slate-500"
            >
              <X />
            </button>
            <h2 className="text-xl font-black text-[#173c70]">
              Registrar ganador
            </h2>
            <p className="mt-2 text-sm text-[#5d7698]">
              Ingresa los datos confirmados para <b>{winnerFor.titulo}</b>. El
              registro quedará auditado y podrás validarlo antes de publicarlo.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Field
                label="Nombres"
                value={winnerForm.nombres}
                onChange={(nombres) =>
                  setWinnerForm({ ...winnerForm, nombres })
                }
                required
              />
              <Field
                label="Apellidos"
                value={winnerForm.apellidos}
                onChange={(apellidos) =>
                  setWinnerForm({ ...winnerForm, apellidos })
                }
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
            <button className="mt-5 w-full rounded-xl bg-[#234d8d] px-5 py-3 font-bold text-white shadow-lg shadow-[#234d8d]/25">
              Guardar ganador
            </button>
          </form>
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
function Mini({ label, value }: { label: string; value: number }) {
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
      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${value === "PUBLICADO" ? "bg-emerald-100 text-emerald-700" : value === "CANCELADO" ? "bg-red-100 text-red-700" : "bg-[#e8f1ff] text-[#28569a]"}`}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-bold text-[#31547d]">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[#cbdcf3] bg-white p-3 font-normal"
      />
    </label>
  );
}
