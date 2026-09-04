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
import { getWorkshopSettings } from "@/lib/workshop-management";
import { sendWorkshopCancellation, sendWorkshopConfirmation } from "@/lib/workshop-mailer";

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
    const previous = (await query<{ nombre: string; email: string; estado: string }>(
      "SELECT nombre,email,estado FROM talleres_duelo_inscripciones WHERE id=? AND taller_id=? LIMIT 1",
      [registrationId, workshopId],
    ))[0];
    if (!previous) return NextResponse.json({ success: false, message: "Registro no encontrado." }, { status: 404 });
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
    let emailStatus: "PENDIENTE" | "ENVIADO" | "ERROR" = "PENDIENTE";
    if (previous.estado !== status) {
      try {
        const workshop = (await query<{ titulo: string; fecha_label: string; lugar: string }>("SELECT titulo,fecha_label,lugar FROM talleres_duelo WHERE id=? LIMIT 1", [workshopId]))[0];
        const settings = (await getWorkshopSettings([workshopId])).get(workshopId);
        if (workshop && settings) {
          const mail = { email: previous.email, name: repairMojibake(previous.nombre), title: repairMojibake(workshop.titulo), date: repairMojibake(workshop.fecha_label), place: repairMojibake(workshop.lugar), connectionUrl: settings.connectionUrl };
          emailStatus = status === "CANCELADA"
            ? await sendWorkshopCancellation(mail)
            : await sendWorkshopConfirmation({ ...mail, waiting: status === "LISTA_ESPERA" });
          await execute("UPDATE talleres_duelo_inscripciones SET correo_estado=?,correo_enviado_at=IF(?='ENVIADO',NOW(),correo_enviado_at) WHERE id=?", [emailStatus, emailStatus, registrationId]);
          await recordWorkshopActivity({ workshopId, adminUserId: session.userId, action: "CORREO_ESTADO_INSCRIPCION", detail: `Estado ${status} notificado a ${previous.email}: ${emailStatus}.` });
        }
      } catch (mailError) {
        console.error("La inscripción se actualizó, pero no fue posible enviar el correo:", mailError);
        emailStatus = "ERROR";
      }
    }
    return NextResponse.json({ success: true, message: previous.estado === status ? "Registro actualizado." : `Estado actualizado a ${status}. Correo: ${emailStatus.toLowerCase()}.` });
  } catch {
    return NextResponse.json(
      { success: false, message: "No fue posible actualizar la inscripción." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "workshops.update",
  );
  if (!session) return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  const workshopId = Number(params.id);
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.nombre === "string" ? body.nombre.trim().slice(0, 180) : "";
    const phone = typeof body.telefono === "string" ? body.telefono.trim().slice(0, 50) : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 160) : "";
    if (!Number.isSafeInteger(workshopId) || workshopId < 1 || !name || !phone || !/^\S+@\S+\.\S+$/.test(email))
      return NextResponse.json({ success: false, message: "Completa nombre, teléfono y un correo válido." }, { status: 422 });
    await ensureWorkshopManagementTables();
    const workshop = (await query<{ titulo: string; fecha_label: string; lugar: string }>("SELECT titulo,fecha_label,lugar FROM talleres_duelo WHERE id=? AND activo=TRUE AND deleted_at IS NULL LIMIT 1", [workshopId]))[0];
    if (!workshop) return NextResponse.json({ success: false, message: "El taller ya no está disponible." }, { status: 404 });
    const settings = (await getWorkshopSettings([workshopId])).get(workshopId)!;
    const count = (await query<{ total: number }>("SELECT COUNT(*) AS total FROM talleres_duelo_inscripciones WHERE taller_id=? AND estado='CONFIRMADA'", [workshopId]))[0];
    const status = Number(count?.total || 0) >= settings.capacity ? "LISTA_ESPERA" : "CONFIRMADA";
    await execute("INSERT INTO talleres_duelo_inscripciones (taller_id,nombre,telefono,email,estado) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),telefono=VALUES(telefono),estado=IF(estado='CANCELADA',VALUES(estado),estado)", [workshopId, name, phone, email, status]);
    let emailStatus = "PENDIENTE";
    try { emailStatus = await sendWorkshopConfirmation({ email, name, title: repairMojibake(workshop.titulo), date: repairMojibake(workshop.fecha_label), place: repairMojibake(workshop.lugar), connectionUrl: settings.connectionUrl, waiting: status === "LISTA_ESPERA" }); } catch { emailStatus = "ERROR"; }
    await execute("UPDATE talleres_duelo_inscripciones SET correo_estado=?,correo_enviado_at=IF(?='ENVIADO',NOW(),correo_enviado_at) WHERE taller_id=? AND email=?", [emailStatus, emailStatus, workshopId, email]);
    await recordWorkshopActivity({ workshopId, adminUserId: session.userId, action: "INSCRIPCION_MANUAL", detail: `${name} agregado manualmente con estado ${status}.` });
    return NextResponse.json({ success: true, message: status === "CONFIRMADA" ? "Persona agregada y reserva confirmada." : "Persona agregada a la lista de espera." });
  } catch {
    return NextResponse.json({ success: false, message: "No fue posible agregar la persona." }, { status: 500 });
  }
}
