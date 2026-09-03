import { execute, query } from "@/lib/db";

export type WorkshopSettings = {
  workshopId: number;
  city: string;
  modality: "Presencial" | "Virtual" | "Híbrido";
  capacity: number;
  facilitator: string;
  duration: string;
  category: string;
  instructions: string;
  connectionUrl: string;
};

const defaults = (workshopId: number): WorkshopSettings => ({
  workshopId,
  city: "",
  modality: "Presencial",
  capacity: 20,
  facilitator: "",
  duration: "",
  category: "Acompañamiento en duelo",
  instructions: "",
  connectionUrl: "",
});

export async function ensureWorkshopManagementTables() {
  await execute(`CREATE TABLE IF NOT EXISTS talleres_duelo_configuracion (
    taller_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    ciudad VARCHAR(120) NOT NULL DEFAULT '', modalidad ENUM('Presencial','Virtual','Híbrido') NOT NULL DEFAULT 'Presencial',
    cupos INT UNSIGNED NOT NULL DEFAULT 20, facilitador VARCHAR(180) NOT NULL DEFAULT '', duracion VARCHAR(80) NOT NULL DEFAULT '',
    categoria VARCHAR(120) NOT NULL DEFAULT 'Acompañamiento en duelo', instrucciones TEXT NULL, url_conexion VARCHAR(500) NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_taller_config_taller FOREIGN KEY (taller_id) REFERENCES talleres_duelo(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const configurationColumns = await query<{ COLUMN_NAME: string }>(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='talleres_duelo_configuracion' AND COLUMN_NAME='url_conexion'",
  );
  if (!configurationColumns.length)
    await execute(
      "ALTER TABLE talleres_duelo_configuracion ADD COLUMN url_conexion VARCHAR(500) NOT NULL DEFAULT '' AFTER instrucciones",
    );
  await execute(`CREATE TABLE IF NOT EXISTS talleres_duelo_inscripciones (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, taller_id BIGINT UNSIGNED NOT NULL,
    nombre VARCHAR(180) NOT NULL, telefono VARCHAR(50) NOT NULL, email VARCHAR(160) NOT NULL,
    estado ENUM('CONFIRMADA','LISTA_ESPERA','CANCELADA') NOT NULL DEFAULT 'CONFIRMADA', asistencia ENUM('PENDIENTE','ASISTIÓ','NO_ASISTIÓ') NOT NULL DEFAULT 'PENDIENTE',
    observaciones VARCHAR(1000) NULL, correo_estado ENUM('PENDIENTE','ENVIADO','ERROR') NOT NULL DEFAULT 'PENDIENTE', correo_enviado_at TIMESTAMP NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_taller_email (taller_id, email), INDEX idx_taller_inscripciones (taller_id, estado),
    CONSTRAINT fk_taller_inscripcion_taller FOREIGN KEY (taller_id) REFERENCES talleres_duelo(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  const registrationColumns = await query<{ COLUMN_NAME: string }>(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='talleres_duelo_inscripciones' AND COLUMN_NAME IN ('correo_estado','correo_enviado_at')",
  );
  const registrationColumnNames = new Set(
    registrationColumns.map((column) => column.COLUMN_NAME),
  );
  if (!registrationColumnNames.has("correo_estado"))
    await execute(
      "ALTER TABLE talleres_duelo_inscripciones ADD COLUMN correo_estado ENUM('PENDIENTE','ENVIADO','ERROR') NOT NULL DEFAULT 'PENDIENTE' AFTER observaciones",
    );
  if (!registrationColumnNames.has("correo_enviado_at"))
    await execute(
      "ALTER TABLE talleres_duelo_inscripciones ADD COLUMN correo_enviado_at TIMESTAMP NULL AFTER correo_estado",
    );
  await execute(`CREATE TABLE IF NOT EXISTS talleres_duelo_activity_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, taller_id BIGINT UNSIGNED NOT NULL,
    admin_user_id BIGINT UNSIGNED NULL, accion VARCHAR(80) NOT NULL, detalle VARCHAR(1000) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_taller_auditoria (taller_id, created_at),
    CONSTRAINT fk_taller_log_taller FOREIGN KEY (taller_id) REFERENCES talleres_duelo(id) ON DELETE CASCADE,
    CONSTRAINT fk_taller_log_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
}

export async function recordWorkshopActivity(input: {
  workshopId: number;
  adminUserId?: number | null;
  action: string;
  detail?: string;
}) {
  await ensureWorkshopManagementTables();
  await execute(
    "INSERT INTO talleres_duelo_activity_logs (taller_id,admin_user_id,accion,detalle) VALUES (?,?,?,?)",
    [
      input.workshopId,
      input.adminUserId ?? null,
      input.action.slice(0, 80),
      input.detail?.slice(0, 1000) || null,
    ],
  );
}

export async function getWorkshopSettings(ids: number[]) {
  if (!ids.length) return new Map<number, WorkshopSettings>();
  await ensureWorkshopManagementTables();
  const rows = await query<{
    taller_id: number;
    ciudad: string;
    modalidad: WorkshopSettings["modality"];
    cupos: number;
    facilitador: string;
    duracion: string;
    categoria: string;
    instrucciones: string | null;
    url_conexion: string;
  }>(
    `SELECT taller_id,ciudad,modalidad,cupos,facilitador,duracion,categoria,instrucciones,url_conexion FROM talleres_duelo_configuracion WHERE taller_id IN (${ids.map(() => "?").join(",")})`,
    ids,
  );
  const result = new Map<number, WorkshopSettings>();
  rows.forEach((row) =>
    result.set(Number(row.taller_id), {
      workshopId: Number(row.taller_id),
      city: row.ciudad || "",
      modality: row.modalidad || "Presencial",
      capacity: Number(row.cupos) || 20,
      facilitator: row.facilitador || "",
      duration: row.duracion || "",
      category: row.categoria || "Acompañamiento en duelo",
      instructions: row.instrucciones || "",
      connectionUrl: row.url_conexion || "",
    }),
  );
  ids.forEach((id) => {
    if (!result.has(id)) result.set(id, defaults(id));
  });
  return result;
}

export async function saveWorkshopSettings(settings: WorkshopSettings) {
  await ensureWorkshopManagementTables();
  await execute(
    `INSERT INTO talleres_duelo_configuracion (taller_id,ciudad,modalidad,cupos,facilitador,duracion,categoria,instrucciones,url_conexion) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ciudad=VALUES(ciudad),modalidad=VALUES(modalidad),cupos=VALUES(cupos),facilitador=VALUES(facilitador),duracion=VALUES(duracion),categoria=VALUES(categoria),instrucciones=VALUES(instrucciones),url_conexion=VALUES(url_conexion)`,
    [
      settings.workshopId,
      settings.city,
      settings.modality,
      settings.capacity,
      settings.facilitator,
      settings.duration,
      settings.category,
      settings.instructions,
      settings.connectionUrl,
    ],
  );
}
