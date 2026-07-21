-- ============================================================
-- JARDINES DEL RENACER
-- KPI'S Y MÉTRICAS
-- DATABASE 2.0
-- ============================================================

CREATE OR REPLACE VIEW vw_kpi_total_candidatos AS

SELECT COUNT(*) total FROM candidatos WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW vw_kpi_vacantes_activas AS

SELECT COUNT(*) total
FROM vacantes
WHERE
    estado = 'Publicada'
    AND deleted_at IS NULL;

CREATE OR REPLACE VIEW vw_kpi_postulaciones AS

SELECT COUNT(*) total
FROM postulaciones
WHERE
    deleted_at IS NULL;

CREATE OR REPLACE VIEW vw_kpi_contratados AS

SELECT COUNT(*) total
FROM
    postulaciones p
    INNER JOIN estados_postulacion e ON p.estado_id = e.id
WHERE
    e.nombre = 'Contratado';

CREATE OR REPLACE VIEW vw_kpi_entrevistas_programadas AS

SELECT COUNT(*) total FROM entrevistas WHERE estado = 'Programada'

CREATE OR REPLACE VIEW vw_kpi_top_vacantes AS

SELECT v.id, v.titulo, COUNT(p.id) postulaciones
FROM vacantes v
    LEFT JOIN postulaciones p ON p.vacante_id = v.id
GROUP BY
    v.id
ORDER BY postulaciones DESC;

CREATE OR REPLACE VIEW vw_kpi_ciudades AS

SELECT ciudad, COUNT(*) cantidad
FROM candidatos
GROUP BY
    ciudad
ORDER BY cantidad DESC;

CREATE OR REPLACE VIEW vw_kpi_departamentos AS

SELECT departamento, COUNT(*) cantidad
FROM candidatos
GROUP BY
    departamento;

CREATE OR REPLACE VIEW vw_kpi_postulaciones_mes AS

SELECT YEAR(created_at) año, MONTH(created_at) mes, COUNT(*) cantidad
FROM postulaciones
GROUP BY
    YEAR(created_at),
    MONTH(created_at);

CREATE OR REPLACE VIEW vw_kpi_entrevistadores AS

SELECT a.nombre, COUNT(e.id) entrevistas
FROM entrevistas e
    INNER JOIN admin_users a ON a.id = e.entrevistador
GROUP BY
    a.id;

CREATE OR REPLACE VIEW vw_kpi_tiempo_contratacion AS

SELECT AVG(
        DATEDIFF(p.updated_at, p.created_at)
    ) dias
FROM
    postulaciones p
    INNER JOIN estados_postulacion ep ON ep.id = p.estado_id
WHERE
    ep.nombre = 'Contratado';

CREATE OR REPLACE VIEW vw_kpi_habilidades AS

SELECT h.nombre, COUNT(*) candidatos
FROM
    candidato_habilidades ch
    INNER JOIN habilidades h ON h.id = ch.habilidad_id
GROUP BY
    h.id
ORDER BY candidatos DESC;

CREATE OR REPLACE VIEW vw_kpi_modalidades AS

SELECT modalidad, COUNT(*) cantidad
FROM vacantes
GROUP BY
    modalidad;

CREATE OR REPLACE VIEW vw_kpi_contratos AS

SELECT tipo_contrato, COUNT(*) cantidad
FROM vacantes
GROUP BY
    tipo_contrato;

CREATE OR REPLACE VIEW vw_dashboard_general AS

SELECT (
        SELECT COUNT(*)
        FROM candidatos
    ) candidatos,
    (
        SELECT COUNT(*)
        FROM vacantes
    ) vacantes,
    (
        SELECT COUNT(*)
        FROM postulaciones
    ) postulaciones,
    (
        SELECT COUNT(*)
        FROM entrevistas
    ) entrevistas,
    (
        SELECT COUNT(*)
        FROM notificaciones
    ) notificaciones;