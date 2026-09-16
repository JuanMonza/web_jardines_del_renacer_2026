import { institutionalEmailLayout } from "@/lib/institutional-email";
import { prepareOutboundEmail, trainingEmailNotice } from "@/lib/training-environment";

async function sendTrainingSafeEmail(
  transporter: { sendMail: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown> },
  options: { from: string; to: string; subject: string; html: string },
) {
  const delivery = prepareOutboundEmail(options.to, options.subject);
  return transporter.sendMail({
    ...options,
    to: delivery.to,
    subject: delivery.subject,
    html: `${trainingEmailNotice(options.to)}${options.html}`,
  });
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] || character,
  );
}

function getSmtpConfiguration() {
  const host = asText(process.env.SMTP_HOST || "smtp.gmail.com");
  const port = Number(process.env.SMTP_PORT || 465);
  const secure =
    (process.env.SMTP_SECURE || "").toLowerCase() === "true" || port === 465;
  const user = asText(process.env.SMTP_USER || process.env.GMAIL_USER);
  const pass = asText(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
  const from = asText(process.env.SMTP_FROM || user);
  return { host, port, secure, user, pass, from };
}

function internalVacanciesRecipient() {
  return asText(
    process.env.VACANCIES_NOTIFICATION_EMAIL ||
      process.env.VACANCIES_TRANSFER_NOTIFICATION_EMAIL ||
      "psicologa@jardinesdelrenacer.co, prueba.smtp@jardinesdelrenacer.co",
  );
}

export async function sendInternalVacancyMovementEmail(input: {
  eventTitle: string;
  candidateName: string;
  candidateDocument: string;
  candidateEmail?: string;
  vacancyTitle: string;
  status: string;
  notes?: string;
  adminName: string;
  applicationId: string;
}) {
  const smtp = getSmtpConfiguration();
  const recipient = internalVacanciesRecipient();
  if (!smtp.user || !smtp.pass || !smtp.from || !recipient) return false;
  const nodemailer = require("nodemailer") as {
    createTransport: (options: { host: string; port: number; secure: boolean; auth: { user: string; pass: string } }) => {
      sendMail: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown>;
    };
  };
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  const contact = input.candidateEmail
    ? `<p style="margin:0 0 8px"><strong>Correo:</strong> ${escapeHtml(input.candidateEmail)}</p>`
    : "";
  const notes = input.notes
    ? `<div style="margin-top:18px;padding:15px 17px;border-left:4px solid #2454a0;background:#f3f7fc"><strong>Observación</strong><p style="margin:7px 0 0">${escapeHtml(input.notes)}</p></div>`
    : "";
  await sendTrainingSafeEmail(transporter, {
    from: smtp.from,
    to: recipient,
    subject: `${input.eventTitle} | ${input.vacancyTitle}`,
    html: institutionalEmailLayout(`<h1 style="font-size:24px;margin:0 0 8px">${escapeHtml(input.eventTitle)}</h1><p style="margin:0 0 20px;color:#526b8b">Se registró un movimiento en el módulo de Talento Humano.</p><div style="padding:18px;border-radius:12px;background:#edf3fc"><p style="margin:0 0 8px"><strong>Postulante:</strong> ${escapeHtml(input.candidateName)}</p><p style="margin:0 0 8px"><strong>Documento:</strong> ${escapeHtml(input.candidateDocument)}</p>${contact}<p style="margin:0 0 8px"><strong>Vacante:</strong> ${escapeHtml(input.vacancyTitle)}</p><p style="margin:0 0 8px"><strong>Estado:</strong> ${escapeHtml(input.status)}</p><p style="margin:0"><strong>Código de postulación:</strong> ${escapeHtml(input.applicationId)}</p></div>${notes}<p style="margin:18px 0 0;font-size:13px;color:#667085">Movimiento registrado por ${escapeHtml(input.adminName)}.</p>`, "Talento Humano · Notificación interna"),
  });
  return true;
}

function candidatePortalUrl() {
  const baseUrl = asText(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://jardinesdelrenacer.com").replace(/\/$/, "");
  return `${baseUrl}/servicios/trabaja-con-nosotros/postulante`;
}

export async function sendCandidateWelcomeEmail({
  email,
  name,
  loginWithPassword = false,
}: {
  email: string;
  name: string;
  loginWithPassword?: boolean;
}) {
  const smtp = getSmtpConfiguration();
  if (!smtp.user || !smtp.pass || !smtp.from) return false;

  const nodemailer = require("nodemailer") as {
    createTransport: (options: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }) => {
      sendMail: (options: {
        from: string;
        to: string;
        subject: string;
        html: string;
      }) => Promise<unknown>;
    };
  };
  const recipientName = escapeHtml(name || "Postulante");
  const loginEmail = escapeHtml(email);
  const portalUrl = candidatePortalUrl();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await sendTrainingSafeEmail(transporter, {
    from: smtp.from,
    to: email,
    subject: "Bienvenido al Portal de Postulantes | Jardines del Renacer",
    html: institutionalEmailLayout(`<h1 style="font-size:26px;margin:0 0 16px">Bienvenido, ${recipientName}</h1><p>Tu cuenta en el <strong>Portal de Postulantes</strong> fue creada correctamente.</p><p>Desde ahora podrás completar tu perfil, cargar tu hoja de vida y consultar tus postulaciones.</p><div style="margin:24px 0;padding:18px;border:1px solid #cbdcf1;border-radius:12px;background:#edf3fc"><strong style="display:block;margin-bottom:10px;color:#173f73">Credenciales de acceso</strong><div style="margin-bottom:7px"><strong>Usuario:</strong> ${loginEmail}</div><div><strong>Contraseña:</strong> ${loginWithPassword ? "La contraseña privada asignada al crear la cuenta" : "Código temporal solicitado desde el portal"}</div><p style="margin:12px 0 0;font-size:13px;color:#526b8b">Por seguridad, la contraseña no se envía ni se almacena como texto visible. No compartas tus datos de acceso.</p></div><p style="margin:24px 0 0"><a href="${portalUrl}" style="display:inline-block;padding:12px 20px;border-radius:10px;background:#2454a0;color:#fff;text-decoration:none;font-weight:bold">Ingresar al portal</a></p><p style="margin:12px 0 0;font-size:13px;color:#526b8b">Dirección de acceso: <a href="${portalUrl}" style="color:#2454a0">${portalUrl}</a></p>`, "Portal de postulantes"),
  });
  return true;
}

export async function sendCandidatePasswordChangedEmail({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const smtp = getSmtpConfiguration();
  if (!smtp.user || !smtp.pass || !smtp.from) return false;

  const nodemailer = require("nodemailer") as {
    createTransport: (options: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }) => {
      sendMail: (options: {
        from: string;
        to: string;
        subject: string;
        html: string;
      }) => Promise<unknown>;
    };
  };
  const recipientName = escapeHtml(name || "Postulante");
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await sendTrainingSafeEmail(transporter, {
    from: smtp.from,
    to: email,
    subject: "Tu contraseña fue actualizada | Jardines del Renacer",
    html: institutionalEmailLayout(`<h1 style="font-size:24px;margin:0 0 16px">Contraseña actualizada</h1><p>Hola, <strong>${recipientName}</strong>.</p><p>La contraseña de tu cuenta del <strong>Portal de Postulantes</strong> fue actualizada correctamente.</p><div style="margin:24px 0;padding:16px 18px;border-radius:12px;background:#fff3f3;color:#8f2938"><strong>¿No realizaste este cambio?</strong><br>Ingresa nuevamente con tu correo y comunícate con nuestro equipo de soporte.</div>`, "Portal de postulantes"),
  });
  return true;
}

export async function sendCandidateApplicationReceivedEmail({
  email,
  name,
  vacancyTitle,
  trackingCode,
}: {
  email: string;
  name: string;
  vacancyTitle: string;
  trackingCode: string;
}) {
  const smtp = getSmtpConfiguration();
  if (!smtp.user || !smtp.pass || !smtp.from) return false;

  const nodemailer = require("nodemailer") as {
    createTransport: (options: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }) => {
      sendMail: (options: {
        from: string;
        to: string;
        subject: string;
        html: string;
      }) => Promise<unknown>;
    };
  };
  const recipientName = escapeHtml(name || "Postulante");
  const position = escapeHtml(vacancyTitle || "la vacante seleccionada");
  const tracking = escapeHtml(trackingCode || "No registrado");
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await sendTrainingSafeEmail(transporter, {
    from: smtp.from,
    to: email,
    subject: `Recibimos tu postulación - ${vacancyTitle}`,
    html: institutionalEmailLayout(`<h1 style="font-size:26px;margin:0 0 16px">Recibimos tu postulación</h1><p>Hola, <strong>${recipientName}</strong>.</p><p>Confirmamos que tu postulación para <strong>${position}</strong> fue recibida correctamente por el equipo de Talento Humano.</p><div style="margin:24px 0;padding:16px 18px;border-radius:12px;background:#edf3fc"><p style="margin:0 0 8px"><strong>Estado actual:</strong> Recibida</p><p style="margin:0"><strong>Código de seguimiento:</strong> ${tracking}</p></div><p>Te notificaremos en este correo cuando tu proceso avance a una nueva etapa.</p>`, "Portal de postulantes"),
  });
  return true;
}

export async function sendCandidateVacancyClosedEmail({
  email,
  name,
  vacancyTitle,
  closureReason,
}: {
  email: string;
  name: string;
  vacancyTitle: string;
  closureReason?: string;
}) {
  const smtp = getSmtpConfiguration();
  if (!smtp.user || !smtp.pass || !smtp.from) return false;
  const nodemailer = require("nodemailer") as {
    createTransport: (options: {
      host: string;
      port: number;
      secure: boolean;
      auth: { user: string; pass: string };
    }) => {
      sendMail: (options: {
        from: string;
        to: string;
        subject: string;
        html: string;
      }) => Promise<unknown>;
    };
  };
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  const reasonMessage = closureReason === "Cancelación de proceso"
    ? "El proceso fue cancelado por una decisión organizacional y no continuará en su programación actual."
    : closureReason === "Modificación del proceso"
      ? "El proceso fue cerrado temporalmente para realizar modificaciones en sus condiciones."
      : "El proceso de selección finalizó y en esta oportunidad no continuarás a la siguiente etapa.";
  await sendTrainingSafeEmail(transporter, {
    from: smtp.from,
    to: email,
    subject: `Actualización de tu postulación - ${vacancyTitle}`,
    html: institutionalEmailLayout(`<h1 style="font-size:24px;margin:0 0 16px">Actualización de tu proceso</h1><p>Hola, <strong>${escapeHtml(name || "Postulante")}</strong>.</p><p>Te informamos una actualización relacionada con la vacante <strong>${escapeHtml(vacancyTitle)}</strong>.</p><div style="margin:24px 0;padding:16px 18px;border-radius:12px;background:#edf3fc"><strong>Estado del proceso</strong><br>${escapeHtml(reasonMessage)}</div><p><strong>Tu perfil sigue siendo valioso.</strong> Conservaremos tu información para considerarte en futuras vacantes que se ajusten a tu experiencia.</p>`, "Portal de postulantes"),
  });
  return true;
}

/**
 * Aviso interno para el equipo responsable. No se envía al postulante: el
 * traslado debe notificarse primero por llamada, según el protocolo definido.
 */
export async function sendInternalCandidateTransferEmail(input: {
  candidateName: string;
  candidateDocument: string;
  sourceVacancy: string;
  targetVacancy: string;
  notes: string;
  adminName: string;
}) {
  const smtp = getSmtpConfiguration();
  if (!smtp.user || !smtp.pass || !smtp.from) return false;
  const recipient = internalVacanciesRecipient();
  const nodemailer = require("nodemailer") as {
    createTransport: (options: { host: string; port: number; secure: boolean; auth: { user: string; pass: string } }) => {
      sendMail: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown>;
    };
  };
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await sendTrainingSafeEmail(transporter, {
    from: smtp.from,
    to: recipient,
    subject: `Traslado interno de postulante | ${input.targetVacancy}`,
    html: institutionalEmailLayout(`<h1 style="font-size:24px;margin:0 0 16px">Traslado interno registrado</h1><p>Se trasladó un postulante para revisión del equipo responsable.</p><div style="margin:20px 0;padding:18px;border-radius:12px;background:#f1edff"><p style="margin:0 0 8px"><strong>Postulante:</strong> ${escapeHtml(input.candidateName)}</p><p style="margin:0 0 8px"><strong>Documento:</strong> ${escapeHtml(input.candidateDocument)}</p><p style="margin:0 0 8px"><strong>Desde:</strong> ${escapeHtml(input.sourceVacancy)}</p><p style="margin:0"><strong>Hacia:</strong> ${escapeHtml(input.targetVacancy)}</p></div><p><strong>Observación:</strong> ${escapeHtml(input.notes)}</p><p style="font-size:13px;color:#667085">Registrado por ${escapeHtml(input.adminName)}. Este correo es interno; el postulante no fue notificado automáticamente.</p>`, "Talento Humano · Aviso interno"),
  });
  return true;
}
