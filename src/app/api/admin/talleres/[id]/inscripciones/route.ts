import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";
import {
  ensureWorkshopManagementTables,
  recordWorkshopActivity,
} from "@/lib/workshop-management";
import { repairMojibake } from "@/lib/text-encoding";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "workshops.view",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  const workshopId = Number(params.id);
  if (!Number.isSafeInteger(workshopId) || workshopId < 1)
    return NextResponse.json(
      { success: false, message: "Taller inválido." },
      { status: 422 },
    );
  try {
    await ensureWorkshopManagementTables();
    const data = await query<{
      id: number;
      nombre: string;
      telefono: string;
      email: string;
      estado: string;
      asistencia: string;
      observaciones: string | null;
      correo_estado: "PENDIENTE" | "ENVIADO" | "ERROR";
      correo_enviado_at: string | null;
      created_at: string;
    }>(
      "SELECT id,nombre,telefono,email,estado,asistencia,observaciones,correo_estado,correo_enviado_at,created_at FROM talleres_duelo_inscripciones WHERE taller_id=? ORDER BY FIELD(estado,'CONFIRMADA','LISTA_ESPERA','CANCELADA'),created_at DESC",
      [workshopId],
    );
    return NextResponse.json({
      success: true,
      data: data.map((item) => ({
        ...item,
        nombre: repairMojibake(item.nombre),
        telefono: repairMojibake(item.telefono),
        observaciones: repairMojibake(item.observaciones),
      })),
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible consultar inscritos." },
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
    "workshops.update",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  const workshopId = Number(params.id);
  try {
    const body = (await request.json()) as {
      registrationId?: unknown;
      attendance?: unknown;
      status?: unknown;
      notes?: unknown;
    };
    const registrationId = Number(body.registrationId);
    const attendance = ["PENDIENTE", "ASISTIÓ", "NO_ASISTIÓ"].includes(
      String(body.attendance),
    )
      ? String(body.attendance)
      : "PENDIENTE";
    const status = ["CONFIRMADA", "LISTA_ESPERA", "CANCELADA"].includes(
      String(body.status),
    )
      ? String(body.status)
      : "CONFIRMADA";
    if (
      !Number.isSafeInteger(workshopId) ||
      !Number.isSafeInteger(registrationId)
    )
      return NextResponse.json(
        { success: false, message: "Registro inválido." },
        { status: 422 },
      );
    await ensureWorkshopManagementTables();
    await execute(
      "UPDATE talleres_duelo_inscripciones SET asistencia=?,estado=?,observaciones=? WHERE id=? AND taller_id=?",
      [
        attendance,
        status,
        typeof body.notes === "string"
          ? body.notes.trim().slice(0, 1000)
          : null,
        registrationId,
        workshopId,
      ],
    );
    await recordWorkshopActivity({
      workshopId,
      adminUserId: session.userId,
      action: "INSCRIPCION_ACTUALIZADA",
      detail: `Registro ${registrationId}: ${status}, asistencia ${attendance}.`,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible actualizar la inscripción." },
      { status: 500 },
    );
  }
}
