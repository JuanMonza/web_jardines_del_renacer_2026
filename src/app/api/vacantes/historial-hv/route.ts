import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { ensureHistoricalCandidateSchema } from "@/lib/historical-candidate-records";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import { ADMIN_SESSION_COOKIE, requireAdminPermission, verifyAdminPassword } from "@/lib/iam/admin-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.applications.view");
  if (!session) return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  try {
    await ensureHistoricalCandidateSchema();
    const search = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
    const from = request.nextUrl.searchParams.get("from")?.trim() ?? "";
    const to = request.nextUrl.searchParams.get("to")?.trim() ?? "";
    const params: string[] = [];
    const filters: string[] = [];
    if (search) {
      filters.push("(c.nombre LIKE ? OR c.documento LIKE ? OR c.correo LIKE ? OR c.telefono LIKE ? OR m.vacante LIKE ?)");
      const value = `%${search}%`;
      params.push(value, value, value, value, value);
    }
    if (status) { filters.push("m.estado = ?"); params.push(status); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { filters.push("m.fecha >= ?"); params.push(from); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) { filters.push("m.fecha <= ?"); params.push(to); }
    const requestedPage = Math.max(1, Math.floor(Number(request.nextUrl.searchParams.get("page")) || 1));
    const pageSize = request.nextUrl.searchParams.get("pageSize") === "100" ? 100 : 10;
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const counts = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM historical_candidate_movements m INNER JOIN historical_candidates c ON c.identity_key=m.identity_key ${where}`, params);
    const total = Number(counts[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const states = await query<{ estado: string }>("SELECT DISTINCT estado FROM historical_candidate_movements WHERE estado IS NOT NULL ORDER BY estado");
    const rows = await query(`SELECT m.id, c.nombre AS name, c.documento AS documentNumber, c.correo AS email, c.telefono AS phone, c.ciudad AS city, c.departamento AS department, DATE_FORMAT(m.fecha, '%Y-%m-%d') AS processDate, m.vacante AS vacancyTitle, m.estado AS status, m.origen AS source, m.entrevistadores AS interviewers, m.observaciones AS observations, m.evaluacion AS evaluation, m.motivo_descarte AS discardReason, m.licencia_runt AS licenseCheck, m.raw_data AS rawData, m.hoja_origen AS sourceSheet, m.fila_origen AS sourceRow FROM historical_candidate_movements m INNER JOIN historical_candidates c ON c.identity_key=m.identity_key ${where} ORDER BY m.fecha DESC, m.id DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]);
    const totals = await query<{ candidates: number; movements: number }>("SELECT (SELECT COUNT(*) FROM historical_candidates) candidates, (SELECT COUNT(*) FROM historical_candidate_movements) movements");
    return NextResponse.json({ success: true, data: rows, pagination: { page, pageSize, total, totalPages }, statuses: states.map(row => row.estado), totals: totals[0] ?? { candidates: 0, movements: 0 } });
  } catch (error) {
    console.error("No fue posible consultar el histórico laboral:", error);
    return NextResponse.json({ success: false, message: "No fue posible consultar el historial laboral." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.create");
  if (!session) return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  try {
    const body = await request.json().catch(() => ({}));
    if (!(await verifyAdminPassword(session, body.password))) return NextResponse.json({ success: false, message: "La contraseña es incorrecta." }, { status: 401 });
    await ensureHistoricalCandidateSchema();
    const deletedMovements = await execute("DELETE FROM historical_candidate_movements WHERE hoja_origen NOT IN ('Contratación desde vacantes','Movimiento interno')");
    const deletedCandidates = await execute("DELETE c FROM historical_candidates c WHERE NOT EXISTS (SELECT 1 FROM historical_candidate_movements m WHERE m.identity_key=c.identity_key)");
    await recordVacancyAudit({ action: "HISTORICO_HV_ELIMINADO", table: "candidatos", recordId: 0, description: `Administrador ${session.name} (ID ${session.userId}) eliminó ${deletedMovements.affectedRows} movimiento(s) y ${deletedCandidates.affectedRows} candidato(s) del historial laboral importado.` });
    return NextResponse.json({ success: true, data: { deletedMovements: deletedMovements.affectedRows, deletedCandidates: deletedCandidates.affectedRows } });
  } catch (error) {
    console.error("No fue posible eliminar el histórico laboral:", error);
    return NextResponse.json({ success: false, message: "No fue posible eliminar el historial laboral." }, { status: 500 });
  }
}
