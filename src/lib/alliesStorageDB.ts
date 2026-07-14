import { query, execute } from './db';
import {
  resolveAllyDepartment,
  type CommercialAlly,
} from '@/config/allies';

/**
 * Mapea una fila de la tabla `aliados` de la base de datos a la interfaz `CommercialAlly` de TypeScript.
 * Esto es necesario porque los nombres de las columnas en SQL (snake_case) son diferentes
 * a los nombres de las propiedades en la interfaz (camelCase).
 *
 * @param dbAlly - El objeto de aliado tal como viene de la base de datos.
 * @returns Un objeto `CommercialAlly` normalizado o `null` si faltan campos esenciales.
 */
function mapDbAllyToCommercialAlly(dbAlly: any): CommercialAlly | null {
  if (!dbAlly || !dbAlly.id || !dbAlly.name) {
    return null;
  }

  return {
    id: dbAlly.id,
    name: dbAlly.name,
    loginId: dbAlly.login_id,
    categorySlug: dbAlly.category_slug,
    subcategory: dbAlly.subcategory,
    discountLabel: dbAlly.discount_label,
    departamento: resolveAllyDepartment(dbAlly.departamento),
    municipio: dbAlly.municipio,
    address: dbAlly.address,
    url: dbAlly.url,
    logo: dbAlly.logo,
    whatsappNumber: dbAlly.whatsapp_number,
    whatsappTemplate: dbAlly.whatsapp_template,
    featured: Boolean(dbAlly.featured),
    description: dbAlly.description,
    loginPassword: dbAlly.login_password, // Nota: La contraseña no debería viajar al frontend.
    createdAt: new Date(dbAlly.created_at).toISOString(),
    updatedAt: dbAlly.updated_at ? new Date(dbAlly.updated_at).toISOString() : new Date(dbAlly.created_at).toISOString(),
    // Los siguientes campos son de presentación y no están en la BD, se pueden omitir o poner valores por defecto.
    actionLabel: 'Más información',
    containerStyle: undefined,
    innerStyle: undefined,
    glowStyle: undefined,
    logoStyle: undefined,
  };
}

/**
 * Lee todos los aliados comerciales activos desde la base de datos.
 * @returns Una promesa que se resuelve en un array de `CommercialAlly`.
 */
export async function getAlliesFromDB(): Promise<CommercialAlly[]> {
  try {
    const rows = await query('SELECT * FROM aliados WHERE active = 1 ORDER BY featured DESC, name ASC');
    return rows
      .map(mapDbAllyToCommercialAlly)
      .filter(Boolean) as CommercialAlly[];
  } catch (error) {
    console.error('Error al leer los aliados comerciales de la base de datos:', error);
    return [];
  }
}

/**
 * Busca y devuelve un solo aliado comercial por su ID.
 * @param id - El UUID del aliado a buscar.
 * @returns Una promesa que se resuelve en el objeto `CommercialAlly` o `null` si no se encuentra.
 */
export async function getAllyByIdFromDB(id: string): Promise<CommercialAlly | null> {
  const rows = await query('SELECT * FROM aliados WHERE id = ? AND active = 1', [id]);
  if (rows.length === 0) {
    return null;
  }
  return mapDbAllyToCommercialAlly(rows[0]);
}

/**
 * Crea un nuevo aliado comercial en la base de datos.
 * @param allyData - Un objeto parcial con los datos del nuevo aliado.
 * @returns El ID del nuevo aliado creado.
 */
export async function createAllyInDB(allyData: Partial<Omit<CommercialAlly, 'id'>>) {
  const { name, loginId, categorySlug, subcategory, discountLabel, departamento, municipio, address, url, logo, whatsappNumber, whatsappTemplate, featured, email, telefono, description, loginPassword } = allyData;
  const sql = `
    INSERT INTO aliados (name, login_id, category_slug, subcategory, discount_label, departamento, municipio, address, url, logo, whatsapp_number, whatsapp_template, featured, email, telefono, description, login_password, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;
  // Nota: La contraseña debería ser un hash, no texto plano.
  const result = await execute(sql, [name, loginId, categorySlug, subcategory, discountLabel, departamento, municipio, address, url, logo, whatsappNumber, whatsappTemplate, featured, email, telefono, description, loginPassword]);
  return result.insertId;
}

/**
 * Actualiza un aliado comercial existente en la base de datos.
 * @param id - El UUID del aliado a actualizar.
 * @param allyData - Un objeto parcial con los campos a actualizar.
 * @returns El número de filas afectadas.
 */
export async function updateAllyInDB(id: string, allyData: Partial<Omit<CommercialAlly, 'id'>>) {
  const fields = Object.keys(allyData)
    .map(key => {
      // Mapear de camelCase a snake_case para la consulta SQL
      if (key === 'loginId') return 'login_id';
      if (key === 'categorySlug') return 'category_slug';
      if (key === 'discountLabel') return 'discount_label';
      if (key === 'whatsappNumber') return 'whatsapp_number';
      if (key === 'whatsappTemplate') return 'whatsapp_template';
      if (key === 'loginPassword') return 'login_password';
      return key;
    });
  
  const values = Object.values(allyData);

  if (fields.length === 0) {
    return 0;
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const sql = `UPDATE aliados SET ${setClause} WHERE id = ?`;

  const result = await execute(sql, [...values, id]);
  return result.affectedRows;
}

/**
 * Realiza una eliminación lógica de un aliado comercial (lo marca como inactivo).
 * @param id - El UUID del aliado a eliminar.
 * @returns El número de filas afectadas.
 */
export async function deleteAllyFromDB(id: string): Promise<number> {
  const sql = 'UPDATE aliados SET active = 0 WHERE id = ?';
  const result = await execute(sql, [id]);
  return result.affectedRows;
}
