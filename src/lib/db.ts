import mysql from 'mysql2/promise';

// Lee las credenciales de forma segura desde las variables de entorno
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // Habilita SSL si está configurado en las variables de entorno
  ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : undefined,
  // Otras opciones recomendadas para producción
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crea un pool de conexiones para reutilizarlas y mejorar el rendimiento
const pool = mysql.createPool(dbConfig);

/**
 * Ejecuta una consulta SQL y devuelve las filas.
 * Ideal para sentencias SELECT.
 * @param sql - La consulta SQL a ejecutar.
 * @param params - Un array de parámetros para prevenir inyección SQL.
 * @returns Una promesa que se resuelve con las filas obtenidas.
 */
export async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(sql, params);
  return rows as T[];
}

/**
 * Ejecuta una sentencia SQL que no devuelve filas (INSERT, UPDATE, DELETE).
 * @param sql - La sentencia SQL a ejecutar.
 * @param params - Un array de parámetros.
 * @returns Una promesa que se resuelve con el resultado de la ejecución.
 */
export async function execute(sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}

export default pool;
