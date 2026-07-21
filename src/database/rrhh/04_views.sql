CREATE OR REPLACE VIEW vw_dashboard_rrhh AS

SELECT (
        SELECT COUNT(*)
        FROM candidatos
        WHERE
            deleted_at IS NULL
    ) AS total_candidatos,
    (
        SELECT COUNT(*)
        FROM vacantes
        WHERE
            estado = 'Publicada'
            AND deleted_at IS NULL
    ) AS vacantes_activas,
    (
        SELECT COUNT(*)
        FROM postulaciones
        WHERE
            deleted_at IS NULL
    ) AS total_postulaciones,
    (
        SELECT COUNT(*)
        FROM entrevistas
        WHERE
            estado = 'Programada'
            AND deleted_at IS NULL
    ) AS entrevistas_programadas,
    (
        SELECT COUNT(*)
        FROM
            postulaciones p
            INNER JOIN estados_postulacion e ON p.estado_id = e.id
        WHERE
            e.es_final = 1
            AND e.nombre = 'Contratado'
    ) AS contratados;

CREATE OR REPLACE VIEW vw_dashboard_candidato AS

SELECT
    c.id,
    c.nombres,
    c.apellidos,
    c.email,
    COUNT(DISTINCT p.id) AS total_postulaciones,
    SUM(
        CASE
            WHEN ep.es_final = 0 THEN 1
            ELSE 0
        END
    ) AS procesos_activos,
    SUM(
        CASE
            WHEN ep.nombre = 'Contratado' THEN 1
            ELSE 0
        END
    ) AS contrataciones
FROM
    candidatos c
    LEFT JOIN postulaciones p ON p.candidato_id = c.id
    LEFT JOIN estados_postulacion ep ON ep.id = p.estado_id
GROUP BY
    c.id;

CREATE OR REPLACE VIEW vw_vacantes_publicadas AS

SELECT
    id,
    titulo,
    ciudad,
    departamento,
    modalidad,
    salario_desde,
    salario_hasta,
    applications_count,
    views,
    fecha_publicacion
FROM vacantes
WHERE
    estado = 'Publicada'
    AND deleted_at IS NULL;

CREATE OR REPLACE VIEW vw_candidatos AS

SELECT
    c.id,
    c.documento,
    c.nombres,
    c.apellidos,
    c.email,
    c.telefono,
    c.ciudad,
    c.departamento,
    COUNT(p.id) AS postulaciones,
    MAX(p.created_at) AS ultima_postulacion
FROM candidatos c
    LEFT JOIN postulaciones p ON p.candidato_id = c.id
GROUP BY
    c.id;

CREATE OR REPLACE VIEW vw_entrevistas_hoy AS

SELECT e.id, c.nombres, c.apellidos, v.titulo, e.modalidad, e.fecha, e.estado
FROM
    entrevistas e
    INNER JOIN candidatos c ON c.id = e.candidato_id
    INNER JOIN vacantes v ON v.id = e.vacante_id
WHERE
    DATE(e.fecha) = CURDATE();

CREATE OR REPLACE VIEW vw_ultimas_postulaciones AS

SELECT p.id, c.nombres, c.apellidos, v.titulo, ep.nombre AS estado, p.created_at
FROM
    postulaciones p
    INNER JOIN candidatos c ON c.id = p.candidato_id
    INNER JOIN vacantes v ON v.id = p.vacante_id
    INNER JOIN estados_postulacion ep ON ep.id = p.estado_id
ORDER BY p.created_at DESC;

CREATE OR REPLACE VIEW vw_vacantes_populares AS

SELECT
    id,
    titulo,
    views,
    applications_count
FROM vacantes
ORDER BY applications_count DESC, views DESC;

CREATE OR REPLACE VIEW vw_indicadores_rrhh AS

SELECT ep.nombre, COUNT(*) cantidad
FROM
    postulaciones p
    INNER JOIN estados_postulacion ep ON ep.id = p.estado_id
GROUP BY
    ep.nombre;