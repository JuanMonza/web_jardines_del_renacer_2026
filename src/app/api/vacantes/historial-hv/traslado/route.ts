import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import pool from "@/lib/db";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from "@/lib/iam/admin-session";
import { ensureHistoricalCandidateSchema } from "@/lib/historical-candidate-records";
import { sendInternalVacancyMovementEmail } from "@/lib/candidateMailer";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import type { RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.applications.update");
  if (!session) return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const destination = typeof body.destination === "string" ? body.destination.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (!Number.isSafeInteger(body.id) || !destination || destination.length > 255 || !notes || notes.length > 10000)
    return NextResponse.json({ message: "Indica el cargo destino y el motivo (máximo 10.000 caracteres)." }, { status: 422 });
  await ensureHistoricalCandidateSchema();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<RowDataPacket[]>(`SELECT hm.*, hc.nombre AS candidate_name, hc.documento AS candidate_document, hc.correo AS candidate_email
      FROM historical_candidate_movements hm
      INNER JOIN historical_candidates hc ON hc.identity_key = hm.identity_key
      WHERE hm.id = ? FOR UPDATE`, [body.id]);
    const source = rows[0];
    if (!source) { await connection.rollback(); return NextResponse.json({ message: "Registro no encontrado." }, { status: 404 }); }
    if (source.vacante === destination) { await connection.rollback(); return NextResponse.json({ message: "El destino debe ser diferente al cargo de origen." }, { status: 422 }); }
    const date = new Date().toISOString();
    const description = `Cambio de cargo desde “${source.vacante || "Sin cargo registrado"}” a “${destination}”. Responsable: ${session.name} (ID ${session.userId}). Fecha: ${date}. Motivo: ${notes}`;
    await connection.execute("INSERT INTO historical_candidate_movements (source_key,identity_key,fecha,vacante,estado,origen,entrevistadores,observaciones,raw_data,hoja_origen,fila_origen) VALUES (?,?,CURRENT_DATE(),?,'Trasladado','Cambio de cargo',?,?,?,'Movimiento interno',?)",
      [randomUUID(), source.identity_key, destination, session.name, description, JSON.stringify({ "Cargo de origen": source.vacante, "Cargo destino": destination, "Fecha": date, "Responsable": session.name, "ID responsable": session.userId, "Motivo": notes, "Registro de origen": source.id }), source.id]);
    await connection.execute("INSERT INTO activity_logs (usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion) VALUES ('Admin','HISTORICO_CARGO_TRASLADADO','Vacantes','candidatos',?,?)", [source.id, description]);
    await connection.commit();
    let internalNotificationSent = false;
    try {
      internalNotificationSent = await sendInternalVacancyMovementEmail({
        eventTitle: "Traslado de historial laboral registrado",
        candidateName: source.candidate_name || "Postulante histórico",
        candidateDocument: source.candidate_document || "No registrado",
        candidateEmail: source.candidate_email || "",
        vacancyTitle: destination,
        status: "Trasladado",
        notes: description,
        adminName: session.name,
        applicationId: `HIST-${source.id}`,
      });
    } catch (emailError) {
      console.error("No fue posible enviar el aviso interno del traslado histórico:", emailError);
    }
    await recordVacancyAudit({
      action: internalNotificationSent ? "HISTORICO_TRASLADO_NOTIFICADO" : "HISTORICO_TRASLADO_PENDIENTE",
      table: "candidatos",
      recordId: source.id,
      description: internalNotificationSent
        ? `Gestión Humana fue notificada del traslado de ${source.candidate_name || "postulante histórico"} desde “${source.vacante || "Sin cargo"}” a “${destination}”. Responsable: ${session.name}. Observación: ${notes}.`
        : `El traslado histórico hacia “${destination}” quedó registrado, pero el aviso interno por correo quedó pendiente. Responsable: ${session.name}.`,
    });
    return NextResponse.json({ success: true, internalNotificationSent });
  } catch {
    await connection.rollback();
    return NextResponse.json({ message: "No fue posible registrar el traslado." }, { status: 500 });
  } finally { connection.release(); }
}
