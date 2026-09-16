import { NextRequest, NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import pool from "@/lib/db";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from "@/lib/iam/admin-session";
import { ensureHistoricalCandidateSchema } from "@/lib/historical-candidate-records";
import { ensureApplicationSnapshotSchema } from "@/lib/candidateStorageDB";
import { hashCandidatePasswordForDB } from "@/lib/candidateAuth";
import { isTrainingEnvironment } from "@/lib/training-environment";
import { sendInternalVacancyMovementEmail } from "@/lib/candidateMailer";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export async function POST(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.applications.update");
  if (!session) return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const destination = typeof body.destination === "string" ? body.destination.trim() : "";
  const targetVacancyId = typeof body.targetVacancyId === "string" ? body.targetVacancyId.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";
  if (!Number.isSafeInteger(body.id) || (!targetVacancyId && !destination) || destination.length > 255 || !notes || notes.length > 10000)
    return NextResponse.json({ message: "Indica la vacante o el cargo destino y el motivo (máximo 10.000 caracteres)." }, { status: 422 });
  if (targetVacancyId) {
    if (!isTrainingEnvironment()) return NextResponse.json({ message: "Disponible solo en el ambiente de prueba." }, { status: 403 });
    if (!/^\d+$/.test(targetVacancyId)) return NextResponse.json({ message: "Selecciona una vacante válida." }, { status: 422 });
    await ensureHistoricalCandidateSchema();
    await ensureApplicationSnapshotSchema();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [sources] = await connection.query<RowDataPacket[]>(`SELECT hm.*,hc.nombre AS candidate_name,hc.documento AS candidate_document,
        hc.correo AS candidate_email,hc.telefono AS candidate_phone,hc.ciudad AS candidate_city,hc.departamento AS candidate_department
        FROM historical_candidate_movements hm INNER JOIN historical_candidates hc ON hc.identity_key=hm.identity_key
        WHERE hm.id=? FOR UPDATE`, [body.id]);
      const source = sources[0];
      if (!source) { await connection.rollback(); return NextResponse.json({ message: "Registro histórico no encontrado." }, { status: 404 }); }
      const [vacancies] = await connection.query<RowDataPacket[]>("SELECT id,titulo FROM vacantes WHERE id=? AND estado='Publicada' AND deleted_at IS NULL FOR UPDATE", [targetVacancyId]);
      const vacancy = vacancies[0];
      if (!vacancy) { await connection.rollback(); return NextResponse.json({ message: "La vacante está pausada, cerrada o ya no está disponible." }, { status: 409 }); }
      const documentNumber = typeof body.candidateDocument === "string" ? body.candidateDocument.replace(/\D/g, "") : "";
      if (!/^\d{6,20}$/.test(documentNumber)) { await connection.rollback(); return NextResponse.json({ message: "Confirma una cédula válida antes de trasladar." }, { status: 422 }); }
      const [candidates] = await connection.query<RowDataPacket[]>("SELECT id,email,cv_url FROM candidatos WHERE documento=? AND deleted_at IS NULL LIMIT 1 FOR UPDATE", [documentNumber]);
      let candidateId = candidates[0]?.id as number | undefined;
      const historicalEmail = typeof body.candidateEmail === "string" ? body.candidateEmail.trim().toLowerCase() : "";
      const email = String(candidates[0]?.email || historicalEmail).trim().toLowerCase();
      if (historicalEmail.length > 180 || !/^\S+@\S+\.\S+$/.test(historicalEmail)) { await connection.rollback(); return NextResponse.json({ message: "Confirma un correo válido de máximo 180 caracteres antes de asignar la persona a una vacante." }, { status: 422 }); }
      if (candidateId && email !== historicalEmail) { await connection.rollback(); return NextResponse.json({ message: "La cédula ya tiene una cuenta con otro correo. Confirma el correo de esa cuenta antes de vincular el historial." }, { status: 409 }); }
      if (!candidateId) {
        const [emailOwner] = await connection.query<RowDataPacket[]>("SELECT id FROM candidatos WHERE LOWER(email)=? LIMIT 1", [email]);
        if (emailOwner.length) { await connection.rollback(); return NextResponse.json({ message: "El correo ya pertenece a otra cuenta. Revisa la ficha histórica antes del traslado." }, { status: 409 }); }
        const name = String(source.candidate_name || "").trim();
        const parts = name.split(/\s+/).filter(Boolean);
        const split = parts.length > 2 ? Math.ceil(parts.length / 2) : 1;
        const passwordHash = await hashCandidatePasswordForDB(randomBytes(32).toString("hex"));
        const [insert] = await connection.execute<ResultSetHeader>(`INSERT INTO candidatos
          (documento,nombres,apellidos,email,telefono,password_hash,ciudad,departamento,activo)
          VALUES (?,?,?,?,?,?,?,?,1)`, [documentNumber, parts.slice(0, split).join(" ").slice(0, 120) || "Postulante", parts.slice(split).join(" ").slice(0, 120), email,
          String(source.candidate_phone || ""), passwordHash, String(source.candidate_city || ""), String(source.candidate_department || "")]);
        candidateId = insert.insertId;
      }
      if (String(source.candidate_document || "").replace(/\D/g, "") !== documentNumber || String(source.candidate_email || "").trim().toLowerCase() !== historicalEmail) {
        await connection.execute("UPDATE historical_candidates SET documento=?,correo=? WHERE identity_key=?", [documentNumber, historicalEmail, source.identity_key]);
      }
      const [duplicates] = await connection.query<RowDataPacket[]>("SELECT id FROM postulaciones WHERE candidato_id=? AND vacante_id=? AND deleted_at IS NULL LIMIT 1 FOR UPDATE", [candidateId, vacancy.id]);
      if (duplicates.length) { await connection.rollback(); return NextResponse.json({ message: "Esta persona ya figura en las postulaciones de esa vacante." }, { status: 409 }); }
      const date = new Date().toISOString();
      const description = `Traslado desde historial laboral “${source.vacante || "Sin cargo"}” a vacante activa “${vacancy.titulo}”. Responsable: ${session.name} (ID ${session.userId}). Fecha: ${date}. Observación: ${notes}`;
      const followup = [description, source.observaciones && `Observaciones históricas: ${source.observaciones}`, source.evaluacion && `Evaluación histórica: ${source.evaluacion}`].filter(Boolean).join("\n\n").slice(0, 60000);
      const snapshot = JSON.stringify({ candidateDocument: documentNumber, candidateName: source.candidate_name || "Postulante", candidateEmail: email,
        candidatePhone: source.candidate_phone || "", candidateCity: source.candidate_city || "", candidateDepartment: source.candidate_department || "",
        vacancyTitle: vacancy.titulo, source: "Historial laboral", capturedAt: date, historicalRecordId: source.id,
        historicalObservations: source.observaciones || "", historicalEvaluation: source.evaluacion || "" });
      const [application] = await connection.execute<ResultSetHeader>(`INSERT INTO postulaciones
        (candidato_id,vacante_id,estado,fuente,observaciones_rh,observaciones_candidato,cv_url,application_snapshot)
        VALUES (?,?,'Postulado','Manual',?,?,?,?)`, [candidateId, vacancy.id, followup, `Perfil trasladado del historial laboral · registro ${source.id}`,
        candidates[0]?.cv_url || null, snapshot]);
      await connection.execute(`INSERT INTO historical_candidate_movements
        (source_key,identity_key,fecha,vacante,estado,origen,entrevistadores,observaciones,raw_data,hoja_origen,fila_origen)
        VALUES (?,?,CURRENT_DATE(),?,'Trasladado','Vacante activa',?,?,?,'Movimiento interno',?)`, [randomUUID(), source.identity_key, vacancy.titulo,
        session.name, description, JSON.stringify({ "Vacante de origen": source.vacante, "Vacante destino": vacancy.titulo, "ID vacante": vacancy.id,
          "ID postulación": application.insertId, "Registro histórico de origen": source.id, "Responsable": session.name, "Observación": notes }), source.id]);
      await connection.execute(`INSERT INTO activity_logs(usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion)
        VALUES ('Admin','HISTORICO_ASIGNADO_A_VACANTE','Vacantes','postulaciones',?,?)`, [application.insertId, description]);
      await connection.commit();
      let internalNotificationSent = false;
      try {
        internalNotificationSent = await sendInternalVacancyMovementEmail({ eventTitle: "Perfil histórico asignado a vacante",
          candidateName: source.candidate_name || "Postulante histórico", candidateDocument: documentNumber, candidateEmail: email,
          vacancyTitle: vacancy.titulo, status: "Recibida", notes: description, adminName: session.name, applicationId: `JDR-${String(application.insertId).padStart(6, "0")}` });
      } catch (error) { console.error("No fue posible enviar el aviso interno del traslado:", error); }
      try {
        await recordVacancyAudit({ action: internalNotificationSent ? "HISTORICO_ASIGNACION_NOTIFICADA" : "HISTORICO_ASIGNACION_AVISO_PENDIENTE",
          table: "postulaciones", recordId: application.insertId, description: `Postulación desde historial laboral en “${vacancy.titulo}”. Aviso interno: ${internalNotificationSent ? "enviado" : "pendiente"}.` });
      } catch (auditError) { console.error("No fue posible auditar el resultado del aviso interno:", auditError); }
      return NextResponse.json({ success: true, applicationId: String(application.insertId), vacancyTitle: vacancy.titulo, internalNotificationSent }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      const code = (error as { code?: string })?.code;
      return NextResponse.json({ message: code === "ER_DUP_ENTRY" ? "El documento o correo ya está asociado a otra cuenta." : "No fue posible asignar el perfil histórico a la vacante." }, { status: code === "ER_DUP_ENTRY" ? 409 : 500 });
    } finally { connection.release(); }
  }
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
