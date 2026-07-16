import { NextRequest, NextResponse } from 'next/server';
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  CANDIDATE_SESSION_MAX_AGE_SECONDS,
  signVacantesCandidateJwt,
} from '@/lib/candidateAuth';
import { findCandidateIdentityFromApplications } from '@/lib/candidateStorageDB';

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

    if (documentNumber.length < 6 || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Documento y correo validos son requeridos.' },
        { status: 400 },
      );
    }

    const candidate = await findCandidateIdentityFromApplications({ documentNumber, email });
    if (!candidate) {
      return NextResponse.json(
        { success: false, message: 'No encontramos postulaciones con ese documento y correo.' },
        { status: 401 },
      );
    }

    const token = await signVacantesCandidateJwt({
      documentNumber: candidate.documentNumber,
      email: candidate.email,
      name: candidate.name,
      role: 'vacantes_usuario',
    });

    const response = NextResponse.json({
      success: true,
      data: {
        documentNumber: candidate.documentNumber,
        email: candidate.email,
        name: candidate.name,
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
