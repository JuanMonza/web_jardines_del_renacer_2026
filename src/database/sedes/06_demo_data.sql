-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MÓDULO: SEDES
-- Archivo: 06_demo_data.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- SEDES
-- ============================================================

INSERT INTO
    sedes (
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
        activo
    )
VALUES (
        'PEREIRA-001',
        'Jardines del Renacer Pereira',
        'jardines-del-renacer-pereira',
        3,
        1,
        1,
        1,
        'Av. 30 de Agosto #100-20',
        '660001',
        4.8133300,
        -75.6961100,
        'Parque memorial principal.',
        TRUE,
        TRUE,
        TRUE
    ),
    (
        'DOSQ-001',
        'Jardines del Renacer Dosquebradas',
        'jardines-del-renacer-dosquebradas',
        2,
        1,
        1,
        2,
        'Cra 16 #35-15',
        '661001',
        4.8395000,
        -75.6673000,
        'Sala de velación.',
        TRUE,
        TRUE,
        TRUE
    ),
    (
        'MANIZALES-001',
        'Jardines del Renacer Manizales',
        'jardines-del-renacer-manizales',
        2,
        1,
        2,
        3,
        'Av Santander',
        '170001',
        5.0703000,
        -75.5138000,
        'Sala principal.',
        TRUE,
        TRUE,
        TRUE
    );

INSERT INTO
    sedes_telefonos (
        sede_id,
        tipo,
        numero,
        principal
    )
VALUES (
        1,
        'PBX',
        '(606)3400000',
        TRUE
    ),
    (
        1,
        'WhatsApp',
        '3200000000',
        FALSE
    ),
    (
        2,
        'PBX',
        '(606)3411111',
        TRUE
    ),
    (
        3,
        'PBX',
        '(606)3422222',
        TRUE
    );

INSERT INTO
    sedes_horarios (
        sede_id,
        dia_semana,
        hora_apertura,
        hora_cierre,
        atiende_24_horas
    )
VALUES (
        1,
        'Lunes',
        '00:00:00',
        '23:59:59',
        TRUE
    ),
    (
        1,
        'Martes',
        '00:00:00',
        '23:59:59',
        TRUE
    ),
    (
        1,
        'Miércoles',
        '00:00:00',
        '23:59:59',
        TRUE
    ),
    (
        1,
        'Jueves',
        '00:00:00',
        '23:59:59',
        TRUE
    ),
    (
        1,
        'Viernes',
        '00:00:00',
        '23:59:59',
        TRUE
    ),
    (
        1,
        'Sábado',
        '00:00:00',
        '23:59:59',
        TRUE
    ),
    (
        1,
        'Domingo',
        '00:00:00',
        '23:59:59',
        TRUE
    );

INSERT INTO
    sedes_servicios (
        sede_id,
        servicio_id,
        destacado
    )
VALUES (1, 1, TRUE),
    (1, 2, TRUE),
    (1, 3, TRUE),
    (1, 4, TRUE),
    (1, 5, FALSE),
    (2, 1, TRUE),
    (2, 4, TRUE),
    (2, 11, TRUE),
    (3, 1, TRUE),
    (3, 2, TRUE),
    (3, 8, FALSE);

INSERT INTO
    sedes_cobertura (
        sede_id,
        country_id,
        department_id,
        city_id,
        tiempo_respuesta,
        cobertura_24h
    )
VALUES (1, 1, 1, 1, 20, TRUE),
    (1, 1, 1, 2, 35, TRUE),
    (2, 1, 1, 2, 15, TRUE),
    (3, 1, 2, 3, 25, TRUE);

INSERT INTO
    sedes_salas (
        sede_id,
        codigo,
        nombre,
        capacidad,
        disponible,
        activa
    )
VALUES (
        1,
        'SALA-101',
        'Sala Esperanza',
        80,
        TRUE,
        TRUE
    ),
    (
        1,
        'SALA-102',
        'Sala Paz',
        60,
        TRUE,
        TRUE
    ),
    (
        2,
        'SALA-201',
        'Sala Luz',
        45,
        TRUE,
        TRUE
    ),
    (
        3,
        'SALA-301',
        'Sala Memorial',
        90,
        TRUE,
        TRUE
    );

SET FOREIGN_KEY_CHECKS = 1;