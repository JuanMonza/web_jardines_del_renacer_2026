import { NextRequest, NextResponse } from "next/server";
import {
  deactivateVacancyInDB,
  getVacancyByIdFromDB,
  setVacancyStatusInDB,
  updateVacancyInDB,
} from "@/lib/vacanciesStorageDB";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import { execute, query } from "@/lib/db";
import { sendCandidateVacancyClosedEmail } from "@/lib/candidateMailer";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.applications.view",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  try {
    const vacancy = await getVacancyByIdFromDB(params.id);
    if (!vacancy)
      return NextResponse.json(
        { success: false, message: "Vacante no encontrada." },
        { status: 404 },
      );
    return NextResponse.json({ success: true, data: vacancy });
  } catch (error) {
    console.error("Error consultando vacante:", error);
    return NextResponse.json(
      { success: false, message: "Error interno." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.update",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  try {
    const body = await request.json();
    await updateVacancyInDB(params.id, body);
    await recordVacancyAudit({
      action: "VACANTE_ACTUALIZADA",
      table: "vacantes",
      recordId: params.id,
      description: `Administrador ${session.name} (ID ${session.userId}) actualizó la vacante “${body.title || params.id}”.`,
    });
    return NextResponse.json({
      success: true,
      message: "Vacante actualizada correctamente.",
    });
  } catch (error) {
    console.error("Error actualizando vacante:", error);
    return NextResponse.json(
      { success: false, message: "No se pudo actualizar la vacante." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.update",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  try {
    const body = (await request.json()) as { status?: string };
    if (!["Publicada", "Pausada"].includes(String(body.status)))
      return NextResponse.json(
        { success: false, message: "Estado inválido." },
        { status: 422 },
      );
    const changed = await setVacancyStatusInDB(
      params.id,
      body.status as "Publicada" | "Pausada",
    );
    if (!changed)
      return NextResponse.json(
        { success: false, message: "Vacante no encontrada." },
        { status: 404 },
      );
    await recordVacancyAudit({
      action:
        body.status === "Pausada" ? "VACANTE_PAUSADA" : "VACANTE_REANUDADA",
      table: "vacantes",
      recordId: params.id,
      description: `Administrador ${session.name} (ID ${session.userId}) ${body.status === "Pausada" ? "pausó" : "reanudó"} la vacante “${params.id}”.`,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "No fue posible cambiar el estado de la vacante.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.delete",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  try {
    const vacancy = await getVacancyByIdFromDB(params.id);
    const applications = await query<{
      id: string;
      nombre: string;
      email: string;
    }>(
      "SELECT p.id, CONCAT(c.nombres, ' ', c.apellidos) AS nombre, c.email FROM postulaciones p INNER JOIN candidatos c ON c.id=p.candidato_id WHERE p.vacante_id=? AND p.deleted_at IS NULL AND p.estado NOT IN ('Contratado','No seleccionado','Proceso cerrado')",
      [params.id],
    );
    let notified = 0;
    for (const application of applications) {
      await execute(
        "UPDATE postulaciones SET estado='No seleccionado', observaciones_rh=? WHERE id=?",
        [
          "Vacante cubierta; se conserva el perfil para futuras oportunidades.",
          application.id,
        ],
      );
      try {
        if (
          await sendCandidateVacancyClosedEmail({
            email: application.email,
            name: application.nombre,
            vacancyTitle: vacancy?.title || "la vacante",
          })
        )
          notified += 1;
      } catch (emailError) {
        console.error(
          "No fue posible notificar cierre de vacante:",
          emailError,
        );
      }
      await recordVacancyAudit({
        action: "POSTULANTE_NO_CONTINUA_VACANTE_CUBIERTA",
        table: "postulaciones",
        recordId: application.id,
        description: `La vacante “${vacancy?.title || params.id}” fue cubierta. Se notificó al postulante ${application.nombre} que su perfil se conservará para futuras oportunidades.`,
      });
    }
    const affectedRows = await deactivateVacancyInDB(params.id);
    if (!affectedRows)
      return NextResponse.json(
        { success: false, message: "Vacante no encontrada." },
        { status: 404 },
      );
    await recordVacancyAudit({
      action: "VACANTE_ELIMINADA",
      table: "vacantes",
      recordId: params.id,
      description: `Administrador ${session.name} (ID ${session.userId}) cerró la vacante “${vacancy?.title || params.id}”. Se notificó a ${notified} postulante(s) no seleccionados y sus perfiles quedan disponibles para futuras oportunidades.`,
    });
    return NextResponse.json({
      success: true,
      message: `Vacante cerrada. Se notificó a ${notified} postulante(s).`,
    });
  } catch (error) {
    console.error("Error desactivando vacante:", error);
    return NextResponse.json(
      { success: false, message: "No se pudo desactivar la vacante." },
      { status: 500 },
    );
  }
}
