-- Jardines del Renacer 2026
-- Migracion: Portal de Postulantes - cuentas de candidatos
-- Ejecutar sobre la base configurada por variables de entorno.

CREATE TABLE IF NOT EXISTS candidatos (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  documento VARCHAR(15) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  email VARCHAR(150) NOT NULL,
  telefono VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  foto TEXT,
  fecha_nacimiento DATE,
  direccion VARCHAR(200),
  ciudad VARCHAR(80),
  departamento VARCHAR(80),
  profesion VARCHAR(150),
  experiencia TEXT,
  educacion TEXT,
  linkedin TEXT,
  portfolio TEXT,
  cv_url TEXT,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_login TIMESTAMP NULL,
  reset_token_hash VARCHAR(255),
  reset_expires_at TIMESTAMP NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_candidatos_documento UNIQUE (documento),
  CONSTRAINT uq_candidatos_email UNIQUE (email),
  INDEX idx_candidatos_email (email),
  INDEX idx_candidatos_documento (documento),
  INDEX idx_candidatos_activo (activo),
  INDEX idx_candidatos_deleted_at (deleted_at),
  INDEX idx_candidatos_ciudad_departamento (ciudad, departamento)
);

SET @has_candidato_id := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'postulaciones'
    AND COLUMN_NAME = 'candidato_id'
);

SET @sql := IF(
  @has_candidato_id = 0,
  'ALTER TABLE postulaciones ADD COLUMN candidato_id CHAR(36) NULL AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_candidato_index := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'postulaciones'
    AND INDEX_NAME = 'idx_postulaciones_candidato_id'
);

SET @sql := IF(
  @has_candidato_index = 0,
  'ALTER TABLE postulaciones ADD INDEX idx_postulaciones_candidato_id (candidato_id)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_candidato_fk := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'postulaciones'
    AND CONSTRAINT_NAME = 'fk_postulaciones_candidato'
);

SET @sql := IF(
  @has_candidato_fk = 0,
  'ALTER TABLE postulaciones ADD CONSTRAINT fk_postulaciones_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON UPDATE CASCADE ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE postulaciones p
INNER JOIN candidatos c
  ON c.documento = p.candidate_document
SET p.candidato_id = c.id
WHERE p.candidato_id IS NULL;
