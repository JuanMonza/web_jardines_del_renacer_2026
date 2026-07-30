CREATE TABLE IF NOT EXISTS sede_activity_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  sede_id VARCHAR(20) NOT NULL,
  admin_user_id BIGINT UNSIGNED NOT NULL,
  event_type VARCHAR(60) NOT NULL,
  details JSON DEFAULT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_sede_activity_sede_date (sede_id, created_at),
  KEY idx_sede_activity_date (created_at),
  CONSTRAINT fk_sede_activity_sede FOREIGN KEY (sede_id) REFERENCES sedes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_sede_activity_admin FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
