"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx-js-style";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownToLine,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  TrendingUp,
  UsersRound,
} from "lucide-react";

type Application = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidateDocument?: string;
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
type AuditItem = { createdAt: string; action: string; description: string };
const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});
const shortDateFormatter = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeZone: "America/Bogota",
});
const sheetHeader = {
  font: { bold: true, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "1D4E89" } },
  alignment: { horizontal: "center", vertical: "center" },
};
const excelStatusStyles: Record<
  string,
  { label: string; color: string; font: string; meaning: string }
> = {
  Recibida: {
    label: "Recibida",
    color: "DCEEFF",
    font: "075985",
    meaning: "Nueva postulación recibida",
  },
  "En revision": {
    label: "En revisión",
    color: "FEF3C7",
    font: "92400E",
    meaning: "Perfil en validación",
  },
  Entrevista: {
    label: "Entrevista",
    color: "EDE9FE",
    font: "6D28D9",
    meaning: "Candidato en entrevista",
  },
  "Prueba tecnica": {
    label: "Prueba técnica",
    color: "FFEDD5",
    font: "9A3412",
    meaning: "Evaluación técnica pendiente",
  },
  Seleccionado: {
    label: "Seleccionado",
    color: "DCFCE7",
    font: "166534",
    meaning: "Proceso aprobado",
  },
  "No continua": {
    label: "No continúa",
    color: "FEE2E2",
    font: "B91C1C",
    meaning: "Proceso finalizado sin selección",
  },
};
const cellBorder = {
  top: { style: "thin", color: { rgb: "D9E4F2" } },
  bottom: { style: "thin", color: { rgb: "D9E4F2" } },
  left: { style: "thin", color: { rgb: "D9E4F2" } },
  right: { style: "thin", color: { rgb: "D9E4F2" } },
};
const funnelStages = [
  {
    status: "Recibida",
    label: "Postulaciones recibidas",
    color: "bg-blue-500",
  },
  { status: "En revision", label: "En revisión", color: "bg-amber-500" },
  { status: "Entrevista", label: "En entrevista", color: "bg-violet-500" },
  { status: "Prueba tecnica", label: "Prueba técnica", color: "bg-indigo-500" },
  { status: "Seleccionado", label: "Seleccionados", color: "bg-emerald-500" },
];

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}
function styleTableSheet(
  sheet: XLSX.WorkSheet,
  range: string,
  widths: number[],
) {
  const headerRange = XLSX.utils.decode_range(range);
  for (let column = headerRange.s.c; column <= headerRange.e.c; column += 1) {
    const cell =
      sheet[XLSX.utils.encode_cell({ r: headerRange.s.r, c: column })];
    if (cell) cell.s = sheetHeader;
  }
  sheet["!autofilter"] = { ref: range };
  sheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  sheet["!cols"] = widths.map((wch) => ({ wch }));
}
function auditStatus(description: string) {
  const status = description.match(/Estado informado:\s*([^.]*)/i)?.[1]?.trim();
  return status && excelStatusStyles[status] ? status : "";
}
function applyStatusCellStyle(
  sheet: XLSX.WorkSheet,
  cellAddress: string,
  status: string,
) {
  const style = excelStatusStyles[status];
  const cell = sheet[cellAddress];
  if (!cell || !style) return;
  cell.s = {
    font: { bold: true, color: { rgb: style.font } },
    fill: { fgColor: { rgb: style.color } },
    alignment: { horizontal: "center", vertical: "center" },
    border: cellBorder,
  };
}
function auditRow(item: AuditItem) {
  const description =
    typeof item.description === "string" ? item.description : "";
  const action =
    typeof item.action === "string" ? item.action : "MOVIMIENTO_HISTÓRICO";
  const responsible = description.match(
    /Administrador\s+(.+?)\s+\(ID\s+(\d+)\)/i,
  );
  const quotedItem = description.match(/“([^”]+)”/);
  const observation = description
    .match(/Observación:\s*([\s\S]*?)$/i)?.[1]
    ?.trim();
  return {
    Fecha: formatDate(item.createdAt),
    Movimiento:
      (
        {
          VACANTE_CREADA: "Creó una vacante",
          VACANTE_ACTUALIZADA: "Editó una vacante",
          VACANTE_ELIMINADA: "Cerró una vacante",
          VACANTE_PAUSADA: "Pausó una vacante",
          VACANTE_REANUDADA: "Reanudó una vacante",
          POSTULANTE_ELIMINADO: "Eliminó un postulante",
          POSTULACION_ESTADO_ACTUALIZADO: "Actualizó un proceso",
          POSTULANTE_NOTIFICADO: "Envió una notificación",
          POSTULANTE_NO_CONTINUA_VACANTE_CUBIERTA: "Notificó cierre de vacante",
        } as Record<string, string>
      )[action] || action.replaceAll("_", " "),
    Estado: auditStatus(description),
    "Usuario responsable": responsible
      ? `${responsible[1]} (ID ${responsible[2]})`
      : "No disponible (histórico)",
    "Elemento afectado": quotedItem?.[1] || "Ver detalle",
    Observación: observation || "Sin observación registrada",
    "Detalle completo":
      description || "Sin detalle disponible para este movimiento histórico.",
  };
}
function auditLabel(action: string) {
  return (
    (
      {
        VACANTE_CREADA: "Vacante creada",
        VACANTE_ACTUALIZADA: "Vacante editada",
        VACANTE_ELIMINADA: "Vacante cerrada",
        VACANTE_PAUSADA: "Vacante pausada",
        VACANTE_REANUDADA: "Vacante reanudada",
        POSTULANTE_ELIMINADO: "Postulante eliminado",
        POSTULACION_ESTADO_ACTUALIZADO: "Seguimiento actualizado",
        POSTULANTE_NOTIFICADO: "Correo enviado",
        POSTULANTE_NO_CONTINUA_VACANTE_CUBIERTA: "Cierre notificado",
      } as Record<string, string>
    )[action] || action.replaceAll("_", " ")
  );
}

export default function AnalyticsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  useEffect(() => {
    void Promise.all([
      fetch("/api/vacantes/postulaciones"),
      fetch("/api/vacantes"),
      fetch("/api/vacantes/auditoria"),
    ])
      .then(
        async ([applicationsResponse, vacanciesResponse, auditResponse]) => {
          const applications = await applicationsResponse.json();
          const auditLog = await auditResponse.json();
          setApps(applications.data ?? []);
          setVacancies(await vacanciesResponse.json());
          setAudit(auditLog.data ?? []);
        },
      )
      .catch(() => undefined);
  }, []);
  const activeVacancies = vacancies.filter(
    (vacancy) => (vacancy.applicationCount || 0) > 0,
  ).length;
  const noMovement = vacancies.filter((vacancy) => !vacancy.applicationCount);
  const visibleAudit = useMemo(
    () =>
      audit.filter((item) => {
        const value = new Date(item.createdAt).getTime();
        const from = auditStartDate
          ? new Date(`${auditStartDate}T00:00:00`).getTime()
          : null;
        const until = auditEndDate
          ? new Date(`${auditEndDate}T23:59:59.999`).getTime()
          : null;
        return (
          Number.isFinite(value) &&
          (from === null || value >= from) &&
          (until === null || value <= until)
        );
      }),
    [audit, auditStartDate, auditEndDate],
  );
  const stalled = apps.filter(
    (item) =>
      item.status === "Recibida" &&
      Date.now() - new Date(item.appliedAt).getTime() > 7 * 86400000,
  );
  const funnel = funnelStages.map((stage) => ({
    ...stage,
    value: apps.filter((item) => item.status === stage.status).length,
  }));
  const trend = useMemo(() => {
    const months: { label: string; key: string; postulaciones: number }[] = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - offset);
      months.push({
        label: date.toLocaleDateString("es-CO", { month: "short" }),
        key: `${date.getFullYear()}-${date.getMonth()}`,
        postulaciones: 0,
      });
    }
    apps.forEach((app) => {
      const value = new Date(app.appliedAt);
      const match = months.find(
        (month) => month.key === `${value.getFullYear()}-${value.getMonth()}`,
      );
      if (match) match.postulaciones += 1;
    });
    return months;
  }, [apps]);
  const exportReport = () => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      workbook.Props = {
        Title: "Analítica de Vacantes · Jardines del Renacer",
        Subject: "Reporte operativo y de auditoría",
      };
      const summary = XLSX.utils.aoa_to_sheet([
        ["REPORTE DE ANALÍTICA · VACANTES"],
        ["Jardines del Renacer"],
        [`Generado: ${dateFormatter.format(new Date())}`],
        [],
        ["Indicador", "Valor"],
        ["Postulaciones activas", apps.length],
        ["Vacantes con movimiento", activeVacancies],
        ["Vacantes sin movimiento", noMovement.length],
        [
          "Postulantes eliminados (histórico)",
          audit.filter((item) => item.action === "POSTULANTE_ELIMINADO").length,
        ],
        [],
        ["SEMÁFORO DEL PROCESO"],
        ["Estado", "Significado"],
        ...Object.values(excelStatusStyles).map((item) => [
          item.label,
          item.meaning,
        ]),
      ]);
      summary["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 10, c: 0 }, e: { r: 10, c: 1 } },
      ];
      summary.A1.s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "173F73" } },
        alignment: { horizontal: "center" },
      };
      summary.A2.s = { font: { bold: true, color: { rgb: "1D4E89" } } };
      for (const cell of ["A5", "B5", "A12", "B12"])
        if (summary[cell]) summary[cell].s = sheetHeader;
      Object.entries(excelStatusStyles).forEach(([, style], index) => {
        const cell = summary[`A${index + 13}`];
        if (cell)
          cell.s = {
            font: { bold: true, color: { rgb: style.font } },
            fill: { fgColor: { rgb: style.color } },
            border: cellBorder,
          };
      });
      summary["!cols"] = [{ wch: 38 }, { wch: 48 }];
      summary["!rows"] = [{ hpt: 28 }];
      XLSX.utils.book_append_sheet(workbook, summary, "Resumen ejecutivo");

      const applicationsSheet = XLSX.utils.json_to_sheet(
        apps.map((item) => ({
          "ID postulación": item.id,
          Cédula: item.candidateDocument || "No registrada",
          Candidato: item.candidateName,
          Correo: item.candidateEmail,
          Vacante: item.vacancyTitle,
          Estado: item.status,
          "Fecha de postulación": formatDate(item.appliedAt),
        })),
      );
      styleTableSheet(
        applicationsSheet,
        `A1:G${Math.max(1, apps.length + 1)}`,
        [16, 18, 28, 34, 28, 20, 25],
      );
      apps.forEach((item, index) =>
        applyStatusCellStyle(applicationsSheet, `F${index + 2}`, item.status),
      );
      XLSX.utils.book_append_sheet(
        workbook,
        applicationsSheet,
        "Postulaciones activas",
      );

      const auditRows = audit.map(auditRow);
      const auditSheet = XLSX.utils.json_to_sheet(auditRows);
      styleTableSheet(
        auditSheet,
        `A1:G${Math.max(1, auditRows.length + 1)}`,
        [25, 32, 20, 34, 35, 55, 100],
      );
      auditRows.forEach((item, index) =>
        applyStatusCellStyle(auditSheet, `C${index + 2}`, item.Estado),
      );
      XLSX.utils.book_append_sheet(
        workbook,
        auditSheet,
        "Movimientos y auditoría",
      );
      XLSX.writeFile(
        workbook,
        `analitica-vacantes-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
    } finally {
      setIsExporting(false);
    }
  };
  const alerts = [
    ...noMovement.slice(0, 2).map((item) => ({
      type: "Vacante sin movimiento",
      text: item.title,
      icon: BriefcaseBusiness,
      tone: "text-amber-700 bg-amber-50",
    })),
    ...stalled.slice(0, 2).map((item) => ({
      type: "Postulación pendiente",
      text: `${item.candidateName} · ${item.vacancyTitle}`,
      icon: Clock3,
      tone: "text-rose-700 bg-rose-50",
    })),
  ];
  return (
    <div className="space-y-6 p-6 md:p-8">
      <section className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#173f73] via-[#315d98] to-[#78a1cf] p-7 text-white shadow-[0_20px_50px_rgba(20,57,106,.22)]">
        <BarChart3 className="absolute -right-4 -bottom-9 h-44 w-44 text-white/10" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-100">
              Talento humano · Decisiones
            </p>
            <h1 className="mt-2 text-3xl font-bold">Analítica de selección</h1>
            <p className="mt-2 max-w-2xl text-blue-50">
              Visualiza avances, identifica procesos que requieren atención y
              conserva la trazabilidad.
            </p>
          </div>
          <button
            type="button"
            onClick={exportReport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#173f73] shadow-sm disabled:opacity-70 md:self-auto"
          >
            <ArrowDownToLine size={17} />
            {isExporting ? "Generando…" : "Descargar Excel"}
          </button>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            FileText,
            "Postulaciones activas",
            apps.length,
            "Procesos con seguimiento en curso",
            "text-blue-700 bg-blue-50",
          ],
          [
            TrendingUp,
            "Vacantes con movimiento",
            activeVacancies,
            "Recibieron al menos una postulación",
            "text-emerald-700 bg-emerald-50",
          ],
          [
            BellRing,
            "Vacantes sin movimiento",
            noMovement.length,
            "Revisa visibilidad o publicación",
            "text-amber-700 bg-amber-50",
          ],
          [
            UsersRound,
            "Procesos finalizados",
            apps.filter(
              (item) =>
                item.status === "Seleccionado" || item.status === "No continua",
            ).length,
            "Decisión registrada en el proceso",
            "text-violet-700 bg-violet-50",
          ],
        ].map(([Icon, label, value, detail, tone]) => {
          const MetricIcon = Icon as typeof FileText;
          return (
            <article
              key={label as string}
              className="rounded-2xl border border-[#dbe5f3] bg-white p-5 shadow-[0_8px_22px_rgba(32,69,113,.07)]"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone as string}`}
              >
                <MetricIcon size={20} />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-textLight">
                {label as string}
              </p>
              <p className="mt-1 text-3xl font-bold text-text">
                {value as number}
              </p>
              <p className="mt-2 text-xs text-textLight">{detail as string}</p>
            </article>
          );
        })}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
                Embudo de selección
              </p>
              <h2 className="mt-1 text-xl font-bold text-text">
                Dónde están los postulantes
              </h2>
            </div>
            <span className="text-sm font-bold text-primary">
              {apps.length} total
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {funnel.map((stage) => (
              <div key={stage.status}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-text">{stage.label}</span>
                  <span className="font-bold text-primary">{stage.value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${stage.color} transition-all`}
                    style={{
                      width: `${apps.length ? Math.max((stage.value / apps.length) * 100, stage.value ? 5 : 0) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Atención requerida
          </p>
          <h2 className="mt-1 text-xl font-bold text-text">
            Procesos para revisar
          </h2>
          <div className="mt-5 space-y-3">
            {alerts.length ? (
              alerts.map((alert, index) => {
                const AlertIcon = alert.icon;
                return (
                  <article
                    key={`${alert.type}-${index}`}
                    className="flex gap-3 rounded-2xl border border-slate-100 p-4"
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${alert.tone}`}
                    >
                      <AlertIcon size={18} />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-textLight">
                        {alert.type}
                      </p>
                      <p className="mt-1 text-sm font-bold text-text">
                        {alert.text}
                      </p>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" />
                <p className="mt-2 font-bold text-emerald-800">
                  Todo está al día
                </p>
                <p className="mt-1 text-sm text-emerald-700">
                  No encontramos alertas operativas.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Tendencia
          </p>
          <h2 className="mt-1 text-xl font-bold text-text">
            Postulaciones de los últimos 6 meses
          </h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid
                  vertical={false}
                  stroke="#e8eef6"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#718096", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#718096", fontSize: 12 }}
                />
                <Tooltip cursor={{ fill: "#edf3fb" }} />
                <Bar
                  dataKey="postulaciones"
                  name="Postulaciones"
                  fill="#315d98"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-3xl border border-[#dbe5f3] bg-white p-6 shadow-[0_10px_28px_rgba(32,69,113,.08)]">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">
            Trazabilidad reciente
          </p>
          <h2 className="mt-1 text-xl font-bold text-text">
            Últimos movimientos
          </h2>
          <div className="mt-4 grid gap-2 rounded-2xl border border-[#dbe5f3] bg-[#f8fbff] p-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              type="date"
              value={auditStartDate}
              onChange={(event) => setAuditStartDate(event.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
              aria-label="Movimientos desde"
            />
            <input
              type="date"
              value={auditEndDate}
              onChange={(event) => setAuditEndDate(event.target.value)}
              className="rounded-xl border border-border bg-white px-3 py-2 text-sm"
              aria-label="Movimientos hasta"
            />
            <button
              type="button"
              onClick={() => {
                setAuditStartDate("");
                setAuditEndDate("");
              }}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-sm font-bold text-primary"
            >
              Limpiar
            </button>
          </div>
          <p className="mt-3 text-xs font-semibold text-textLight">
            {visibleAudit.length} de {audit.length} movimiento(s), ordenados por
            fecha.
          </p>
          <div className="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {visibleAudit.map((item, index) => (
              <article
                key={`${item.createdAt}-${index}`}
                className="border-l-2 border-primary/30 pl-4"
              >
                <p className="text-sm font-bold text-text">
                  {auditLabel(item.action)}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-textLight">
                  {item.description || "Movimiento histórico sin detalle."}
                </p>
                <p className="mt-1 text-[11px] font-semibold text-primary">
                  {shortDateFormatter.format(new Date(item.createdAt))}
                </p>
              </article>
            ))}
            {!visibleAudit.length && (
              <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-textLight">
                No hay movimientos en el rango seleccionado.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
