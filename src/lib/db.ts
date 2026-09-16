import mysql from "mysql2/promise";
import { isTrainingEnvironment } from "@/lib/training-environment";

const trainingMode = isTrainingEnvironment();
const databasePrefix = trainingMode ? "TRAINING_DB_" : "DB_";
const environmentValue = (name: "HOST" | "PORT" | "USER" | "PASSWORD" | "DATABASE" | "SSL") =>
  process.env[`${databasePrefix}${name}`];

if (trainingMode) {
  const required = ["HOST", "USER", "PASSWORD", "DATABASE"] as const;
  const missing = required.filter((name) => !environmentValue(name));
  if (missing.length) throw new Error(`Faltan variables de la base de capacitación: ${missing.map((name) => `TRAINING_DB_${name}`).join(", ")}.`);
  if (environmentValue("DATABASE") === process.env.DB_DATABASE) {
    throw new Error("La base de capacitación debe ser diferente de DB_DATABASE.");
  }
}

// En capacitación solo se aceptan credenciales de una base separada.
const dbConfig = {
  host: environmentValue("HOST"),
  port: Number(environmentValue("PORT") || 3306),
  user: environmentValue("USER"),
  password: environmentValue("PASSWORD"),
  database: environmentValue("DATABASE"),
  charset: "utf8mb4",
  // Habilita SSL si está configurado en las variables de entorno
  ssl: environmentValue("SSL") ? JSON.parse(environmentValue("SSL")!) : undefined,
  // Otras opciones recomendadas para producción
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Crea un pool de conexiones para reutilizarlas y mejorar el rendimiento
const globalDatabase = globalThis as typeof globalThis & {
  __jdrMysqlPool?: mysql.Pool;
};
const pool = globalDatabase.__jdrMysqlPool ?? mysql.createPool(dbConfig);
if (process.env.NODE_ENV !== "production") globalDatabase.__jdrMysqlPool = pool;

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
export async function execute(
  sql: string,
  params: any[] = [],
): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(sql, params);
  return result;
}

export default pool;
