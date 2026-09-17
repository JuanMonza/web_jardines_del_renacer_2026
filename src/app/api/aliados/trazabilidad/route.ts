import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx-js-style';
import { execute } from '@/lib/db';
import { getAllyReportAccess } from '@/lib/ally-report-access';
import { getAllyTraceCount, getAllyTraceEvents, getAllyTraceSummary, type AllyTraceEvent } from '@/lib/ally-traceability';
import { ADMIN_SESSION_COOKIE, getActiveAdminSession } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const labels: Record<AllyTraceEvent['type'], string> = {
  ALLY_CREATED: 'Nuevo aliado', ALLY_DEACTIVATED: 'Aliado retirado', ALLY_UPDATED: 'Aliado actualizado',
};
const fills: Record<AllyTraceEvent['type'], string> = {
  ALLY_CREATED: 'DCFCE7', ALLY_DEACTIVATED: 'FEE2E2', ALLY_UPDATED: 'FEF3C7',
};

function validDate(value: string) {
  return !value || (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
    && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value);
}

function cellText(value: unknown) {
  const text = String(value ?? '');
  return /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
}

function createWorkbook(events: AllyTraceEvent[], summary: Awaited<ReturnType<typeof getAllyTraceSummary>>, from: string, to: string) {
  const workbook = XLSX.utils.book_new();
  const overview = XLSX.utils.aoa_to_sheet([
    ['TRAZABILIDAD DE ALIADOS', 'Jardines del Renacer'],
    ['Período', `${from || 'Inicio'} a ${to || 'Actualidad'}`],
    ['Indicador', 'Aliados'],
    ['Nuevos', summary.created],
    ['Retirados', summary.deactivated],
    ['Actualizados', summary.updated],
    ['Movimientos de actualización', summary.updatedMovements],
    ['Total de movimientos', events.length],
  ]);
  overview['!cols'] = [{ wch: 34 }, { wch: 46 }];
  for (const address of ['A1', 'B1', 'A3', 'B3']) if (overview[address]) overview[address].s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '244F8A' } }, alignment: { vertical: 'center' } };
  XLSX.utils.book_append_sheet(workbook, overview, 'Resumen');

  const headings = ['Fecha', 'Movimiento', 'Aliado', 'ID aliado', 'Categoría', 'Departamento', 'Ciudad', 'Campos actualizados', 'Responsable'];
  const table = XLSX.utils.aoa_to_sheet([headings, ...events.map(item => [
    new Date(item.date).toLocaleString('es-CO', { timeZone: 'America/Bogota' }), labels[item.type], cellText(item.allyName),
    cellText(item.loginId), cellText(item.category), cellText(item.department), cellText(item.city), cellText(item.changedFields), cellText(item.actor),
  ])]);
  table['!cols'] = [24, 24, 35, 19, 22, 24, 23, 42, 30].map(wch => ({ wch }));
  table['!autofilter'] = { ref: `A1:I${events.length + 1}` };
  for (let column = 0; column < headings.length; column++) {
    const address = XLSX.utils.encode_cell({ r: 0, c: column });
    table[address].s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '173F73' } }, alignment: { vertical: 'center' } };
  }
  events.forEach((event, index) => {
    const status = table[XLSX.utils.encode_cell({ r: index + 1, c: 1 })];
    if (status) status.s = { font: { bold: true, color: { rgb: event.type === 'ALLY_DEACTIVATED' ? '991B1B' : event.type === 'ALLY_CREATED' ? '166534' : '92400E' } }, fill: { fgColor: { rgb: fills[event.type] } } };
  });
  XLSX.utils.book_append_sheet(workbook, table, 'Movimientos');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
}

export async function GET(request: NextRequest) {
  const session = await getActiveAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try {
    const access = await getAllyReportAccess(session);
    if (!access.canView) return NextResponse.json({ message: 'El administrador general aún no te ha habilitado este informe.' }, { status: 403 });
    const from = request.nextUrl.searchParams.get('from') || '';
    const to = request.nextUrl.searchParams.get('to') || '';
    if (!validDate(from) || !validDate(to) || (from && to && from > to)) return NextResponse.json({ message: 'Selecciona un rango de fechas válido.' }, { status: 422 });
    const download = request.nextUrl.searchParams.get('format') === 'xlsx';
    if (download && !access.canExport) return NextResponse.json({ message: 'No tienes permiso para descargar el informe.' }, { status: 403 });
    const [summary, total] = await Promise.all([getAllyTraceSummary(from, to), getAllyTraceCount(from, to)]);
    if (download) {
      if (total > 20000) return NextResponse.json({ message: 'El período supera 20.000 movimientos. Selecciona un rango de fechas más corto.' }, { status: 422 });
      const events = await getAllyTraceEvents(from, to, total || 1);
      const file = createWorkbook(events, summary, from, to);
      await execute(`INSERT INTO activity_logs (usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion)
        VALUES ('Admin','ALLY_REPORT_EXPORTED','Aliados','ally_activity_logs',?,?)`,
      [session.userId, `Administrador ${session.name} descargó informe de aliados (${from || 'inicio'} a ${to || 'actualidad'}; ${events.length} movimientos).`]);
      return new NextResponse(new Blob([Uint8Array.from(file)]), { headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="trazabilidad-aliados-${from || 'inicio'}-${to || 'actualidad'}.xlsx"`,
        'Cache-Control': 'no-store',
      } });
    }
    const page = Math.max(1, Math.min(100000, Number(request.nextUrl.searchParams.get('page')) || 1));
    const pageSize = Math.max(10, Math.min(100, Number(request.nextUrl.searchParams.get('pageSize')) || 20));
    const events = await getAllyTraceEvents(from, to, pageSize, (page - 1) * pageSize);
    return NextResponse.json({ data: events, summary, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) }, access }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[aliados] Informe de trazabilidad:', error);
    return NextResponse.json({ message: 'No fue posible consultar el informe de aliados.' }, { status: 500 });
  }
}
