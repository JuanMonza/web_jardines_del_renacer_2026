import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ensureWorkshopManagementTables,
  getWorkshopSettings,
  recordWorkshopActivity,
} from "@/lib/workshop-management";
import { repairMojibake } from "@/lib/text-encoding";
import { sendWorkshopConfirmation } from "@/lib/workshop-mailer";

const clean = (value: unknown, length: number) =>
  typeof value === "string" ? value.trim().slice(0, length) : "";

export async function POST(request: NextRequest) {
  try {
    await ensureWorkshopManagementTables();
    const body = (await request.json()) as Record<string, unknown>;
    const workshopId = Number(body.workshopId);
    const name = clean(body.name, 180);
    const phone = clean(body.phone, 50);
    const email = clean(body.email, 160).toLowerCase();
    if (
      !Number.isSafeInteger(workshopId) ||
      workshopId < 1 ||
      !name ||
      !phone ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      return NextResponse.json(
        {
          success: false,
          message: "Completa nombre, teléfono y un correo válido.",
        },
        { status: 422 },
      );
    const workshops = await query<{
      id: number;
      titulo: string;
      fecha_label: string;
      lugar: string;
    }>(
      "SELECT id,titulo,fecha_label,lugar FROM talleres_duelo WHERE id=? AND activo=TRUE AND deleted_at IS NULL LIMIT 1",
      [workshopId],
    );
    const workshop = workshops[0];
    if (!workshop)
      return NextResponse.json(
        { success: false, message: "Este taller ya no está disponible." },
        { status: 404 },
      );
    const settings = await getWorkshopSettings([workshopId]);
    const detail = settings.get(workshopId)!;
    const existingRows = await query<{ estado: string }>(
      "SELECT estado FROM talleres_duelo_inscripciones WHERE taller_id=? AND email=? LIMIT 1",
      [workshopId, email],
    );
    const existing = existingRows[0];
    if (existing?.estado === "CONFIRMADA")
      return NextResponse.json({
        success: true,
        data: { status: "CONFIRMADA", alreadyRegistered: true },
        message: "Ya tienes una reserva confirmada para este taller.",
      });
    const countRows = await query<{ total: number }>(
      "SELECT COUNT(*) AS total FROM talleres_duelo_inscripciones WHERE taller_id=? AND estado='CONFIRMADA'",
      [workshopId],
    );
    const status =
      Number(countRows[0]?.total || 0) >= detail.capacity
        ? "LISTA_ESPERA"
        : "CONFIRMADA";
    await execute(
      "INSERT INTO talleres_duelo_inscripciones (taller_id,nombre,telefono,email,estado) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),telefono=VALUES(telefono),estado=IF(estado='CANCELADA',VALUES(estado),estado)",
      [workshopId, name, phone, email, status],
    );
    await recordWorkshopActivity({
      workshopId,
      action: "INSCRIPCION_PUBLICA",
      detail: `${name} se registró con estado ${status}.`,
    });
    let emailStatus: "PENDIENTE" | "ENVIADO" | "ERROR" = "PENDIENTE";
    try {
      emailStatus = await sendWorkshopConfirmation({
        email,
        name,
        title: repairMojibake(workshop.titulo),
        date: repairMojibake(workshop.fecha_label),
        place: repairMojibake(workshop.lugar),
        waiting: status === "LISTA_ESPERA",
        connectionUrl: detail.connectionUrl,
      });
    } catch (emailError) {
      console.error(
        "No fue posible enviar confirmación de taller:",
        emailError,
      );
      emailStatus = "ERROR";
    }
    await execute(
      "UPDATE talleres_duelo_inscripciones SET correo_estado=?,correo_enviado_at=IF(?='ENVIADO',NOW(),correo_enviado_at) WHERE taller_id=? AND email=?",
      [emailStatus, emailStatus, workshopId, email],
    );
    await recordWorkshopActivity({
      workshopId,
      action: "CORREO_INSCRIPCION",
      detail: `Confirmación para ${email}: ${emailStatus}.`,
    });
    return NextResponse.json({
      success: true,
      data: { status, emailStatus },
      message:
        status === "LISTA_ESPERA"
          ? "Los cupos se agotaron. Quedaste registrado en la lista de espera y te enviamos la confirmación al correo."
          : "Reserva realizada con éxito. Te enviamos la confirmación al correo.",
    });
  } catch (error) {
    console.error("No fue posible registrar inscripción a taller:", error);
    return NextResponse.json(
      { success: false, message: "No fue posible registrar tu inscripción." },
      { status: 500 },
    );
  }
}
