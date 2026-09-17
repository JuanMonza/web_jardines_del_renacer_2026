-- Perfil profesional de postulantes para instalaciones existentes.
SET @jdr_profile_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'candidatos'
    AND COLUMN_NAME = 'resumen_profesional'
);
SET @jdr_profile_sql = IF(
  @jdr_profile_column_exists > 0,
  'SELECT 1',
  'ALTER TABLE candidatos ADD COLUMN resumen_profesional TEXT NULL AFTER habilidades'
);
PREPARE jdr_profile_statement FROM @jdr_profile_sql;
EXECUTE jdr_profile_statement;
DEALLOCATE PREPARE jdr_profile_statement;
