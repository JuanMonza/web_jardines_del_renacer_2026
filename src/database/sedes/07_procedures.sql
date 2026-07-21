-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MÓDULO: SEDES
-- Archivo: 07_procedures.sql
--
-- Procedimientos almacenados
-- ============================================================

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_crear
--
-- Descripción:
-- Crea una nueva sede validando que el código y el slug
-- no existan previamente.
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_crear $$

CREATE PROCEDURE sp_sedes_crear(

    IN p_codigo VARCHAR(30),
    IN p_nombre VARCHAR(180),
    IN p_slug VARCHAR(180),
    IN p_tipo_id SMALLINT UNSIGNED,
    IN p_country_id SMALLINT UNSIGNED,
    IN p_department_id SMALLINT UNSIGNED,
    IN p_city_id INT UNSIGNED,
    IN p_direccion VARCHAR(255),
    IN p_codigo_postal VARCHAR(20),
    IN p_latitud DECIMAL(10,7),
    IN p_longitud DECIMAL(10,7),
    IN p_descripcion TEXT,
    IN p_disponible_24 BOOLEAN,
    IN p_admin BIGINT UNSIGNED

)

BEGIN

    DECLARE vExisteCodigo INT DEFAULT 0;
    DECLARE vExisteSlug INT DEFAULT 0;
    DECLARE vSedeId BIGINT;
    START TRANSACTION;
    SELECT COUNT(*)
    INTO vExisteCodigo
    FROM sedes
    WHERE codigo = p_codigo
    AND deleted_at IS NULL;
    IF vExisteCodigo > 0 THEN
        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='El código de la sede ya existe.';

    END IF;

    SELECT COUNT(*)

    INTO vExisteSlug

    FROM sedes

    WHERE slug=p_slug

    AND deleted_at IS NULL;

    IF vExisteSlug > 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='El slug ya existe.';

    END IF;

    INSERT INTO sedes(

        codigo,
        nombre,
        slug,
        tipo_id,

        country_id,
        department_id,
        city_id,

        direccion,
        codigo_postal,

        latitud,
        longitud,

        descripcion,

        disponible_24_horas,

        mostrar_en_web,

        activo,

        created_by

    )

    VALUES(

        p_codigo,
        p_nombre,
        p_slug,
        p_tipo_id,

        p_country_id,
        p_department_id,
        p_city_id,

        p_direccion,
        p_codigo_postal,

        p_latitud,
        p_longitud,

        p_descripcion,

        p_disponible_24,

        TRUE,

        TRUE,

        p_admin

    );

    SET vSedeId = LAST_INSERT_ID();

    SELECT

        TRUE AS success,

        'Sede creada correctamente.' AS mensaje,

        vSedeId AS sede_id;

    COMMIT;

END $$

DELIMITER;

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_actualizar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_actualizar $$

CREATE PROCEDURE sp_sedes_actualizar(

    IN p_id BIGINT UNSIGNED,

    IN p_codigo VARCHAR(30),
    IN p_nombre VARCHAR(180),
    IN p_slug VARCHAR(180),
    IN p_tipo_id SMALLINT UNSIGNED,

    IN p_country_id SMALLINT UNSIGNED,
    IN p_department_id SMALLINT UNSIGNED,
    IN p_city_id INT UNSIGNED,

    IN p_direccion VARCHAR(255),
    IN p_codigo_postal VARCHAR(20),

    IN p_latitud DECIMAL(10,7),
    IN p_longitud DECIMAL(10,7),

    IN p_descripcion TEXT,

    IN p_disponible24 BOOLEAN,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    DECLARE vCodigo INT DEFAULT 0;
    DECLARE vSlug INT DEFAULT 0;

    START TRANSACTION;

    SELECT COUNT(*)

    INTO vCodigo

    FROM sedes

    WHERE codigo=p_codigo

    AND id<>p_id

    AND deleted_at IS NULL;

    IF vCodigo>0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='Ya existe otra sede con ese código.';

    END IF;

    SELECT COUNT(*)

    INTO vSlug

    FROM sedes

    WHERE slug=p_slug

    AND id<>p_id

    AND deleted_at IS NULL;

    IF vSlug>0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='Ya existe otra sede con ese slug.';

    END IF;

    UPDATE sedes

    SET

        codigo=p_codigo,

        nombre=p_nombre,

        slug=p_slug,

        tipo_id=p_tipo_id,

        country_id=p_country_id,

        department_id=p_department_id,

        city_id=p_city_id,

        direccion=p_direccion,

        codigo_postal=p_codigo_postal,

        latitud=p_latitud,

        longitud=p_longitud,

        descripcion=p_descripcion,

        disponible_24_horas=p_disponible24,

        updated_by=p_admin,

        updated_at=NOW()

    WHERE

        id=p_id;

    COMMIT;

    SELECT

        TRUE AS success,

        'Sede actualizada correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_eliminar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_eliminar $$

CREATE PROCEDURE sp_sedes_eliminar(

    IN p_id BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    START TRANSACTION;

    UPDATE sedes

    SET

        activo=FALSE,

        mostrar_en_web=FALSE,

        deleted_at=NOW(),

        updated_by=p_admin,

        updated_at=NOW()

    WHERE

        id=p_id;

    COMMIT;

    SELECT

        TRUE AS success,

        'Sede eliminada correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_restaurar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_restaurar $$

CREATE PROCEDURE sp_sedes_restaurar(

    IN p_id BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    START TRANSACTION;

    UPDATE sedes

    SET

        activo=TRUE,

        mostrar_en_web=TRUE,

        deleted_at=NULL,

        updated_by=p_admin,

        updated_at=NOW()

    WHERE

        id=p_id;

    COMMIT;

    SELECT

        TRUE AS success,

        'Sede restaurada correctamente.' AS mensaje;

END $$

DELIMITER;

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_obtener
--
-- Obtiene una sede por ID con toda su información principal
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_obtener $$

CREATE PROCEDURE sp_sedes_obtener(

    IN p_id BIGINT UNSIGNED

)

BEGIN

    SELECT

        s.*,

        st.nombre AS tipo,

        c.name AS pais,

        d.name AS departamento,

        ci.name AS ciudad

    FROM sedes s

        INNER JOIN sedes_tipos st
            ON st.id=s.tipo_id

        LEFT JOIN countries c
            ON c.id=s.country_id

        LEFT JOIN departments d
            ON d.id=s.department_id

        LEFT JOIN cities ci
            ON ci.id=s.city_id

    WHERE

        s.id=p_id

        AND s.deleted_at IS NULL

    LIMIT 1;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_listar
--
-- Lista todas las sedes activas
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_listar $$

CREATE PROCEDURE sp_sedes_listar()

BEGIN

    SELECT

        s.id,

        s.codigo,

        s.nombre,

        s.slug,

        st.nombre AS tipo,

        ci.name AS ciudad,

        s.disponible_24_horas,

        s.activo,

        s.mostrar_en_web,

        s.created_at

    FROM sedes s

        INNER JOIN sedes_tipos st

            ON st.id=s.tipo_id

        LEFT JOIN cities ci

            ON ci.id=s.city_id

    WHERE

        s.deleted_at IS NULL

    ORDER BY

        s.nombre;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_buscar
--
-- Búsqueda general para el administrador
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_buscar $$

CREATE PROCEDURE sp_sedes_buscar(

    IN p_texto VARCHAR(150)

)

BEGIN

    SELECT

        s.id,

        s.codigo,

        s.nombre,

        s.slug,

        st.nombre AS tipo,

        ci.name AS ciudad,

        s.activo,

        s.mostrar_en_web

    FROM sedes s

        INNER JOIN sedes_tipos st

            ON st.id=s.tipo_id

        LEFT JOIN cities ci

            ON ci.id=s.city_id

    WHERE

        s.deleted_at IS NULL

        AND (

            s.nombre LIKE CONCAT('%',p_texto,'%')

            OR s.codigo LIKE CONCAT('%',p_texto,'%')

            OR s.slug LIKE CONCAT('%',p_texto,'%')

            OR ci.name LIKE CONCAT('%',p_texto,'%')

            OR st.nombre LIKE CONCAT('%',p_texto,'%')

        )

    ORDER BY

        s.nombre;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sedes_dashboard
--
-- Resumen ejecutivo del módulo
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sedes_dashboard $$

CREATE PROCEDURE sp_sedes_dashboard()

BEGIN

    SELECT

        COUNT(*) AS total_sedes,

        SUM(activo=TRUE) AS sedes_activas,

        SUM(activo=FALSE) AS sedes_inactivas,

        SUM(disponible_24_horas=TRUE) AS sedes_24_horas,

        SUM(mostrar_en_web=TRUE) AS publicadas,

        SUM(mostrar_en_web=FALSE) AS ocultas

    FROM sedes

    WHERE deleted_at IS NULL;

END $$

DELIMITER;

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_telefono_crear
-- ============================================================

DROP PROCEDURE IF EXISTS sp_telefono_crear $$

CREATE PROCEDURE sp_telefono_crear(

    IN p_sede_id BIGINT UNSIGNED,
    IN p_tipo VARCHAR(30),
    IN p_numero VARCHAR(30),
    IN p_extension VARCHAR(15),
    IN p_principal BOOLEAN,
    IN p_admin BIGINT UNSIGNED

)

BEGIN

    START TRANSACTION;

    IF p_principal = TRUE THEN

        UPDATE sedes_telefonos

        SET principal = FALSE

        WHERE sede_id = p_sede_id;

    END IF;

    INSERT INTO sedes_telefonos(

        sede_id,
        tipo,
        numero,
        extension,
        principal,
        activo,
        created_by

    )

    VALUES(

        p_sede_id,
        p_tipo,
        p_numero,
        p_extension,
        p_principal,
        TRUE,
        p_admin

    );

    COMMIT;

    SELECT

        TRUE AS success,

        LAST_INSERT_ID() AS telefono_id,

        'Teléfono registrado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_telefono_actualizar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_telefono_actualizar $$

CREATE PROCEDURE sp_telefono_actualizar(

    IN p_id BIGINT UNSIGNED,

    IN p_tipo VARCHAR(30),

    IN p_numero VARCHAR(30),

    IN p_extension VARCHAR(15),

    IN p_principal BOOLEAN,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    DECLARE vSede BIGINT;

    SELECT sede_id

    INTO vSede

    FROM sedes_telefonos

    WHERE id = p_id;

    START TRANSACTION;

    IF p_principal = TRUE THEN

        UPDATE sedes_telefonos

        SET principal = FALSE

        WHERE sede_id = vSede;

    END IF;

    UPDATE sedes_telefonos

    SET

        tipo = p_tipo,

        numero = p_numero,

        extension = p_extension,

        principal = p_principal,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    COMMIT;

    SELECT

        TRUE AS success,

        'Teléfono actualizado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_telefono_eliminar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_telefono_eliminar $$

CREATE PROCEDURE sp_telefono_eliminar(

    IN p_id BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_telefonos

    SET

        activo = FALSE,

        deleted_at = NOW(),

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Teléfono eliminado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_telefono_principal
-- ============================================================

DROP PROCEDURE IF EXISTS sp_telefono_principal $$

CREATE PROCEDURE sp_telefono_principal(

    IN p_id BIGINT UNSIGNED

)

BEGIN

    DECLARE vSede BIGINT;

    SELECT sede_id

    INTO vSede

    FROM sedes_telefonos

    WHERE id = p_id;

    START TRANSACTION;

    UPDATE sedes_telefonos

    SET principal = FALSE

    WHERE sede_id = vSede;

    UPDATE sedes_telefonos

    SET principal = TRUE

    WHERE id = p_id;

    COMMIT;

    SELECT

        TRUE AS success,

        'Teléfono principal actualizado.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_telefonos_listar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_telefonos_listar $$

CREATE PROCEDURE sp_telefonos_listar(

    IN p_sede BIGINT UNSIGNED

)

BEGIN

    SELECT

        id,

        tipo,

        numero,

        extension,

        principal,

        activo

    FROM sedes_telefonos

    WHERE

        sede_id = p_sede

        AND deleted_at IS NULL

    ORDER BY

        principal DESC,

        tipo;

END $$

DELIMITER;

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_horario_crear
-- ============================================================

DROP PROCEDURE IF EXISTS sp_horario_crear $$

CREATE PROCEDURE sp_horario_crear(

    IN p_sede_id BIGINT UNSIGNED,

    IN p_dia ENUM(
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
        'Festivo'
    ),

    IN p_hora_apertura TIME,

    IN p_hora_cierre TIME,

    IN p_24_horas BOOLEAN,

    IN p_observaciones VARCHAR(255),

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    DECLARE vExiste INT DEFAULT 0;

    SELECT COUNT(*)

    INTO vExiste

    FROM sedes_horarios

    WHERE

        sede_id = p_sede_id

        AND dia_semana = p_dia

        AND deleted_at IS NULL;

    IF vExiste > 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='Ya existe un horario para este día.';

    END IF;

    INSERT INTO sedes_horarios(

        sede_id,

        dia_semana,

        hora_apertura,

        hora_cierre,

        atiende_24_horas,

        observaciones,

        activo,

        created_by

    )

    VALUES(

        p_sede_id,

        p_dia,

        p_hora_apertura,

        p_hora_cierre,

        p_24_horas,

        p_observaciones,

        TRUE,

        p_admin

    );

    SELECT

        TRUE AS success,

        LAST_INSERT_ID() AS horario_id,

        'Horario creado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_horario_actualizar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_horario_actualizar $$

CREATE PROCEDURE sp_horario_actualizar(

    IN p_id BIGINT UNSIGNED,

    IN p_hora_apertura TIME,

    IN p_hora_cierre TIME,

    IN p_24_horas BOOLEAN,

    IN p_observaciones VARCHAR(255),

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_horarios

    SET

        hora_apertura = p_hora_apertura,

        hora_cierre = p_hora_cierre,

        atiende_24_horas = p_24_horas,

        observaciones = p_observaciones,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Horario actualizado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_horario_eliminar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_horario_eliminar $$

CREATE PROCEDURE sp_horario_eliminar(

    IN p_id BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_horarios

    SET

        activo = FALSE,

        deleted_at = NOW(),

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Horario eliminado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_horarios_listar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_horarios_listar $$

CREATE PROCEDURE sp_horarios_listar(

    IN p_sede BIGINT UNSIGNED

)

BEGIN

    SELECT

        id,

        dia_semana,

        hora_apertura,

        hora_cierre,

        atiende_24_horas,

        observaciones,

        activo

    FROM sedes_horarios

    WHERE

        sede_id = p_sede

        AND deleted_at IS NULL

    ORDER BY FIELD(

        dia_semana,

        'Lunes',

        'Martes',

        'Miércoles',

        'Jueves',

        'Viernes',

        'Sábado',

        'Domingo',

        'Festivo'

    );

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_horario_copiar_semana
-- Copia el horario de un día a todos los días de la semana
-- ============================================================

DROP PROCEDURE IF EXISTS sp_horario_copiar_semana $$

CREATE PROCEDURE sp_horario_copiar_semana(

    IN p_sede BIGINT UNSIGNED,

    IN p_dia_origen ENUM(
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
        'Festivo'
    ),

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    DECLARE vHoraInicio TIME;
    DECLARE vHoraFin TIME;
    DECLARE v24 BOOLEAN;
    DECLARE vObs VARCHAR(255);

    SELECT

        hora_apertura,
        hora_cierre,
        atiende_24_horas,
        observaciones

    INTO

        vHoraInicio,
        vHoraFin,
        v24,
        vObs

    FROM sedes_horarios

    WHERE

        sede_id = p_sede

        AND dia_semana = p_dia_origen

        AND deleted_at IS NULL

    LIMIT 1;

    UPDATE sedes_horarios

    SET

        hora_apertura = vHoraInicio,

        hora_cierre = vHoraFin,

        atiende_24_horas = v24,

        observaciones = vObs,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE

        sede_id = p_sede

        AND dia_semana <> p_dia_origen

        AND deleted_at IS NULL;

    SELECT

        TRUE AS success,

        'Horario copiado correctamente a toda la semana.' AS mensaje;

END $$

DELIMITER;

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_servicio_asignar
-- Asigna un servicio a una sede
-- ============================================================

DROP PROCEDURE IF EXISTS sp_servicio_asignar $$

CREATE PROCEDURE sp_servicio_asignar(

    IN p_sede_id BIGINT UNSIGNED,
    IN p_servicio_id SMALLINT UNSIGNED,
    IN p_destacado BOOLEAN,
    IN p_observaciones TEXT,
    IN p_admin BIGINT UNSIGNED

)

BEGIN

    DECLARE vExiste INT DEFAULT 0;

    SELECT COUNT(*)

    INTO vExiste

    FROM sedes_servicios

    WHERE

        sede_id = p_sede_id

        AND servicio_id = p_servicio_id

        AND deleted_at IS NULL;

    IF vExiste > 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='El servicio ya fue asignado a esta sede.';

    END IF;

    INSERT INTO sedes_servicios(

        sede_id,

        servicio_id,

        destacado,

        observaciones,

        activo,

        created_by

    )

    VALUES(

        p_sede_id,

        p_servicio_id,

        p_destacado,

        p_observaciones,

        TRUE,

        p_admin

    );

    SELECT

        TRUE AS success,

        LAST_INSERT_ID() AS id,

        'Servicio asignado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_servicio_actualizar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_servicio_actualizar $$

CREATE PROCEDURE sp_servicio_actualizar(

    IN p_id BIGINT UNSIGNED,

    IN p_destacado BOOLEAN,

    IN p_observaciones TEXT,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_servicios

    SET

        destacado = p_destacado,

        observaciones = p_observaciones,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Servicio actualizado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_servicio_eliminar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_servicio_eliminar $$

CREATE PROCEDURE sp_servicio_eliminar(

    IN p_id BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_servicios

    SET

        activo = FALSE,

        deleted_at = NOW(),

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Servicio eliminado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_servicio_destacar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_servicio_destacar $$

CREATE PROCEDURE sp_servicio_destacar(

    IN p_id BIGINT UNSIGNED,

    IN p_estado BOOLEAN,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_servicios

    SET

        destacado = p_estado,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Estado destacado actualizado.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_servicios_listar
-- Lista los servicios de una sede
-- ============================================================

DROP PROCEDURE IF EXISTS sp_servicios_listar $$

CREATE PROCEDURE sp_servicios_listar(

    IN p_sede BIGINT UNSIGNED

)

BEGIN

    SELECT

        ss.id,

        c.id AS servicio_id,

        c.nombre,

        c.descripcion,

        c.icono,

        c.color,

        ss.destacado,

        ss.observaciones,

        ss.activo

    FROM sedes_servicios ss

        INNER JOIN sedes_servicios_catalogo c

            ON c.id = ss.servicio_id

    WHERE

        ss.sede_id = p_sede

        AND ss.deleted_at IS NULL

    ORDER BY

        c.orden,

        c.nombre;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_servicios_disponibles
-- Lista servicios que aún no tiene la sede
-- ============================================================

DROP PROCEDURE IF EXISTS sp_servicios_disponibles $$

CREATE PROCEDURE sp_servicios_disponibles(

    IN p_sede BIGINT UNSIGNED

)

BEGIN

    SELECT

        c.id,

        c.nombre,

        c.descripcion,

        c.icono,

        c.color

    FROM sedes_servicios_catalogo c

    WHERE

        c.activo = TRUE

        AND c.deleted_at IS NULL

        AND c.id NOT IN (

            SELECT servicio_id

            FROM sedes_servicios

            WHERE

                sede_id = p_sede

                AND deleted_at IS NULL

        )

    ORDER BY

        c.orden,

        c.nombre;

END $$

DELIMITER;

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sala_crear
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sala_crear $$

CREATE PROCEDURE sp_sala_crear(

    IN p_sede_id BIGINT UNSIGNED,

    IN p_codigo VARCHAR(30),

    IN p_nombre VARCHAR(120),

    IN p_piso VARCHAR(30),

    IN p_capacidad SMALLINT UNSIGNED,

    IN p_descripcion TEXT,

    IN p_media BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    DECLARE vExiste INT DEFAULT 0;

    SELECT COUNT(*)

    INTO vExiste

    FROM sedes_salas

    WHERE

        codigo = p_codigo

        AND deleted_at IS NULL;

    IF vExiste > 0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='El código de la sala ya existe.';

    END IF;

    INSERT INTO sedes_salas(

        sede_id,

        codigo,

        nombre,

        piso,

        capacidad,

        descripcion,

        foto_media_id,

        disponible,

        activa,

        created_by

    )

    VALUES(

        p_sede_id,

        p_codigo,

        p_nombre,

        p_piso,

        p_capacidad,

        p_descripcion,

        p_media,

        TRUE,

        TRUE,

        p_admin

    );

    SELECT

        TRUE AS success,

        LAST_INSERT_ID() AS sala_id,

        'Sala creada correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sala_actualizar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sala_actualizar $$

CREATE PROCEDURE sp_sala_actualizar(

    IN p_id BIGINT UNSIGNED,

    IN p_nombre VARCHAR(120),

    IN p_piso VARCHAR(30),

    IN p_capacidad SMALLINT UNSIGNED,

    IN p_descripcion TEXT,

    IN p_media BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_salas

    SET

        nombre = p_nombre,

        piso = p_piso,

        capacidad = p_capacidad,

        descripcion = p_descripcion,

        foto_media_id = p_media,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Sala actualizada correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sala_eliminar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sala_eliminar $$

CREATE PROCEDURE sp_sala_eliminar(

    IN p_id BIGINT UNSIGNED,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_salas

    SET

        activa = FALSE,

        disponible = FALSE,

        deleted_at = NOW(),

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Sala eliminada correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sala_cambiar_estado
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sala_cambiar_estado $$

CREATE PROCEDURE sp_sala_cambiar_estado(

    IN p_id BIGINT UNSIGNED,

    IN p_estado BOOLEAN,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_salas

    SET

        activa = p_estado,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Estado actualizado correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_sala_cambiar_disponibilidad
-- ============================================================

DROP PROCEDURE IF EXISTS sp_sala_cambiar_disponibilidad $$

CREATE PROCEDURE sp_sala_cambiar_disponibilidad(

    IN p_id BIGINT UNSIGNED,

    IN p_disponible BOOLEAN,

    IN p_admin BIGINT UNSIGNED

)

BEGIN

    UPDATE sedes_salas

    SET

        disponible = p_disponible,

        updated_by = p_admin,

        updated_at = NOW()

    WHERE id = p_id;

    SELECT

        TRUE AS success,

        'Disponibilidad actualizada correctamente.' AS mensaje;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_salas_listar
-- ============================================================

DROP PROCEDURE IF EXISTS sp_salas_listar $$

CREATE PROCEDURE sp_salas_listar(

    IN p_sede BIGINT UNSIGNED

)

BEGIN

    SELECT

        id,

        codigo,

        nombre,

        piso,

        capacidad,

        disponible,

        activa,

        created_at

    FROM sedes_salas

    WHERE

        sede_id = p_sede

        AND deleted_at IS NULL

    ORDER BY

        nombre;

END $$

DELIMITER;

DELIMITER $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_dashboard_sedes
-- Dashboard ejecutivo del módulo de sedes
-- ============================================================

DROP PROCEDURE IF EXISTS sp_dashboard_sedes $$

CREATE PROCEDURE sp_dashboard_sedes()

BEGIN

    SELECT
        COUNT(*) AS total_sedes,
        SUM(activo = TRUE) AS sedes_activas,
        SUM(activo = FALSE) AS sedes_inactivas,
        SUM(mostrar_en_web = TRUE) AS publicadas_web,
        SUM(disponible_24_horas = TRUE) AS sedes_24_horas,
        SUM(destacada = TRUE) AS sedes_destacadas
    FROM sedes
    WHERE deleted_at IS NULL;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_dashboard_salas
-- ============================================================

DROP PROCEDURE IF EXISTS sp_dashboard_salas $$

CREATE PROCEDURE sp_dashboard_salas()

BEGIN

    SELECT

        COUNT(*) AS total_salas,

        SUM(activa=TRUE) AS salas_activas,

        SUM(disponible=TRUE) AS salas_disponibles,

        SUM(disponible=FALSE) AS salas_ocupadas

    FROM sedes_salas

    WHERE deleted_at IS NULL;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_dashboard_servicios
-- ============================================================

DROP PROCEDURE IF EXISTS sp_dashboard_servicios $$

CREATE PROCEDURE sp_dashboard_servicios()

BEGIN

    SELECT

        COUNT(*) AS servicios_asignados,

        SUM(destacado=TRUE) AS destacados,

        COUNT(DISTINCT sede_id) AS sedes_con_servicios

    FROM sedes_servicios

    WHERE deleted_at IS NULL;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_reporte_sedes_por_departamento
-- ============================================================

DROP PROCEDURE IF EXISTS sp_reporte_sedes_por_departamento $$

CREATE PROCEDURE sp_reporte_sedes_por_departamento()

BEGIN

    SELECT

        d.name AS departamento,

        COUNT(s.id) AS total_sedes

    FROM departments d

        LEFT JOIN sedes s

            ON s.department_id=d.id

            AND s.deleted_at IS NULL

    GROUP BY

        d.id,
        d.name

    ORDER BY

        total_sedes DESC,
        departamento;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_reporte_sedes_por_ciudad
-- ============================================================

DROP PROCEDURE IF EXISTS sp_reporte_sedes_por_ciudad $$

CREATE PROCEDURE sp_reporte_sedes_por_ciudad()

BEGIN

    SELECT

        c.name AS ciudad,

        d.name AS departamento,

        COUNT(s.id) AS total

    FROM cities c

        INNER JOIN departments d

            ON d.id=c.department_id

        LEFT JOIN sedes s

            ON s.city_id=c.id

            AND s.deleted_at IS NULL

    GROUP BY

        c.id,
        c.name,
        d.name

    ORDER BY

        total DESC,
        ciudad;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_reporte_servicios_populares
-- ============================================================

DROP PROCEDURE IF EXISTS sp_reporte_servicios_populares $$

CREATE PROCEDURE sp_reporte_servicios_populares()

BEGIN

    SELECT

        sc.nombre,

        COUNT(ss.id) AS total_sedes

    FROM sedes_servicios_catalogo sc

        LEFT JOIN sedes_servicios ss

            ON ss.servicio_id=sc.id

            AND ss.deleted_at IS NULL

    GROUP BY

        sc.id,
        sc.nombre

    ORDER BY

        total_sedes DESC,
        sc.nombre;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_reporte_capacidad_total
-- ============================================================

DROP PROCEDURE IF EXISTS sp_reporte_capacidad_total $$

CREATE PROCEDURE sp_reporte_capacidad_total()

BEGIN

    SELECT

        s.nombre,

        COUNT(sa.id) AS total_salas,

        SUM(sa.capacidad) AS capacidad_total

    FROM sedes s

        LEFT JOIN sedes_salas sa

            ON sa.sede_id=s.id

            AND sa.deleted_at IS NULL

    WHERE s.deleted_at IS NULL

    GROUP BY

        s.id,
        s.nombre

    ORDER BY

        capacidad_total DESC;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_generar_codigo_sede
-- ============================================================

DROP PROCEDURE IF EXISTS sp_generar_codigo_sede $$

CREATE PROCEDURE sp_generar_codigo_sede()

BEGIN

    SELECT CONCAT(

        'SED-',

        LPAD(

            IFNULL(MAX(id)+1,1),

            5,

            '0'

        )

    ) AS siguiente_codigo

    FROM sedes;

END $$

-- ============================================================
-- PROCEDIMIENTO:
-- sp_generar_slug
-- ============================================================

DROP PROCEDURE IF EXISTS sp_generar_slug $$

CREATE PROCEDURE sp_generar_slug(

    IN p_nombre VARCHAR(200)

)

BEGIN

    SELECT

        LOWER(

            REPLACE(

                REPLACE(

                    REPLACE(

                        TRIM(p_nombre),

                        ' ',

                        '-'

                    ),

                    '--',

                    '-'

                ),

                '_',

                '-'

            )

        ) AS slug;

END $$

DELIMITER;