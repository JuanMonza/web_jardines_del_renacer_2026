import { NextRequest, NextResponse } from 'next/server';
import {
  createCandidateEmailAccessCode,
  hashCandidateEmailAccessCode,
} from '@/lib/candidateEmailAccess';
import {
  canRequestCandidateEmailAccessCode,
  createCandidateEmailAccessCode as saveCandidateEmailAccessCode,
  getCandidateAccountForLogin,
} from '@/lib/candidateStorageDB';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = asText(body.email).toLowerCase();
    if (!email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Ingresa un correo válido.' }, { status: 400 });
    }

    const smtp = getSmtpConfiguration();
    if (!smtp.user || !smtp.pass || !smtp.from) {
      return NextResponse.json({
        success: false,
        message: 'El acceso por correo aún no está configurado. Comunícate con soporte.',
      }, { status: 503 });
    }

    const candidate = await getCandidateAccountForLogin({ email });
    // Evita revelar si un correo está o no registrado.
    if (!candidate) {
      return NextResponse.json({ success: true, message: 'Si el correo está registrado, recibirás un código de acceso.' });
    }

    if (!(await canRequestCandidateEmailAccessCode(email))) {
      return NextResponse.json({ success: false, message: 'Espera un minuto antes de solicitar otro código.' }, { status: 429 });
    }

    const code = createCandidateEmailAccessCode();
    await saveCandidateEmailAccessCode({
      email,
      codeHash: hashCandidateEmailAccessCode(email, code),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const nodemailer = require('nodemailer') as {
      createTransport: (options: {
        host: string; port: number; secure: boolean; auth: { user: string; pass: string };
      }) => { sendMail: (options: { from: string; to: string; subject: string; html: string }) => Promise<unknown> };
    };
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });
    await transporter.sendMail({
      from: smtp.from,
      to: email,
      subject: 'Tu código de acceso | Jardines del Renacer',
      html: `<div style="font-family:Arial,sans-serif;color:#24344d;max-width:540px;margin:auto;padding:28px"><p style="color:#3c60a2;font-weight:700;letter-spacing:1.5px;font-size:12px">PORTAL DE POSTULANTES</p><h1 style="font-size:24px">Tu código de acceso</h1><p>Usa este código para ingresar de forma segura a tu portal de postulante:</p><p style="font-size:32px;letter-spacing:8px;font-weight:800;color:#244f91;background:#edf3fc;padding:18px 22px;border-radius:14px;text-align:center">${code}</p><p>El código vence en 10 minutos y solo puede utilizarse una vez.</p><p style="font-size:13px;color:#667085">Si no solicitaste este acceso, puedes ignorar este mensaje.</p></div>`,
    });

    return NextResponse.json({ success: true, message: 'Te enviamos un código temporal. Revisa también la carpeta de spam.' });
  } catch (error) {
    console.error('Error en POST /api/postulantes/acceso-correo/solicitar:', error);
    const detail = error instanceof Error ? error.message.replace(/\s+/g, ' ').slice(0, 180) : '';
    const message = process.env.NODE_ENV === 'production'
      ? 'No fue posible enviar el código. Intenta nuevamente.'
      : `No fue posible enviar el código. Diagnóstico SMTP: ${detail || 'revisa la terminal local.'}`;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
