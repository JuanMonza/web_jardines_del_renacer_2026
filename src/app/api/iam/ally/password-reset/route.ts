import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';

export const runtime = 'nodejs';
const generic = { message: 'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.' };
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email?: string };
    const normalized = String(email || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) return NextResponse.json(generic);
    const rows = await query<{ accountId: number; name: string }>(`SELECT aa.id accountId, a.name FROM ally_accounts aa JOIN aliados a ON a.id=aa.aliado_id WHERE aa.activo=TRUE AND a.active=TRUE AND LOWER(a.email)=? LIMIT 1`, [normalized]);
    if (!rows[0] || !process.env.RESEND_API_KEY) return NextResponse.json(generic);
    const token = randomBytes(32).toString('hex');
    await execute('UPDATE ally_password_resets SET usado_en=NOW() WHERE ally_account_id=? AND usado_en IS NULL', [rows[0].accountId]);
    await execute('INSERT INTO ally_password_resets (ally_account_id, token_hash, expira_en) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))', [rows[0].accountId, hash(token)]);
    const origin = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const url = `${origin}/login/aliado/restablecer?token=${token}`;
    await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Jardines del Renacer <onboarding@resend.dev>', to: [normalized], subject: 'Restablece tu contraseña de aliado', html: `<p>Hola ${rows[0].name},</p><p>Solicitaste restablecer tu contraseña. El enlace vence en 30 minutos:</p><p><a href="${url}">Restablecer contraseña</a></p><p>Si no lo solicitaste, ignora este correo.</p>` }) });
    return NextResponse.json(generic);
  } catch { return NextResponse.json(generic); }
}
