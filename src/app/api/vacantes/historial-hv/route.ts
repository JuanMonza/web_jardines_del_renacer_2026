import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { ensureHistoricalCandidateSchema } from "@/lib/historical-candidate-records";
import { ensureCandidateLicenseColumn, ensureCandidateProfessionalSummaryColumn } from "@/lib/candidateStorageDB";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import { ADMIN_SESSION_COOKIE, requireAdminPermission, verifyAdminPassword } from "@/lib/iam/admin-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.applications.view");
  if (!session) return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  try {
    await Promise.all([
      ensureHistoricalCandidateSchema(),
      ensureCandidateLicenseColumn(),
      ensureCandidateProfessionalSummaryColumn(),
    ]);
    const search = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const status = request.nextUrl.searchParams.get("status")?.trim() ?? "";
    const from = request.nextUrl.searchParams.get("from")?.trim() ?? "";
    const to = request.nextUrl.searchParams.get("to")?.trim() ?? "";
    const params: string[] = [];
    const filters: string[] = [];
    if (search) {
      filters.push("(name LIKE ? OR documentNumber LIKE ? OR email LIKE ? OR phone LIKE ? OR vacancyTitle LIKE ?)");
      const value = `%${search}%`;
      params.push(value, value, value, value, value);
    }
    if (status) { filters.push("status = ?"); params.push(status); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(from)) { filters.push("processDate >= ?"); params.push(from); }
    if (/^\d{4}-\d{2}-\d{2}$/.test(to)) { filters.push("processDate <= ?"); params.push(to); }
    const requestedPage = Math.max(1, Math.floor(Number(request.nextUrl.searchParams.get("page")) || 1));
    const pageSize = request.nextUrl.searchParams.get("pageSize") === "100" ? 100 : 10;
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const unifiedHistory = `
      SELECT m.id, c.nombre AS name, c.documento AS documentNumber,
        c.correo AS email, c.telefono AS phone, c.ciudad AS city,
        c.departamento AS department, DATE_FORMAT(m.fecha, '%Y-%m-%d') AS processDate,
        m.vacante AS vacancyTitle, m.estado AS status, m.origen AS source,
        m.entrevistadores AS interviewers, m.observaciones AS observations,
        m.evaluacion AS evaluation, m.motivo_descarte AS discardReason,
        m.licencia_runt AS licenseCheck, m.raw_data AS rawData,
        m.hoja_origen AS sourceSheet, m.fila_origen AS sourceRow
      FROM historical_candidate_movements m
      INNER JOIN historical_candidates c ON c.identity_key = m.identity_key
      UNION ALL
      SELECT -CAST(p.id AS SIGNED) AS id,
        TRIM(CONCAT(COALESCE(p.nombres,''),' ',COALESCE(p.apellidos,''))) AS name,
        p.documento AS documentNumber, p.email, p.telefono AS phone,
        p.ciudad AS city, p.departamento AS department,
        DATE_FORMAT(p.created_at, '%Y-%m-%d') AS processDate,
        'Sin postulación asociada' AS vacancyTitle, 'Perfil registrado' AS status,
        'Portal de postulantes' AS source, '' AS interviewers,
        'Cuenta registrada. Sus movimientos aparecerán aquí al postularse o avanzar en un proceso.' AS observations,
        COALESCE(p.resumen_profesional,'') AS evaluation, '' AS discardReason,
        IF(p.tiene_licencia_conduccion = 1, 'Sí', '') AS licenseCheck,
        JSON_OBJECT('candidateId', p.id, 'professionalTitle', COALESCE(p.profesion,'')) AS rawData,
        'Registro en plataforma' AS sourceSheet, 0 AS sourceRow
      FROM candidatos p
      WHERE p.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM historical_candidates hc
          INNER JOIN historical_candidate_movements hm ON hm.identity_key = hc.identity_key
          WHERE hc.documento = p.documento OR LOWER(hc.correo) = LOWER(p.email)
        )`;
    const counts = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM (${unifiedHistory}) history ${where}`, params);
    const total = Number(counts[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(requestedPage, totalPages);
    const states = await query<{ estado: string }>("SELECT DISTINCT estado FROM historical_candidate_movements WHERE estado IS NOT NULL ORDER BY estado");
    const rows = await query(`SELECT * FROM (${unifiedHistory}) history ${where} ORDER BY processDate DESC, id DESC LIMIT ? OFFSET ?`, [...params, pageSize, (page - 1) * pageSize]);
    const totals = await query<{ candidates: number; movements: number }>("SELECT (SELECT COUNT(*) FROM candidatos WHERE deleted_at IS NULL) candidates, (SELECT COUNT(*) FROM historical_candidate_movements) movements");
    return NextResponse.json({ success: true, data: rows, pagination: { page, pageSize, total, totalPages }, statuses: [...new Set(["Perfil registrado", ...states.map(row => row.estado)])], totals: totals[0] ?? { candidates: 0, movements: 0 } });
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
