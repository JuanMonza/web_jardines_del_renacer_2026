import { institutionalEmailLayout, institutionalEmailSiteUrl } from "@/lib/institutional-email";
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
  const configured = [
    process.env.VACANCIES_NOTIFICATION_EMAIL,
    process.env.VACANCIES_TRANSFER_NOTIFICATION_EMAIL,
  ].flatMap(value => asText(value).split(/[;,]/).map(address => address.trim()).filter(Boolean));
  const recipients = [
    "psicologa@jardinesdelrenacer.co",
    "prueba.smtp@jardinesdelrenacer.co",
    ...configured,
  ];
  return recipients.filter((address, index) =>
    recipients.findIndex(candidate => candidate.toLowerCase() === address.toLowerCase()) === index,
  ).join(", ");
}

function candidateSiteUrl() {
  return institutionalEmailSiteUrl();
}

function vacancyEmailHero(vacancyTitle: string, label: string) {
  const imageUrl = `${candidateSiteUrl()}/images/images-baners/Trabaja_con_nosotros.webp`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:separate;border-spacing:0;overflow:hidden;border-radius:20px;background:#173f73">
    <tr><td><img src="${imageUrl}" width="572" alt="Equipo Jardines del Renacer" style="display:block;width:100%;max-width:572px;height:auto;border:0"></td></tr>
    <tr><td style="padding:22px 24px 24px;background:linear-gradient(135deg,#173f73,#3972ad);color:#fff">
      <div style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#dbeafe">${escapeHtml(label)}</div>
      <div style="padding:17px 18px;border:1px solid rgba(255,255,255,.35);border-radius:14px;background:rgba(255,255,255,.14)">
        <div style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#dbeafe">Vacante</div>
        <div style="font-size:24px;line-height:1.25;font-weight:800;color:#fff">${escapeHtml(vacancyTitle)}</div>
      </div>
    </td></tr>
  </table>`;
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
  const receivedHero = input.status === "Recibida"
    ? vacancyEmailHero(input.vacancyTitle, "Nueva postulación recibida")
    : "";
  await sendTrainingSafeEmail(transporter, {
    from: smtp.from,
    to: recipient,
    subject: `${input.eventTitle} | ${input.vacancyTitle}`,
    html: institutionalEmailLayout(`${receivedHero}<h1 style="font-size:24px;margin:0 0 8px;color:#173f73">${escapeHtml(input.eventTitle)}</h1><p style="margin:0 0 20px;color:#526b8b">Se registró un movimiento en el módulo de Talento Humano.</p><div style="padding:18px;border:1px solid #d4e2f3;border-radius:14px;background:#edf3fc"><p style="margin:0 0 8px"><strong>Postulante:</strong> ${escapeHtml(input.candidateName)}</p><p style="margin:0 0 8px"><strong>Documento:</strong> ${escapeHtml(input.candidateDocument)}</p>${contact}<p style="margin:0 0 8px"><strong>Vacante:</strong> ${escapeHtml(input.vacancyTitle)}</p><p style="margin:0 0 8px"><strong>Estado:</strong> <span style="display:inline-block;padding:4px 9px;border-radius:999px;background:#dff7e9;color:#087443;font-size:12px;font-weight:700">${escapeHtml(input.status)}</span></p><p style="margin:0"><strong>Código de postulación:</strong> ${escapeHtml(input.applicationId)}</p></div>${notes}<p style="margin:18px 0 0;font-size:13px;color:#667085">Movimiento registrado por ${escapeHtml(input.adminName)}.</p>`, "Talento Humano · Notificación interna"),
  });
  return true;
}

function candidatePortalUrl() {
  return `${candidateSiteUrl()}/servicios/trabaja-con-nosotros/postulante`;
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
    subject: `Recibimos tu postulación - ${vacancyTitle}`,
    html: institutionalEmailLayout(`${vacancyEmailHero(vacancyTitle || "Vacante seleccionada", "¡Estamos buscando talento!")}<h1 style="font-size:27px;line-height:1.2;margin:0 0 14px;color:#173f73">Recibimos tu postulación</h1><p style="font-size:16px;line-height:1.6">Hola, <strong>${recipientName}</strong>.</p><p style="font-size:16px;line-height:1.6">Confirmamos que tu postulación para <strong>${position}</strong> fue recibida correctamente por el equipo de Talento Humano.</p><div style="margin:24px 0;padding:18px;border:1px solid #c9ddf3;border-radius:14px;background:#eef5fc"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding-bottom:10px"><strong style="color:#173f73">Estado actual</strong></td><td style="padding-bottom:10px;text-align:right"><span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#dff7e9;color:#087443;font-size:12px;font-weight:700">Recibida</span></td></tr><tr><td style="color:#526b8b">Código de seguimiento</td><td style="text-align:right;font-weight:700;color:#173f73">${tracking}</td></tr></table></div><p style="font-size:15px;line-height:1.6">Te notificaremos en este correo cuando tu proceso avance a una nueva etapa.</p><p style="margin:24px 0 8px;text-align:center"><a href="${portalUrl}" style="display:inline-block;padding:13px 22px;border-radius:12px;background:#245c9b;color:#fff;text-decoration:none;font-weight:700">Consultar mi proceso</a></p>`, "Portal de postulantes"),
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
