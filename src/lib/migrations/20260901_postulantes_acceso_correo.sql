-- Acceso sin contraseña para postulantes mediante código temporal enviado por SMTP.
-- Ejecutar una vez sobre la base de datos configurada en el VPS.

CREATE TABLE IF NOT EXISTS postulante_access_codes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(150) NOT NULL,
  code_hash CHAR(64) NOT NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_postulante_access_codes_lookup (email, used_at, expires_at),
  INDEX idx_postulante_access_codes_created_at (created_at)
);

