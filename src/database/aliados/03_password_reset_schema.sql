CREATE TABLE IF NOT EXISTS ally_password_resets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ally_account_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expira_en DATETIME NOT NULL,
  usado_en DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_ally_reset_token (token_hash),
  KEY idx_ally_reset_account_expiry (ally_account_id, expira_en),
  CONSTRAINT fk_ally_reset_account FOREIGN KEY (ally_account_id) REFERENCES ally_accounts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
