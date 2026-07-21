-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MÓDULO: SEDES
-- Archivo: 04_views.sql
-- ============================================================

DROP VIEW IF EXISTS vw_sedes;

CREATE VIEW vw_sedes AS

SELECT
    s.id,
    s.uuid,
    s.codigo,
    s.nombre,
    s.slug,
    st.nombre AS tipo,
    c.name AS pais,
    d.name AS departamento,
    ci.name AS ciudad,
    s.direccion,
    s.codigo_postal,
    s.latitud,
    s.longitud,
    s.descripcion,
    s.disponible_24_horas,
    s.mostrar_en_web,
    s.activo,
    s.created_at
FROM
    sedes s
    INNER JOIN sedes_tipos st ON st.id = s.tipo_id
    LEFT JOIN countries c ON c.id = s.country_id
    LEFT JOIN departments d ON d.id = s.department_id
    LEFT JOIN cities ci ON ci.id = s.city_id
WHERE
    s.deleted_at IS NULL;

DROP VIEW IF EXISTS vw_sedes_web;

CREATE VIEW vw_sedes_web AS

SELECT *
FROM vw_sedes
WHERE
    activo = TRUE
    AND mostrar_en_web = TRUE;

DROP VIEW IF EXISTS vw_sedes_telefonos;

CREATE VIEW vw_sedes_telefonos AS

SELECT s.id, s.nombre, t.tipo, t.numero, t.extension, t.principal
FROM sedes s
    INNER JOIN sedes_telefonos t ON s.id = t.sede_id
WHERE
    t.activo = TRUE
    AND s.deleted_at IS NULL;

DROP VIEW IF EXISTS vw_sedes_horarios;

CREATE VIEW vw_sedes_horarios AS

SELECT s.id, s.nombre, h.dia_semana, h.hora_apertura, h.hora_cierre, h.atiende_24_horas
FROM sedes s
    INNER JOIN sedes_horarios h ON h.sede_id = s.id
WHERE
    h.activo = TRUE
    AND s.deleted_at IS NULL;

DROP VIEW IF EXISTS vw_sedes_servicios;

CREATE VIEW vw_sedes_servicios AS

SELECT s.id, s.nombre, c.nombre AS servicio, ss.destacado
FROM
    sedes_servicios ss
    INNER JOIN sedes s ON s.id = ss.sede_id
    INNER JOIN sedes_servicios_catalogo c ON c.id = ss.servicio_id
WHERE
    ss.activo = TRUE
    AND s.deleted_at IS NULL;

DROP VIEW IF EXISTS vw_sedes_cobertura;

CREATE VIEW vw_sedes_cobertura AS

SELECT
    s.id,
    s.nombre,
    co.name AS pais,
    de.name AS departamento,
    ci.name AS ciudad,
    cob.tiempo_respuesta,
    cob.cobertura_24h
FROM
    sedes_cobertura cob
    INNER JOIN sedes s ON s.id = cob.sede_id
    LEFT JOIN countries co ON co.id = cob.country_id
    LEFT JOIN departments de ON de.id = cob.department_id
    LEFT JOIN cities ci ON ci.id = cob.city_id
WHERE
    s.deleted_at IS NULL;

DROP VIEW IF EXISTS vw_sedes_salas;

CREATE VIEW vw_sedes_salas AS

SELECT sa.id, sa.codigo, sa.nombre, sa.capacidad, sa.disponible, sa.activa, s.nombre AS sede
FROM sedes_salas sa
    INNER JOIN sedes s ON s.id = sa.sede_id
WHERE
    s.deleted_at IS NULL;

DROP VIEW IF EXISTS vw_dashboard_sedes;

CREATE VIEW vw_dashboard_sedes AS

SELECT
    s.id,
    s.nombre,
    st.nombre AS tipo,
    ci.name AS ciudad,
    COUNT(DISTINCT sa.id) AS total_salas,
    COUNT(DISTINCT se.servicio_id) AS total_servicios,
    COUNT(DISTINCT te.id) AS telefonos,
    s.activo
FROM
    sedes s
    LEFT JOIN sedes_tipos st ON st.id = s.tipo_id
    LEFT JOIN cities ci ON ci.id = s.city_id
    LEFT JOIN sedes_salas sa ON sa.sede_id = s.id
    LEFT JOIN sedes_servicios se ON se.sede_id = s.id
    LEFT JOIN sedes_telefonos te ON te.sede_id = s.id
WHERE
    s.deleted_at IS NULL
GROUP BY
    s.id;