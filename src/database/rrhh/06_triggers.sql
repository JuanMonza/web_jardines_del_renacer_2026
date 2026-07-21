-- ============================================================
-- TRIGGERS
-- JARDINES DEL RENACER ERP
-- ============================================================

DELIMITER $$

-- ============================================================
-- CUANDO UN CANDIDATO SE POSTULA
-- ============================================================

CREATE TRIGGER trg_postulacion_insert

AFTER INSERT

ON postulaciones

FOR EACH ROW

BEGIN

    UPDATE vacantes

    SET applications_count = applications_count + 1

    WHERE id = NEW.vacante_id;

END$$

DELIMITER;

DELIMITER $$

CREATE TRIGGER trg_estado_postulacion

AFTER UPDATE

ON postulaciones

FOR EACH ROW

BEGIN

    IF OLD.estado_id <> NEW.estado_id THEN

        INSERT INTO historial_postulacion(

            postulacion_id,

            estado_id,

            comentario

        )

        VALUES(

            NEW.id,

            NEW.estado_id,

            'Cambio automático de estado'

        );

    END IF;

END$$

DELIMITER;

DELIMITER $$

CREATE TRIGGER trg_login_candidato

AFTER UPDATE

ON candidatos

FOR EACH ROW

BEGIN

    IF OLD.ultimo_login <> NEW.ultimo_login THEN

        INSERT INTO activity_logs(

            usuario_tipo,

            usuario_id,

            accion,

            modulo,

            tabla_afectada,

            registro_id

        )

        VALUES(

            'Candidato',

            NEW.id,

            'LOGIN',

            'Portal',

            'candidatos',

            NEW.id

        );

    END IF;

END$$

DELIMITER;

DELIMITER $$

CREATE TRIGGER trg_candidato_creado

AFTER INSERT

ON candidatos

FOR EACH ROW

BEGIN

    INSERT INTO activity_logs(

        usuario_tipo,

        usuario_id,

        accion,

        modulo,

        tabla_afectada,

        registro_id

    )

    VALUES(

        'Candidato',

        NEW.id,

        'CREAR CUENTA',

        'Portal',

        'candidatos',

        NEW.id

    );

END$$

DELIMITER;

DELIMITER $$

CREATE TRIGGER trg_nueva_entrevista

AFTER INSERT

ON entrevistas

FOR EACH ROW

BEGIN

    INSERT INTO notificaciones(

        candidato_id,

        titulo,

        mensaje,

        tipo

    )

    VALUES(

        NEW.candidato_id,

        'Nueva entrevista',

        'Se programó una entrevista para tu proceso.',

        'Entrevista'

    );

END$$

DELIMITER;

DELIMITER $$

CREATE TRIGGER trg_contratado

AFTER UPDATE

ON postulaciones

FOR EACH ROW

BEGIN

    IF NEW.estado_id <> OLD.estado_id THEN

        IF EXISTS(

            SELECT 1

            FROM estados_postulacion

            WHERE id = NEW.estado_id

            AND nombre='Contratado'

        ) THEN

            INSERT INTO notificaciones(

                candidato_id,

                titulo,

                mensaje,

                tipo

            )

            VALUES(

                NEW.candidato_id,

                '¡Felicitaciones!',

                'Has sido contratado.',

                'Sistema'

            );

        END IF;

    END IF;

END$$

DELIMITER;