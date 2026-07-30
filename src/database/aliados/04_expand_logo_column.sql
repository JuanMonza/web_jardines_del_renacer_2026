-- JARDINES DEL RENACER | Aliados
-- Amplía logo de TEXT a MEDIUMTEXT para soportar imágenes locales en Base64.
-- Seguro de ejecutar sobre instalaciones existentes con MySQL 8.
ALTER TABLE aliados MODIFY COLUMN logo MEDIUMTEXT DEFAULT NULL;
