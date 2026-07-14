import { query, execute } from './db';
import {
  normalizeVacancyDepartment,
  type JobVacancy,
} from '@/config/vacancies';

/**
 * Mapea una fila de la tabla `vacantes` a la interfaz `JobVacancy`.
 * Convierte nombres de snake_case a camelCase y asegura los tipos correctos.
 *
 * @param dbVacancy - El objeto de vacante desde la base de datos.
 * @returns Un objeto `JobVacancy` normalizado o `null` si faltan campos.
 */
function mapDbVacancyToJobVacancy(dbVacancy: any): JobVacancy | null {
  if (!dbVacancy || !dbVacancy.id || !dbVacancy.title) {
    return null;
  }

  return {
    id: dbVacancy.id,
    title: dbVacancy.title,
    area: dbVacancy.area,
    department: normalizeVacancyDepartment(dbVacancy.department),
    city: dbVacancy.city,
    modality: dbVacancy.modality,
    contractType: dbVacancy.contract_type,
    schedule: dbVacancy.schedule,
    salary: dbVacancy.salary,
    summary: dbVacancy.summary,
    // Los campos JSON se parsean. Si están vacíos o nulos, se devuelve un array vacío.
    requirements: dbVacancy.requirements ? JSON.parse(dbVacancy.requirements) : [],
    benefits: dbVacancy.benefits ? JSON.parse(dbVacancy.benefits) : [],
    featured: Boolean(dbVacancy.featured),
    postedAt: new Date(dbVacancy.posted_at).toISOString().slice(0, 10),
    createdAt: new Date(dbVacancy.created_at).toISOString(),
    updatedAt: new Date(dbVacancy.updated_at).toISOString(),
    // El campo 'experience' no está en la tabla, se puede añadir o manejar por defecto.
    experience: dbVacancy.experience ?? '',
  };
}

/**
 * Lee todas las vacantes activas desde la base de datos.
 * @returns Una promesa que se resuelve en un array de `JobVacancy`.
 */
export async function getVacanciesFromDB(): Promise<JobVacancy[]> {
  try {
    const rows = await query('SELECT * FROM vacantes WHERE active = 1 ORDER BY featured DESC, posted_at DESC');
    return rows
      .map(mapDbVacancyToJobVacancy)
      .filter(Boolean) as JobVacancy[];
  } catch (error) {
    console.error('Error al leer las vacantes de la base de datos:', error);
    return [];
  }
}

/**
 * Busca y devuelve una sola vacante por su ID.
 * @param id - El UUID de la vacante a buscar.
 * @returns Una promesa que se resuelve en el objeto `JobVacancy` o `null` si no se encuentra.
 */
export async function getVacancyByIdFromDB(id: string): Promise<JobVacancy | null> {
  const rows = await query('SELECT * FROM vacantes WHERE id = ? AND active = 1', [id]);
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
export async function createVacancyInDB(vacancyData: Omit<JobVacancy, 'id' | 'createdAt' | 'updatedAt'>) {
  const { title, area, department, city, modality, contractType, schedule, summary, requirements, benefits, salary, featured, postedAt } = vacancyData;
  const sql = `
    INSERT INTO vacantes (title, area, department, city, modality, contract_type, schedule, summary, requirements, benefits, salary, featured, active, posted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `;
  const params = [
    title,
    area,
    department,
    city,
    modality,
    contractType,
    schedule,
    summary,
    JSON.stringify(requirements), // Los arrays se convierten a string JSON
    JSON.stringify(benefits),
    salary,
    featured,
    postedAt,
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
  const sql = 'UPDATE vacantes SET active = 0 WHERE id = ?';
  const result = await execute(sql, [id]);
  return result.affectedRows;
}
