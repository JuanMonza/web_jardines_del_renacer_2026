import { NextRequest, NextResponse } from 'next/server';
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  CANDIDATE_SESSION_MAX_AGE_SECONDS,
  signVacantesCandidateJwt,
  verifyVacantesCandidateJwt,
} from '@/lib/candidateAuth';
import {
  getCandidateProfileFromDB,
  updateCandidateProfileInDB,
} from '@/lib/candidateStorageDB';
import type { CandidateProfile } from '@/config/candidates';
import { ACADEMIC_LEVEL_OPTIONS } from '@/config/candidates';

export const dynamic = 'force-dynamic';

async function readSession(request: NextRequest) {
  const token = request.cookies.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
  return token ? verifyVacantesCandidateJwt(token) : null;
}

export async function GET(request: NextRequest) {
  const session = await readSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
  }

  const profile = await getCandidateProfileFromDB({
    documentNumber: session.documentNumber,
    email: session.email,
  });

  if (!profile) {
    return NextResponse.json(
      { success: false, message: 'No encontramos el perfil del postulante.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ success: true, data: profile });
}

export async function PUT(request: NextRequest) {
  const session = await readSession(request);
  if (!session) {
    return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
  }

  try {
    const profile = (await request.json()) as Partial<CandidateProfile>;
    const education = typeof profile.education === 'string' ? profile.education.trim() : '';
    const professionalTitle = typeof profile.professionalTitle === 'string' ? profile.professionalTitle.trim() : '';
    const currentProfile = await getCandidateProfileFromDB({ documentNumber: session.documentNumber, email: session.email });
    if (education && !(ACADEMIC_LEVEL_OPTIONS as readonly string[]).includes(education) && education !== currentProfile?.education) {
      return NextResponse.json({ success: false, message: 'Selecciona un nivel académico válido.' }, { status: 422 });
    }
    if ((ACADEMIC_LEVEL_OPTIONS as readonly string[]).includes(education) && !professionalTitle) {
      return NextResponse.json({ success: false, message: 'Escribe el nombre del título o profesión.' }, { status: 422 });
    }
    if (professionalTitle.length > 120) {
      return NextResponse.json({ success: false, message: 'El nombre del título o profesión es demasiado largo.' }, { status: 422 });
    }
    await updateCandidateProfileInDB({
      documentNumber: session.documentNumber,
      email: session.email,
      profile,
    });

    const updatedProfile = await getCandidateProfileFromDB({
      documentNumber: session.documentNumber,
      email: session.email,
    });

    const response = NextResponse.json({ success: true, data: updatedProfile });
    if (updatedProfile?.fullName) {
      const token = await signVacantesCandidateJwt({
        candidateId: session.candidateId,
        documentNumber: session.documentNumber,
        email: session.email,
        name: updatedProfile.fullName,
        role: 'vacantes_usuario',
      });
      response.cookies.set(CANDIDATE_SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: CANDIDATE_SESSION_MAX_AGE_SECONDS,
      });
    }

    return response;
  } catch (error) {
    console.error('Error en PUT /api/postulantes/perfil:', error);
    return NextResponse.json(
      { success: false, message: 'No se pudo actualizar el perfil.' },
      { status: 500 },
    );
  }
}
