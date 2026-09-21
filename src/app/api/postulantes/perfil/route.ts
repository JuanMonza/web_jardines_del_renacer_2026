import { trainingCookiePath } from '@/lib/training-environment';
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

const PROFILE_BODY_LIMIT = 32_768;

async function readBoundedBody(request: NextRequest) {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > PROFILE_BODY_LIMIT) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

const TEXT_FIELDS: Array<{ key: keyof CandidateProfile; label: string; max: number; multiline?: boolean }> = [
  { key: 'fullName', label: 'Nombre completo', max: 240 },
  { key: 'firstName', label: 'Nombres', max: 120 },
  { key: 'lastName', label: 'Apellidos', max: 120 },
  { key: 'phone', label: 'Teléfono', max: 30 },
  { key: 'birthDate', label: 'Fecha de nacimiento', max: 10 },
  { key: 'address', label: 'Dirección', max: 250 },
  { key: 'department', label: 'Departamento', max: 120 },
  { key: 'city', label: 'Ciudad', max: 120 },
  { key: 'professionalTitle', label: 'Título o profesión', max: 120 },
  { key: 'yearsExperience', label: 'Años de experiencia', max: 30 },
  { key: 'education', label: 'Nivel académico', max: 120 },
  { key: 'skills', label: 'Habilidades', max: 500, multiline: true },
  { key: 'about', label: 'Perfil profesional', max: 2000, multiline: true },
  { key: 'linkedinUrl', label: 'LinkedIn', max: 255 },
];

function invalidCharacters(value: string, multiline = false) {
  if (value.includes('<') || value.includes('>')) return true;
  return [...value].some(character => {
    const code = character.charCodeAt(0);
    return (code < 32 && (!multiline || ![9, 10, 13].includes(code))) || code === 127;
  });
}

function validWebUrl(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname);
  } catch {
    return false;
  }
}

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
    const statedSize = Number(request.headers.get('content-length') || 0);
    if (statedSize > PROFILE_BODY_LIMIT) {
      return NextResponse.json({ success: false, message: 'El perfil supera el tamaño permitido.' }, { status: 413 });
    }
    const raw = await readBoundedBody(request);
    if (raw === null) {
      return NextResponse.json({ success: false, message: 'El perfil supera el tamaño permitido.' }, { status: 413 });
    }
    let profile: Partial<CandidateProfile>;
    try {
      profile = JSON.parse(raw) as Partial<CandidateProfile>;
    } catch {
      return NextResponse.json({ success: false, message: 'El perfil enviado no es válido.' }, { status: 400 });
    }
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      return NextResponse.json({ success: false, message: 'El perfil enviado no es válido.' }, { status: 422 });
    }
    for (const field of TEXT_FIELDS) {
      const value = profile[field.key];
      if (value === undefined) continue;
      if (typeof value !== 'string' || value.length > field.max || invalidCharacters(value, field.multiline)) {
        return NextResponse.json({ success: false, message: `${field.label} contiene caracteres no permitidos o supera ${field.max} caracteres.` }, { status: 422 });
      }
    }
    if (profile.fullName) {
      const parts = profile.fullName.trim().split(/\s+/);
      const givenNames = parts.slice(0, -1).join(' ');
      if (givenNames.length > 120 || parts[parts.length - 1].length > 120) {
        return NextResponse.json({ success: false, message: 'Los nombres o apellidos superan 120 caracteres.' }, { status: 422 });
      }
    }
    if (profile.hasDriversLicense !== undefined && typeof profile.hasDriversLicense !== 'boolean') {
      return NextResponse.json({ success: false, message: 'El dato de licencia no es válido.' }, { status: 422 });
    }
    if (!validWebUrl(profile.linkedinUrl?.trim() || '')) {
      return NextResponse.json({ success: false, message: 'El enlace de LinkedIn debe comenzar por https:// o http://.' }, { status: 422 });
    }
    if (profile.birthDate) {
      const date = new Date(`${profile.birthDate}T12:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.birthDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== profile.birthDate || date > new Date()) {
        return NextResponse.json({ success: false, message: 'La fecha de nacimiento no es válida.' }, { status: 422 });
      }
    }
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
        path: trainingCookiePath(),
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
