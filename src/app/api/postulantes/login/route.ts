import { NextRequest, NextResponse } from 'next/server';
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  CANDIDATE_SESSION_MAX_AGE_SECONDS,
  signVacantesCandidateJwt,
  verifyCandidatePasswordForDB,
} from '@/lib/candidateAuth';
import {
  getCandidateAccountForLogin,
  updateCandidateLastLogin,
} from '@/lib/candidateStorageDB';

export const dynamic = 'force-dynamic';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const documentNumber = normalizeDocumentNumber(asText(body.documentNumber));
    const email = asText(body.email).toLowerCase();
    const password = asText(body.password);

    if (documentNumber.length < 6 || !email.includes('@') || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Documento, correo y contrasena validos son requeridos.' },
        { status: 400 },
      );
    }

    const candidate = await getCandidateAccountForLogin({ documentNumber, email });
    const passwordOk = candidate
      ? await verifyCandidatePasswordForDB(password, candidate.password_hash)
      : false;

    if (!candidate || !passwordOk) {
      return NextResponse.json(
        { success: false, message: 'Documento, correo o contrasena incorrectos.' },
        { status: 401 },
      );
    }

    await updateCandidateLastLogin(candidate.documento);
    const fullName = [candidate.nombre, candidate.apellido ?? ''].filter(Boolean).join(' ');
    const token = await signVacantesCandidateJwt({
      candidateId: candidate.id,
      documentNumber: candidate.documento,
      email: candidate.email,
      name: fullName || 'Postulante',
      role: 'vacantes_usuario',
    });

    const response = NextResponse.json({
      success: true,
      data: {
        candidateId: candidate.id,
        documentNumber: candidate.documento,
        email: candidate.email,
        name: fullName || 'Postulante',
      },
    });

    response.cookies.set(CANDIDATE_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: CANDIDATE_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Error en POST /api/postulantes/login:', error);
    return NextResponse.json(
      { success: false, message: 'No se pudo iniciar sesion.' },
      { status: 500 },
    );
  }
}
