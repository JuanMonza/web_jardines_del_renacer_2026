import { NextRequest, NextResponse } from "next/server";
import {
  APPLICATION_STATUS_OPTIONS,
  type ApplicationStatus,
} from "@/config/candidates";
import {
  deactivateCandidateFromApplicationInDB,
  getApplicationByIdFromDB,
  updateApplicationStatusInDB,
} from "@/lib/candidateStorageDB";
import { sendInternalVacancyMovementEmail } from "@/lib/candidateMailer";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
  verifyAdminPassword,
} from "@/lib/iam/admin-session";

export const runtime = "nodejs";
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.applications.update",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  try {
    const body = (await request.json()) as {
      status?: ApplicationStatus;
      notes?: string;
    };
    if (!body.status || !APPLICATION_STATUS_OPTIONS.includes(body.status))
      return NextResponse.json(
        { success: false, message: "Estado de postulación inválido." },
        { status: 422 },
      );
    if (body.status !== "Recibida" && !body.notes?.trim())
      return NextResponse.json(
        {
          success: false,
          message:
            "Registra una observación antes de cambiar la etapa del proceso.",
        },
        { status: 422 },
      );
    const { id } = await params;
    if (
      !(await updateApplicationStatusInDB({
        id,
        status: body.status,
        notes: body.notes,
        adminName: session.name,
        adminUserId: session.userId,
      }))
    )
      return NextResponse.json(
        {
          success: false,
          message:
            "No fue posible actualizar la postulación. Registra una observación para continuar.",
        },
        { status: 422 },
      );
    const application = await getApplicationByIdFromDB(id);
    let internalNotificationSent = false;
    if (application) {
      try {
        internalNotificationSent = await sendInternalVacancyMovementEmail({
          eventTitle: "Estado de postulación actualizado",
          candidateName: application.candidateName,
          candidateDocument: application.candidateDocument,
          candidateEmail: application.candidateEmail,
          vacancyTitle: application.vacancyTitle,
          status: body.status,
          notes: body.notes?.trim(),
          adminName: session.name,
          applicationId: application.trackingCode || id,
        });
      } catch (emailError) {
        console.error("No se pudo enviar el aviso interno del movimiento:", emailError);
      }
      await recordVacancyAudit({
        action: internalNotificationSent ? "MOVIMIENTO_INTERNO_NOTIFICADO" : "MOVIMIENTO_INTERNO_PENDIENTE",
        table: "postulaciones",
        recordId: id,
        description: internalNotificationSent
          ? `Gestión Humana fue notificada del cambio de ${application.candidateName} a “${body.status}”. Responsable: ${session.name}. Observación: ${body.notes?.trim() || "Sin observación"}.`
          : `El cambio de ${application.candidateName} a “${body.status}” se guardó, pero el aviso interno quedó pendiente. Responsable: ${session.name}.`,
      });
    }
    return NextResponse.json({ success: true, internalNotificationSent });
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible actualizar la postulación." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const body = (await request.json()) as { password?: string };
    if (!(await verifyAdminPassword(session, body.password))) {
      return NextResponse.json(
        {
          success: false,
          message: "La contraseña del administrador no es correcta.",
        },
        { status: 401 },
      );
    }
    const { id } = await params;
    const candidate = await deactivateCandidateFromApplicationInDB({
      applicationId: id,
      adminUserId: session.userId,
      adminName: session.name,
    });
    if (!candidate)
      return NextResponse.json(
        { success: false, message: "Postulante no encontrado o ya eliminado." },
        { status: 404 },
      );
    return NextResponse.json({
      success: true,
      data: { email: candidate.email, name: candidate.name },
    });
  } catch (error) {
    console.error("No fue posible eliminar el postulante:", error);
    return NextResponse.json(
      { success: false, message: "No fue posible eliminar el postulante." },
      { status: 500 },
    );
  }
}
