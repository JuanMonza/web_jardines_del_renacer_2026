-- JARDINES DEL RENACER | Acceso seguro de clientes de membresía.
SET @schema_name = DATABASE();
SET @add_password_hash = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'clientes_membresia' AND COLUMN_NAME = 'password_hash') = 0,
  'ALTER TABLE clientes_membresia ADD COLUMN password_hash VARCHAR(255) NULL AFTER telefono',
  'SELECT 1'
);
PREPARE add_password_hash_stmt FROM @add_password_hash;
EXECUTE add_password_hash_stmt;
DEALLOCATE PREPARE add_password_hash_stmt;

SET @add_last_login = IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'clientes_membresia' AND COLUMN_NAME = 'ultimo_login') = 0,
  'ALTER TABLE clientes_membresia ADD COLUMN ultimo_login TIMESTAMP NULL DEFAULT NULL AFTER estado',
  'SELECT 1'
);
PREPARE add_last_login_stmt FROM @add_last_login;
EXECUTE add_last_login_stmt;
DEALLOCATE PREPARE add_last_login_stmt;

CREATE TABLE IF NOT EXISTS cliente_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cliente_id BIGINT UNSIGNED NOT NULL,
  session_token_hash CHAR(64) NOT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  expira_en TIMESTAMP NOT NULL,
  cerrada_en TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_cliente_session_token (session_token_hash),
  KEY idx_cliente_session_active (cliente_id, activa, expira_en),
  CONSTRAINT fk_cliente_session_cliente FOREIGN KEY (cliente_id) REFERENCES clientes_membresia(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
