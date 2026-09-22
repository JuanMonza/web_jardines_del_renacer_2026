-- Operación y reportes del panel de Mercadeo.
ALTER TABLE sorteos
  MODIFY COLUMN estado ENUM('BORRADOR','PROGRAMADO','PAUSADO','CERRADO','PUBLICADO','CANCELADO') NOT NULL DEFAULT 'BORRADOR',
  ADD COLUMN ganadores_esperados SMALLINT UNSIGNED NOT NULL DEFAULT 1 AFTER premio,
  ADD COLUMN live_visualizaciones INT UNSIGNED NULL AFTER terminos_url,
  ADD COLUMN live_plataformas VARCHAR(255) NULL AFTER live_visualizaciones;

CREATE INDEX idx_sorteos_reporte_fecha ON sorteos (fecha_sorteo, deleted_at);
