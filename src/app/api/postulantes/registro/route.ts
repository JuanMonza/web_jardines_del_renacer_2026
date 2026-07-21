import { NextRequest, NextResponse } from 'next/server';
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  CANDIDATE_SESSION_MAX_AGE_SECONDS,
  hashCandidatePasswordForDB,
  signVacantesCandidateJwt,
} from '@/lib/candidateAuth';
import {
  createCandidateAccountInDB,
  getCandidateAccountByDocumentOrEmail,
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
    const firstName = asText(body.firstName || body.name || body.fullName);
    const lastName = asText(body.lastName);
    const email = asText(body.email).toLowerCase();
    const phone = asText(body.phone);
    const password = asText(body.password);

    if (documentNumber.length < 6 || !firstName || !email.includes('@') || password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Documento, nombre, correo y contrasena son obligatorios.' },
        { status: 400 },
      );
    }

    const existing = await getCandidateAccountByDocumentOrEmail({ documentNumber, email });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Ya existe una cuenta con ese documento o correo.' },
        { status: 409 },
      );
    }

    const passwordHash = await hashCandidatePasswordForDB(password);
    const candidateId = await createCandidateAccountInDB({
      documentNumber,
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      city: asText(body.city),
      department: asText(body.department),
      professionalTitle: asText(body.professionalTitle),
      yearsExperience: asText(body.yearsExperience),
      education: asText(body.education),
      linkedinUrl: asText(body.linkedinUrl),
      portfolioUrl: asText(body.portfolioUrl),
      cvUrl: asText(body.cvUrl),
    });

    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const token = await signVacantesCandidateJwt({
      candidateId,
      documentNumber,
      email,
      name: fullName || 'Postulante',
      role: 'vacantes_usuario',
    });

    const response = NextResponse.json({
      success: true,
      data: { candidateId, documentNumber, email, name: fullName },
    }, { status: 201 });

    response.cookies.set(CANDIDATE_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: CANDIDATE_SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Error en POST /api/postulantes/registro:', error);
    return NextResponse.json(
      { success: false, message: 'No se pudo crear la cuenta del postulante.' },
      { status: 500 },
    );
  }
}
