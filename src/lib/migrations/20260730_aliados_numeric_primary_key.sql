-- Convierte aliados.id de UUID a entero autoincremental.
-- Ejecutar una sola vez sobre instalaciones que aún tengan id CHAR(36).
-- El UUID previo se usa solo durante esta conversión y se elimina al finalizar.

ALTER TABLE codigos_descuento DROP FOREIGN KEY fk_codigos_descuento_aliado;

ALTER TABLE aliados
  CHANGE COLUMN id legacy_uuid CHAR(36) NOT NULL,
  DROP PRIMARY KEY,
  ADD COLUMN id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST,
  ADD UNIQUE KEY uk_aliados_legacy_uuid (legacy_uuid);

ALTER TABLE codigos_descuento
  MODIFY COLUMN aliado_id BIGINT UNSIGNED NOT NULL,
  ADD CONSTRAINT fk_codigos_descuento_aliado
    FOREIGN KEY (aliado_id) REFERENCES aliados(id)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE aliados
  DROP INDEX uk_aliados_legacy_uuid,
  DROP COLUMN legacy_uuid;
