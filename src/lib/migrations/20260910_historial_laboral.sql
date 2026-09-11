CREATE TABLE IF NOT EXISTS historical_candidates (
  identity_key CHAR(64) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  documento VARCHAR(30),
  correo VARCHAR(255),
  telefono VARCHAR(60),
  ciudad VARCHAR(120),
  departamento VARCHAR(120),
  first_seen DATE NULL,
  last_seen DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_historical_documento (documento),
  INDEX idx_historical_nombre (nombre),
  INDEX idx_historical_ciudad (ciudad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS historical_candidate_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_key CHAR(64) NOT NULL UNIQUE,
  identity_key CHAR(64) NOT NULL,
  fecha DATE NULL,
  vacante VARCHAR(255),
  estado VARCHAR(80),
  origen VARCHAR(160),
  entrevistadores VARCHAR(255),
  observaciones LONGTEXT,
  evaluacion LONGTEXT,
  motivo_descarte TEXT,
  licencia_runt TEXT,
  hoja_origen VARCHAR(120) NOT NULL,
  fila_origen INT NOT NULL,
  imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_historical_identity (identity_key),
  INDEX idx_historical_fecha (fecha),
  INDEX idx_historical_estado (estado),
  CONSTRAINT fk_historical_movement_candidate
    FOREIGN KEY (identity_key) REFERENCES historical_candidates(identity_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
