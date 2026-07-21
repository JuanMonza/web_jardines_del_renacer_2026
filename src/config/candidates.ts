export interface CandidateProfile {
  documentNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  passwordHash: string;
  passwordUpdatedAt: string;
  phone: string;
  photoUrl: string;
  birthDate: string;
  address: string;
  department: string;
  city: string;
  professionalTitle: string;
  yearsExperience: string;
  education: string;
  skills: string;
  about: string;
  linkedinUrl: string;
  portfolioUrl: string;
  cvUrl: string;
  resumeFileName: string;
  resumeFileData: string;
  active: boolean;
  lastLoginAt: string;
  updatedAt: string;
}

export interface CandidateAccount {
  id: string;
  documentNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  birthDate: string;
  address: string;
  city: string;
  department: string;
  professionalTitle: string;
  yearsExperience: string;
  education: string;
  skills: string;
  about: string;
  linkedinUrl: string;
  portfolioUrl: string;
  cvUrl: string;
  active: boolean;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | 'Recibida'
  | 'En revision'
  | 'Entrevista'
  | 'Prueba tecnica'
  | 'Seleccionado'
  | 'No continua';

export const APPLICATION_STATUS_OPTIONS: ApplicationStatus[] = [
  'Recibida',
  'En revision',
  'Entrevista',
  'Prueba tecnica',
  'Seleccionado',
  'No continua',
];

export interface JobApplication {
  id: string;
  trackingCode: string;
  vacancyId: string;
  vacancyTitle: string;
  candidateDocument: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  resumeFileName: string;
  resumeFileData: string;
  appliedAt: string;
  status: ApplicationStatus;
}

export const CANDIDATE_PROFILE_STORAGE_KEY = 'jdr.candidate.profile.v1';
export const CANDIDATE_APPLICATIONS_STORAGE_KEY = 'jdr.candidate.applications.v1';

export function createEmptyCandidateProfile(): CandidateProfile {
  return {
    documentNumber: '',
    firstName: '',
    lastName: '',
    fullName: '',
    email: '',
    passwordHash: '',
    passwordUpdatedAt: '',
    phone: '',
    photoUrl: '',
    birthDate: '',
    address: '',
    department: '',
    city: '',
    professionalTitle: '',
    yearsExperience: '',
    education: '',
    skills: '',
    about: '',
    linkedinUrl: '',
    portfolioUrl: '',
    cvUrl: '',
    resumeFileName: '',
    resumeFileData: '',
    active: true,
    lastLoginAt: '',
    updatedAt: '',
  };
}
