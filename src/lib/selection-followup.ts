import { execute, query } from "@/lib/db";
let schema: Promise<void> | null = null;
export function ensureSelectionSchema() {
  return schema ??= (async () => {
    const columns = await query("SHOW COLUMNS FROM vacantes LIKE 'selection_steps'");
    if (!columns.length) await execute("ALTER TABLE vacantes ADD COLUMN selection_steps JSON NULL");
    await execute("CREATE TABLE IF NOT EXISTS application_followups (application_id BIGINT NOT NULL PRIMARY KEY, fields_json JSON NOT NULL, revision INT NOT NULL DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    await execute(`CREATE TABLE IF NOT EXISTS entrevistas (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      postulacion_id BIGINT UNSIGNED NOT NULL,candidato_id BIGINT UNSIGNED NOT NULL,vacante_id BIGINT UNSIGNED NOT NULL,
      entrevistador BIGINT UNSIGNED NULL,modalidad ENUM('Presencial','Google Meet','Microsoft Teams','Zoom','Llamada Telefónica') DEFAULT 'Presencial',
      fecha DATETIME NOT NULL,duracion INT DEFAULT 60,lugar VARCHAR(255),enlace VARCHAR(255),
      estado ENUM('Programada','Realizada','Cancelada','Reagendada') DEFAULT 'Programada',
      resultado ENUM('Pendiente','Aprobado','Rechazado') DEFAULT 'Pendiente',observaciones TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,deleted_at TIMESTAMP NULL,
      INDEX idx_entrevistas_postulacion (postulacion_id),INDEX idx_entrevistas_fecha (fecha)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  })().catch(error => { schema = null; throw error; });
}
