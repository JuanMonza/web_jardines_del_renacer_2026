-- Base completa del módulo de Cotizaciones para instalaciones que aún no tienen
-- la tabla `cotizaciones`. Ejecutar en lugar de 20260820_cotizaciones_follow_up.sql.

CREATE TABLE IF NOT EXISTS cotizaciones (
  id CHAR(36) NOT NULL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  apellido VARCHAR(150) NOT NULL DEFAULT '',
  telefono VARCHAR(30) NOT NULL,
  ciudad VARCHAR(80) NOT NULL,
  email VARCHAR(150) NULL,
  cargo VARCHAR(120) NULL,
  plan_id VARCHAR(60) NOT NULL,
  plan_nombre VARCHAR(120) NULL,
  cobertura ENUM('individual','familiar','segmentado','especial','corporativo','independiente') NOT NULL,
  num_beneficiarios TINYINT UNSIGNED NOT NULL DEFAULT 1,
  contacto_preferido ENUM('WhatsApp','Llamada') NOT NULL DEFAULT 'WhatsApp',
  hora_contacto CHAR(5) NULL,
  estado ENUM('nuevo','contactado','en_negociacion','convertido','descartado') NOT NULL DEFAULT 'nuevo',
  notas_asesor TEXT NULL,
  motivo_perdida VARCHAR(200) NULL,
  proximo_contacto DATETIME NULL,
  asesor_id BIGINT UNSIGNED NULL,
  primer_contacto_en TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cotizaciones_estado (estado),
  INDEX idx_cotizaciones_plan (plan_id),
  INDEX idx_cotizaciones_ciudad (ciudad),
  INDEX idx_cotizaciones_proximo_contacto (proximo_contacto),
  INDEX idx_cotizaciones_asesor_estado (asesor_id, estado),
  CONSTRAINT fk_cotizaciones_asesor FOREIGN KEY (asesor_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cotizacion_historial (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id CHAR(36) NOT NULL,
  admin_user_id BIGINT UNSIGNED NULL,
  tipo ENUM('creada','estado','nota','asignacion','seguimiento') NOT NULL,
  detalle VARCHAR(500) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cotizacion_fecha (cotizacion_id, creado_en),
  CONSTRAINT fk_historial_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_asesor FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cotizacion_notificaciones (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  cotizacion_id CHAR(36) NULL,
  tipo ENUM('nueva_cotizacion','seguimiento_hoy','seguimiento_vencido') NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  leida_en TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notificacion_usuario (admin_user_id, leida_en, creado_en),
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificacion_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO permissions (modulo, codigo, nombre, descripcion, accion, es_sistema, activo)
VALUES ('COTIZACIONES', 'quotes.view.all', 'Ver todas las cotizaciones', 'Consultar y asignar cotizaciones de todo el equipo.', 'VIEW', TRUE, TRUE)
ON DUPLICATE KEY UPDATE activo = TRUE, deleted_at = NULL;

INSERT INTO roles (nombre, descripcion, prioridad, es_sistema, activo)
VALUES
  ('Coordinador de Cotizaciones', 'Supervisa, asigna y consulta todas las cotizaciones.', 35, TRUE, TRUE),
  ('Gestor de Cotizaciones', 'Gestiona únicamente las cotizaciones que le sean asignadas.', 45, TRUE, TRUE)
ON DUPLICATE KEY UPDATE activo = TRUE, deleted_at = NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permissions p ON p.codigo IN ('quotes.view', 'quotes.update', 'quotes.view.all')
WHERE r.nombre = 'Coordinador de Cotizaciones';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permissions p ON p.codigo IN ('quotes.view', 'quotes.update')
WHERE r.nombre = 'Gestor de Cotizaciones';
