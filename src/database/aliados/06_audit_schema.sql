-- JARDINES DEL RENACER | Auditoría de aliados
-- Historial inmutable de operaciones ejecutadas por aliados y administradores.
CREATE TABLE IF NOT EXISTS ally_activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  aliado_id BIGINT UNSIGNED NOT NULL,
  ally_account_id BIGINT UNSIGNED DEFAULT NULL,
  admin_user_id BIGINT UNSIGNED DEFAULT NULL,
  actor_type ENUM('ALLY', 'ADMIN', 'SYSTEM') NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id CHAR(36) DEFAULT NULL,
  details JSON DEFAULT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ally_activity_ally_date (aliado_id, created_at),
  KEY idx_ally_activity_event_date (event_type, created_at),
  CONSTRAINT fk_ally_activity_ally FOREIGN KEY (aliado_id) REFERENCES aliados(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_ally_activity_account FOREIGN KEY (ally_account_id) REFERENCES ally_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_ally_activity_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
