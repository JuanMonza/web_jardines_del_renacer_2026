import { NextRequest, NextResponse } from 'next/server';
import { hashCandidateResetToken } from '@/lib/candidateAuth';
import { setCandidatePasswordResetToken } from '@/lib/candidateStorageDB';

export const dynamic = 'force-dynamic';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
}

function createResetToken() {
  return crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentNumber = normalizeDocumentNumber(asText(body.documentNumber));
    const email = asText(body.email).toLowerCase();

    if (documentNumber.length < 6 || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Documento y correo validos son requeridos.' },
        { status: 400 },
      );
    }

    const token = createResetToken();
    const tokenHash = await hashCandidateResetToken(token);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await setCandidatePasswordResetToken({ documentNumber, email, tokenHash, expiresAt });

    return NextResponse.json({
      success: true,
      message: 'Si la cuenta existe, se genero una solicitud de recuperacion.',
      data: process.env.NODE_ENV === 'production' ? undefined : { resetToken: token },
    });
  } catch (error) {
    console.error('Error en POST /api/postulantes/recuperar-password:', error);
    return NextResponse.json(
      { success: false, message: 'No se pudo generar la recuperacion.' },
      { status: 500 },
    );
  }
}
