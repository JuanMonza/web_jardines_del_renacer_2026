SET GLOBAL event_scheduler = ON;

DELIMITER $$

/*==============================================================
EVENTO:
ev_sedes_actualizar_estadisticas

Recalcula estadísticas cada hora
==============================================================*/

DROP EVENT IF EXISTS ev_sedes_actualizar_estadisticas $$

CREATE EVENT ev_sedes_actualizar_estadisticas

ON SCHEDULE EVERY 1 HOUR

DO
BEGIN

    ANALYZE TABLE sedes;
    ANALYZE TABLE sedes_salas;
    ANALYZE TABLE sedes_servicios;
    ANALYZE TABLE sedes_telefonos;
    ANALYZE TABLE sedes_horarios;

END $$

/*==============================================================
EVENTO:
ev_sedes_optimizar_tablas

Optimización semanal
==============================================================*/

DROP EVENT IF EXISTS ev_sedes_optimizar_tablas $$

CREATE EVENT ev_sedes_optimizar_tablas

ON SCHEDULE EVERY 1 WEEK

DO
BEGIN

    OPTIMIZE TABLE sedes;
    OPTIMIZE TABLE sedes_salas;
    OPTIMIZE TABLE sedes_servicios;
    OPTIMIZE TABLE sedes_telefonos;
    OPTIMIZE TABLE sedes_horarios;

END $$

/*==============================================================
EVENTO:
ev_sedes_eliminacion_fisica

Elimina registros borrados hace más de 180 días
==============================================================*/

DROP EVENT IF EXISTS ev_sedes_eliminacion_fisica $$

CREATE EVENT ev_sedes_eliminacion_fisica

ON SCHEDULE EVERY 1 DAY

DO
BEGIN

    DELETE FROM sedes_telefonos
    WHERE deleted_at IS NOT NULL
      AND deleted_at < DATE_SUB(NOW(),INTERVAL 180 DAY);

    DELETE FROM sedes_horarios
    WHERE deleted_at IS NOT NULL
      AND deleted_at < DATE_SUB(NOW(),INTERVAL 180 DAY);

    DELETE FROM sedes_servicios
    WHERE deleted_at IS NOT NULL
      AND deleted_at < DATE_SUB(NOW(),INTERVAL 180 DAY);

    DELETE FROM sedes_salas
    WHERE deleted_at IS NOT NULL
      AND deleted_at < DATE_SUB(NOW(),INTERVAL 180 DAY);

    DELETE FROM sedes
    WHERE deleted_at IS NOT NULL
      AND deleted_at < DATE_SUB(NOW(),INTERVAL 180 DAY);

END $$

DELIMITER;

DELIMITER $$

/*==============================================================
EVENTO:
ev_sedes_validar_publicacion

Despublica automáticamente sedes inactivas
==============================================================*/

DROP EVENT IF EXISTS ev_sedes_validar_publicacion $$

CREATE EVENT ev_sedes_validar_publicacion

ON SCHEDULE EVERY 30 MINUTE

DO
BEGIN

    UPDATE sedes

    SET mostrar_en_web = FALSE

    WHERE

        activo = FALSE

        AND mostrar_en_web = TRUE;

END $$

/*==============================================================
EVENTO:
ev_salas_validar_estado

Las salas inactivas nunca estarán disponibles
==============================================================*/

DROP EVENT IF EXISTS ev_salas_validar_estado $$

CREATE EVENT ev_salas_validar_estado

ON SCHEDULE EVERY 30 MINUTE

DO
BEGIN

    UPDATE sedes_salas

    SET disponible = FALSE

    WHERE

        activa = FALSE

        AND disponible = TRUE;

END $$

/*==============================================================
EVENTO:
ev_sedes_limpiar_logs

Limpia logs muy antiguos
==============================================================*/

DROP EVENT IF EXISTS ev_sedes_limpiar_logs $$

CREATE EVENT ev_sedes_limpiar_logs

ON SCHEDULE EVERY 1 MONTH

DO
BEGIN

    DELETE

    FROM audit_logs

    WHERE

        tabla LIKE 'sedes%'

        AND created_at < DATE_SUB(NOW(),INTERVAL 5 YEAR);

END $$

DELIMITER;

DELIMITER $$

/*==============================================================
EVENTO:
ev_dashboard_refresh

Actualiza materializaciones
==============================================================*/

DROP EVENT IF EXISTS ev_dashboard_refresh $$

CREATE EVENT ev_dashboard_refresh

ON SCHEDULE EVERY 15 MINUTE

DO
BEGIN

    ANALYZE TABLE sedes;

END $$

/*==============================================================
EVENTO:
ev_estadisticas_servicios

Actualiza estadísticas de servicios
==============================================================*/

DROP EVENT IF EXISTS ev_estadisticas_servicios $$

CREATE EVENT ev_estadisticas_servicios

ON SCHEDULE EVERY 1 DAY

DO
BEGIN

    ANALYZE TABLE sedes_servicios;

END $$

/*==============================================================
EVENTO:
ev_estadisticas_salas

==============================================================*/

DROP EVENT IF EXISTS ev_estadisticas_salas $$

CREATE EVENT ev_estadisticas_salas

ON SCHEDULE EVERY 1 DAY

DO
BEGIN

    ANALYZE TABLE sedes_salas;

END $$

DELIMITER;