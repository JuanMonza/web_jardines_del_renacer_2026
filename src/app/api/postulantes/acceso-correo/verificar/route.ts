import { NextRequest, NextResponse } from 'next/server';
import {
  hashCandidateEmailAccessCode,
  isCandidateEmailAccessCodeValid,
} from '@/lib/candidateEmailAccess';
import {
  consumeCandidateEmailAccessCode,
  getCandidateAccountForLogin,
  getCandidateEmailAccessCode,
  registerFailedCandidateEmailAccessCodeAttempt,
  updateCandidateLastLogin,
} from '@/lib/candidateStorageDB';
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  CANDIDATE_SESSION_MAX_AGE_SECONDS,
  signVacantesCandidateJwt,
} from '@/lib/candidateAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = asText(body.email).toLowerCase();
    const code = asText(body.code).replace(/\D/g, '');
    if (!email.includes('@') || code.length !== 6) {
      return NextResponse.json({ success: false, message: 'Ingresa el correo y el código de 6 dígitos.' }, { status: 400 });
    }

    const storedCode = await getCandidateEmailAccessCode(email);
    if (!storedCode || storedCode.attempts >= 5) {
      return NextResponse.json({ success: false, message: 'El código venció o ya no es válido. Solicita uno nuevo.' }, { status: 401 });
    }
    if (!isCandidateEmailAccessCodeValid(storedCode.code_hash, hashCandidateEmailAccessCode(email, code))) {
      await registerFailedCandidateEmailAccessCodeAttempt(storedCode.id);
      return NextResponse.json({ success: false, message: 'El código no es correcto. Intenta nuevamente.' }, { status: 401 });
    }
    if (!(await consumeCandidateEmailAccessCode(storedCode.id))) {
      return NextResponse.json({ success: false, message: 'El código ya fue utilizado. Solicita uno nuevo.' }, { status: 401 });
    }

    const candidate = await getCandidateAccountForLogin({ email });
    if (!candidate) return NextResponse.json({ success: false, message: 'No encontramos una cuenta activa con ese correo.' }, { status: 401 });
    await updateCandidateLastLogin(candidate.documento);
    const name = [candidate.nombre, candidate.apellido ?? ''].filter(Boolean).join(' ') || 'Postulante';
    const token = await signVacantesCandidateJwt({ candidateId: candidate.id, documentNumber: candidate.documento, email: candidate.email, name, role: 'vacantes_usuario' });
    const response = NextResponse.json({ success: true, data: { email: candidate.email, name } });
    response.cookies.set(CANDIDATE_SESSION_COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: CANDIDATE_SESSION_MAX_AGE_SECONDS });
    return response;
  } catch (error) {
    console.error('Error en POST /api/postulantes/acceso-correo/verificar:', error);
    return NextResponse.json({ success: false, message: 'No fue posible validar el código.' }, { status: 500 });
  }
}

