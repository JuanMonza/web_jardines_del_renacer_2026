'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx-js-style';

type Application = { id: string; candidateName: string; candidateEmail: string; vacancyTitle: string; status: string; appliedAt: string };
type Vacancy = { id: string; title: string; city: string; applicationCount?: number };
type AuditItem = { createdAt: string; action: string; description: string };

const dateFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' });
const sheetHeader = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '1D4E89' } }, alignment: { horizontal: 'center', vertical: 'center' } };

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
}

function styleTableSheet(sheet: XLSX.WorkSheet, range: string, widths: number[]) {
  const headerRange = XLSX.utils.decode_range(range);
  for (let column = headerRange.s.c; column <= headerRange.e.c; column += 1) {
    const cell = sheet[XLSX.utils.encode_cell({ r: headerRange.s.r, c: column })];
    if (cell) cell.s = sheetHeader;
  }
  sheet['!autofilter'] = { ref: range };
  sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
  sheet['!cols'] = widths.map((wch) => ({ wch }));
}

function auditRow(item: AuditItem) {
  const responsible = item.description.match(/Administrador\s+(.+?)\s+\(ID\s+(\d+)\)/i);
  const quotedItem = item.description.match(/“([^”]+)”/);
  const candidate = item.description.match(/postulante\s+(.+?)\s+\(/i);
  const actionLabels: Record<string, string> = {
    VACANTE_CREADA: 'Creó una vacante',
    VACANTE_ACTUALIZADA: 'Editó una vacante',
    VACANTE_ELIMINADA: 'Cerró / eliminó una vacante',
    POSTULANTE_ELIMINADO: 'Eliminó un postulante',
    POSTULACION_ESTADO_ACTUALIZADO: 'Actualizó seguimiento del postulante',
    POSTULANTE_NOTIFICADO: 'Envió notificación al postulante',
  };
  return {
    Fecha: formatDate(item.createdAt),
    Movimiento: actionLabels[item.action] || item.action.replaceAll('_', ' '),
    'Usuario responsable': responsible ? `${responsible[1]} (ID ${responsible[2]})` : 'No disponible (registro histórico)',
    'Elemento afectado': quotedItem?.[1] || candidate?.[1] || 'Ver detalle',
    'Detalle completo': item.description,
  };
}

export default function AnalyticsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [audit, setAudit] = useState<AuditItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    void Promise.all([fetch('/api/vacantes/postulaciones'), fetch('/api/vacantes'), fetch('/api/vacantes/auditoria')])
      .then(async ([applicationsResponse, vacanciesResponse, auditResponse]) => {
        const applications = await applicationsResponse.json();
        const auditLog = await auditResponse.json();
        setApps(applications.data ?? []);
        setVacancies(await vacanciesResponse.json());
        setAudit(auditLog.data ?? []);
      })
      .catch(() => undefined);
  }, []);

  const byStatus = useMemo(() => apps.reduce<Record<string, number>>((result, application) => ({ ...result, [application.status]: (result[application.status] || 0) + 1 }), {}), [apps]);
  const activeVacancies = vacancies.filter((vacancy) => (vacancy.applicationCount || 0) > 0).length;
  const deleted = audit.filter((item) => item.action === 'POSTULANTE_ELIMINADO').length;

  const exportReport = () => {
    setIsExporting(true);
    try {
      const workbook = XLSX.utils.book_new();
      const summary = XLSX.utils.aoa_to_sheet([
        ['REPORTE DE ANALÍTICA · VACANTES'],
        ['Jardines del Renacer'],
        [`Generado: ${dateFormatter.format(new Date())}`],
        [],
        ['Indicador', 'Valor'],
        ['Postulaciones activas', apps.length],
        ['Vacantes con movimiento', activeVacancies],
        ['Vacantes sin movimiento', vacancies.length - activeVacancies],
        ['Postulantes eliminados (histórico)', deleted],
      ]);
      summary['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];
      summary.A1.s = { font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '173F73' } }, alignment: { horizontal: 'center' } };
      summary.A2.s = { font: { bold: true, color: { rgb: '1D4E89' } } };
      for (const cell of ['A5', 'B5']) summary[cell].s = sheetHeader;
      summary['!cols'] = [{ wch: 38 }, { wch: 22 }];
      XLSX.utils.book_append_sheet(workbook, summary, 'Resumen');

      const applicationsSheet = XLSX.utils.json_to_sheet(apps.map((item) => ({
        Candidato: item.candidateName, Correo: item.candidateEmail, Vacante: item.vacancyTitle,
        Estado: item.status, 'Fecha de postulación': formatDate(item.appliedAt),
      })));
      styleTableSheet(applicationsSheet, `A1:E${Math.max(1, apps.length + 1)}`, [28, 34, 28, 20, 25]);
      XLSX.utils.book_append_sheet(workbook, applicationsSheet, 'Postulaciones activas');

      const auditSheet = XLSX.utils.json_to_sheet(audit.map(auditRow));
      styleTableSheet(auditSheet, `A1:E${Math.max(1, audit.length + 1)}`, [25, 36, 34, 35, 100]);
      XLSX.utils.book_append_sheet(workbook, auditSheet, 'Movimientos y auditoría');
      XLSX.writeFile(workbook, `analitica-vacantes-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } finally { setIsExporting(false); }
  };

  return <div className="p-6 md:p-8">
    <section className="rounded-[28px] bg-gradient-to-br from-[#163c70] to-[#6e94c2] p-7 text-white"><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-100">Talento humano</p><h1 className="mt-2 text-3xl font-bold">Analítica de selección</h1><p className="mt-2 text-blue-50">Indicadores operativos, postulaciones y trazabilidad de movimientos.</p></section>
    <div className="mt-6 grid gap-4 md:grid-cols-4">{[['Postulaciones activas', apps.length], ['Vacantes con movimiento', activeVacancies], ['Sin movimiento', vacancies.length - activeVacancies], ['Eliminaciones registradas', deleted]].map(([label, value]) => <article key={String(label)} className="rounded-2xl border border-white/80 bg-white/65 p-5 shadow-sm backdrop-blur-xl"><p className="text-xs font-bold uppercase tracking-wider text-textLight">{label}</p><p className="mt-2 text-3xl font-bold text-primary">{value}</p></article>)}</div>
    <section className="mt-6 rounded-3xl border border-white/80 bg-white/65 p-6 shadow-sm backdrop-blur-xl"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Embudo por estado</h2><p className="mt-1 text-sm text-textLight">El Excel incluye resumen, postulaciones activas y movimientos de auditoría.</p></div><button type="button" onClick={exportReport} disabled={isExporting} className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-70">{isExporting ? 'Generando Excel…' : 'Descargar Excel'}</button></div><div className="mt-5 grid gap-3 md:grid-cols-3">{Object.entries(byStatus).map(([status, count]) => <div key={status} className="rounded-2xl border border-primary/10 bg-white p-4"><p className="text-sm text-textLight">{status}</p><p className="mt-1 text-2xl font-bold text-text">{count}</p></div>)}</div></section>
  </div>;
}
