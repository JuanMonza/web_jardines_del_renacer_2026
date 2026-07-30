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
type AllyRow = {
  id: number; name: string; login_id: string | null; category_slug: string | null; subcategory: string | null;
  discount_label: string | null; departamento: string | null; municipio: string | null; address: string | null;
  url: string | null; logo: string | null; whatsapp_number: string | null; whatsapp_template: string | null;
  featured: number; email: string | null; telefono: string | null; description: string | null;
  created_at: Date;
};

export type AllyAccessStatus = {
  allyId: string;
  accountConfigured: boolean;
  accessActive: boolean;
  lockedUntil: string | null;
  lastLogin: string | null;
};

export type AllyActivityEntry = {
  id: string;
  allyId: string;
  allyName: string;
  actorType: 'ALLY' | 'ADMIN' | 'SYSTEM';
  eventType: string;
  createdAt: string;
};

const ALLY_COLUMNS = `id, name, login_id, category_slug, subcategory, discount_label, departamento, municipio,
  address, url, logo, whatsapp_number, whatsapp_template, featured, email, telefono, description, created_at`;

function mapDbAllyToCommercialAlly(dbAlly: AllyRow): CommercialAlly | null {
  if (!dbAlly || !dbAlly.id || !dbAlly.name) {
    return null;
  }

  return {
    id: String(dbAlly.id),
    name: dbAlly.name,
    loginId: dbAlly.login_id ?? undefined,
    categorySlug: dbAlly.category_slug ?? 'general',
    subcategory: dbAlly.subcategory ?? '',
    discountLabel: dbAlly.discount_label ?? 'Beneficio sujeto a condiciones',
    departamento: resolveAllyDepartment(dbAlly.departamento ?? undefined),
    municipio: dbAlly.municipio ?? '',
    address: dbAlly.address ?? '',
    email: dbAlly.email ?? undefined,
    telefono: dbAlly.telefono ?? undefined,
    url: dbAlly.url ?? undefined,
    logo: dbAlly.logo ?? '',
    whatsappNumber: dbAlly.whatsapp_number ?? '',
    whatsappTemplate: dbAlly.whatsapp_template ?? '',
    featured: Boolean(dbAlly.featured),
    description: dbAlly.description ?? undefined,
    createdAt: new Date(dbAlly.created_at).toISOString(),
    updatedAt: new Date(dbAlly.created_at).toISOString(),
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
  const rows = await query<AllyRow>(`SELECT ${ALLY_COLUMNS} FROM aliados WHERE active = 1 ORDER BY featured DESC, name ASC`);
  return rows.map(mapDbAllyToCommercialAlly).filter(Boolean) as CommercialAlly[];
}

/** Estado de acceso para el panel administrativo. Nunca se expone en el catálogo público. */
export async function getAllyAccessStatusesFromDB(): Promise<AllyAccessStatus[]> {
  const rows = await query<{
    ally_id: number;
    account_id: number | null;
    activo: number | null;
    bloqueado_hasta: Date | null;
    ultimo_login: Date | null;
  }>(`SELECT a.id AS ally_id, aa.id AS account_id, aa.activo, aa.bloqueado_hasta, aa.ultimo_login
      FROM aliados a
      LEFT JOIN ally_accounts aa ON aa.aliado_id = a.id
      WHERE a.active = 1`);

  return rows.map((row) => ({
    allyId: String(row.ally_id),
    accountConfigured: Boolean(row.account_id),
    accessActive: Boolean(row.activo),
    lockedUntil: row.bloqueado_hasta ? new Date(row.bloqueado_hasta).toISOString() : null,
    lastLogin: row.ultimo_login ? new Date(row.ultimo_login).toISOString() : null,
  }));
}

/** Bitácora resumida, sin detalles sensibles, para el tablero administrativo. */
export async function getRecentAllyActivityFromDB(limit = 12): Promise<AllyActivityEntry[]> {
  const rows = await query<{
    id: number;
    ally_id: number;
    ally_name: string;
    actor_type: 'ALLY' | 'ADMIN' | 'SYSTEM';
    event_type: string;
    created_at: Date;
  }>(`SELECT l.id, l.aliado_id AS ally_id, a.name AS ally_name, l.actor_type, l.event_type, l.created_at
      FROM ally_activity_logs l
      INNER JOIN aliados a ON a.id = l.aliado_id
      ORDER BY l.created_at DESC
      LIMIT ?`, [Math.min(Math.max(limit, 1), 50)]);

  return rows.map((row) => ({
    id: String(row.id),
    allyId: String(row.ally_id),
    allyName: row.ally_name,
    actorType: row.actor_type,
    eventType: row.event_type,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

/**
 * Busca y devuelve un solo aliado comercial por su ID.
 * @param id - El UUID del aliado a buscar.
 * @returns Una promesa que se resuelve en el objeto `CommercialAlly` o `null` si no se encuentra.
 */
export async function getAllyByIdFromDB(id: string): Promise<CommercialAlly | null> {
  const rows = await query<AllyRow>(`SELECT ${ALLY_COLUMNS} FROM aliados WHERE id = ? AND active = 1`, [id]);
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
  const { name, loginId, categorySlug, subcategory, discountLabel, departamento, municipio, address, url, logo, whatsappNumber, whatsappTemplate, featured, email, telefono, description } = allyData;
  const sql = `
    INSERT INTO aliados (name, login_id, category_slug, subcategory, discount_label, departamento, municipio, address, url, logo, whatsapp_number, whatsapp_template, featured, email, telefono, description, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `;
  await execute(sql, [name, loginId, categorySlug, subcategory, discountLabel, departamento, municipio, address, url, logo, whatsappNumber, whatsappTemplate, featured, email, telefono, description]);
  const rows = await query<AllyRow>(`SELECT ${ALLY_COLUMNS} FROM aliados WHERE login_id = ? LIMIT 1`, [loginId]);
  return rows[0] ? mapDbAllyToCommercialAlly(rows[0]) : null;
}

/**
 * Actualiza un aliado comercial existente en la base de datos.
 * @param id - El identificador numérico del aliado a actualizar.
 * @param allyData - Un objeto parcial con los campos a actualizar.
 * @returns El número de filas afectadas.
 */
export async function updateAllyInDB(id: string, allyData: Record<string, unknown>) {
  // Lista explícita: evita que datos de presentación o claves no previstas formen parte del UPDATE.
  const columnByField: Record<string, string> = {
    name: 'name',
    loginId: 'login_id',
    categorySlug: 'category_slug',
    subcategory: 'subcategory',
    discountLabel: 'discount_label',
    departamento: 'departamento',
    municipio: 'municipio',
    address: 'address',
    url: 'url',
    logo: 'logo',
    whatsappNumber: 'whatsapp_number',
    whatsappTemplate: 'whatsapp_template',
    featured: 'featured',
    email: 'email',
    telefono: 'telefono',
    description: 'description',
  };
  const entries = Object.entries(allyData)
    .filter(([field, value]) => columnByField[field] && value !== undefined);
  const fields = entries.map(([field]) => columnByField[field]);

  // mysql2 no permite parámetros undefined; los campos opcionales vacíos se almacenan como NULL.
  const values = entries.map(([, value]) => value ?? null);

  if (fields.length === 0) {
    return 0;
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const sql = `UPDATE aliados SET ${setClause} WHERE id = ? AND active = 1`;

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
