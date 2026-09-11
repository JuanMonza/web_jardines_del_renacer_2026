import {
  APPLICATION_STATUS_OPTIONS,
  CANDIDATE_APPLICATIONS_STORAGE_KEY,
  CANDIDATE_PROFILE_STORAGE_KEY,
  type CandidateAccount,
  createEmptyCandidateProfile,
  type CandidateProfile,
  type JobApplication,
} from "@/config/candidates";
import mysql from "mysql2/promise";
import db, { query, execute } from "./db";
import { recordHiring } from "@/lib/hiring-history";
import { ensureSelectionSchema } from "@/lib/selection-followup";
import { ensureHistoricalCandidateSchema } from "@/lib/historical-candidate-records";

type DbApplicationRow = {
  id: string;
  candidato_id?: string | null;
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
  documento?: string;
  created_at?: string | Date | null;
  estado?: string;
  observaciones_rh?: string | null;
  vacante_id?: string | number;
};

type VacancyApplicationCountRow = {
  vacante_id: string;
  count: number | string;
};

type CandidateAccountRow = {
  id: string;
  documento: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  password_hash: string;
  foto: string | null;
  fecha_nacimiento: string | Date | null;
  direccion: string | null;
  ciudad: string | null;
  departamento: string | null;
  profesion: string | null;
  experiencia: string | null;
  educacion: string | null;
  linkedin: string | null;
  portfolio: string | null;
  tiene_licencia_conduccion?: number | boolean | null;
  cv_url: string | null;
  activo: number | boolean;
  ultimo_login: string | Date | null;
  reset_token_hash: string | null;
  reset_expires_at: string | Date | null;
  deleted_at: string | Date | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type CandidateEmailAccessCodeRow = {
  id: number;
  email: string;
  code_hash: string;
  attempts: number;
};

type CreateApplicationInput = Omit<
  JobApplication,
  "id" | "trackingCode" | "appliedAt" | "status"
> & {
  candidateId?: string;
  candidateCity?: string;
  candidateDepartment?: string;
  candidateProfessionalTitle?: string;
  candidateEducation?: string;
  applicationSource?: "Portal Web" | "Manual";
  resumeUrl?: string;
};

export type CandidateRegistrationInput = {
  documentNumber: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  passwordHash: string;
  city?: string;
  department?: string;
  professionalTitle?: string;
  yearsExperience?: string;
  education?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  cvUrl?: string;
};

function toIsoString(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

let candidateLicenseSchemaPromise: Promise<void> | null = null;
let applicationSnapshotSchemaPromise: Promise<void> | null = null;

export async function ensureApplicationSnapshotSchema() {
  if (!applicationSnapshotSchemaPromise) {
    applicationSnapshotSchemaPromise = (async () => {
      const columns = await query<{ Field: string }>("SHOW COLUMNS FROM postulaciones LIKE 'application_snapshot'");
      if (!columns.length) await execute("ALTER TABLE postulaciones ADD COLUMN application_snapshot JSON NULL AFTER cv_url");
      await execute(`UPDATE postulaciones p
        LEFT JOIN candidatos c ON c.id=p.candidato_id
        LEFT JOIN vacantes v ON v.id=p.vacante_id
        SET p.application_snapshot=JSON_OBJECT(
          'candidateDocument',COALESCE(c.documento,''),'candidateName',TRIM(CONCAT(COALESCE(c.nombres,''),' ',COALESCE(c.apellidos,''))),
          'candidateEmail',COALESCE(c.email,''),'candidatePhone',COALESCE(c.telefono,''),'candidateCity',COALESCE(c.ciudad,''),
          'candidateDepartment',COALESCE(c.departamento,''),'professionalTitle',COALESCE(c.profesion,''),'education',COALESCE(c.educacion,''),
          'vacancyTitle',COALESCE(v.titulo,''),'source',COALESCE(p.fuente,''),'capturedAt',DATE_FORMAT(COALESCE(p.created_at,NOW()),'%Y-%m-%dT%H:%i:%s')
        ) WHERE p.application_snapshot IS NULL`);
    })().catch(error => { applicationSnapshotSchemaPromise = null; throw error; });
  }
  return applicationSnapshotSchemaPromise;
}

/** Mantiene compatible la base de datos ya instalada al incorporar este dato de perfil. */
export async function ensureCandidateLicenseColumn() {
  if (!candidateLicenseSchemaPromise) {
    candidateLicenseSchemaPromise = (async () => {
      const columns = await query<{ Field: string }>("SHOW COLUMNS FROM candidatos LIKE 'tiene_licencia_conduccion'");
      if (!columns.length) {
        await execute("ALTER TABLE candidatos ADD COLUMN tiene_licencia_conduccion BOOLEAN NOT NULL DEFAULT FALSE AFTER portfolio");
      }
    })().catch((error) => {
      candidateLicenseSchemaPromise = null;
      throw error;
    });
  }
  return candidateLicenseSchemaPromise;
}

function createUuid() {
  return globalThis.crypto?.randomUUID?.() ?? `app-${Date.now().toString(36)}`;
}

function decodeBase64File(value: string) {
  if (!value) {
    return null;
  }
  const payload = value.includes(",") ? value.split(",")[1] : value;
  return payload ? Buffer.from(payload, "base64") : null;
}

function buildFullName(firstName: string, lastName?: string | null) {
  return [firstName, lastName ?? ""]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }
  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

const CANDIDATE_ACCOUNT_COLUMNS = `
  id, documento, nombres AS nombre, apellidos AS apellido, email, telefono,
  password_hash, foto_url AS foto, fecha_nacimiento, direccion, ciudad,
  departamento, profesion, experiencia, educacion, linkedin, portfolio, tiene_licencia_conduccion, cv_url,
  activo, ultimo_login, reset_token_hash, reset_expires_at, deleted_at,
  created_at, updated_at
`;

function mapCandidateAccount(row: CandidateAccountRow): CandidateAccount {
  const firstName = row.nombre ?? "";
  const lastName = row.apellido ?? "";
  return {
    id: row.id,
    documentNumber: row.documento,
    firstName,
    lastName,
    fullName: buildFullName(firstName, lastName),
    email: normalizeEmail(row.email),
    phone: row.telefono ?? "",
    photoUrl: row.foto ?? "",
    birthDate: toIsoString(row.fecha_nacimiento).slice(0, 10),
    address: row.direccion ?? "",
    city: row.ciudad ?? "",
    department: row.departamento ?? "",
    professionalTitle: row.profesion ?? "",
    yearsExperience: row.experiencia ?? "",
    education: row.educacion ?? "",
    skills: "",
    about: "",
    linkedinUrl: row.linkedin ?? "",
    portfolioUrl: row.portfolio ?? "",
    hasDriversLicense: Boolean(row.tiene_licencia_conduccion),
    cvUrl: row.cv_url ?? "",
    active: Boolean(row.activo) && !row.deleted_at,
    lastLoginAt: toIsoString(row.ultimo_login),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapCandidateProfile(row: CandidateAccountRow): CandidateProfile {
  const account = mapCandidateAccount(row);
  return {
    ...createEmptyCandidateProfile(),
    documentNumber: account.documentNumber,
    firstName: account.firstName,
    lastName: account.lastName,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    photoUrl: account.photoUrl,
    birthDate: account.birthDate,
    address: account.address,
    city: account.city,
    department: account.department,
    professionalTitle: account.professionalTitle,
    yearsExperience: account.yearsExperience,
    education: account.education,
    linkedinUrl: account.linkedinUrl,
    portfolioUrl: account.portfolioUrl,
    hasDriversLicense: account.hasDriversLicense,
    cvUrl: account.cvUrl,
    resumeFileName: account.cvUrl ? (account.cvUrl.split("/").pop() ?? "") : "",
    active: account.active,
    lastLoginAt: account.lastLoginAt,
    updatedAt: account.updatedAt,
  };
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
    documentNumber: record.documentNumber ?? "",
    firstName: record.firstName ?? "",
    lastName: record.lastName ?? "",
    fullName: record.fullName ?? "",
    email: record.email ?? "",
    passwordHash: record.passwordHash ?? "",
    passwordUpdatedAt: record.passwordUpdatedAt ?? "",
    phone: record.phone ?? "",
    photoUrl: record.photoUrl ?? "",
    birthDate: record.birthDate ?? "",
    address: record.address ?? "",
    department: record.department ?? "",
    city: record.city ?? "",
    professionalTitle: record.professionalTitle ?? "",
    yearsExperience: record.yearsExperience ?? "",
    education: record.education ?? "",
    skills: record.skills ?? "",
    about: record.about ?? "",
    linkedinUrl: record.linkedinUrl ?? "",
    portfolioUrl: record.portfolioUrl ?? "",
    hasDriversLicense: record.hasDriversLicense ?? false,
    cvUrl: record.cvUrl ?? "",
    resumeFileName: record.resumeFileName ?? "",
    resumeFileData: record.resumeFileData ?? "",
    active: record.active ?? true,
    lastLoginAt: record.lastLoginAt ?? "",
    updatedAt: record.updatedAt ?? "",
  };
}

/**
 * Normaliza los datos de una postulación individual para asegurar consistencia.
 * También proporciona soporte a datos generados en versiones anteriores de la plataforma.
 *
 * @param record - Objeto parcial con la postulación guardada en el navegador.
 * @returns Un objeto `JobApplication` válido o `null` si faltan campos obligatorios críticos.
 */
function normalizeApplication(
  record: Partial<JobApplication>,
): JobApplication | null {
  // Soporte de compatibilidad (Legacy) para datos de versiones anteriores del formulario.
  const legacyRecord = record as Partial<JobApplication> & {
    email?: string;
    phone?: string;
    fullName?: string;
    documentNumber?: string;
    trackingCode?: string;
  };
  const candidateEmail = (
    record.candidateEmail ??
    legacyRecord.email ??
    ""
  ).trim();
  const candidateDocument = (
    record.candidateDocument ??
    legacyRecord.documentNumber ??
    ""
  )
    .toString()
    .replace(/\D/g, "");

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
    ? (record.status as JobApplication["status"])
    : "Recibida";
  return {
    id: record.id,
    trackingCode:
      (record.trackingCode ?? legacyRecord.trackingCode ?? "")
        .toString()
        .trim()
        .toUpperCase() || `JDR-${record.id.toUpperCase()}`,
    vacancyId: record.vacancyId,
    vacancyTitle: record.vacancyTitle,
    candidateDocument,
    candidateName: record.candidateName ?? legacyRecord.fullName ?? "",
    candidateEmail,
    candidatePhone: record.candidatePhone ?? legacyRecord.phone ?? "",
    resumeFileName: record.resumeFileName ?? "",
    resumeFileData: record.resumeFileData ?? "",
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
  if (typeof window === "undefined") {
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
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    CANDIDATE_PROFILE_STORAGE_KEY,
    JSON.stringify(profile),
  );
  window.dispatchEvent(new Event("candidate-storage-updated"));
}

/**
 * Lee el arreglo de postulaciones a vacantes (historial) del candidato activo
 * y las normaliza para evitar errores en las vistas de listados.
 *
 * @returns Una lista tipada `JobApplication[]`. Si no hay datos devuelve `[]`.
 */
export function readCandidateApplications() {
  if (typeof window === "undefined") {
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
export async function getAllApplicationsFromDB() {
  await ensureApplicationSnapshotSchema();
  const sql = `
    SELECT CAST(p.id AS CHAR) AS id, CAST(p.vacante_id AS CHAR) AS vacancyId,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateName')),''),NULLIF(TRIM(CONCAT(COALESCE(c.nombres,''),' ',COALESCE(c.apellidos,''))),''),'Postulante sin nombre') AS candidateName,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateDocument')),''),c.documento,'') AS candidateDocument,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateEmail')),''),c.email,'') AS candidateEmail,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidatePhone')),''),c.telefono,'') AS candidatePhone,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateCity')),''),c.ciudad,'') AS city,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.candidateDepartment')),''),c.departamento,'') AS department,
      COALESCE(NULLIF(JSON_UNQUOTE(JSON_EXTRACT(p.application_snapshot,'$.vacancyTitle')),''),v.titulo,'Vacante no disponible') AS vacancyTitle,
      p.fuente AS source,p.observaciones_rh AS observations,p.updated_at AS updatedAt,
      CASE
        WHEN p.estado IN ('Postulado','Recibido') THEN 'Recibida'
        WHEN p.estado IN ('En revisión','Filtro RH') THEN 'En revision'
        WHEN p.estado = 'Prueba técnica' THEN 'Prueba tecnica'
        WHEN p.estado IN ('Entrevista RH','Entrevista Técnica','Finalista') THEN 'Entrevista'
        WHEN p.estado = 'Contratado' THEN 'Seleccionado'
        WHEN p.estado = 'No seleccionado' AND p.observaciones_rh LIKE 'Trasladado internamente%' THEN 'Trasladado'
        WHEN p.estado IN ('No seleccionado','Proceso cerrado') THEN 'No continua'
        ELSE p.estado
      END AS status,
      p.created_at AS appliedAt
    FROM postulaciones p LEFT JOIN candidatos c ON c.id = p.candidato_id LEFT JOIN vacantes v ON v.id = p.vacante_id
    WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC
  `;

  return query(sql);
}

export async function updateApplicationStatusInDB(input: {
  id: string; status: JobApplication["status"]; notes?: string; adminName?: string; adminUserId?: number;
}) {
  const note=input.notes?.trim()||"";
  if(input.status!=="Recibida"&&!note)return false;
  const corporateStatus={Recibida:"Postulado","En revision":"En revisión",Entrevista:"Entrevista RH","Prueba tecnica":"Prueba técnica",Seleccionado:"Contratado","No continua":"No seleccionado",Trasladado:"No seleccionado"}[input.status];
  if(input.status==="Seleccionado"){await ensureSelectionSchema();await ensureHistoricalCandidateSchema();}
  const connection=await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows]=await connection.query<mysql.RowDataPacket[]>("SELECT id FROM postulaciones WHERE id=? AND deleted_at IS NULL FOR UPDATE",[input.id]);
    if(!rows.length){await connection.rollback();return false;}
    await connection.execute("UPDATE postulaciones SET estado=?,observaciones_rh=CONCAT(?, '\\n', COALESCE(observaciones_rh,'')) WHERE id=?",[corporateStatus,note,input.id]);
    const admin=`${input.adminName||"Administrador"} (ID ${input.adminUserId||"No registrado"})`;
    await connection.execute("INSERT INTO activity_logs(usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion) VALUES ('Admin','POSTULACION_ESTADO_ACTUALIZADO','Vacantes','postulaciones',?,?)",[input.id,`Administrador ${admin} actualizó el proceso. Estado informado: ${input.status}. Observación: ${note}`]);
    if(input.status==="Seleccionado")await recordHiring(connection,input.id,admin,note);
    await connection.commit();return true;
  } catch(error){await connection.rollback();throw error;}
  finally {connection.release();}
}

/**
 * Guarda todo el historial de postulaciones de un candidato en el Storage
 * y notifica al resto del frontend que hubo cambios en las aplicaciones.
 *
 * @param applications - Arreglo de objetos `JobApplication` que reemplazará al actual.
 */
export function writeCandidateApplications(applications: JobApplication[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(
    CANDIDATE_APPLICATIONS_STORAGE_KEY,
    JSON.stringify(applications),
  );
  window.dispatchEvent(new Event("candidate-storage-updated"));
}

export async function createCandidateAccountInDB(
  input: CandidateRegistrationInput,
) {
  const documentNumber = normalizeDocumentNumber(input.documentNumber);
  const email = normalizeEmail(input.email);
  const sql = `
    INSERT INTO candidatos (
      documento,
      nombres,
      apellidos,
      email,
      telefono,
      password_hash,
      ciudad,
      departamento,
      profesion,
      experiencia,
      educacion,
      linkedin,
      portfolio,
      cv_url,
      activo
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;

  const result = await execute(sql, [
    documentNumber,
    input.firstName.trim(),
    input.lastName?.trim() ?? "",
    email,
    input.phone?.trim() ?? "",
    input.passwordHash,
    input.city?.trim() ?? "",
    input.department?.trim() ?? "",
    input.professionalTitle?.trim() ?? "",
    input.yearsExperience?.trim() ?? "",
    input.education?.trim() ?? "",
    input.linkedinUrl?.trim() ?? "",
    input.portfolioUrl?.trim() ?? "",
    input.cvUrl?.trim() ?? "",
  ]);

  return String(result.insertId);
}

export async function getCandidateAccountByDocumentOrEmail(input: {
  documentNumber?: string;
  email?: string;
}) {
  await ensureCandidateLicenseColumn();
  const documentNumber = normalizeDocumentNumber(input.documentNumber ?? "");
  const email = normalizeEmail(input.email ?? "");
  const conditions: string[] = [];
  const params: string[] = [];

  if (documentNumber) {
    conditions.push("documento = ?");
    params.push(documentNumber);
  }
  if (email) {
    conditions.push("LOWER(email) = ?");
    params.push(email);
  }
  if (conditions.length === 0) {
    return null;
  }

  const rows = await query<CandidateAccountRow>(
    `
      SELECT ${CANDIDATE_ACCOUNT_COLUMNS}
      FROM candidatos
      WHERE (${conditions.join(" OR ")})
        AND deleted_at IS NULL
      LIMIT 1
    `,
    params,
  );

  return rows[0] ?? null;
}

export async function getCandidateAccountForLogin(input: {
  documentNumber?: string;
  email: string;
}) {
  await ensureCandidateLicenseColumn();
  const documentNumber = normalizeDocumentNumber(input.documentNumber ?? "");
  const email = normalizeEmail(input.email);
  const documentCondition = documentNumber ? "AND documento = ?" : "";
  const params = documentNumber ? [email, documentNumber] : [email];
  const rows = await query<CandidateAccountRow>(
    `
      SELECT ${CANDIDATE_ACCOUNT_COLUMNS}
      FROM candidatos
      WHERE LOWER(email) = ?
        ${documentCondition}
        AND activo = 1
        AND deleted_at IS NULL
      LIMIT 1
    `,
    params,
  );

  return rows[0] ?? null;
}

export async function deactivateCandidateFromApplicationInDB(input: {
  applicationId: string;
  adminUserId: number;
  adminName: string;
}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT c.id, c.documento, c.email, CONCAT(c.nombres, ' ', c.apellidos) AS name
       FROM postulaciones p INNER JOIN candidatos c ON c.id = p.candidato_id
       WHERE p.id = ? AND p.deleted_at IS NULL AND c.deleted_at IS NULL LIMIT 1`,
      [input.applicationId],
    );
    const candidate = rows[0] as
      | { id: number; documento: string; email: string; name: string }
      | undefined;
    if (!candidate) {
      await connection.rollback();
      return null;
    }

    await connection.execute(
      "UPDATE postulaciones SET deleted_at = NOW() WHERE candidato_id = ? AND deleted_at IS NULL",
      [candidate.id],
    );
    await connection.execute(
      "UPDATE candidatos SET activo = FALSE, deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
      [candidate.id],
    );
    // Estas columnas existen tanto en la base actual como en la de producción.
    await connection.execute(
      "INSERT INTO activity_logs (usuario_tipo, accion, modulo, tabla_afectada, registro_id, descripcion) VALUES (?,?,?,?,?,?)",
      [
        "Admin",
        "POSTULANTE_ELIMINADO",
        "Vacantes",
        "candidatos",
        candidate.id,
        `Administrador ${input.adminName} (ID ${input.adminUserId}) eliminó lógicamente al postulante ${candidate.name} (${candidate.documento}) y sus postulaciones activas.`,
      ],
    );
    await connection.commit();
    return candidate;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function canRequestCandidateEmailAccessCode(email: string) {
  const rows = await query<{ id: number }>(
    `SELECT id FROM postulante_access_codes
     WHERE LOWER(email) = ? AND created_at > DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 60 SECOND)
     ORDER BY id DESC LIMIT 1`,
    [normalizeEmail(email)],
  );
  return rows.length === 0;
}

export async function createCandidateEmailAccessCode(input: {
  email: string;
  codeHash: string;
  expiresAt: Date;
}) {
  const email = normalizeEmail(input.email);
  await execute("DELETE FROM postulante_access_codes WHERE LOWER(email) = ?", [
    email,
  ]);
  await execute(
    `INSERT INTO postulante_access_codes (email, code_hash, expires_at)
     VALUES (?, ?, ?)`,
    [email, input.codeHash, input.expiresAt],
  );
}

export async function getCandidateEmailAccessCode(email: string) {
  const rows = await query<CandidateEmailAccessCodeRow>(
    `SELECT id, email, code_hash, attempts
     FROM postulante_access_codes
     WHERE LOWER(email) = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP
     ORDER BY id DESC LIMIT 1`,
    [normalizeEmail(email)],
  );
  return rows[0] ?? null;
}

export async function registerFailedCandidateEmailAccessCodeAttempt(
  id: number,
) {
  await execute(
    "UPDATE postulante_access_codes SET attempts = attempts + 1 WHERE id = ? AND used_at IS NULL",
    [id],
  );
}

export async function consumeCandidateEmailAccessCode(id: number) {
  const result = await execute(
    "UPDATE postulante_access_codes SET used_at = CURRENT_TIMESTAMP WHERE id = ? AND used_at IS NULL",
    [id],
  );
  return result.affectedRows > 0;
}

export async function getCandidateProfileFromDB(input: {
  documentNumber: string;
  email: string;
}): Promise<CandidateProfile | null> {
  const account = await getCandidateAccountForLogin(input);
  return account ? mapCandidateProfile(account) : null;
}

export async function updateCandidateLastLogin(documentNumber: string) {
  await execute(
    "UPDATE candidatos SET ultimo_login = CURRENT_TIMESTAMP WHERE documento = ? AND deleted_at IS NULL",
    [normalizeDocumentNumber(documentNumber)],
  );
}

export async function updateCandidateProfileInDB(input: {
  documentNumber: string;
  email: string;
  profile: Partial<CandidateProfile>;
}) {
  await ensureCandidateLicenseColumn();
  const profile = input.profile;
  const nameParts = profile.fullName ? splitFullName(profile.fullName) : null;
  const firstName = profile.firstName?.trim() || nameParts?.firstName || "";
  const lastName = profile.lastName?.trim() || nameParts?.lastName || "";

  const result = await execute(
    `
      UPDATE candidatos
      SET nombres = ?,
          apellidos = ?,
          telefono = ?,
          foto_url = ?,
          fecha_nacimiento = ?,
          direccion = ?,
          ciudad = ?,
          departamento = ?,
          profesion = ?,
          experiencia = ?,
          educacion = ?,
          linkedin = ?,
          portfolio = ?,
          tiene_licencia_conduccion = ?,
          cv_url = ?
      WHERE documento = ?
        AND LOWER(email) = ?
        AND deleted_at IS NULL
    `,
    [
      firstName,
      lastName,
      profile.phone?.trim() ?? "",
      profile.photoUrl?.trim() ?? "",
      profile.birthDate?.trim() || null,
      profile.address?.trim() ?? "",
      profile.city?.trim() ?? "",
      profile.department?.trim() ?? "",
      profile.professionalTitle?.trim() ?? "",
      profile.yearsExperience?.trim() ?? "",
      profile.education?.trim() ?? "",
      profile.linkedinUrl?.trim() ?? "",
      profile.portfolioUrl?.trim() ?? "",
      profile.hasDriversLicense ? 1 : 0,
      profile.cvUrl?.trim() ?? "",
      normalizeDocumentNumber(input.documentNumber),
      normalizeEmail(input.email),
    ],
  );

  return result.affectedRows;
}

export async function updateCandidatePasswordInDB(input: {
  documentNumber: string;
  email: string;
  passwordHash: string;
}) {
  const result = await execute(
    `
      UPDATE candidatos
      SET password_hash = ?,
          reset_token_hash = NULL,
          reset_expires_at = NULL
      WHERE documento = ?
        AND LOWER(email) = ?
        AND deleted_at IS NULL
    `,
    [
      input.passwordHash,
      normalizeDocumentNumber(input.documentNumber),
      normalizeEmail(input.email),
    ],
  );

  return result.affectedRows;
}

export async function setCandidatePasswordResetToken(input: {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const result = await execute(
    `
      UPDATE candidatos
      SET reset_token_hash = ?,
          reset_expires_at = ?
      WHERE LOWER(email) = ?
        AND activo = 1
        AND deleted_at IS NULL
    `,
    [input.tokenHash, input.expiresAt, normalizeEmail(input.email)],
  );

  return result.affectedRows;
}

export async function getCandidateByResetToken(tokenHash: string) {
  const rows = await query<CandidateAccountRow>(
    `
      SELECT ${CANDIDATE_ACCOUNT_COLUMNS}
      FROM candidatos
      WHERE reset_token_hash = ?
        AND reset_expires_at > CURRENT_TIMESTAMP
        AND activo = 1
        AND deleted_at IS NULL
      LIMIT 1
    `,
    [tokenHash],
  );

  return rows[0] ?? null;
}

/**
 * Mapea una fila de la tabla `postulaciones` a la interfaz `JobApplication`.
 * @param dbApplication - El objeto de postulación desde la base de datos.
 * @returns Un objeto `JobApplication` normalizado o `null`.
 */
function mapDbApplicationToJobApplication(
  dbApplication: DbApplicationRow,
): JobApplication | null {
  if (!dbApplication || !dbApplication.id) {
    return null;
  }

  const rawStatus = String(
    dbApplication.estado ?? dbApplication.status ?? "Postulado",
  );
  const statusMap: Record<string, JobApplication["status"]> = {
    Postulado: "Recibida",
    Recibido: "Recibida",
    "En revisión": "En revision",
    "Filtro RH": "En revision",
    "Prueba técnica": "Prueba tecnica",
    "Entrevista RH": "Entrevista",
    "Entrevista Técnica": "Entrevista",
    Finalista: "Entrevista",
    Contratado: "Seleccionado",
    "No seleccionado": "No continua",
    "Proceso cerrado": "No continua",
  };
  const status =
    (rawStatus === "No seleccionado" && String(dbApplication.observaciones_rh ?? "").startsWith("Trasladado internamente")
      ? "Trasladado"
      : statusMap[rawStatus]) ??
    (APPLICATION_STATUS_OPTIONS.includes(rawStatus as JobApplication["status"])
      ? (rawStatus as JobApplication["status"])
      : "Recibida");

  // La hoja de vida se almacena como BLOB, no la devolvemos en listados.
  return {
    id: String(dbApplication.id),
    trackingCode: `JDR-${String(dbApplication.id).padStart(6, "0")}`,
    vacancyId: String(dbApplication.vacante_id ?? dbApplication.vacancy_id),
    vacancyTitle: dbApplication.vacancy_title ?? "Vacante sin titulo",
    candidateDocument: dbApplication.documento ?? "",
    candidateName: dbApplication.candidate_name ?? "",
    candidateEmail: dbApplication.candidate_email ?? "",
    candidatePhone: dbApplication.candidate_phone ?? "",
    resumeFileName: "",
    resumeFileData: "", // No se devuelve el binario en las listas
    appliedAt:
      toIsoString(dbApplication.created_at) || new Date().toISOString(),
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
    candidateId,
    vacancyId,
    vacancyTitle,
    candidateDocument,
    candidateName,
    candidateEmail,
    candidatePhone,
    candidateCity,
    candidateDepartment,
    candidateProfessionalTitle,
    candidateEducation,
    applicationSource = "Portal Web",
    resumeFileName,
    resumeFileData, // Se espera en formato Base64
    resumeUrl,
  } = applicationData;
  await ensureApplicationSnapshotSchema();
  const applicationSnapshot = JSON.stringify({ candidateDocument, candidateName: candidateName.trim(), candidateEmail, candidatePhone, candidateCity: candidateCity || "", candidateDepartment: candidateDepartment || "", professionalTitle: candidateProfessionalTitle || "", education: candidateEducation || "", vacancyTitle, source: applicationSource, capturedAt: new Date().toISOString() });

  const sql = `
    INSERT INTO postulaciones (
      candidato_id, vacante_id, estado, fuente, observaciones_candidato, cv_url, application_snapshot
    )
    VALUES (?, ?, 'Postulado', ?, ?, ?, ?)
  `;

  const params = [
    candidateId || null,
    vacancyId,
    applicationSource,
    `Postulación de ${candidateName.trim()}`,
    resumeUrl || null,
    applicationSnapshot,
  ];

  const result = await execute(sql, params);
  return String(result.insertId);
}

/**
 * Obtiene todas las postulaciones de un candidato por su número de documento.
 * @param document - El número de documento del candidato.
 * @returns Una promesa que se resuelve en un array de `JobApplication`.
 */
export async function getApplicationsByCandidateFromDB(
  document: string,
  email?: string,
  publicView = false,
): Promise<JobApplication[]> {
  try {
    const params: string[] = [normalizeDocumentNumber(document)];
    const emailCondition = email ? "AND LOWER(c.email) = ?" : "";
    if (email) {
      params.push(normalizeEmail(email));
    }

    // Hacemos un JOIN para obtener el título de la vacante.
    const sql = `
      SELECT p.*, v.titulo as vacancy_title, c.documento, CONCAT(c.nombres, ' ', c.apellidos) AS candidate_name, c.email AS candidate_email, c.telefono AS candidate_phone
      FROM postulaciones p INNER JOIN candidatos c ON c.id = p.candidato_id INNER JOIN vacantes v ON p.vacante_id = v.id
      WHERE c.documento = ? AND p.deleted_at IS NULL
      ${publicView ? "AND COALESCE(p.observaciones_candidato,'') <> 'Traslado interno sin correo automático.'" : ""}
      ${emailCondition}
      ORDER BY p.created_at DESC
    `;
    const rows = await query<DbApplicationRow>(sql, params);
    return rows
      .map(mapDbApplicationToJobApplication)
      .filter(item => !publicView || item?.status !== "Trasladado")
      .filter(Boolean) as JobApplication[];
  } catch (error) {
    console.error("Error al leer las postulaciones del candidato:", error);
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
      name: row.candidate_name || "Postulante",
      phone: row.candidate_phone ?? "",
      city: row.city ?? "",
      department: row.department ?? "",
    };
  } catch (error) {
    console.error("Error al validar identidad de postulante:", error);
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
      fullName: row.candidate_name || "",
      email: normalizeEmail(row.candidate_email),
      phone: row.candidate_phone ?? "",
      city: row.city ?? "",
      department: row.department ?? "",
      resumeFileName: row.resume_filename ?? "",
      updatedAt: toIsoString(row.applied_at),
    };
  } catch (error) {
    console.error("Error al leer perfil desde postulaciones:", error);
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
  const fullName = input.profile.fullName?.trim() ?? "";
  const phone = input.profile.phone?.trim() ?? "";
  const department = input.profile.department?.trim() ?? "";
  const city = input.profile.city?.trim() ?? "";

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
export async function getApplicationByIdFromDB(
  id: string,
): Promise<JobApplication | null> {
  try {
    const sql = `
      SELECT p.*, v.titulo AS vacancy_title, c.documento,
        CONCAT(c.nombres, ' ', c.apellidos) AS candidate_name,
        c.email AS candidate_email, c.telefono AS candidate_phone
      FROM postulaciones p
      LEFT JOIN vacantes v ON p.vacante_id = v.id
      LEFT JOIN candidatos c ON p.candidato_id = c.id
      WHERE p.id = ? AND p.deleted_at IS NULL
    `;
    const rows = await query<DbApplicationRow>(sql, [id]);
    if (rows.length === 0) {
      return null;
    }
    const application = mapDbApplicationToJobApplication(rows[0]);
    if (application && rows[0].resume_filedata) {
      application.resumeFileData = Buffer.from(
        rows[0].resume_filedata,
      ).toString("base64");
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
export async function getVacancyApplicationCounts(): Promise<
  Record<string, number>
> {
  try {
    const sql = `
      SELECT vacante_id, COUNT(id) as count
      FROM postulaciones
      GROUP BY vacante_id
    `;
    const rows = await query<VacancyApplicationCountRow>(sql, []);
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.vacante_id] = Number(row.count);
    }
    return counts;
  } catch (error) {
    console.error("Error al contar las postulaciones por vacante:", error);
    return {};
  }
}
