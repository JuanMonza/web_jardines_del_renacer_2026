function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[character] || character));
}

function getSmtpConfiguration() {
  const host = asText(process.env.SMTP_HOST || 'smtp.gmail.com');
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = (process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
  const user = asText(process.env.SMTP_USER || process.env.GMAIL_USER);
  const pass = asText(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
  const from = asText(process.env.SMTP_FROM || user);
  return { host, port, secure, user, pass, from };
}

export async function sendCandidateWelcomeEmail({ email, name }: { email: string; name: string }) {
  const smtp = getSmtpConfiguration();
  if (!smtp.user || !smtp.pass || !smtp.from) return false;

  const nodemailer = require('nodemailer') as {
    createTransport: (options: { host: string; port: number; secure: boolean; auth: { user: string; pass: string } }) => {
      sendMail: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown>;
    };
  };
  const recipientName = escapeHtml(name || 'Postulante');
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: 'Bienvenido al Portal de Postulantes | Jardines del Renacer',
    html: `<div style="font-family:Arial,sans-serif;color:#24344d;max-width:540px;margin:auto;padding:28px"><p style="color:#3c60a2;font-weight:700;letter-spacing:1.5px;font-size:12px">JARDINES DEL RENACER</p><h1 style="font-size:26px;margin:0 0 16px">¡Bienvenido, ${recipientName}!</h1><p>Tu cuenta en el <strong>Portal de Postulantes</strong> fue creada correctamente.</p><p>Desde ahora podrás completar tu perfil, cargar tu hoja de vida y postularte a las vacantes disponibles.</p><div style="margin:24px 0;padding:16px 18px;border-radius:12px;background:#edf3fc"><strong>¿Cómo ingresas?</strong><br>Usa tu correo electrónico y solicita un código temporal de seguridad. No compartas ese código con nadie.</div><p style="font-size:13px;color:#667085">Este es un mensaje automático; por favor no respondas a este correo.</p></div>`,
  });
  return true;
}

export async function sendCandidatePasswordChangedEmail({ email, name }: { email: string; name: string }) {
  const smtp = getSmtpConfiguration();
  if (!smtp.user || !smtp.pass || !smtp.from) return false;

  const nodemailer = require('nodemailer') as {
    createTransport: (options: { host: string; port: number; secure: boolean; auth: { user: string; pass: string } }) => {
      sendMail: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown>;
    };
  };
  const recipientName = escapeHtml(name || 'Postulante');
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: 'Tu contraseña fue actualizada | Jardines del Renacer',
    html: `<div style="font-family:Arial,sans-serif;color:#24344d;max-width:540px;margin:auto;padding:28px"><p style="color:#3c60a2;font-weight:700;letter-spacing:1.5px;font-size:12px">JARDINES DEL RENACER</p><h1 style="font-size:24px;margin:0 0 16px">Contraseña actualizada</h1><p>Hola, <strong>${recipientName}</strong>.</p><p>La contraseña de tu cuenta del <strong>Portal de Postulantes</strong> fue actualizada correctamente.</p><div style="margin:24px 0;padding:16px 18px;border-radius:12px;background:#fff3f3;color:#8f2938"><strong>¿No realizaste este cambio?</strong><br>Ingresa nuevamente con tu correo y comunícate con nuestro equipo de soporte.</div><p style="font-size:13px;color:#667085">Este es un mensaje automático; por favor no respondas a este correo.</p></div>`,
  });
  return true;
}
