SET @has_vacancy_template_data := (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vacantes' AND COLUMN_NAME = 'template_data'
);
SET @vacancy_template_sql := IF(
  @has_vacancy_template_data = 0,
  'ALTER TABLE vacantes ADD COLUMN template_data JSON NULL',
  'SELECT 1'
);
PREPARE vacancy_template_stmt FROM @vacancy_template_sql;
EXECUTE vacancy_template_stmt;
DEALLOCATE PREPARE vacancy_template_stmt;
