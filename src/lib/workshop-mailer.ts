type WorkshopMail = {
  email: string;
  name: string;
  title: string;
  date: string;
  place: string;
  connectionUrl?: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'\"]/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!,
  );

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://jardinesdelrenacer.com").replace(/\/$/, "");
}

function layout(title: string, content: string) {
  const logo = `${siteUrl()}/logo-oficial.webp`;
  return `<div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:24px;color:#1f2937"><div style="max-width:600px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #dbe5f6"><div style="background:#173f73;color:#fff;padding:20px 24px;display:flex;align-items:center"><img src="${logo}" width="48" height="48" alt="Jardines del Renacer" style="display:block;object-fit:contain;margin-right:14px"><div><strong style="font-size:18px">Jardines del Renacer</strong><div style="font-size:13px;margin-top:4px;color:#dbeafe">Talleres de acompañamiento</div></div></div><div style="padding:26px 24px">${content}<p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#64748b">Si necesitas apoyo o no puedes asistir, comunícate con nuestro equipo.</p></div></div></div>`;
}

async function send(input: WorkshopMail & { subject: string; body: string }) {
  const user = (process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
  const password = (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "").trim();
  const from = (process.env.SMTP_FROM || user).trim();
  if (!user || !password || !from) return "PENDIENTE" as const;
  const nodemailer = require("nodemailer") as { createTransport: (options: object) => { sendMail: (options: object) => Promise<unknown> } };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || "").toLowerCase() === "true" || Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user, pass: password },
  });
  const details = `<div style="background:#f8fbff;border:1px solid #dbe5f6;border-radius:12px;padding:14px;margin:18px 0"><p style="margin:0 0 8px"><strong>Taller:</strong> ${escapeHtml(input.title)}</p><p style="margin:0 0 8px"><strong>Fecha y horario:</strong> ${escapeHtml(input.date)}</p><p style="margin:0"><strong>Lugar:</strong> ${escapeHtml(input.place)}</p></div>`;
  const connection = input.connectionUrl ? `<p style="margin:22px 0"><a href="${escapeHtml(input.connectionUrl)}" style="display:inline-block;background:#2454a0;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Conectarme al taller</a></p>` : "";
  await transporter.sendMail({ from, to: input.email, subject: input.subject, html: layout(input.subject, `<h2 style="margin-top:0">Hola, ${escapeHtml(input.name)}</h2>${input.body}${details}${connection}`) });
  return "ENVIADO" as const;
}

export function sendWorkshopConfirmation(input: WorkshopMail & { waiting: boolean }) {
  return send({ ...input, subject: input.waiting ? `Lista de espera · ${input.title}` : `Reserva confirmada · ${input.title}`, body: `<p>${input.waiting ? "Los cupos se agotaron y quedaste registrado en la lista de espera. Te avisaremos si se libera un espacio." : "Tu reserva fue registrada con éxito. Te esperamos en el taller."}</p>` });
}

export function sendWorkshopUpdate(input: WorkshopMail) {
  return send({ ...input, subject: `Actualización de taller · ${input.title}`, body: "<p>Te informamos que se actualizaron los datos de tu taller. Consulta la información vigente a continuación.</p>" });
}

export function sendWorkshopCancellation(input: WorkshopMail) {
  return send({ ...input, subject: `Cancelación de taller · ${input.title}`, body: "<p>Lamentamos informarte que este taller fue cancelado. Agradecemos tu comprensión y conservaremos tu información para futuras actividades de acompañamiento.</p>" });
}
