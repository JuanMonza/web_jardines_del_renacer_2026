"use client";

import { useEffect, useState } from "react";

type Adviser = {
  id: number;
  nombre: string;
  cedula?: string;
  email?: string;
  cargo?: string;
  activo?: number;
  rol?: string;
};

export default function CotizacionesTeamManager() {
  const [advisers, setAdvisers] = useState<Adviser[]>([]);
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [deleteCandidate, setDeleteCandidate] = useState<Adviser | null>(null);
  const load = async () => {
    const response = await fetch("/api/cotizaciones/asesores");
    const payload = (await response.json()) as { data?: Adviser[] };
    setAdvisers(payload.data || []);
  };
  useEffect(() => {
    void load();
  }, []);
  const notify = (ok: boolean, message?: string) => {
    setNotice({
      ok,
      message:
        message ||
        (ok ? "Proceso completado." : "No fue posible completar la acción."),
    });
    window.setTimeout(() => setNotice(null), 3200);
  };
  const create = async (form: HTMLFormElement) => {
    const response = await fetch("/api/cotizaciones/asesores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const payload = (await response.json()) as { message?: string };
    notify(response.ok, payload.message);
    if (response.ok) {
      form.reset();
      void load();
    }
  };
  const update = async (adviser: Adviser, form: HTMLFormElement) => {
    const response = await fetch(`/api/cotizaciones/asesores/${adviser.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const payload = (await response.json()) as { message?: string };
    notify(response.ok, payload.message);
    if (response.ok) void load();
  };
  const action = async (
    adviser: Adviser,
    type: "suspend" | "activate" | "delete",
  ) => {
    const response = await fetch(
      `/api/cotizaciones/asesores/${adviser.id}`,
      type === "delete"
        ? { method: "DELETE" }
        : {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              nombre: adviser.nombre,
              email: adviser.email,
              activo: type === "activate",
            }),
          },
    );
    const payload = (await response.json()) as { message?: string };
    notify(response.ok, payload.message);
    if (response.ok) void load();
  };
  return (
    <div className="p-6 md:p-8">
      {deleteCandidate && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/35 p-5 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-7 text-center shadow-[0_28px_80px_-24px_rgba(15,23,42,.6)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-3xl font-bold text-red-600">
              !
            </div>
            <h2 className="mt-4 text-xl font-bold text-text">
              ¿Eliminar acceso?
            </h2>
            <p className="mt-2 text-sm leading-6 text-textLight">
              Eliminarás el acceso de <strong>{deleteCandidate.nombre}</strong>.
              Sus cotizaciones e historial se conservarán.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="rounded-xl border border-primary/15 bg-white px-5 py-2.5 text-sm font-bold text-primary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const adviser = deleteCandidate;
                  setDeleteCandidate(null);
                  void action(adviser, "delete");
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
      {notice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/25 p-5 backdrop-blur-[2px]"
          role="alert"
          onClick={() => setNotice(null)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-white/80 bg-white p-7 text-center shadow-[0_28px_80px_-24px_rgba(15,23,42,.55)]"
          >
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${notice.ok ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
            >
              {notice.ok ? "✓" : "!"}
            </div>
            <h2 className="mt-4 text-xl font-bold text-text">
              {notice.ok
                ? "Acción completada"
                : "No fue posible completar la acción"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-textLight">
              {notice.message}
            </p>
            <button
              onClick={() => setNotice(null)}
              className={`mt-6 rounded-xl px-5 py-2.5 text-sm font-bold text-white ${notice.ok ? "bg-emerald-600" : "bg-red-600"}`}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
        Administración
      </p>
      <h1 className="mt-2 text-3xl font-bold text-text">
        Equipo de cotizaciones
      </h1>
      <p className="mt-2 text-textLight">
        Crea y administra únicamente gestores y coordinadores de cotizaciones.
      </p>
      <section className="mt-6 rounded-2xl border border-primary/15 bg-white/70 p-5">
        <h2 className="font-bold text-text">Nuevo integrante</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void create(event.currentTarget);
          }}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <input
            required
            name="nombres"
            placeholder="Nombres"
            className="rounded-xl border border-primary/15 px-4 py-3 text-sm"
          />
          <input
            required
            name="apellidos"
            placeholder="Apellidos"
            className="rounded-xl border border-primary/15 px-4 py-3 text-sm"
          />
          <input
            required
            name="cedula"
            inputMode="numeric"
            placeholder="Cédula"
            className="rounded-xl border border-primary/15 px-4 py-3 text-sm"
          />
          <input
            required
            name="cargo"
            placeholder="Cargo"
            className="rounded-xl border border-primary/15 px-4 py-3 text-sm"
          />
          <input
            required
            name="email"
            type="email"
            placeholder="Correo corporativo"
            className="rounded-xl border border-primary/15 px-4 py-3 text-sm"
          />
          <div className="relative">
            <input
              required
              name="password"
              type={showTemporaryPassword ? "text" : "password"}
              minLength={12}
              placeholder="Contraseña temporal (mínimo 12 caracteres)"
              className="w-full rounded-xl border border-primary/15 px-4 py-3 pr-20 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowTemporaryPassword((visible) => !visible)}
              className="absolute inset-y-0 right-3 text-xs font-semibold text-primary hover:text-primary/75"
              aria-label={
                showTemporaryPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showTemporaryPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
          <select
            name="rol"
            className="rounded-xl border border-primary/15 px-4 py-3 text-sm"
          >
            <option value="gestor">Gestor de cotizaciones</option>
            <option value="coordinador">Coordinador de cotizaciones</option>
          </select>
          <button className="w-fit rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">
            Crear integrante
          </button>
        </form>
      </section>
      <section className="mt-5 rounded-2xl border border-primary/15 bg-white/70 p-5">
        <h2 className="font-bold text-text">Integrantes registrados</h2>
        <div className="mt-4 space-y-3">
          {advisers.map((adviser) => (
            <form
              key={adviser.id}
              onSubmit={(event) => {
                event.preventDefault();
                void update(adviser, event.currentTarget);
              }}
              className="grid gap-2 rounded-xl border border-primary/10 bg-white/80 p-3 md:grid-cols-2 xl:grid-cols-[1.1fr_1.1fr_1fr_.9fr_auto]"
            >
              <div>
                <p className="text-xs font-bold text-text">
                  {adviser.cedula} · {adviser.cargo || "Sin cargo"}
                </p>
                <input
                  name="nombre"
                  defaultValue={adviser.nombre}
                  className="mt-1 w-full rounded-lg border border-primary/15 px-2 py-2 text-sm"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:contents">
                <input
                  required
                  name="cargo"
                  defaultValue={adviser.cargo || ""}
                  placeholder="Cargo"
                  className="rounded-lg border border-primary/15 px-2 py-2 text-sm"
                />
                <input
                  required
                  name="email"
                  type="email"
                  defaultValue={adviser.email}
                  className="rounded-lg border border-primary/15 px-2 py-2 text-sm"
                />
              </div>
              <select
                name="rol"
                defaultValue={
                  adviser.rol?.includes("Coordinador")
                    ? "coordinador"
                    : "gestor"
                }
                className="rounded-lg border border-primary/15 px-2 py-2 text-sm"
              >
                <option value="gestor">Gestor</option>
                <option value="coordinador">Coordinador</option>
              </select>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void action(
                      adviser,
                      adviser.activo ? "suspend" : "activate",
                    )
                  }
                  className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800"
                >
                  {adviser.activo ? "Suspender" : "Reactivar"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteCandidate(adviser)}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                >
                  Eliminar
                </button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
