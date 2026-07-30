-- Cuentas y sesiones seguras para el portal de aliados.
CREATE TABLE IF NOT EXISTS ally_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  aliado_id BIGINT UNSIGNED NOT NULL,
  login_id VARCHAR(40) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  intentos_fallidos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  bloqueado_hasta DATETIME DEFAULT NULL,
  ultimo_login DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ally_accounts_aliado (aliado_id),
  UNIQUE KEY uk_ally_accounts_login (login_id),
  CONSTRAINT fk_ally_accounts_aliado FOREIGN KEY (aliado_id) REFERENCES aliados(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ally_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ally_account_id BIGINT UNSIGNED NOT NULL,
  session_token_hash CHAR(64) NOT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  activa BOOLEAN NOT NULL DEFAULT TRUE,
  expira_en DATETIME NOT NULL,
  cerrada_en DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ally_sessions_token (session_token_hash),
  KEY idx_ally_sessions_account_active (ally_account_id, activa, expira_en),
  CONSTRAINT fk_ally_sessions_account FOREIGN KEY (ally_account_id) REFERENCES ally_accounts(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE codigos_descuento
  ADD COLUMN canjeado_por_cuenta_id BIGINT UNSIGNED DEFAULT NULL,
  ADD KEY idx_codigos_cuenta_canje (canjeado_por_cuenta_id, canjeado_en),
  ADD CONSTRAINT fk_codigos_cuenta_canje FOREIGN KEY (canjeado_por_cuenta_id) REFERENCES ally_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;
