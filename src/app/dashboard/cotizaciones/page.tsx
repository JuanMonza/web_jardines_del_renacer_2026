"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import * as XLSX from "xlsx-js-style";

type QuoteStatus =
  "nuevo" | "contactado" | "en_negociacion" | "convertido" | "descartado";
type Quote = {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  ciudad: string;
  plan_nombre: string | null;
  cobertura: string;
  num_beneficiarios: number;
  contacto_preferido: string;
  hora_contacto: string | null;
  estado: QuoteStatus;
  creado_en: string;
  notas_asesor: string | null;
  motivo_perdida: string | null;
  proximo_contacto: string | null;
  asesor_id: number | null;
  asesor_nombre: string | null;
  primer_contacto_en: string | null;
};
type Adviser = {
  id: number;
  nombre: string;
  cedula?: string;
  email?: string;
  activo?: number;
  rol?: string;
};
type QuickFilter =
  "" | "sin_gestionar" | "seguimiento_hoy" | "seguimiento_vencido";

const statusLabels: Record<QuoteStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  en_negociacion: "En negociación",
  convertido: "Convertido",
  descartado: "Descartado",
};

export default function CotizacionesDashboardPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [status, setStatus] = useState<"todos" | QuoteStatus>("todos");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("");
  const [adviserFilter, setAdviserFilter] = useState("");
  const [advisers, setAdvisers] = useState<Adviser[]>([]);
  const [history, setHistory] = useState<
    Array<{ id: number; detalle: string; creado_en: string; asesor: string }>
  >([]);
  const [historyQuote, setHistoryQuote] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; mensaje: string; creado_en: string }>
  >([]);
  const [canExport, setCanExport] = useState(false);
  const [advisorName, setAdvisorName] = useState("asesor(a)");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAdviser, setBulkAdviser] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (status !== "todos") params.set("estado", status);
      if (search.trim()) params.set("q", search.trim());
      if (fromDate) params.set("desde", fromDate);
      if (toDate) params.set("hasta", toDate);
      if (quickFilter) params.set("filtro", quickFilter);
      if (adviserFilter) params.set("asesor", adviserFilter);
      const response = await fetch(`/api/cotizaciones?${params}`);
      const payload = (await response.json()) as {
        data?: Quote[];
        message?: string;
      };
      if (!response.ok)
        throw new Error(
          payload.message || "No fue posible cargar las cotizaciones.",
        );
      setQuotes(payload.data || []);
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las cotizaciones.",
      );
    } finally {
      setLoading(false);
    }
  }, [status, search, fromDate, toDate, quickFilter, adviserFilter]);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);
  useEffect(() => {
    fetch("/api/cotizaciones/asesores")
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then((payload: { data?: Adviser[] }) => setAdvisers(payload.data || []));
  }, []);
  useEffect(() => {
    fetch("/api/iam/admin/session")
      .then((response) =>
        response.ok ? response.json() : { user: { permissions: [] } },
      )
      .then((payload: { user?: { permissions?: string[]; name?: string } }) => {
        setCanExport(
          payload.user?.permissions?.includes("quotes.view.all") || false,
        );
        setAdvisorName(payload.user?.name?.trim() || "asesor(a)");
      });
  }, []);
  useEffect(() => {
    fetch("/api/cotizaciones/notificaciones")
      .then((response) => (response.ok ? response.json() : { data: [] }))
      .then(
        (payload: {
          data?: Array<{ id: number; mensaje: string; creado_en: string }>;
        }) => setNotifications(payload.data || []),
      );
  }, []);

  const exportCsv = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("desde", fromDate);
      if (toDate) params.set("hasta", toDate);
      if (adviserFilter) params.set("asesor", adviserFilter);
      const response = await fetch(`/api/cotizaciones/reporte?${params}`);
      const payload = (await response.json()) as {
        cotizaciones?: Array<Record<string, unknown>>;
        historial?: Array<Record<string, unknown>>;
        message?: string;
      };
      if (!response.ok)
        throw new Error(
          payload.message || "No fue posible generar el reporte.",
        );
      const workbook = XLSX.utils.book_new();
      const quotesRows = (payload.cotizaciones || []).map((quote) => ({
        Fecha: quote.creado_en
          ? new Date(String(quote.creado_en)).toLocaleString("es-CO")
          : "",
        Nombres: quote.nombre,
        Apellidos: quote.apellido,
        Teléfono: quote.telefono,
        Ciudad: quote.ciudad,
        Plan: quote.plan_nombre,
        Cobertura: quote.cobertura,
        Beneficiarios: quote.num_beneficiarios,
        Canal: quote.contacto_preferido,
        "Hora solicitada": quote.hora_contacto,
        Estado: quote.estado,
        Asesor: quote.asesor_nombre,
        "Primer contacto": quote.primer_contacto_en,
        "Próximo contacto": quote.proximo_contacto,
        "Motivo de pérdida": quote.motivo_perdida,
        "Notas actuales": quote.notas_asesor,
      }));
      const historyRows = (payload.historial || []).map((event) => ({
        "ID cotización": event.cotizacion_id,
        Fecha: event.creado_en
          ? new Date(String(event.creado_en)).toLocaleString("es-CO")
          : "",
        Tipo: event.tipo,
        Responsable: event.responsable || "Sistema",
        Detalle: event.detalle,
      }));
      const total = quotesRows.length;
      const count = (status: string) =>
        quotesRows.filter((quote) => quote.Estado === status).length;
      const converted = count("convertido");
      const lost = count("descartado");
      const summaryRows = [
        ["REPORTE COMERCIAL · JARDINES DEL RENACER", ""],
        ["Período", `${fromDate || "Inicio"} a ${toDate || "Hoy"}`],
        ["Total de cotizaciones", total],
        ["Nuevas / por confirmar", count("nuevo") + count("contactado")],
        ["En proceso", count("en_negociacion")],
        ["Ventas convertidas", converted],
        ["Perdidas", lost],
        [
          "Conversión",
          total ? `${Math.round((converted / total) * 100)}%` : "0%",
        ],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
      summarySheet["!cols"] = [{ wch: 28 }, { wch: 28 }];
      const paints: Record<number, string> = {
        4: "FDE68A",
        5: "BFDBFE",
        6: "BBF7D0",
        7: "FECACA",
        8: "DBEAFE",
      };
      Object.entries(paints).forEach(([row, color]) => {
        const cell = summarySheet[`B${row}`];
        if (cell)
          cell.s = { fill: { fgColor: { rgb: color } }, font: { bold: true } };
      });
      const quotesSheet = XLSX.utils.json_to_sheet(quotesRows);
      quotesSheet["!cols"] = [
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 28 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 16 },
        { wch: 18 },
        { wch: 24 },
        { wch: 20 },
        { wch: 20 },
        { wch: 26 },
        { wch: 42 },
      ];
      const statusColors: Record<string, string> = {
        nuevo: "FDE68A",
        contactado: "BFDBFE",
        en_negociacion: "DDD6FE",
        convertido: "BBF7D0",
        descartado: "FECACA",
      };
      quotesRows.forEach((quote, index) => {
        const cell = quotesSheet[`K${index + 2}`];
        const color = statusColors[String(quote.Estado)];
        if (cell && color)
          cell.s = { fill: { fgColor: { rgb: color } }, font: { bold: true } };
      });
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
      XLSX.utils.book_append_sheet(workbook, quotesSheet, "Cotizaciones");
      XLSX.utils.book_append_sheet(
        workbook,
        XLSX.utils.json_to_sheet(historyRows),
        "Trazabilidad",
      );
      XLSX.writeFile(
        workbook,
        `reporte-cotizaciones-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No fue posible generar el reporte.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const summary = useMemo(
    () => ({
      total: quotes.length,
      nuevo: quotes.filter((quote) => quote.estado === "nuevo").length,
      contactado: quotes.filter((quote) => quote.estado === "contactado")
        .length,
      convertido: quotes.filter((quote) => quote.estado === "convertido")
        .length,
      perdido: quotes.filter((quote) => quote.estado === "descartado").length,
      vencidos: quotes.filter(
        (quote) =>
          quote.proximo_contacto &&
          new Date(quote.proximo_contacto) < new Date() &&
          !["convertido", "descartado"].includes(quote.estado),
      ).length,
    }),
    [quotes],
  );
  const conversionRate = summary.total
    ? Math.round((summary.convertido / summary.total) * 100)
    : 0;
  const firstContactHours = useMemo(() => {
    const answered = quotes.filter((quote) => quote.primer_contacto_en);
    if (!answered.length) return null;
    return (
      Math.round(
        (answered.reduce(
          (total, quote) =>
            total +
            (new Date(quote.primer_contacto_en as string).getTime() -
              new Date(quote.creado_en).getTime()) /
              3_600_000,
          0,
        ) /
          answered.length) *
          10,
      ) / 10
    );
  }, [quotes]);
  const topBy = (field: "plan_nombre" | "ciudad" | "asesor_nombre") =>
    Object.entries(
      quotes.reduce<Record<string, number>>((result, item) => {
        const key = item[field] || "Sin asignar";
        result[key] = (result[key] || 0) + 1;
        return result;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  const pendingByAdviser = Object.entries(
    quotes
      .filter((quote) => !["convertido", "descartado"].includes(quote.estado))
      .reduce<Record<string, number>>((result, quote) => {
        const key = quote.asesor_nombre || "Sin asignar";
        result[key] = (result[key] || 0) + 1;
        return result;
      }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const conversionByAdviser = Object.entries(
    quotes.reduce<Record<string, { total: number; converted: number }>>(
      (result, quote) => {
        const key = quote.asesor_nombre || "Sin asignar";
        const current = result[key] || { total: 0, converted: 0 };
        current.total += 1;
        if (quote.estado === "convertido") current.converted += 1;
        result[key] = current;
        return result;
      },
      {},
    ),
  )
    .map(
      ([name, data]) =>
        [name, `${Math.round((data.converted / data.total) * 100)}%`] as [
          string,
          string,
        ],
    )
    .sort(
      (a, b) => Number(b[1].replace("%", "")) - Number(a[1].replace("%", "")),
    )
    .slice(0, 3);
  const toWhatsAppPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 10 ? `57${digits}` : digits;
  };
  const followUpIndicator = (quote: Quote) => {
    if (["convertido", "descartado"].includes(quote.estado))
      return { label: "Cerrado", className: "bg-slate-100 text-slate-600" };
    if (!quote.proximo_contacto)
      return {
        label: "Sin programar",
        className: "bg-amber-100 text-amber-800",
      };
    const date = new Date(quote.proximo_contacto);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date < today)
      return { label: "Vencido", className: "bg-red-100 text-red-700" };
    if (date.getTime() === today.getTime())
      return { label: "Hoy", className: "bg-amber-100 text-amber-800" };
    return {
      label: "Programado",
      className: "bg-emerald-100 text-emerald-700",
    };
  };
  const encodeURIComponent = (value: string) =>
    globalThis.encodeURIComponent(
      value
        .replace(
          " 💙 Soy asesor de Jardines del Renacer.",
          ` Soy ${advisorName} de Jardines del Renacer.`,
        )
        .replace(
          "¿Te parece si te cuento sus beneficios y preparamos una cotización personalizada, sin compromiso? 💙",
          `En Jardines del Renacer te acompañamos con dignidad, sensibilidad y confianza. ${String.fromCodePoint(0x1f499)}`,
        ),
    );
  const saveFollowUp = async (quote: Quote, form: HTMLFormElement) => {
    const data = new FormData(form);
    const response = await fetch(`/api/cotizaciones/${quote.id}/estado`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        estado: data.get("estado"),
        notasAsesor: data.get("nota"),
        proximoContacto: data.get("proximoContacto"),
        asesorId: Number(data.get("asesorId")) || undefined,
        motivoPerdida: data.get("motivoPerdida"),
      }),
    });
    const payload = (await response.json()) as { message?: string };
    setFeedback(
      response.ok
        ? "Seguimiento guardado."
        : payload.message || "No fue posible guardar el seguimiento.",
    );
    if (response.ok) {
      setSelectedQuote(null);
      void loadQuotes();
    }
  };
  const loadHistory = async (quote: Quote) => {
    const response = await fetch(`/api/cotizaciones/${quote.id}/estado`);
    const raw = await response.text();
    let payload: { data?: typeof history; message?: string } = {};
    try {
      payload = raw ? (JSON.parse(raw) as typeof payload) : {};
    } catch {
      payload = { message: "No fue posible cargar el historial." };
    }
    if (!response.ok) {
      setFeedback(payload.message || "No fue posible cargar el historial.");
      return;
    }
    setHistory(payload.data || []);
    setHistoryQuote(quote.nombre);
  };
  const openManage = async (quote: Quote) => {
    setSelectedQuote(quote);
    await loadHistory(quote);
  };
  const assignSelected = async () => {
    const response = await fetch("/api/cotizaciones/asignar", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: selectedIds, asesorId: Number(bulkAdviser) }),
    });
    const payload = (await response.json()) as { message?: string };
    setFeedback(payload.message || "No fue posible asignar las cotizaciones.");
    if (response.ok) {
      setSelectedIds([]);
      setBulkAdviser("");
      void loadQuotes();
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Prospectos
          </p>
          <h1 className="mt-2 text-3xl font-bold text-text">Cotizaciones</h1>
          <p className="mt-2 text-textLight">
            Consulta, actualiza y descarga las solicitudes recibidas desde
            Afíliate Ya.
          </p>
        </div>
        {canExport && (
          <button
            onClick={exportCsv}
            disabled={!quotes.length || isExporting}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {isExporting ? "Generando reporte..." : "Descargar Excel completo"}
          </button>
        )}
      </div>
      {canExport && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {[
              ["Total", summary.total],
              ["Nuevas", summary.nuevo],
              ["Contactadas", summary.contactado],
              ["Convertidas", summary.convertido],
              ["Conversión", `${conversionRate}%`],
              [
                "1.er contacto",
                firstContactHours === null ? "—" : `${firstContactHours} h`,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-textLight">
                  {label}
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
              </div>
            ))}
          </div>
          {notifications.length > 0 && (
            <details className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
              <summary className="cursor-pointer list-none text-sm font-bold text-primary">
                Notificaciones pendientes{" "}
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                  {notifications.length}
                </span>
              </summary>
              <div className="mt-3 space-y-2 border-t border-primary/10 pt-3 text-sm text-text">
                {notifications.slice(0, 5).map((notification) => (
                  <p
                    key={notification.id}
                    className="rounded-lg bg-white/60 px-3 py-2"
                  >
                    {notification.mensaje}
                  </p>
                ))}
              </div>
            </details>
          )}
          {(summary.vencidos > 0 || summary.perdido > 0) && (
            <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <strong>{summary.vencidos} seguimiento(s) vencido(s).</strong> Usa
              el filtro para atenderlos. Cotizaciones perdidas:{" "}
              {summary.perdido}.
            </div>
          )}
          <details className="mt-4">
            <summary className="inline-flex cursor-pointer list-none rounded-xl border border-primary/20 bg-white/70 px-4 py-3 text-sm font-bold text-primary shadow-sm">
              Ver análisis comercial
            </summary>
            <div className="mt-3 grid gap-3 lg:grid-cols-4">
              {[
                {
                  label: "Planes más solicitados",
                  values: topBy("plan_nombre"),
                },
                {
                  label: "Ciudades con más solicitudes",
                  values: topBy("ciudad"),
                },
                { label: "Pendientes por asesor", values: pendingByAdviser },
                { label: "Conversión por asesor", values: conversionByAdviser },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-white/80 bg-white/65 p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-textLight">
                    {card.label}
                  </p>
                  <div className="mt-3 space-y-1 text-sm text-text">
                    {card.values.length ? (
                      card.values.map(([label, value]) => (
                        <p key={label} className="flex justify-between gap-3">
                          <span className="truncate">{label}</span>
                          <strong>{value}</strong>
                        </p>
                      ))
                    ) : (
                      <p className="text-textLight">
                        Sin datos en este período.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </>
      )}
      {!canExport && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Mis ventas", summary.total],
            ["Convertidas", summary.convertido],
            ["Por confirmar", summary.nuevo + summary.contactado],
            [
              "En proceso",
              quotes.filter((quote) => quote.estado === "en_negociacion")
                .length,
            ],
            ["Perdidas", summary.perdido],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-textLight">
                {label}
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            "todos",
            "nuevo",
            "contactado",
            "en_negociacion",
            "convertido",
            "descartado",
          ] as const
        ).map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`rounded-full px-3 py-2 text-xs font-bold ${status === item ? "bg-primary text-white" : "bg-white/70 text-primary"}`}
          >
            {item === "todos" ? "Todas" : statusLabels[item]}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(
          [
            { value: "", label: "Todos los seguimientos" },
            { value: "sin_gestionar", label: "Sin gestionar" },
            { value: "seguimiento_hoy", label: "Seguimiento hoy" },
            { value: "seguimiento_vencido", label: "Vencidos" },
          ] as Array<{ value: QuickFilter; label: string }>
        ).map((item) => (
          <button
            key={item.label}
            onClick={() => setQuickFilter(item.value)}
            className={`rounded-full px-3 py-2 text-xs font-bold ${quickFilter === item.value ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-800"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre, teléfono, ciudad o plan"
          className="rounded-xl border border-primary/15 bg-white/70 px-4 py-3 text-sm text-text"
        />
        <input
          type="date"
          value={fromDate}
          onChange={(event) => setFromDate(event.target.value)}
          className="rounded-xl border border-primary/15 bg-white/70 px-4 py-3 text-sm text-text"
        />
        <input
          type="date"
          value={toDate}
          onChange={(event) => setToDate(event.target.value)}
          className="rounded-xl border border-primary/15 bg-white/70 px-4 py-3 text-sm text-text"
        />
        <select
          value={adviserFilter}
          onChange={(event) => setAdviserFilter(event.target.value)}
          className="rounded-xl border border-primary/15 bg-white/70 px-4 py-3 text-sm text-text"
        >
          <option value="">Todos los asesores</option>
          {advisers.map((adviser) => (
            <option key={adviser.id} value={adviser.id}>
              {adviser.nombre}
            </option>
          ))}
        </select>
      </div>
      {feedback && (
        <p className="mt-4 text-sm font-medium text-primary" role="status">
          {feedback}
        </p>
      )}
      {selectedQuote &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/80 bg-white p-6 shadow-[0_28px_80px_-24px_rgba(15,23,42,.55)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
                    Gestionar cotización
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-text">
                    {selectedQuote.nombre} {selectedQuote.apellido}
                  </h2>
                  <p className="mt-1 text-sm text-textLight">
                    {selectedQuote.telefono} ·{" "}
                    {selectedQuote.contacto_preferido} · Hora solicitada:{" "}
                    {selectedQuote.hora_contacto || "No registrada"} ·{" "}
                    {selectedQuote.plan_nombre || "Plan por definir"} ·{" "}
                    {selectedQuote.ciudad}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold text-textLight"
                >
                  Cerrar
                </button>
              </div>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveFollowUp(selectedQuote, event.currentTarget);
                }}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <label className="text-sm font-semibold text-text">
                  Estado
                  <select
                    name="estado"
                    defaultValue={selectedQuote.estado}
                    className="mt-2 w-full rounded-xl border border-primary/20 bg-white px-3 py-3 text-sm text-primary"
                  >
                    {(Object.keys(statusLabels) as QuoteStatus[]).map(
                      (item) => (
                        <option key={item} value={item}>
                          {statusLabels[item]}
                        </option>
                      ),
                    )}
                  </select>
                </label>
                <label className="text-sm font-semibold text-text">
                  Asesor responsable
                  <select
                    name="asesorId"
                    defaultValue={selectedQuote.asesor_id || ""}
                    className="mt-2 w-full rounded-xl border border-primary/20 bg-white px-3 py-3 text-sm text-text"
                  >
                    <option value="">Asignarme a mí</option>
                    {advisers.map((adviser) => (
                      <option key={adviser.id} value={adviser.id}>
                        {adviser.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold text-text">
                  Próximo contacto
                  <input
                    name="proximoContacto"
                    type="datetime-local"
                    defaultValue={
                      selectedQuote.proximo_contacto
                        ? new Date(selectedQuote.proximo_contacto)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    className="mt-2 w-full rounded-xl border border-primary/20 bg-white px-3 py-3 text-sm text-text"
                  />
                </label>
                <label className="text-sm font-semibold text-text">
                  Motivo de pérdida
                  <select
                    name="motivoPerdida"
                    defaultValue={selectedQuote.motivo_perdida || ""}
                    className="mt-2 w-full rounded-xl border border-primary/20 bg-white px-3 py-3 text-sm text-text"
                  >
                    <option value="">
                      Selecciona un motivo si la descartas
                    </option>
                    <option value="Precio">Precio</option>
                    <option value="No respondió">No respondió</option>
                    <option value="Ya tiene plan">Ya tiene plan</option>
                    <option value="No cumple condiciones">
                      No cumple condiciones
                    </option>
                    <option value="Otro">Otro</option>
                  </select>
                </label>
                <label className="md:col-span-2 text-sm font-semibold text-text">
                  Nota de seguimiento
                  <textarea
                    name="nota"
                    defaultValue={selectedQuote.notas_asesor || ""}
                    placeholder="Registra aquí acuerdos, necesidades o próximos pasos"
                    className="mt-2 min-h-24 w-full rounded-xl border border-primary/20 bg-white px-3 py-3 text-sm text-text"
                  />
                </label>
                <div className="md:col-span-2 flex justify-end">
                  <button className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">
                    Guardar cambios
                  </button>
                </div>
              </form>
              <div className="mt-6 border-t border-primary/10 pt-5">
                <p className="font-bold text-text">Historial</p>
                <div className="mt-3 space-y-2 text-sm">
                  {history.length ? (
                    history.map((entry) => (
                      <p
                        key={entry.id}
                        className="rounded-xl bg-primary/5 p-3 text-text"
                      >
                        <strong>{entry.asesor || "Sistema"}</strong> ·{" "}
                        {entry.detalle}
                        <span className="ml-2 text-xs text-textLight">
                          {new Date(entry.creado_en).toLocaleString("es-CO")}
                        </span>
                      </p>
                    ))
                  ) : (
                    <p className="text-textLight">
                      Aún no hay movimientos registrados para{" "}
                      {historyQuote || selectedQuote.nombre}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {canExport && selectedIds.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <strong className="text-sm text-primary">
            {selectedIds.length} seleccionada(s)
          </strong>
          <select
            value={bulkAdviser}
            onChange={(event) => setBulkAdviser(event.target.value)}
            className="rounded-xl border border-primary/15 bg-white px-3 py-2 text-sm"
          >
            <option value="">Asignar a un gestor</option>
            {advisers.map((adviser) => (
              <option key={adviser.id} value={adviser.id}>
                {adviser.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={() => void assignSelected()}
            disabled={!bulkAdviser}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            Asignar seleccionadas
          </button>
        </div>
      )}
      <div className="mt-5 space-y-3 lg:hidden">
        {quotes.map((quote) => (
          <article
            key={quote.id}
            className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-text">
                  {quote.nombre} {quote.apellido}
                </p>
                <p className="mt-1 text-sm text-textLight">
                  {quote.telefono} · {quote.ciudad}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${followUpIndicator(quote).className}`}
              >
                {followUpIndicator(quote).label}
              </span>
            </div>
            <p className="mt-3 text-sm text-text">
              {quote.plan_nombre || "Plan por definir"}
            </p>
            <p className="mt-1 text-xs text-textLight">
              {quote.contacto_preferido} ·{" "}
              {quote.hora_contacto || "Hora no registrada"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${toWhatsAppPhone(quote.telefono)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
              >
                WhatsApp
              </a>
              <a
                href={`tel:${quote.telefono}`}
                className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary"
              >
                Llamar
              </a>
              <button
                onClick={() => void openManage(quote)}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
              >
                Gestionar
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-white/80 bg-white/65 lg:block">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-primary/10 text-xs uppercase tracking-wider text-textLight">
            <tr>
              {[
                ...(canExport ? ["Seleccionar"] : []),
                "Fecha",
                "Persona",
                "Plan",
                "Cobertura",
                "Canal",
                "Contacto",
                "Seguimiento",
              ].map((label) => (
                <th key={label} className="px-4 py-4">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={canExport ? 8 : 7}
                  className="px-4 py-10 text-center text-textLight"
                >
                  Cargando cotizaciones...
                </td>
              </tr>
            ) : quotes.length ? (
              quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="border-b border-primary/5 last:border-0"
                >
                  {canExport && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(quote.id)}
                        onChange={(event) =>
                          setSelectedIds((ids) =>
                            event.target.checked
                              ? [...ids, quote.id]
                              : ids.filter((id) => id !== quote.id),
                          )
                        }
                        className="h-4 w-4 accent-primary"
                        aria-label={`Seleccionar ${quote.nombre}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-4 text-textLight">
                    {new Date(quote.creado_en).toLocaleDateString("es-CO")}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-bold text-text">
                      {quote.nombre} {quote.apellido}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-textLight">
                      <span>
                        {quote.telefono} · {quote.ciudad}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text">
                    {quote.plan_nombre || "Sin plan"}
                  </td>
                  <td className="px-4 py-4 text-textLight">
                    {quote.cobertura} · {quote.num_beneficiarios}
                  </td>
                  <td className="px-4 py-4 text-textLight">
                    <p>{quote.contacto_preferido}</p>
                    <p className="mt-1 text-xs">
                      Hora solicitada: {quote.hora_contacto || "No registrada"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2">
                      <a
                        href={`https://wa.me/${toWhatsAppPhone(quote.telefono)}?text=${encodeURIComponent(`Hola, ${quote.nombre}. 💙 Soy asesor de Jardines del Renacer.\n\nGracias por interesarte en el ${quote.plan_nombre || "plan que consultaste"}. Queremos ayudarte a proteger a tu familia con una alternativa que se ajuste a lo que necesitas.\n\n¿Te parece si te cuento sus beneficios y preparamos una cotización personalizada, sin compromiso? 💙`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${quote.telefono}`}
                        className="inline-flex rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary/20"
                      >
                        Llamar
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${followUpIndicator(quote).className}`}
                      >
                        {followUpIndicator(quote).label}
                      </span>
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        {statusLabels[quote.estado]}
                      </span>
                      <p className="text-xs text-textLight">
                        {quote.asesor_nombre || "Sin asignar"}
                        {quote.proximo_contacto
                          ? ` · ${new Date(quote.proximo_contacto).toLocaleDateString("es-CO")}`
                          : ""}
                      </p>
                      <button
                        onClick={() => void openManage(quote)}
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
                      >
                        Gestionar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={canExport ? 8 : 7}
                  className="px-4 py-10 text-center text-textLight"
                >
                  No hay cotizaciones para este filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
