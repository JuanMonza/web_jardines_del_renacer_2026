import { NextRequest, NextResponse } from 'next/server';
import { CANDIDATE_SESSION_COOKIE_NAME, verifyVacantesCandidateJwt } from '@/lib/candidateAuth';
import {
  createApplicationInDB,
  getCandidateProfileFromDB,
  getApplicationsByCandidateFromDB,
} from '@/lib/candidateStorageDB';
import type { JobApplication } from '@/config/candidates';

export const dynamic = 'force-dynamic';

function asText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
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

  const applications = await getApplicationsByCandidateFromDB(
    session.documentNumber,
    session.email,
  );

  return NextResponse.json({ success: true, data: applications });
}

export async function POST(request: NextRequest) {
  try {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    const body = await request.json();
    const vacancyId = asText(body.vacancyId);
    const vacancyTitle = asText(body.vacancyTitle);
    const resumeFileName = asText(body.resumeFileName);
    const resumeFileData = asText(body.resumeFileData);
    const profile = await getCandidateProfileFromDB({ documentNumber: session.documentNumber, email: session.email });
    const candidateDocument = session.documentNumber;
    const candidateName = profile?.fullName || session.name;
    const candidateEmail = session.email;
    const candidatePhone = profile?.phone ?? '';
    const candidateCity = profile?.city ?? '';
    const candidateDepartment = profile?.department ?? '';

    if (!vacancyId || !vacancyTitle || !candidateName) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos obligatorios para la postulacion.' },
        { status: 400 },
      );
    }

    const existingApplications = await getApplicationsByCandidateFromDB(
      candidateDocument,
      candidateEmail,
    );
    const alreadyApplied = existingApplications.some(
      (application) => application.vacancyId === vacancyId,
    );
    if (alreadyApplied) {
      return NextResponse.json(
        { success: false, message: 'Ya existe una postulacion para esta vacante.' },
        { status: 409 },
      );
    }

    const id = await createApplicationInDB({
      candidateId: session.candidateId,
      vacancyId,
      vacancyTitle,
      candidateDocument,
      candidateName,
      candidateEmail,
      candidatePhone,
      candidateCity,
      candidateDepartment,
      resumeFileName,
      resumeFileData,
    });

    const application: JobApplication = {
      id,
      trackingCode: `JDR-${id.toUpperCase().slice(0, 8)}`,
      vacancyId,
      vacancyTitle,
      candidateDocument,
      candidateName,
      candidateEmail,
      candidatePhone,
      resumeFileName,
      resumeFileData: '',
      appliedAt: new Date().toISOString(),
      status: 'Recibida',
    };

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/postulantes/mis-postulaciones:', error);
    return NextResponse.json(
      { success: false, message: 'No se pudo registrar la postulacion.' },
      { status: 500 },
    );
  }
}
