import { NextRequest, NextResponse } from 'next/server';
import type { ApplicationStatus } from '@/config/candidates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type NotifyStatusPayload = {
  candidateName?: string;
  candidateEmail?: string;
  candidateDocument?: string;
  vacancyTitle?: string;
  trackingCode?: string;
  status?: ApplicationStatus;
};

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildEmailCopy(payload: {
  candidateName: string;
  vacancyTitle: string;
  status: ApplicationStatus;
  trackingCode: string;
}) {
  const name = payload.candidateName || 'Postulante';

  if (payload.status === 'Prueba tecnica') {
    return {
      subject: `Avanzaste a prueba tecnica - ${payload.vacancyTitle}`,
      headline: `Hola ${name}, avanzaste a la etapa de prueba tecnica.`,
      body:
        'Tu perfil fue validado por nuestro equipo y queremos continuar contigo en el proceso de seleccion. Pronto te contactaremos con instrucciones y fecha.',
    };
  }

  if (payload.status === 'No continua') {
    return {
      subject: `Actualizacion de tu postulacion - ${payload.vacancyTitle}`,
      headline: `Hola ${name}, tu proceso para esta vacante no continuara.`,
      body:
        'Agradecemos tu postulacion y el tiempo invertido. Conservaremos tu perfil para futuras oportunidades alineadas a tu experiencia.',
    };
  }

  return {
    subject: `Estado actualizado - ${payload.vacancyTitle}`,
    headline: `Hola ${name}, tu postulacion tuvo una actualizacion.`,
    body: `El estado actual de tu proceso es: ${payload.status}.`,
  };
}

function buildHtmlMail(payload: {
  headline: string;
  body: string;
  candidateName: string;
  vacancyTitle: string;
  status: ApplicationStatus;
  trackingCode: string;
  candidateDocument: string;
}) {
  return `
  <div style="background:#f5f7fb;padding:24px;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dbe5f6;border-radius:14px;overflow:hidden;">
      <div style="padding:18px 22px;background:linear-gradient(135deg,#2f5bd6,#3c60a2);color:#fff;">
        <h1 style="margin:0;font-size:20px;font-weight:700;">Jardines del Renacer</h1>
        <p style="margin:6px 0 0;font-size:13px;opacity:0.92;">Actualizacion de estado de postulacion</p>
      </div>
      <div style="padding:22px;">
        <h2 style="margin:0 0 12px;font-size:20px;color:#0f172a;">${payload.headline}</h2>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#334155;">${payload.body}</p>

        <div style="border:1px solid #dbe5f6;border-radius:12px;padding:14px;background:#f8fbff;">
          <p style="margin:0 0 8px;font-size:13px;"><strong>Cargo:</strong> ${payload.vacancyTitle}</p>
          <p style="margin:0 0 8px;font-size:13px;"><strong>Estado actual:</strong> ${payload.status}</p>
          <p style="margin:0 0 8px;font-size:13px;"><strong>Codigo de seguimiento:</strong> ${
            payload.trackingCode || 'No registrado'
          }</p>
          <p style="margin:0;font-size:13px;"><strong>Cedula:</strong> ${
            payload.candidateDocument || 'No registrada'
          }</p>
        </div>

        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
          Si necesitas soporte, responde este correo o comunicate con nuestro equipo de talento humano.
        </p>
      </div>
    </div>
  </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as NotifyStatusPayload;

    const candidateName = asText(payload.candidateName);
    const candidateEmail = asText(payload.candidateEmail).toLowerCase();
    const candidateDocument = asText(payload.candidateDocument);
    const vacancyTitle = asText(payload.vacancyTitle);
    const trackingCode = asText(payload.trackingCode);
    const status = payload.status;

    if (!candidateEmail || !vacancyTitle || !status) {
      return NextResponse.json(
        { ok: false, message: 'Datos incompletos para notificar el estado.' },
        { status: 400 },
      );
    }

    const smtpHost = asText(process.env.SMTP_HOST || 'smtp.gmail.com');
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure =
      (process.env.SMTP_SECURE || '').toLowerCase() === 'true' || smtpPort === 465;
    const smtpUser = asText(process.env.SMTP_USER || process.env.GMAIL_USER);
    const smtpPass = asText(
      process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD,
    );
    const fromEmail = asText(process.env.SMTP_FROM || smtpUser);

    if (!smtpUser || !smtpPass || !fromEmail) {
      return NextResponse.json(
        {
          ok: false,
          message:
            'Correo no configurado. Define SMTP_USER, SMTP_PASS (App Password de Google) y SMTP_FROM.',
        },
        { status: 500 },
      );
    }

    const nodemailer = require('nodemailer') as {
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
        }) => Promise<{ messageId?: string }>;
      };
    };

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const copy = buildEmailCopy({
      candidateName,
      vacancyTitle,
      status,
      trackingCode,
    });

    const html = buildHtmlMail({
      headline: copy.headline,
      body: copy.body,
      candidateName,
      vacancyTitle,
      status,
      trackingCode,
      candidateDocument,
    });

    const result = await transporter.sendMail({
      from: fromEmail,
      to: candidateEmail,
      subject: copy.subject,
      html,
    });

    return NextResponse.json({
      ok: true,
      message: 'Correo enviado correctamente.',
      messageId: result.messageId || '',
    });
  } catch (error) {
    console.error('Error enviando notificacion de vacantes:', error);
    return NextResponse.json(
      {
        ok: false,
        message:
          'No se pudo enviar el correo. Verifica si falta instalar nodemailer o revisar credenciales SMTP.',
      },
      { status: 500 },
    );
  }
}
