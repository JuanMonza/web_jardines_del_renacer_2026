SET @cv_filename_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'candidatos'
      AND COLUMN_NAME = 'cv_filename'
  ),
  'SELECT 1',
  'ALTER TABLE candidatos ADD COLUMN cv_filename VARCHAR(255) NULL AFTER cv_url'
);
PREPARE cv_filename_statement FROM @cv_filename_sql;
EXECUTE cv_filename_statement;
DEALLOCATE PREPARE cv_filename_statement;

SET @cv_mime_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'candidatos'
      AND COLUMN_NAME = 'cv_mime'
  ),
  'SELECT 1',
  'ALTER TABLE candidatos ADD COLUMN cv_mime VARCHAR(127) NULL AFTER cv_filename'
);
PREPARE cv_mime_statement FROM @cv_mime_sql;
EXECUTE cv_mime_statement;
DEALLOCATE PREPARE cv_mime_statement;

SET @cv_filedata_sql = IF(
  EXISTS(
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'candidatos'
      AND COLUMN_NAME = 'cv_filedata'
  ),
  'SELECT 1',
  'ALTER TABLE candidatos ADD COLUMN cv_filedata MEDIUMBLOB NULL AFTER cv_mime'
);
PREPARE cv_filedata_statement FROM @cv_filedata_sql;
EXECUTE cv_filedata_statement;
DEALLOCATE PREPARE cv_filedata_statement;
