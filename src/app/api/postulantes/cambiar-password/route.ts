import { NextRequest, NextResponse } from 'next/server';
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  hashCandidatePasswordForDB,
  hashCandidateResetToken,
  verifyCandidatePasswordForDB,
  verifyVacantesCandidateJwt,
} from '@/lib/candidateAuth';
import {
  getCandidateAccountForLogin,
  getCandidateByResetToken,
  updateCandidatePasswordInDB,
} from '@/lib/candidateStorageDB';

export const dynamic = 'force-dynamic';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function readSession(request: NextRequest) {
  const token = request.cookies.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
  return token ? verifyVacantesCandidateJwt(token) : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPassword = asText(body.newPassword);
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'La nueva contrasena debe tener al menos 8 caracteres.' },
        { status: 400 },
      );
    }

    const resetToken = asText(body.resetToken);
    if (resetToken) {
      const tokenHash = await hashCandidateResetToken(resetToken);
      const candidate = await getCandidateByResetToken(tokenHash);
      if (!candidate) {
        return NextResponse.json(
          { success: false, message: 'El token de recuperacion no es valido o expiro.' },
          { status: 401 },
        );
      }

      const passwordHash = await hashCandidatePasswordForDB(newPassword);
      await updateCandidatePasswordInDB({
        documentNumber: candidate.documento,
        email: candidate.email,
        passwordHash,
      });
      return NextResponse.json({ success: true });
    }

    const session = await readSession(request);
    const currentPassword = asText(body.currentPassword);
    if (!session || !currentPassword) {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    const candidate = await getCandidateAccountForLogin({
      documentNumber: session.documentNumber,
      email: session.email,
    });
    const passwordOk = candidate
      ? await verifyCandidatePasswordForDB(currentPassword, candidate.password_hash)
      : false;
    if (!candidate || !passwordOk) {
      return NextResponse.json(
        { success: false, message: 'La contrasena actual no es correcta.' },
        { status: 401 },
      );
    }

    const passwordHash = await hashCandidatePasswordForDB(newPassword);
    await updateCandidatePasswordInDB({
      documentNumber: session.documentNumber,
      email: session.email,
      passwordHash,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error en POST /api/postulantes/cambiar-password:', error);
    return NextResponse.json(
      { success: false, message: 'No se pudo cambiar la contrasena.' },
      { status: 500 },
    );
  }
}
