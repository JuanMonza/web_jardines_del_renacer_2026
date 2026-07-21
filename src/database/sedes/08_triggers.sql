DELIMITER $$

/*==============================================================
TRIGGER:
tr_sedes_before_insert
Genera automáticamente fechas de auditoría
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_before_insert $$

CREATE TRIGGER tr_sedes_before_insert
BEFORE INSERT
ON sedes
FOR EACH ROW
BEGIN

    SET NEW.created_at = NOW();
    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_before_update
Actualiza automáticamente updated_at
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_before_update $$

CREATE TRIGGER tr_sedes_before_update
BEFORE UPDATE
ON sedes
FOR EACH ROW
BEGIN

    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_validar_codigo
Evita códigos duplicados
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_validar_codigo $$

CREATE TRIGGER tr_sedes_validar_codigo
BEFORE INSERT
ON sedes
FOR EACH ROW
BEGIN

    IF EXISTS(

        SELECT 1

        FROM sedes

        WHERE codigo = NEW.codigo

        AND deleted_at IS NULL

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='El código de la sede ya existe.';

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_validar_slug
Evita slugs repetidos
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_validar_slug $$

CREATE TRIGGER tr_sedes_validar_slug
BEFORE INSERT
ON sedes
FOR EACH ROW
BEGIN

    IF EXISTS(

        SELECT 1

        FROM sedes

        WHERE slug = NEW.slug

        AND deleted_at IS NULL

    ) THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='El slug ya existe.';

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_validar_coordenadas
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_validar_coordenadas $$

CREATE TRIGGER tr_sedes_validar_coordenadas
BEFORE INSERT
ON sedes
FOR EACH ROW
BEGIN

    IF NEW.latitud IS NOT NULL THEN

        IF NEW.latitud < -90 OR NEW.latitud > 90 THEN

            SIGNAL SQLSTATE '45000'

            SET MESSAGE_TEXT='Latitud inválida.';

        END IF;

    END IF;

    IF NEW.longitud IS NOT NULL THEN

        IF NEW.longitud < -180 OR NEW.longitud > 180 THEN

            SIGNAL SQLSTATE '45000'

            SET MESSAGE_TEXT='Longitud inválida.';

        END IF;

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_validar_nombre
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_validar_nombre $$

CREATE TRIGGER tr_sedes_validar_nombre
BEFORE INSERT
ON sedes
FOR EACH ROW
BEGIN

    SET NEW.nombre = TRIM(NEW.nombre);

    IF LENGTH(NEW.nombre)=0 THEN

        SIGNAL SQLSTATE '45000'

        SET MESSAGE_TEXT='El nombre es obligatorio.';

    END IF;

END $$

DELIMITER;

DELIMITER $$

/*==============================================================
TRIGGER:
tr_sedes_telefonos_before_insert
Auditoría automática
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_telefonos_before_insert $$

CREATE TRIGGER tr_sedes_telefonos_before_insert
BEFORE INSERT
ON sedes_telefonos
FOR EACH ROW
BEGIN

    SET NEW.created_at = NOW();
    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_telefonos_before_update
Actualiza fecha de modificación
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_telefonos_before_update $$

CREATE TRIGGER tr_sedes_telefonos_before_update
BEFORE UPDATE
ON sedes_telefonos
FOR EACH ROW
BEGIN

    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_telefonos_validar_numero
El número es obligatorio
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_telefonos_validar_numero $$

CREATE TRIGGER tr_sedes_telefonos_validar_numero
BEFORE INSERT
ON sedes_telefonos
FOR EACH ROW
BEGIN

    SET NEW.numero = TRIM(NEW.numero);

    IF NEW.numero IS NULL
        OR CHAR_LENGTH(NEW.numero)=0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Debe ingresar un número telefónico.';

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_telefonos_unico_principal_insert
Solo un teléfono principal por sede
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_telefonos_unico_principal_insert $$

CREATE TRIGGER tr_sedes_telefonos_unico_principal_insert
BEFORE INSERT
ON sedes_telefonos
FOR EACH ROW
BEGIN

    IF NEW.principal = TRUE THEN

        UPDATE sedes_telefonos
        SET principal = FALSE
        WHERE sede_id = NEW.sede_id;

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_telefonos_unico_principal_update
Solo un principal durante actualización
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_telefonos_unico_principal_update $$

CREATE TRIGGER tr_sedes_telefonos_unico_principal_update
BEFORE UPDATE
ON sedes_telefonos
FOR EACH ROW
BEGIN

    IF NEW.principal = TRUE THEN

        UPDATE sedes_telefonos
        SET principal = FALSE
        WHERE sede_id = NEW.sede_id
          AND id <> NEW.id;

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_telefonos_validar_tipo
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_telefonos_validar_tipo $$

CREATE TRIGGER tr_sedes_telefonos_validar_tipo
BEFORE INSERT
ON sedes_telefonos
FOR EACH ROW
BEGIN

    IF NEW.tipo IS NULL
       OR CHAR_LENGTH(TRIM(NEW.tipo))=0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Debe indicar el tipo de teléfono.';

    END IF;

END $$

DELIMITER;

DELIMITER $$

/*==============================================================
TRIGGER:
tr_sedes_horarios_before_insert
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_horarios_before_insert $$

CREATE TRIGGER tr_sedes_horarios_before_insert
BEFORE INSERT
ON sedes_horarios
FOR EACH ROW
BEGIN

    SET NEW.created_at = NOW();
    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_horarios_before_update
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_horarios_before_update $$

CREATE TRIGGER tr_sedes_horarios_before_update
BEFORE UPDATE
ON sedes_horarios
FOR EACH ROW
BEGIN

    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_horarios_validar_horas
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_horarios_validar_horas $$

CREATE TRIGGER tr_sedes_horarios_validar_horas
BEFORE INSERT
ON sedes_horarios
FOR EACH ROW
BEGIN

    IF NEW.atiende_24_horas = FALSE THEN

        IF NEW.hora_apertura IS NULL THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT='Debe indicar la hora de apertura.';

        END IF;

        IF NEW.hora_cierre IS NULL THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT='Debe indicar la hora de cierre.';

        END IF;

        IF NEW.hora_apertura >= NEW.hora_cierre THEN

            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT='La hora de apertura debe ser menor que la hora de cierre.';

        END IF;

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_horarios_validar_dia_unico
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_horarios_validar_dia_unico $$

CREATE TRIGGER tr_sedes_horarios_validar_dia_unico
BEFORE INSERT
ON sedes_horarios
FOR EACH ROW
BEGIN

    IF EXISTS(

        SELECT 1

        FROM sedes_horarios

        WHERE

            sede_id = NEW.sede_id

            AND dia_semana = NEW.dia_semana

            AND deleted_at IS NULL

    ) THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Ya existe un horario registrado para este día.';

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_horarios_limpiar_observaciones
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_horarios_limpiar_observaciones $$

CREATE TRIGGER tr_sedes_horarios_limpiar_observaciones
BEFORE INSERT
ON sedes_horarios
FOR EACH ROW
BEGIN

    IF NEW.observaciones IS NOT NULL THEN

        SET NEW.observaciones = TRIM(NEW.observaciones);

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_horarios_24_horas
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_horarios_24_horas $$

CREATE TRIGGER tr_sedes_horarios_24_horas
BEFORE INSERT
ON sedes_horarios
FOR EACH ROW
BEGIN

    IF NEW.atiende_24_horas = TRUE THEN

        SET NEW.hora_apertura = '00:00:00';
        SET NEW.hora_cierre = '23:59:59';

    END IF;

END $$

DELIMITER;

DELIMITER $$

/*==============================================================
TRIGGER:
tr_sedes_servicios_before_insert
Auditoría automática
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_servicios_before_insert $$

CREATE TRIGGER tr_sedes_servicios_before_insert
BEFORE INSERT
ON sedes_servicios
FOR EACH ROW
BEGIN

    SET NEW.created_at = NOW();
    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_servicios_before_update
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_servicios_before_update $$

CREATE TRIGGER tr_sedes_servicios_before_update
BEFORE UPDATE
ON sedes_servicios
FOR EACH ROW
BEGIN

    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_servicios_validar_unico
Un servicio no puede repetirse en una misma sede
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_servicios_validar_unico $$

CREATE TRIGGER tr_sedes_servicios_validar_unico
BEFORE INSERT
ON sedes_servicios
FOR EACH ROW
BEGIN

    IF EXISTS (

        SELECT 1
        FROM sedes_servicios
        WHERE sede_id = NEW.sede_id
          AND servicio_id = NEW.servicio_id
          AND deleted_at IS NULL

    ) THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='El servicio ya está asignado a esta sede.';

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_salas_before_insert
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_salas_before_insert $$

CREATE TRIGGER tr_sedes_salas_before_insert
BEFORE INSERT
ON sedes_salas
FOR EACH ROW
BEGIN

    SET NEW.created_at = NOW();
    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_salas_before_update
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_salas_before_update $$

CREATE TRIGGER tr_sedes_salas_before_update
BEFORE UPDATE
ON sedes_salas
FOR EACH ROW
BEGIN

    SET NEW.updated_at = NOW();

END $$

/*==============================================================
TRIGGER:
tr_sedes_salas_validar_codigo
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_salas_validar_codigo $$

CREATE TRIGGER tr_sedes_salas_validar_codigo
BEFORE INSERT
ON sedes_salas
FOR EACH ROW
BEGIN

    IF EXISTS (

        SELECT 1
        FROM sedes_salas
        WHERE codigo = NEW.codigo
          AND deleted_at IS NULL

    ) THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='El código de la sala ya existe.';

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_salas_validar_capacidad
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_salas_validar_capacidad $$

CREATE TRIGGER tr_sedes_salas_validar_capacidad
BEFORE INSERT
ON sedes_salas
FOR EACH ROW
BEGIN

    IF NEW.capacidad <= 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='La capacidad debe ser mayor que cero.';

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_sedes_salas_limpiar_nombre
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_salas_limpiar_nombre $$

CREATE TRIGGER tr_sedes_salas_limpiar_nombre
BEFORE INSERT
ON sedes_salas
FOR EACH ROW
BEGIN

    SET NEW.nombre = TRIM(NEW.nombre);

END $$

/*==============================================================
TRIGGER:
tr_sedes_salas_validar_nombre
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_salas_validar_nombre $$

CREATE TRIGGER tr_sedes_salas_validar_nombre
BEFORE INSERT
ON sedes_salas
FOR EACH ROW
BEGIN

    IF CHAR_LENGTH(NEW.nombre)=0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT='Debe ingresar el nombre de la sala.';

    END IF;

END $$

DELIMITER;

DELIMITER $$

/*==============================================================
TRIGGER:
tr_sedes_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_after_insert_audit $$

CREATE TRIGGER tr_sedes_after_insert_audit
AFTER INSERT
ON sedes
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes',
        NEW.id,
        'INSERT',
        CONCAT('Se creó la sede "', NEW.nombre, '"'),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_sedes_after_update_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_after_update_audit $$

CREATE TRIGGER tr_sedes_after_update_audit
AFTER UPDATE
ON sedes
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.updated_by,
        'sedes',
        NEW.id,
        'UPDATE',
        CONCAT('Se actualizó la sede "', NEW.nombre, '"'),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_sedes_after_delete_logico
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_after_delete_logico $$

CREATE TRIGGER tr_sedes_after_delete_logico
AFTER UPDATE
ON sedes
FOR EACH ROW
BEGIN

    IF OLD.deleted_at IS NULL
       AND NEW.deleted_at IS NOT NULL THEN

        INSERT INTO audit_logs (

            admin_user_id,
            tabla,
            registro_id,
            accion,
            descripcion,
            created_at

        )

        VALUES (

            NEW.updated_by,
            'sedes',
            NEW.id,
            'DELETE',
            CONCAT('Se eliminó lógicamente la sede "', NEW.nombre, '"'),
            NOW()

        );

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_salas_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_salas_after_insert_audit $$

CREATE TRIGGER tr_salas_after_insert_audit
AFTER INSERT
ON sedes_salas
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_salas',
        NEW.id,
        'INSERT',
        CONCAT('Nueva sala: ', NEW.nombre),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_servicios_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_servicios_after_insert_audit $$

CREATE TRIGGER tr_servicios_after_insert_audit
AFTER INSERT
ON sedes_servicios
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_servicios',
        NEW.id,
        'INSERT',
        'Servicio asignado a sede.',
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_telefonos_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_telefonos_after_insert_audit $$

CREATE TRIGGER tr_telefonos_after_insert_audit
AFTER INSERT
ON sedes_telefonos
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_telefonos',
        NEW.id,
        'INSERT',
        CONCAT('Nuevo teléfono: ', NEW.numero),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_horarios_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_horarios_after_insert_audit $$

CREATE TRIGGER tr_horarios_after_insert_audit
AFTER INSERT
ON sedes_horarios
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_horarios',
        NEW.id,
        'INSERT',
        CONCAT('Horario creado para ', NEW.dia_semana),
        NOW()

    );

END $$

DELIMITER;

DELIMITER $$

/*==============================================================
TRIGGER:
tr_sedes_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_after_insert_audit $$

CREATE TRIGGER tr_sedes_after_insert_audit
AFTER INSERT
ON sedes
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes',
        NEW.id,
        'INSERT',
        CONCAT('Se creó la sede "', NEW.nombre, '"'),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_sedes_after_update_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_after_update_audit $$

CREATE TRIGGER tr_sedes_after_update_audit
AFTER UPDATE
ON sedes
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.updated_by,
        'sedes',
        NEW.id,
        'UPDATE',
        CONCAT('Se actualizó la sede "', NEW.nombre, '"'),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_sedes_after_delete_logico
==============================================================*/

DROP TRIGGER IF EXISTS tr_sedes_after_delete_logico $$

CREATE TRIGGER tr_sedes_after_delete_logico
AFTER UPDATE
ON sedes
FOR EACH ROW
BEGIN

    IF OLD.deleted_at IS NULL
       AND NEW.deleted_at IS NOT NULL THEN

        INSERT INTO audit_logs (

            admin_user_id,
            tabla,
            registro_id,
            accion,
            descripcion,
            created_at

        )

        VALUES (

            NEW.updated_by,
            'sedes',
            NEW.id,
            'DELETE',
            CONCAT('Se eliminó lógicamente la sede "', NEW.nombre, '"'),
            NOW()

        );

    END IF;

END $$

/*==============================================================
TRIGGER:
tr_salas_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_salas_after_insert_audit $$

CREATE TRIGGER tr_salas_after_insert_audit
AFTER INSERT
ON sedes_salas
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_salas',
        NEW.id,
        'INSERT',
        CONCAT('Nueva sala: ', NEW.nombre),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_servicios_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_servicios_after_insert_audit $$

CREATE TRIGGER tr_servicios_after_insert_audit
AFTER INSERT
ON sedes_servicios
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_servicios',
        NEW.id,
        'INSERT',
        'Servicio asignado a sede.',
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_telefonos_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_telefonos_after_insert_audit $$

CREATE TRIGGER tr_telefonos_after_insert_audit
AFTER INSERT
ON sedes_telefonos
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_telefonos',
        NEW.id,
        'INSERT',
        CONCAT('Nuevo teléfono: ', NEW.numero),
        NOW()

    );

END $$

/*==============================================================
TRIGGER:
tr_horarios_after_insert_audit
==============================================================*/

DROP TRIGGER IF EXISTS tr_horarios_after_insert_audit $$

CREATE TRIGGER tr_horarios_after_insert_audit
AFTER INSERT
ON sedes_horarios
FOR EACH ROW
BEGIN

    INSERT INTO audit_logs (

        admin_user_id,
        tabla,
        registro_id,
        accion,
        descripcion,
        created_at

    )

    VALUES (

        NEW.created_by,
        'sedes_horarios',
        NEW.id,
        'INSERT',
        CONCAT('Horario creado para ', NEW.dia_semana),
        NOW()

    );

END $$

DELIMITER;