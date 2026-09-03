-- Talleres de duelo y sorteos: persistencia e IAM empresarial.
-- Ejecutar una vez en jardinesweb, después de las migraciones core.

CREATE TABLE IF NOT EXISTS talleres_duelo (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(180) NOT NULL,
  fecha_label VARCHAR(100) NOT NULL,
  fecha DATE NULL,
  lugar VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  imagen LONGTEXT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  INDEX idx_talleres_publicados (activo, fecha, deleted_at),
  CONSTRAINT fk_talleres_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_talleres_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS talleres_duelo_albumes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  taller_id BIGINT UNSIGNED NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  fecha_label VARCHAR(100) NOT NULL,
  fecha DATE NULL,
  descripcion TEXT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  INDEX idx_albumes_taller (taller_id, activo, deleted_at),
  CONSTRAINT fk_albumes_taller FOREIGN KEY (taller_id) REFERENCES talleres_duelo(id) ON DELETE CASCADE,
  CONSTRAINT fk_albumes_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_albumes_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS talleres_duelo_imagenes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  album_id BIGINT UNSIGNED NOT NULL,
  imagen LONGTEXT NOT NULL,
  alt VARCHAR(180) NOT NULL,
  descripcion VARCHAR(280) NULL,
  orden INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_imagenes_album (album_id, orden),
  CONSTRAINT fk_imagenes_album FOREIGN KEY (album_id) REFERENCES talleres_duelo_albumes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Operación de talleres: filtros públicos, cupos, inscripciones y trazabilidad.
CREATE TABLE IF NOT EXISTS talleres_duelo_configuracion (
  taller_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  ciudad VARCHAR(120) NOT NULL DEFAULT '',
  modalidad ENUM('Presencial','Virtual','Híbrido') NOT NULL DEFAULT 'Presencial',
  cupos INT UNSIGNED NOT NULL DEFAULT 20,
  facilitador VARCHAR(180) NOT NULL DEFAULT '',
  duracion VARCHAR(80) NOT NULL DEFAULT '',
  categoria VARCHAR(120) NOT NULL DEFAULT 'Acompañamiento en duelo',
  instrucciones TEXT NULL,
  url_conexion VARCHAR(500) NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_taller_config_taller FOREIGN KEY (taller_id) REFERENCES talleres_duelo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS talleres_duelo_inscripciones (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  nombre VARCHAR(180) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  email VARCHAR(160) NOT NULL,
  estado ENUM('CONFIRMADA','LISTA_ESPERA','CANCELADA') NOT NULL DEFAULT 'CONFIRMADA',
  asistencia ENUM('PENDIENTE','ASISTIÓ','NO_ASISTIÓ') NOT NULL DEFAULT 'PENDIENTE',
  observaciones VARCHAR(1000) NULL,
  correo_estado ENUM('PENDIENTE','ENVIADO','ERROR') NOT NULL DEFAULT 'PENDIENTE',
  correo_enviado_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_taller_email (taller_id, email),
  INDEX idx_taller_inscripciones (taller_id, estado),
  CONSTRAINT fk_taller_inscripcion_taller FOREIGN KEY (taller_id) REFERENCES talleres_duelo(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS talleres_duelo_activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  taller_id BIGINT UNSIGNED NOT NULL,
  admin_user_id BIGINT UNSIGNED NULL,
  accion VARCHAR(80) NOT NULL,
  detalle VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_taller_auditoria (taller_id, created_at),
  CONSTRAINT fk_taller_log_taller FOREIGN KEY (taller_id) REFERENCES talleres_duelo(id) ON DELETE CASCADE,
  CONSTRAINT fk_taller_log_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sorteos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  titulo VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  fecha_sorteo DATETIME NOT NULL,
  premio VARCHAR(180) NULL,
  imagen LONGTEXT NULL,
  estado ENUM('BORRADOR','PROGRAMADO','CERRADO','PUBLICADO','CANCELADO') NOT NULL DEFAULT 'BORRADOR',
  terminos_url VARCHAR(255) NULL,
  created_by BIGINT UNSIGNED NULL,
  updated_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  PRIMARY KEY (id),
  INDEX idx_sorteos_publicos (estado, fecha_sorteo, deleted_at),
  CONSTRAINT fk_sorteos_created_by FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_sorteos_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sorteo_participantes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sorteo_id BIGINT UNSIGNED NOT NULL,
  numero_contrato VARCHAR(80) NOT NULL,
  nombre VARCHAR(180) NOT NULL,
  documento VARCHAR(40) NULL,
  telefono VARCHAR(50) NULL,
  email VARCHAR(160) NULL,
  habilitado BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sorteo_contrato (sorteo_id, numero_contrato),
  INDEX idx_participantes_habilitados (sorteo_id, habilitado),
  CONSTRAINT fk_participantes_sorteo FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sorteo_ganadores (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sorteo_id BIGINT UNSIGNED NOT NULL,
  participante_id BIGINT UNSIGNED NOT NULL,
  posicion TINYINT UNSIGNED NOT NULL DEFAULT 1,
  seleccionado_por BIGINT UNSIGNED NULL,
  seleccionado_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  validado BOOLEAN NOT NULL DEFAULT FALSE,
  validado_por BIGINT UNSIGNED NULL,
  validado_at TIMESTAMP NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_sorteo_posicion (sorteo_id, posicion),
  CONSTRAINT fk_ganadores_sorteo FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
  CONSTRAINT fk_ganadores_participante FOREIGN KEY (participante_id) REFERENCES sorteo_participantes(id) ON DELETE RESTRICT,
  CONSTRAINT fk_ganadores_seleccionado_por FOREIGN KEY (seleccionado_por) REFERENCES admin_users(id) ON DELETE SET NULL,
  CONSTRAINT fk_ganadores_validado_por FOREIGN KEY (validado_por) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sorteo_activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sorteo_id BIGINT UNSIGNED NOT NULL,
  admin_user_id BIGINT UNSIGNED NULL,
  accion VARCHAR(80) NOT NULL,
  detalle TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_sorteo_auditoria (sorteo_id, created_at),
  CONSTRAINT fk_sorteo_log_sorteo FOREIGN KEY (sorteo_id) REFERENCES sorteos(id) ON DELETE CASCADE,
  CONSTRAINT fk_sorteo_log_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contenido inicial: conserva la programación que ya estaba publicada.
INSERT INTO talleres_duelo (titulo, fecha_label, fecha, lugar, activo)
SELECT 'Taller de duelo "Día del Padre"', '25 DE JUNIO', '2026-06-25', 'Parque Conmemorativo Espiritual', TRUE
WHERE NOT EXISTS (SELECT 1 FROM talleres_duelo WHERE titulo = 'Taller de duelo "Día del Padre"' AND deleted_at IS NULL);
INSERT INTO talleres_duelo (titulo, fecha_label, fecha, lugar, activo)
SELECT 'Taller de duelo "Aún estás en mi corazón"', '28 DE JULIO', '2026-07-28', 'Sede Calarcá', TRUE
WHERE NOT EXISTS (SELECT 1 FROM talleres_duelo WHERE titulo = 'Taller de duelo "Aún estás en mi corazón"' AND deleted_at IS NULL);
INSERT INTO talleres_duelo (titulo, fecha_label, fecha, lugar, activo)
SELECT 'Taller de duelo "Cometa - Globo"', '15 DE AGOSTO', '2026-08-15', 'Parque Conmemorativo Espiritual', TRUE
WHERE NOT EXISTS (SELECT 1 FROM talleres_duelo WHERE titulo = 'Taller de duelo "Cometa - Globo"' AND deleted_at IS NULL);
INSERT INTO talleres_duelo (titulo, fecha_label, fecha, lugar, activo)
SELECT 'Taller de duelo "Origami"', '20 DE SEPTIEMBRE', '2026-09-20', 'Día de Amor y Amistad', TRUE
WHERE NOT EXISTS (SELECT 1 FROM talleres_duelo WHERE titulo = 'Taller de duelo "Origami"' AND deleted_at IS NULL);
INSERT INTO talleres_duelo (titulo, fecha_label, fecha, lugar, activo)
SELECT 'Taller de duelo por pérdida perinatal o gestacional', '31 DE OCTUBRE', '2026-10-31', 'Parque Conmemorativo', FALSE
WHERE NOT EXISTS (SELECT 1 FROM talleres_duelo WHERE titulo = 'Taller de duelo por pérdida perinatal o gestacional' AND deleted_at IS NULL);
INSERT INTO talleres_duelo (titulo, fecha_label, fecha, lugar, activo)
SELECT 'Taller de duelo por pérdida de mascota', '18 DE NOVIEMBRE', '2026-11-18', 'Medellín', FALSE
WHERE NOT EXISTS (SELECT 1 FROM talleres_duelo WHERE titulo = 'Taller de duelo por pérdida de mascota' AND deleted_at IS NULL);
INSERT INTO talleres_duelo (titulo, fecha_label, fecha, lugar, activo)
SELECT 'Taller de duelo en fechas especiales (Navidad)', '12 DE DICIEMBRE', '2026-12-12', 'Parque Conmemorativo Espiritual', FALSE
WHERE NOT EXISTS (SELECT 1 FROM talleres_duelo WHERE titulo = 'Taller de duelo en fechas especiales (Navidad)' AND deleted_at IS NULL);

INSERT INTO sorteos (titulo, descripcion, fecha_sorteo, premio, imagen, estado)
SELECT 'Bono de Mercado de $200.000', 'Sorteo especial del Día de la Madre.', '2026-05-20 19:00:00', 'Bono de mercado', '/images/sorteos_img/ecooter-e5lite-blanci-2.jpg', 'PUBLICADO'
WHERE NOT EXISTS (SELECT 1 FROM sorteos WHERE titulo = 'Bono de Mercado de $200.000' AND deleted_at IS NULL);
INSERT INTO sorteos (titulo, descripcion, fecha_sorteo, premio, imagen, estado)
SELECT 'Freidora de Aire (Air Fryer)', 'Celebra el Día del Padre con este increíble premio.', '2026-06-18 19:00:00', 'Freidora de aire', '/images/sorteos_img/Pixel10_001.webp', 'PUBLICADO'
WHERE NOT EXISTS (SELECT 1 FROM sorteos WHERE titulo = 'Freidora de Aire (Air Fryer)' AND deleted_at IS NULL);
INSERT INTO sorteos (titulo, descripcion, fecha_sorteo, premio, imagen, estado)
SELECT '¡Cambiamos tu celular!', 'Actualiza tus datos y participa.', '2026-08-18 19:00:00', 'Teléfono celular', '/images/sorteos_img/Pixel10_001.webp', 'PROGRAMADO'
WHERE NOT EXISTS (SELECT 1 FROM sorteos WHERE titulo = '¡Cambiamos tu celular!' AND deleted_at IS NULL);
INSERT INTO sorteos (titulo, descripcion, fecha_sorteo, premio, imagen, estado)
SELECT '¡Celebramos el Amor y la Amistad!', 'Celebra con un bono de regalo.', '2026-09-16 19:00:00', 'Bono de regalo', '/images/sorteos_img/stocksnap-people-2587249_1280.jpg', 'PROGRAMADO'
WHERE NOT EXISTS (SELECT 1 FROM sorteos WHERE titulo = '¡Celebramos el Amor y la Amistad!' AND deleted_at IS NULL);
INSERT INTO sorteos (titulo, descripcion, fecha_sorteo, premio, imagen, estado)
SELECT '¡El Tiempo y la Música ahora son tuyos!', 'Participa en nuestro sorteo de aniversario.', '2026-10-16 19:00:00', 'Premio sorpresa', '/images/sorteos_img/F9negroZL02negro_800x.webp', 'PROGRAMADO'
WHERE NOT EXISTS (SELECT 1 FROM sorteos WHERE titulo = '¡El Tiempo y la Música ahora son tuyos!' AND deleted_at IS NULL);

INSERT INTO permissions (modulo, codigo, nombre, descripcion, accion, es_sistema, activo)
VALUES
  ('DASHBOARD', 'dashboard.talleres.view', 'Acceder al panel de talleres', 'Acceso al panel administrativo de talleres de duelo.', 'VIEW', TRUE, TRUE),
  ('TALLERES', 'workshops.view', 'Consultar talleres', 'Consultar talleres, álbumes e imágenes.', 'VIEW', TRUE, TRUE),
  ('TALLERES', 'workshops.create', 'Crear talleres', 'Crear talleres y álbumes de duelo.', 'CREATE', TRUE, TRUE),
  ('TALLERES', 'workshops.update', 'Actualizar talleres', 'Editar talleres, galerías e imágenes.', 'UPDATE', TRUE, TRUE),
  ('TALLERES', 'workshops.delete', 'Desactivar talleres', 'Desactivar talleres y álbumes.', 'DELETE', TRUE, TRUE),
  ('DASHBOARD', 'dashboard.sorteos.view', 'Acceder al panel de sorteos', 'Acceso al panel administrativo de sorteos.', 'VIEW', TRUE, TRUE),
  ('SORTEOS', 'giveaways.view', 'Consultar sorteos', 'Consultar sorteos, participantes y ganadores.', 'VIEW', TRUE, TRUE),
  ('SORTEOS', 'giveaways.create', 'Crear sorteos', 'Crear sorteos y cargar participantes habilitados.', 'CREATE', TRUE, TRUE),
  ('SORTEOS', 'giveaways.update', 'Gestionar sorteos', 'Actualizar sorteos y validar ganadores.', 'UPDATE', TRUE, TRUE),
  ('SORTEOS', 'giveaways.draw', 'Ejecutar selección aleatoria', 'Seleccionar ganadores de forma aleatoria y auditable.', 'UPDATE', TRUE, TRUE),
  ('SORTEOS', 'giveaways.delete', 'Cancelar sorteos', 'Cancelar o retirar sorteos.', 'DELETE', TRUE, TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), activo = TRUE, deleted_at = NULL;

INSERT INTO roles (nombre, descripcion, prioridad, es_sistema, activo)
VALUES
  ('Administrador de Talleres', 'Gestión exclusiva de talleres de duelo, álbumes e imágenes.', 40, TRUE, TRUE),
  ('Administrador de Sorteos', 'Gestión exclusiva de sorteos, participantes y ganadores.', 40, TRUE, TRUE)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), prioridad = VALUES(prioridad), activo = TRUE, deleted_at = NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r INNER JOIN permissions p ON p.codigo IN
('dashboard.talleres.view','workshops.view','workshops.create','workshops.update','workshops.delete')
WHERE r.nombre = 'Administrador de Talleres';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r INNER JOIN permissions p ON p.codigo IN
('dashboard.sorteos.view','giveaways.view','giveaways.create','giveaways.update','giveaways.draw','giveaways.delete')
WHERE r.nombre = 'Administrador de Sorteos';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r INNER JOIN permissions p ON p.codigo IN
('dashboard.talleres.view','workshops.view','dashboard.sorteos.view','giveaways.view')
WHERE r.nombre = 'Administrador General';
