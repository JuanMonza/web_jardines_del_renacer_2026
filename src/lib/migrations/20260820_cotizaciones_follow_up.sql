-- Aplicar una sola vez en instalaciones MySQL anteriores a 8.0.29.
ALTER TABLE cotizaciones ADD COLUMN proximo_contacto DATETIME NULL AFTER notas_asesor;
ALTER TABLE cotizaciones ADD COLUMN apellido VARCHAR(150) NOT NULL DEFAULT '' AFTER nombre;
ALTER TABLE cotizaciones ADD COLUMN hora_contacto CHAR(5) NULL AFTER contacto_preferido;
ALTER TABLE cotizaciones ADD COLUMN primer_contacto_en TIMESTAMP NULL AFTER asesor_id;
ALTER TABLE admin_users ADD COLUMN cargo VARCHAR(120) NULL AFTER email;
CREATE INDEX idx_proximo_contacto ON cotizaciones (proximo_contacto);

-- Historial, alertas y operación comercial del centro de cotizaciones.
ALTER TABLE cotizaciones ADD COLUMN motivo_perdida VARCHAR(200) NULL AFTER notas_asesor;
CREATE INDEX idx_asesor_estado ON cotizaciones (asesor_id, estado);

CREATE TABLE cotizacion_historial (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id CHAR(36) NOT NULL,
  admin_user_id INT NULL,
  tipo ENUM('creada','estado','nota','asignacion','seguimiento') NOT NULL,
  detalle VARCHAR(500) NOT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cotizacion_fecha (cotizacion_id, creado_en),
  CONSTRAINT fk_historial_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_asesor FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE TABLE cotizacion_notificaciones (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL,
  cotizacion_id CHAR(36) NULL,
  tipo ENUM('nueva_cotizacion','seguimiento_hoy','seguimiento_vencido') NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  leida_en TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notificacion_usuario (admin_user_id, leida_en, creado_en),
  CONSTRAINT fk_notificacion_usuario FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notificacion_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE
);

INSERT INTO permissions (modulo, codigo, nombre, descripcion, accion, es_sistema, activo)
VALUES ('COTIZACIONES', 'quotes.view.all', 'Ver todas las cotizaciones', 'Consultar y asignar cotizaciones de todo el equipo.', 'VIEW', TRUE, TRUE)
ON DUPLICATE KEY UPDATE activo = TRUE, deleted_at = NULL;

INSERT INTO roles (nombre, descripcion, prioridad, es_sistema, activo)
VALUES ('Coordinador de Cotizaciones', 'Supervisa, asigna y consulta todas las cotizaciones.', 35, TRUE, TRUE)
ON DUPLICATE KEY UPDATE activo = TRUE, deleted_at = NULL;

INSERT INTO roles (nombre, descripcion, prioridad, es_sistema, activo)
VALUES ('Gestor de Cotizaciones', 'Gestiona únicamente las cotizaciones que le sean asignadas.', 45, TRUE, TRUE)
ON DUPLICATE KEY UPDATE activo = TRUE, deleted_at = NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r INNER JOIN permissions p ON p.codigo IN ('quotes.view', 'quotes.update', 'quotes.view.all')
WHERE r.nombre = 'Coordinador de Cotizaciones';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r INNER JOIN permissions p ON p.codigo IN ('quotes.view', 'quotes.update')
WHERE r.nombre = 'Gestor de Cotizaciones';
