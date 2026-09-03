import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ensureWorkshopManagementTables,
  getWorkshopSettings,
  recordWorkshopActivity,
} from "@/lib/workshop-management";
import { repairMojibake } from "@/lib/text-encoding";

const clean = (value: unknown, length: number) =>
  typeof value === "string" ? value.trim().slice(0, length) : "";

async function sendConfirmation(input: {
  email: string;
  name: string;
  title: string;
  date: string;
  place: string;
  status: string;
  connectionUrl: string;
}) {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const password = (
    process.env.SMTP_PASS ||
    process.env.GMAIL_APP_PASSWORD ||
    ""
  ).trim();
  const from = (process.env.SMTP_FROM || user).trim();
  if (!user || !password || !from) return "PENDIENTE" as const;
  const nodemailer = require("nodemailer") as {
    createTransport: (options: object) => {
      sendMail: (options: object) => Promise<unknown>;
    };
  };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure:
      (process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
      Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass: password },
  });
  const waiting = input.status === "LISTA_ESPERA";
  await transporter.sendMail({
    from,
    to: input.email,
    subject: waiting
      ? `Lista de espera · ${input.title}`
      : `Inscripción confirmada · ${input.title}`,
    html: `<div style="font-family:Arial,sans-serif;background:#f5f7fb;padding:24px;color:#1f2937"><div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dbe5f6"><div style="background:#173f73;color:#fff;padding:20px"><strong>Jardines del Renacer</strong><div style="font-size:13px;margin-top:6px">Talleres de acompañamiento</div></div><div style="padding:24px"><h2 style="margin-top:0">Hola, ${input.name}</h2><p>${waiting ? "Recibimos tu solicitud y quedaste en lista de espera. Te avisaremos si se libera un cupo." : "Tu cupo fue reservado correctamente."}</p><div style="background:#f8fbff;border:1px solid #dbe5f6;border-radius:12px;padding:14px"><p><strong>Taller:</strong> ${input.title}</p><p><strong>Fecha:</strong> ${input.date}</p><p><strong>Lugar:</strong> ${input.place}</p></div>${!waiting && input.connectionUrl ? `<p style="margin:22px 0"><a href="${input.connectionUrl}" style="display:inline-block;background:#2454a0;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Conectarme al taller</a></p>` : ""}<p style="font-size:13px;color:#64748b">Si necesitas apoyo o no puedes asistir, comunícate con nuestro equipo.</p></div></div></div>`,
  });
  return "ENVIADO" as const;
}

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
      emailStatus = await sendConfirmation({
        email,
        name,
        title: repairMojibake(workshop.titulo),
        date: repairMojibake(workshop.fecha_label),
        place: repairMojibake(workshop.lugar),
        status,
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
          ? "Te registramos en la lista de espera. Revisa tu correo."
          : "Tu inscripción fue confirmada. Revisa tu correo.",
    });
  } catch (error) {
    console.error("No fue posible registrar inscripción a taller:", error);
    return NextResponse.json(
      { success: false, message: "No fue posible registrar tu inscripción." },
      { status: 500 },
    );
  }
}
