import {
  APPLICATION_STATUS_OPTIONS,
  CANDIDATE_APPLICATIONS_STORAGE_KEY,
  CANDIDATE_PROFILE_STORAGE_KEY,
  createEmptyCandidateProfile,
  type CandidateProfile,
  type JobApplication,
} from '@/config/candidates'
import { query, execute } from './db';

type DbApplicationRow = {
  id: string;
  vacancy_id: string;
  vacancy_title: string | null;
  candidate_document: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  city?: string | null;
  department?: string | null;
  resume_filename: string | null;
  resume_filedata?: Buffer | Uint8Array | null;
  applied_at: string | Date;
  status: string;
};

type VacancyApplicationCountRow = {
  vacancy_id: string;
  count: number | string;
};

type CreateApplicationInput = Omit<JobApplication, 'id' | 'trackingCode' | 'appliedAt' | 'status'> & {
  candidateCity?: string;
  candidateDepartment?: string;
};

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return '';
  }
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function createUuid() {
  return globalThis.crypto?.randomUUID?.() ?? `app-${Date.now().toString(36)}`;
}

function decodeBase64File(value: string) {
  if (!value) {
    return null;
  }
  const payload = value.includes(',') ? value.split(',')[1] : value;
  return payload ? Buffer.from(payload, 'base64') : null;
}

/**
 * Normaliza los datos de un perfil de candidato para asegurar que tiene
 * todos los campos requeridos en la interfaz `CandidateProfile`.
 * 
 * @param record - Objeto parcial almacenado que puede tener datos faltantes.
 * @returns El perfil completo y estandarizado con los campos por defecto.
 */
function normalizeProfile(record: Partial<CandidateProfile>): CandidateProfile {
  return {
    documentNumber: record.documentNumber ?? '',
    fullName: record.fullName ?? '',
    email: record.email ?? '',
    passwordHash: record.passwordHash ?? '',
    passwordUpdatedAt: record.passwordUpdatedAt ?? '',
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

/**
 * Normaliza los datos de una postulación individual para asegurar consistencia.
 * También proporciona soporte a datos generados en versiones anteriores de la plataforma.
 * 
 * @param record - Objeto parcial con la postulación guardada en el navegador.
 * @returns Un objeto `JobApplication` válido o `null` si faltan campos obligatorios críticos.
 */
function normalizeApplication(record: Partial<JobApplication>): JobApplication | null {
  // Soporte de compatibilidad (Legacy) para datos de versiones anteriores del formulario.
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

/**
 * Lee y recupera el perfil del candidato guardado en el navegador (Local Storage).
 * Si no existe o hay error de formato, devuelve un perfil completamente vacío.
 * 
 * @returns El objeto de perfil del candidato activo.
 */
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

/**
 * Guarda el perfil del candidato directamente en el Local Storage del navegador
 * y emite un evento custom ('candidate-storage-updated') para que el resto de
 * la aplicación (como los paneles en otras pestañas) sepa que debe refrescar los datos.
 * 
 * @param profile - El objeto `CandidateProfile` que se desea guardar.
 */
export function writeCandidateProfile(profile: CandidateProfile) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CANDIDATE_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event('candidate-storage-updated'));
}

/**
 * Lee el arreglo de postulaciones a vacantes (historial) del candidato activo
 * y las normaliza para evitar errores en las vistas de listados.
 * 
 * @returns Una lista tipada `JobApplication[]`. Si no hay datos devuelve `[]`.
 */
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

/**
 * Guarda todo el historial de postulaciones de un candidato en el Storage
 * y notifica al resto del frontend que hubo cambios en las aplicaciones.
 * 
 * @param applications - Arreglo de objetos `JobApplication` que reemplazará al actual.
 */
export function writeCandidateApplications(applications: JobApplication[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(CANDIDATE_APPLICATIONS_STORAGE_KEY, JSON.stringify(applications));
  window.dispatchEvent(new Event('candidate-storage-updated'));
}

/**
 * Mapea una fila de la tabla `postulaciones` a la interfaz `JobApplication`.
 * @param dbApplication - El objeto de postulación desde la base de datos.
 * @returns Un objeto `JobApplication` normalizado o `null`.
 */
function mapDbApplicationToJobApplication(dbApplication: DbApplicationRow): JobApplication | null {
  if (!dbApplication || !dbApplication.id) {
    return null;
  }

  const status = APPLICATION_STATUS_OPTIONS.includes(
    dbApplication.status as JobApplication['status'],
  )
    ? (dbApplication.status as JobApplication['status'])
    : 'Recibida';

  // La hoja de vida se almacena como BLOB, no la devolvemos en listados.
  return {
    id: dbApplication.id,
    trackingCode: `JDR-${dbApplication.id.toUpperCase().slice(0, 8)}`,
    vacancyId: dbApplication.vacancy_id,
    vacancyTitle: dbApplication.vacancy_title ?? 'Vacante sin titulo',
    candidateDocument: dbApplication.candidate_document,
    candidateName: dbApplication.candidate_name,
    candidateEmail: dbApplication.candidate_email,
    candidatePhone: dbApplication.candidate_phone ?? '',
    resumeFileName: dbApplication.resume_filename ?? '',
    resumeFileData: '', // No se devuelve el binario en las listas
    appliedAt: toIsoString(dbApplication.applied_at) || new Date().toISOString(),
    status,
  };
}

/**
 * Crea una nueva postulación en la base de datos.
 * @param applicationData - Datos de la postulación, incluyendo el archivo de la HV en Base64.
 * @returns El ID de la nueva postulación.
 */
export async function createApplicationInDB(
  applicationData: CreateApplicationInput,
) {
  const {
    vacancyId,
    candidateDocument,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateCity,
    candidateDepartment,
    resumeFileName,
    resumeFileData, // Se espera en formato Base64
  } = applicationData;

  // Convertir la hoja de vida de Base64 a Buffer para almacenarla como BLOB.
  const resumeBuffer = decodeBase64File(resumeFileData);
  const id = createUuid();

  const sql = `
    INSERT INTO postulaciones (
      id,
      vacancy_id,
      candidate_document,
      candidate_name,
      candidate_email,
      candidate_phone,
      city,
      department,
      resume_filename,
      resume_filedata,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Recibida')
  `;

  const params = [
    id,
    vacancyId,
    normalizeDocumentNumber(candidateDocument),
    candidateName.trim(),
    normalizeEmail(candidateEmail),
    candidatePhone.trim(),
    candidateCity?.trim() ?? '',
    candidateDepartment?.trim() ?? '',
    resumeFileName,
    resumeBuffer,
  ];

  await execute(sql, params);
  return id;
}

/**
 * Obtiene todas las postulaciones de un candidato por su número de documento.
 * @param document - El número de documento del candidato.
 * @returns Una promesa que se resuelve en un array de `JobApplication`.
 */
export async function getApplicationsByCandidateFromDB(
  document: string,
  email?: string,
): Promise<JobApplication[]> {
  try {
    const params: string[] = [normalizeDocumentNumber(document)];
    const emailCondition = email ? 'AND LOWER(p.candidate_email) = ?' : '';
    if (email) {
      params.push(normalizeEmail(email));
    }

    // Hacemos un JOIN para obtener el título de la vacante.
    const sql = `
      SELECT p.*, v.title as vacancy_title
      FROM postulaciones p
      LEFT JOIN vacantes v ON p.vacancy_id = v.id
      WHERE p.candidate_document = ?
      ${emailCondition}
      ORDER BY p.applied_at DESC
    `;
    const rows = await query<DbApplicationRow>(sql, params);
    return rows
      .map(mapDbApplicationToJobApplication)
      .filter(Boolean) as JobApplication[];
  } catch (error) {
    console.error('Error al leer las postulaciones del candidato:', error);
    return [];
  }
}

export async function findCandidateIdentityFromApplications(input: {
  documentNumber: string;
  email: string;
}) {
  try {
    const sql = `
      SELECT p.*
      FROM postulaciones p
      WHERE p.candidate_document = ?
        AND LOWER(p.candidate_email) = ?
      ORDER BY p.applied_at DESC
      LIMIT 1
    `;
    const rows = await query<DbApplicationRow>(sql, [
      normalizeDocumentNumber(input.documentNumber),
      normalizeEmail(input.email),
    ]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      documentNumber: row.candidate_document,
      email: normalizeEmail(row.candidate_email),
      name: row.candidate_name || 'Postulante',
      phone: row.candidate_phone ?? '',
      city: row.city ?? '',
      department: row.department ?? '',
    };
  } catch (error) {
    console.error('Error al validar identidad de postulante:', error);
    return null;
  }
}

export async function getCandidateProfileFromApplications(input: {
  documentNumber: string;
  email: string;
}): Promise<CandidateProfile | null> {
  try {
    const sql = `
      SELECT p.*
      FROM postulaciones p
      WHERE p.candidate_document = ?
        AND LOWER(p.candidate_email) = ?
      ORDER BY p.applied_at DESC
      LIMIT 1
    `;
    const rows = await query<DbApplicationRow>(sql, [
      normalizeDocumentNumber(input.documentNumber),
      normalizeEmail(input.email),
    ]);

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      ...createEmptyCandidateProfile(),
      documentNumber: row.candidate_document,
      fullName: row.candidate_name || '',
      email: normalizeEmail(row.candidate_email),
      phone: row.candidate_phone ?? '',
      city: row.city ?? '',
      department: row.department ?? '',
      resumeFileName: row.resume_filename ?? '',
      updatedAt: toIsoString(row.applied_at),
    };
  } catch (error) {
    console.error('Error al leer perfil desde postulaciones:', error);
    return null;
  }
}

export async function updateCandidateProfileInApplications(input: {
  documentNumber: string;
  email: string;
  profile: Partial<CandidateProfile>;
}) {
  const documentNumber = normalizeDocumentNumber(input.documentNumber);
  const email = normalizeEmail(input.email);
  const fullName = input.profile.fullName?.trim() ?? '';
  const phone = input.profile.phone?.trim() ?? '';
  const department = input.profile.department?.trim() ?? '';
  const city = input.profile.city?.trim() ?? '';

  const sql = `
    UPDATE postulaciones
    SET candidate_name = ?,
        candidate_phone = ?,
        department = ?,
        city = ?
    WHERE candidate_document = ?
      AND LOWER(candidate_email) = ?
  `;

  const result = await execute(sql, [
    fullName,
    phone,
    department,
    city,
    documentNumber,
    email,
  ]);

  return result.affectedRows;
}

/**
 * Obtiene una postulación específica por su ID, incluyendo el archivo de la HV.
 * @param id - El UUID de la postulación.
 * @returns Una promesa que se resuelve en un objeto `JobApplication` o `null`.
 */
export async function getApplicationByIdFromDB(id: string): Promise<JobApplication | null> {
  try {
    const sql = `
      SELECT p.*, v.title as vacancy_title
      FROM postulaciones p
      LEFT JOIN vacantes v ON p.vacancy_id = v.id
      WHERE p.id = ?
    `;
    const rows = await query<DbApplicationRow>(sql, [id]);
    if (rows.length === 0) {
      return null;
    }
    const application = mapDbApplicationToJobApplication(rows[0]);
    if (application && rows[0].resume_filedata) {
      application.resumeFileData = Buffer.from(rows[0].resume_filedata).toString('base64');
    }
    return application;
  } catch (error) {
    console.error(`Error al leer la postulación con ID ${id}:`, error);
    return null;
  }
}

/**
 * Obtiene el número de postulaciones para cada vacante.
 * @returns Un objeto donde la clave es el ID de la vacante y el valor es el número de postulaciones.
 */
export async function getVacancyApplicationCounts(): Promise<Record<string, number>> {
  try {
    const sql = `
      SELECT vacancy_id, COUNT(id) as count
      FROM postulaciones
      GROUP BY vacancy_id
    `;
    const rows = await query<VacancyApplicationCountRow>(sql, []);
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.vacancy_id] = Number(row.count);
    }
    return counts;
  } catch (error) {
    console.error('Error al contar las postulaciones por vacante:', error);
    return {};
  }
}

