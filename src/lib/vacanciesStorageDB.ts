import { query, execute } from "./db";
import { ensureSelectionSchema } from "@/lib/selection-followup";
import { selectionSteps } from "@/config/selection-followup";
import {
  normalizeVacancyDepartment,
  type JobVacancy,
} from "@/config/vacancies";

// Se conserva junto a los requisitos para no depender de una migración pendiente
// en instalaciones ya existentes de la base de datos.
const DRIVERS_LICENSE_MARKER = "__jdr_requires_drivers_license__";
let vacancyTemplateSchemaPromise: Promise<void> | null = null;

export function ensureVacancyTemplateSchema() {
  return vacancyTemplateSchemaPromise ??= (async () => {
    await ensureSelectionSchema();
    const columns = await query<{ Field: string }>("SHOW COLUMNS FROM vacantes LIKE 'template_data'");
    if (!columns.length) await execute("ALTER TABLE vacantes ADD COLUMN template_data JSON NULL");
  })().catch((error) => { vacancyTemplateSchemaPromise = null; throw error; });
}

function readTemplate(value: unknown): Partial<JobVacancy> {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value as Partial<JobVacancy>;
  try { return JSON.parse(String(value)) as Partial<JobVacancy>; } catch { return {}; }
}

function templateForStorage(vacancy: Partial<JobVacancy>) {
  return JSON.stringify({ title: vacancy.title, area: vacancy.area, department: vacancy.department, city: vacancy.city, modality: vacancy.modality, contractType: vacancy.contractType, schedule: vacancy.schedule, salary: vacancy.salary, experience: vacancy.experience, summary: vacancy.summary, requirements: vacancy.requirements, requiresDriversLicense: Boolean(vacancy.requiresDriversLicense), benefits: vacancy.benefits, featured: Boolean(vacancy.featured), selectionSteps: vacancy.selectionSteps });
}

function readRequirements(value: unknown): string[] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function requirementsForStorage(requirements: string[], requiresDriversLicense?: boolean) {
  const visibleRequirements = requirements.filter((item) => item !== DRIVERS_LICENSE_MARKER);
  return requiresDriversLicense ? [...visibleRequirements, DRIVERS_LICENSE_MARKER] : visibleRequirements;
}

/**
 * Mapea una fila de la tabla `vacantes` a la interfaz `JobVacancy`.
 * Convierte nombres de snake_case a camelCase y asegura los tipos correctos.
 *
 * @param dbVacancy - El objeto de vacante desde la base de datos.
 * @returns Un objeto `JobVacancy` normalizado o `null` si faltan campos.
 */
function mapDbVacancyToJobVacancy(dbVacancy: any): JobVacancy | null {
  if (!dbVacancy || !dbVacancy.id || !dbVacancy.titulo) {
    return null;
  }

  const storedRequirements = readRequirements(dbVacancy.requisitos);
  const template = readTemplate(dbVacancy.template_data);
  return {
    selectionSteps: selectionSteps(typeof dbVacancy.selection_steps === "string" ? JSON.parse(dbVacancy.selection_steps) : dbVacancy.selection_steps),
    id: String(dbVacancy.id),
    title: String(template.title || dbVacancy.titulo),
    area: String(template.area || "Talento humano"),
    department: normalizeVacancyDepartment(dbVacancy.departamento),
    city: dbVacancy.ciudad,
    modality:
      dbVacancy.modalidad === "Híbrido" ? "Hibrido" : dbVacancy.modalidad,
    contractType: String(template.contractType || dbVacancy.tipo_contrato || "Tiempo completo"),
    schedule: String(template.schedule || ""),
    salary: String(template.salary || (dbVacancy.mostrar_salario
      ? [dbVacancy.salario_desde, dbVacancy.salario_hasta]
          .filter(Boolean)
          .join(" - ")
      : "A convenir")),
    summary: String(template.summary || dbVacancy.descripcion || ""),
    // Los campos JSON se parsean. Si están vacíos o nulos, se devuelve un array vacío.
    requirements: storedRequirements.filter((item) => item !== DRIVERS_LICENSE_MARKER),
    requiresDriversLicense: storedRequirements.includes(DRIVERS_LICENSE_MARKER),
    benefits: dbVacancy.beneficios ? JSON.parse(dbVacancy.beneficios) : [],
    featured: Boolean(dbVacancy.destacada),
    postedAt: new Date(dbVacancy.fecha_publicacion || dbVacancy.created_at)
      .toISOString()
      .slice(0, 10),
    createdAt: new Date(dbVacancy.created_at).toISOString(),
    updatedAt: new Date(dbVacancy.updated_at).toISOString(),
    // El campo 'experience' no está en la tabla, se puede añadir o manejar por defecto.
    experience: String(template.experience || dbVacancy.experience || ""),
    status: dbVacancy.estado === "Cerrada" ? "Cerrada" : dbVacancy.estado === "Pausada" ? "Pausada" : "Publicada",
  };
}

/**
 * Lee todas las vacantes activas desde la base de datos.
 * @returns Una promesa que se resuelve en un array de `JobVacancy`.
 */
export async function getVacanciesFromDB(): Promise<JobVacancy[]> {
  try {
    await ensureVacancyTemplateSchema();
    const rows = await query(
      "SELECT * FROM vacantes WHERE estado = ? AND deleted_at IS NULL ORDER BY destacada DESC, fecha_publicacion DESC",
      ["Publicada"],
    );
    return rows.map(mapDbVacancyToJobVacancy).filter(Boolean) as JobVacancy[];
  } catch (error) {
    console.error("Error al leer las vacantes de la base de datos:", error);
    return [];
  }
}

export async function getVacanciesForAdminFromDB(): Promise<JobVacancy[]> {
  try {
    await ensureVacancyTemplateSchema();
    const rows = await query(
      "SELECT * FROM vacantes WHERE estado IN ('Publicada','Pausada') AND deleted_at IS NULL ORDER BY destacada DESC, fecha_publicacion DESC",
    );
    return rows.map(mapDbVacancyToJobVacancy).filter(Boolean) as JobVacancy[];
  } catch (error) {
    console.error("Error al leer vacantes para administración:", error);
    return [];
  }
}

export async function getClosedVacanciesForAdminFromDB(): Promise<JobVacancy[]> {
  await ensureVacancyTemplateSchema();
  const rows = await query("SELECT * FROM vacantes WHERE estado='Cerrada' AND deleted_at IS NULL ORDER BY updated_at DESC");
  return rows.map(mapDbVacancyToJobVacancy).filter(Boolean) as JobVacancy[];
}

/**
 * Busca y devuelve una sola vacante por su ID.
 * @param id - El UUID de la vacante a buscar.
 * @returns Una promesa que se resuelve en el objeto `JobVacancy` o `null` si no se encuentra.
 */
export async function getVacancyByIdFromDB(
  id: string,
): Promise<JobVacancy | null> {
  await ensureVacancyTemplateSchema();
  const rows = await query(
    "SELECT * FROM vacantes WHERE id = ? AND estado = ? AND deleted_at IS NULL",
    [id, "Publicada"],
  );
  if (rows.length === 0) {
    return null;
  }
  return mapDbVacancyToJobVacancy(rows[0]);
}

/**
 * Crea una nueva vacante en la base de datos.
 * @param vacancyData - Un objeto con los datos de la nueva vacante.
 * @returns El ID de la nueva vacante creada.
 */
export async function createVacancyInDB(
  vacancyData: Omit<JobVacancy, "id" | "createdAt" | "updatedAt">,
) {
  await Promise.all([ensureSelectionSchema(), ensureVacancyTemplateSchema()]);
  const {
    title,
    area,
    department,
    city,
    modality,
    contractType,
    schedule,
    summary,
    requirements,
    benefits,
    salary,
    featured,
    postedAt,
  } = vacancyData;
  const sql = `
    INSERT INTO vacantes (titulo, descripcion, requisitos, beneficios, ciudad, departamento, modalidad, tipo_contrato, destacada, estado, fecha_publicacion, selection_steps, template_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Publicada', ?, ?, ?)
  `;
  const params = [
    title,
    summary,
    JSON.stringify(requirementsForStorage(requirements, vacancyData.requiresDriversLicense)),
    JSON.stringify(benefits),
    city,
    department,
    modality === "Hibrido" ? "Híbrido" : modality,
    contractType === "Tiempo completo" ? "Indefinido" : "Fijo",
    featured,
    postedAt,
    JSON.stringify(selectionSteps(vacancyData.selectionSteps)),
    templateForStorage(vacancyData),
  ];
  const result = await execute(sql, params);
  return result.insertId;
}

/**
 * Realiza una eliminación lógica de una vacante (la marca como inactiva).
 * @param id - El UUID de la vacante a desactivar.
 * @returns El número de filas afectadas.
 */
export async function deactivateVacancyInDB(id: string): Promise<number> {
  const sql = "UPDATE vacantes SET estado = 'Cerrada' WHERE id = ?";
  const result = await execute(sql, [id]);
  return result.affectedRows;
}
export async function setVacancyStatusInDB(
  id: string,
  status: "Publicada" | "Pausada",
): Promise<number> {
  const result = await execute(
    "UPDATE vacantes SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL",
    [status, id],
  );
  return result.affectedRows;
}
/**
 * Actualiza una vacante existente.
 */
export async function updateVacancyInDB(
  id: string,
  vacancyData: Omit<JobVacancy, "id" | "createdAt" | "updatedAt">,
): Promise<number> {
  await Promise.all([ensureSelectionSchema(), ensureVacancyTemplateSchema()]);
  const {
    title,
    area,
    department,
    city,
    modality,
    contractType,
    schedule,
    summary,
    requirements,
    benefits,
    salary,
    featured,
    postedAt,
  } = vacancyData;

  const sql = `
    UPDATE vacantes SET titulo = ?, descripcion = ?, requisitos = ?, beneficios = ?, ciudad = ?, departamento = ?, modalidad = ?, tipo_contrato = ?, destacada = ?, fecha_publicacion = ?, selection_steps = ?, template_data = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const result = await execute(sql, [
    title,
    summary,
    JSON.stringify(requirementsForStorage(requirements, vacancyData.requiresDriversLicense)),
    JSON.stringify(benefits),
    city,
    department,
    modality === "Hibrido" ? "Híbrido" : modality,
    contractType === "Tiempo completo" ? "Indefinido" : "Fijo",
    featured,
    postedAt,
    JSON.stringify(selectionSteps(vacancyData.selectionSteps)),
    templateForStorage(vacancyData),
    id,
  ]);

  return result.affectedRows;
}
