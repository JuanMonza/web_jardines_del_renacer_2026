import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from "@/lib/iam/admin-session";
import { sendInternalCandidateTransferEmail } from "@/lib/candidateMailer";
import { ensureApplicationSnapshotSchema } from "@/lib/candidateStorageDB";

export const runtime = "nodejs";

type ApplicationRow = {
  id: number;
  candidato_id: number;
  vacante_id: number;
  vacancy_title: string;
  cv_url: string | null;
  candidate_name: string;
  candidate_document: string;
  application_snapshot: string | Record<string, unknown> | null;
};

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.applications.update",
  );
  if (!session) return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });

  try {
    await ensureApplicationSnapshotSchema();
    const body = await request.json() as { targetVacancyId?: string; notes?: string };
    const targetVacancyId = String(body.targetVacancyId ?? "").trim();
    const notes = String(body.notes ?? "").trim();
    const { id } = await params;
    if (!targetVacancyId || !notes) {
      return NextResponse.json({ success: false, message: "Selecciona la vacante destino y registra la observación de la revisión o llamada." }, { status: 422 });
    }

    const sourceRows = await query<ApplicationRow>(
      `SELECT p.id, p.candidato_id, p.vacante_id, p.cv_url, p.application_snapshot, v.titulo AS vacancy_title,
        CONCAT(c.nombres, ' ', c.apellidos) AS candidate_name, c.documento AS candidate_document
       FROM postulaciones p INNER JOIN vacantes v ON v.id = p.vacante_id
       INNER JOIN candidatos c ON c.id = p.candidato_id
       WHERE p.id = ? AND p.deleted_at IS NULL LIMIT 1`,
      [id],
    );
    const source = sourceRows[0];
    if (!source) return NextResponse.json({ success: false, message: "Postulación no encontrada." }, { status: 404 });
    if (String(source.vacante_id) === targetVacancyId) {
      return NextResponse.json({ success: false, message: "Selecciona una vacante diferente a la actual." }, { status: 422 });
    }

    const targetRows = await query<{ id: number; titulo: string; estado: string; deleted_at: string | null }>(
      "SELECT id, titulo, estado, deleted_at FROM vacantes WHERE id = ? LIMIT 1",
      [targetVacancyId],
    );
    const target = targetRows[0];
    if (!target || target.deleted_at) return NextResponse.json({ success: false, code: "VACANCY_NOT_FOUND", message: "La vacante destino ya no existe o fue eliminada." }, { status: 404 });
    if (target.estado === "Pausada") return NextResponse.json({ success: false, code: "VACANCY_PAUSED", message: `La vacante “${target.titulo}” está pausada. Debes reanudarla antes de trasladar al postulante.` }, { status: 409 });
    if (target.estado === "Cerrada") return NextResponse.json({ success: false, code: "VACANCY_CLOSED", message: `La vacante “${target.titulo}” está cerrada y no puede recibir nuevos postulantes.` }, { status: 409 });
    if (target.estado !== "Publicada") return NextResponse.json({ success: false, code: "VACANCY_UNAVAILABLE", message: `La vacante “${target.titulo}” no está disponible para recibir postulantes.` }, { status: 409 });

    const duplicate = await query<{ id: number }>(
      "SELECT id FROM postulaciones WHERE candidato_id = ? AND vacante_id = ? AND deleted_at IS NULL LIMIT 1",
      [source.candidato_id, target.id],
    );
    if (duplicate[0]) return NextResponse.json({ success: false, message: "Este postulante ya tiene una postulación activa en la vacante destino." }, { status: 409 });

    const transferNote = `Traslado interno desde “${source.vacancy_title}” a “${target.titulo}”. Responsable: ${session.name} (ID ${session.userId}). Fecha: ${new Date().toISOString()}. Observación: ${notes}`;
    let previousSnapshot: Record<string, unknown> = {};
    try { previousSnapshot = typeof source.application_snapshot === "string" ? JSON.parse(source.application_snapshot) : source.application_snapshot || {}; } catch { previousSnapshot = {}; }
    const transferSnapshot = JSON.stringify({ ...previousSnapshot, vacancyTitle: target.titulo, source: "Manual", capturedAt: new Date().toISOString(), transferOrigin: source.vacancy_title, transferObservation: notes });
    await execute(
      "UPDATE postulaciones SET estado = 'No seleccionado', observaciones_rh = CONCAT(?, '\\n', COALESCE(observaciones_rh, '')) WHERE id = ?",
      [`Trasladado internamente a “${target.titulo}”. ${transferNote}`, source.id],
    );
    const inserted = await execute(
      `INSERT INTO postulaciones (candidato_id, vacante_id, estado, fuente, observaciones_rh, observaciones_candidato, cv_url, application_snapshot)
       VALUES (?, ?, 'Postulado', 'Manual', ?, 'Traslado interno sin correo automático.', ?, ?)`,
      [source.candidato_id, target.id, transferNote, source.cv_url, transferSnapshot],
    );

    const admin = `Administrador ${session.name} (ID ${session.userId})`;
    let internalNotificationSent = false;
    try {
      internalNotificationSent = await sendInternalCandidateTransferEmail({
        candidateName: source.candidate_name,
        candidateDocument: source.candidate_document,
        sourceVacancy: source.vacancy_title,
        targetVacancy: target.titulo,
        notes,
        adminName: session.name,
      });
    } catch (emailError) {
      console.error("No fue posible enviar el aviso interno de traslado:", emailError);
    }

    await Promise.all([
      recordVacancyAudit({
        action: "POSTULANTE_TRASLADADO_INTERNO",
        table: "postulaciones",
        recordId: source.id,
        description: `${admin} trasladó internamente al postulante desde “${source.vacancy_title}” a “${target.titulo}”. El postulante no recibió correo automático y queda pendiente la llamada. Aviso interno a Gestión Humana: ${internalNotificationSent ? "enviado" : "pendiente"}. Observación: ${notes}`,
      }),
      recordVacancyAudit({
        action: "POSTULANTE_RECIBIDO_POR_TRASLADO",
        table: "postulaciones",
        recordId: inserted.insertId,
        description: `${admin} incorporó al postulante desde “${source.vacancy_title}” mediante traslado interno. El postulante no recibió correo automático y queda pendiente la llamada. Aviso interno a Gestión Humana: ${internalNotificationSent ? "enviado" : "pendiente"}. Observación: ${notes}`,
      }),
    ]);

    return NextResponse.json({ success: true, data: { id: String(inserted.insertId), vacancyTitle: target.titulo, internalNotificationSent } });
  } catch (error) {
    console.error("No fue posible trasladar internamente al postulante:", error);
    return NextResponse.json({ success: false, message: "No fue posible trasladar al postulante." }, { status: 500 });
  }
}
