"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, ChevronDown, FileText, Search, Users } from "lucide-react";

type Application = {
  id: string;
  name: string;
  document: string;
  email: string;
  phone: string;
  status: string;
  observation: string | null;
  appliedAt: string;
};
type ClosedVacancy = {
  id: string;
  title: string;
  city: string;
  department: string;
  closedAt: string;
  applications: Application[];
};

const statusTone: Record<string, string> = {
  Contratado: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "No seleccionado": "bg-red-50 text-red-700 border-red-200",
  "En revisión": "bg-amber-50 text-amber-800 border-amber-200",
  "Entrevista RH": "bg-violet-50 text-violet-700 border-violet-200",
  "Prueba técnica": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function VacancyHistoryPage() {
  const [vacancies, setVacancies] = useState<ClosedVacancy[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void fetch("/api/vacantes/historial")
      .then((response) => response.json())
      .then((result) => setVacancies(result.data ?? []))
      .catch(() => setVacancies([]))
      .finally(() => setLoading(false));
  }, []);
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vacancies;
    return vacancies.filter(
      (vacancy) =>
        vacancy.title.toLowerCase().includes(query) ||
        vacancy.city.toLowerCase().includes(query) ||
        vacancy.applications.some(
          (application) =>
            application.name.toLowerCase().includes(query) ||
            application.document.includes(query) ||
            application.email.toLowerCase().includes(query),
        ),
    );
  }, [vacancies, search]);
  return (
    <div className="space-y-6 p-5 md:p-8">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#173f73] via-[#315d98] to-[#79a2d0] p-7 text-white shadow-[0_20px_50px_rgba(20,57,106,.22)]">
        <Archive className="absolute -bottom-8 -right-4 h-40 w-40 text-white/10" />
        <p className="relative text-xs font-bold uppercase tracking-[.18em] text-blue-100">
          Archivo operativo
        </p>
        <h1 className="relative mt-2 text-3xl font-bold">
          Historial de vacantes
        </h1>
        <p className="relative mt-2 max-w-2xl text-sm leading-6 text-blue-50">
          Consulta vacantes cerradas y el detalle de cada postulación conservada
          para trazabilidad.
        </p>
      </section>
      <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
        <label className="relative block">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-textLight" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar vacante, nombre, documento o correo..."
            className="w-full rounded-xl border border-border py-3 pl-10 pr-4 outline-none focus:border-primary"
          />
        </label>
        <p className="mt-3 text-sm text-textLight">
          {visible.length} vacante(s) cerrada(s). El historial no se elimina.
        </p>
        <div className="mt-5 space-y-4">
          {loading ? (
            <p className="py-10 text-center text-textLight">
              Cargando historial...
            </p>
          ) : (
            visible.map((vacancy) => {
              const isExpanded = expanded === vacancy.id;
              const selected = vacancy.applications.filter(
                (item) => item.status === "Contratado",
              ).length;
              return (
                <article
                  key={vacancy.id}
                  className="overflow-hidden rounded-2xl border border-[#dbe5f3] bg-[#fbfdff]"
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : vacancy.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-[#f5f9ff]"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[.15em] text-primary">
                        Cerrada ·{" "}
                        {new Date(vacancy.closedAt).toLocaleDateString("es-CO")}
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-text">
                        {vacancy.title}
                      </h2>
                      <p className="mt-1 text-sm text-textLight">
                        {vacancy.city}, {vacancy.department} ·{" "}
                        {vacancy.applications.length} postulación(es) ·{" "}
                        {selected} seleccionado(s)
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-primary transition ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="border-t border-[#dbe5f3] bg-white p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-text">
                        <Users size={16} className="text-primary" /> Postulantes
                        de esta vacante
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[780px] text-left text-sm">
                          <thead className="bg-[#f5f8fd] text-xs uppercase tracking-wider text-textLight">
                            <tr>
                              <th className="p-3">Postulante</th>
                              <th className="p-3">Documento</th>
                              <th className="p-3">Contacto</th>
                              <th className="p-3">Estado final</th>
                              <th className="p-3">Observación</th>
                              <th className="p-3">Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vacancy.applications.map((application) => (
                              <tr
                                key={application.id}
                                className="border-t border-[#edf2f8]"
                              >
                                <td className="p-3 font-bold text-text">
                                  {application.name}
                                </td>
                                <td className="p-3">
                                  {application.document || "No registrado"}
                                </td>
                                <td className="p-3">
                                  <p>{application.email}</p>
                                  <p className="mt-1 text-xs text-textLight">
                                    {application.phone || "No registrado"}
                                  </p>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone[application.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                                  >
                                    {application.status}
                                  </span>
                                </td>
                                <td className="max-w-xs p-3 text-textLight">
                                  {application.observation || "Sin observación"}
                                </td>
                                <td className="p-3 text-textLight">
                                  {new Date(
                                    application.appliedAt,
                                  ).toLocaleDateString("es-CO")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
          {!loading && !visible.length && (
            <div className="rounded-2xl border border-dashed border-[#c8d8ee] p-10 text-center">
              <FileText className="mx-auto h-8 w-8 text-primary/50" />
              <p className="mt-3 font-bold text-text">
                No hay vacantes cerradas para mostrar
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
