import { query, execute } from "./db";
import {
  normalizeVacancyDepartment,
  type JobVacancy,
} from "@/config/vacancies";

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

  return {
    id: String(dbVacancy.id),
    title: dbVacancy.titulo,
    area: "Talento humano",
    department: normalizeVacancyDepartment(dbVacancy.departamento),
    city: dbVacancy.ciudad,
    modality:
      dbVacancy.modalidad === "Híbrido" ? "Hibrido" : dbVacancy.modalidad,
    contractType: dbVacancy.tipo_contrato || "Tiempo completo",
    schedule: "",
    salary: dbVacancy.mostrar_salario
      ? [dbVacancy.salario_desde, dbVacancy.salario_hasta]
          .filter(Boolean)
          .join(" - ")
      : "A convenir",
    summary: dbVacancy.descripcion || "",
    // Los campos JSON se parsean. Si están vacíos o nulos, se devuelve un array vacío.
    requirements: dbVacancy.requisitos ? JSON.parse(dbVacancy.requisitos) : [],
    benefits: dbVacancy.beneficios ? JSON.parse(dbVacancy.beneficios) : [],
    featured: Boolean(dbVacancy.destacada),
    postedAt: new Date(dbVacancy.fecha_publicacion || dbVacancy.created_at)
      .toISOString()
      .slice(0, 10),
    createdAt: new Date(dbVacancy.created_at).toISOString(),
    updatedAt: new Date(dbVacancy.updated_at).toISOString(),
    // El campo 'experience' no está en la tabla, se puede añadir o manejar por defecto.
    experience: dbVacancy.experience ?? "",
    status: dbVacancy.estado === "Pausada" ? "Pausada" : "Publicada",
  };
}

/**
 * Lee todas las vacantes activas desde la base de datos.
 * @returns Una promesa que se resuelve en un array de `JobVacancy`.
 */
export async function getVacanciesFromDB(): Promise<JobVacancy[]> {
  try {
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
    const rows = await query(
      "SELECT * FROM vacantes WHERE estado IN ('Publicada','Pausada') AND deleted_at IS NULL ORDER BY destacada DESC, fecha_publicacion DESC",
    );
    return rows.map(mapDbVacancyToJobVacancy).filter(Boolean) as JobVacancy[];
  } catch (error) {
    console.error("Error al leer vacantes para administración:", error);
    return [];
  }
}

/**
 * Busca y devuelve una sola vacante por su ID.
 * @param id - El UUID de la vacante a buscar.
 * @returns Una promesa que se resuelve en el objeto `JobVacancy` o `null` si no se encuentra.
 */
export async function getVacancyByIdFromDB(
  id: string,
): Promise<JobVacancy | null> {
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
    INSERT INTO vacantes (titulo, descripcion, requisitos, beneficios, ciudad, departamento, modalidad, tipo_contrato, destacada, estado, fecha_publicacion)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Publicada', ?)
  `;
  const params = [
    title,
    summary,
    JSON.stringify(requirements),
    JSON.stringify(benefits),
    city,
    department,
    modality === "Hibrido" ? "Híbrido" : modality,
    contractType === "Tiempo completo" ? "Indefinido" : "Fijo",
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
    UPDATE vacantes SET titulo = ?, descripcion = ?, requisitos = ?, beneficios = ?, ciudad = ?, departamento = ?, modalidad = ?, tipo_contrato = ?, destacada = ?, fecha_publicacion = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  const result = await execute(sql, [
    title,
    summary,
    JSON.stringify(requirements),
    JSON.stringify(benefits),
    city,
    department,
    modality === "Hibrido" ? "Híbrido" : modality,
    contractType === "Tiempo completo" ? "Indefinido" : "Fijo",
    featured,
    postedAt,
    id,
  ]);

  return result.affectedRows;
}
