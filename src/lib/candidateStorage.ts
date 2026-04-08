import {
  APPLICATION_STATUS_OPTIONS,
  CANDIDATE_APPLICATIONS_STORAGE_KEY,
  CANDIDATE_PROFILE_STORAGE_KEY,
  createEmptyCandidateProfile,
  type CandidateProfile,
  type JobApplication,
} from '@/config/candidates';

function normalizeProfile(record: Partial<CandidateProfile>): CandidateProfile {
  return {
    documentNumber: record.documentNumber ?? '',
    fullName: record.fullName ?? '',
    email: record.email ?? '',
    phone: record.phone ?? '',
    department: record.department ?? '',
    city: record.city ?? '',
    professionalTitle: record.professionalTitle ?? '',
    yearsExperience: record.yearsExperience ?? '',
    education: record.education ?? '',
    skills: record.skills ?? '',
    about: record.about ?? '',
    linkedinUrl: record.linkedinUrl ?? '',
    portfolioUrl: record.portfolioUrl ?? '',
    resumeFileName: record.resumeFileName ?? '',
    resumeFileData: record.resumeFileData ?? '',
    updatedAt: record.updatedAt ?? '',
  };
}

function normalizeApplication(record: Partial<JobApplication>): JobApplication | null {
  // Soporte de compatibilidad para datos de versiones anteriores del formulario.
  const legacyRecord = record as Partial<JobApplication> & {
    email?: string;
    phone?: string;
    fullName?: string;
    documentNumber?: string;
    trackingCode?: string;
  };
  const candidateEmail = (record.candidateEmail ?? legacyRecord.email ?? '').trim();
  const candidateDocument = (record.candidateDocument ?? legacyRecord.documentNumber ?? '')
    .toString()
    .replace(/\D/g, '');

  if (
    !record.id ||
    !record.vacancyId ||
    !record.vacancyTitle ||
    !candidateEmail
  ) {
    return null;
  }
  const validStatus = APPLICATION_STATUS_OPTIONS.includes(
    record.status as (typeof APPLICATION_STATUS_OPTIONS)[number],
  )
    ? (record.status as JobApplication['status'])
    : 'Recibida';
  return {
    id: record.id,
    trackingCode:
      (record.trackingCode ?? legacyRecord.trackingCode ?? '')
        .toString()
        .trim()
        .toUpperCase() || `JDR-${record.id.toUpperCase()}`,
    vacancyId: record.vacancyId,
    vacancyTitle: record.vacancyTitle,
    candidateDocument,
    candidateName: record.candidateName ?? legacyRecord.fullName ?? '',
    candidateEmail,
    candidatePhone: record.candidatePhone ?? legacyRecord.phone ?? '',
    resumeFileName: record.resumeFileName ?? '',
    resumeFileData: record.resumeFileData ?? '',
    appliedAt: record.appliedAt ?? new Date().toISOString(),
    status: validStatus,
  };
}

export function readCandidateProfile() {
  if (typeof window === 'undefined') {
    return createEmptyCandidateProfile();
  }
  const raw = window.localStorage.getItem(CANDIDATE_PROFILE_STORAGE_KEY);
  if (!raw) {
    return createEmptyCandidateProfile();
  }
  try {
    return normalizeProfile(JSON.parse(raw) as Partial<CandidateProfile>);
  } catch {
    return createEmptyCandidateProfile();
  }
}

export function writeCandidateProfile(profile: CandidateProfile) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CANDIDATE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  // Disparamos evento para refrescar paneles que estén abiertos en otras vistas.
  window.dispatchEvent(new Event('candidate-storage-updated'));
}

export function readCandidateApplications() {
  if (typeof window === 'undefined') {
    return [] as JobApplication[];
  }
  const raw = window.localStorage.getItem(CANDIDATE_APPLICATIONS_STORAGE_KEY);
  if (!raw) {
    return [] as JobApplication[];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as JobApplication[];
    }
    return parsed
      .map((record) => normalizeApplication(record as Partial<JobApplication>))
      .filter(Boolean) as JobApplication[];
  } catch {
    return [] as JobApplication[];
  }
}

export function writeCandidateApplications(applications: JobApplication[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CANDIDATE_APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
  // Mismo evento para mantener sincronizada la consulta del proceso en vivo.
  window.dispatchEvent(new Event('candidate-storage-updated'));
}
