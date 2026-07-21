-- JARDINES DEL RENACER
-- 08_demo_data.sql (plantilla demo)
SET FOREIGN_KEY_CHECKS=0;

USE jardinesweb;

INSERT INTO
    candidatos (
        documento,
        tipo_documento,
        nombres,
        apellidos,
        email,
        telefono,
        fecha_nacimiento,
        genero,
        direccion,
        ciudad,
        departamento,
        pais,
        profesion,
        experiencia,
        educacion,
        habilidades,
        idiomas,
        linkedin,
        github,
        portfolio,
        foto_url,
        cv_url,
        password_hash,
        email_verificado,
        activo
    )
VALUES (
        '100000001',
        'CC',
        'Juan David',
        'Monsalve',
        'juan1@demo.com',
        '3000000001',
        '1995-01-10',
        'M',
        'Cra 1',
        'Pereira',
        'Risaralda',
        'Colombia',
        'Full Stack',
        '5 años',
        'Ingeniero',
        'React,Node',
        'Español',
        '',
        '',
        '',
        '/uploads/fotos/1.jpg',
        '/uploads/cv/1.pdf',
        '$2y$10$demo',
        1,
        1
    ),
    (
        '100000002',
        'CC',
        'María Fernanda',
        'López',
        'maria2@demo.com',
        '3000000002',
        '1997-03-12',
        'F',
        'Cra 2',
        'Medellín',
        'Antioquia',
        'Colombia',
        'UX/UI',
        '3 años',
        'Diseñadora',
        'Figma',
        'Español',
        '',
        '',
        '',
        '/uploads/fotos/2.jpg',
        '/uploads/cv/2.pdf',
        '$2y$10$demo',
        1,
        1
    );

INSERT INTO
    vacantes (
        titulo,
        slug,
        descripcion,
        requisitos,
        responsabilidades,
        beneficios,
        ciudad,
        departamento,
        modalidad,
        tipo_contrato,
        salario_desde,
        salario_hasta,
        estado,
        fecha_publicacion
    )
VALUES (
        'Desarrollador Full Stack',
        'desarrollador-full-stack',
        'Vacante demo',
        'React, Node',
        'Desarrollo',
        'Beneficios',
        'Pereira',
        'Risaralda',
        'Híbrido',
        'Indefinido',
        4500000,
        6500000,
        'Publicada',
        NOW()
    ),
    (
        'Diseñador UX/UI',
        'disenador-ux-ui',
        'Vacante demo',
        'Figma',
        'Diseño',
        'Beneficios',
        'Medellín',
        'Antioquia',
        'Remoto',
        'Indefinido',
        3500000,
        5000000,
        'Publicada',
        NOW()
    );
    -- ============================================================
-- POSTULACIONES DEMO
-- ============================================================

INSERT INTO postulaciones (
    candidato_id,
    vacante_id,
    estado,
    fuente,
    observaciones_rh,
    observaciones_candidato,
    puntuacion,
    cv_url
)
VALUES
(
    1,
    1,
    'En revisión',
    'Portal Web',
    'Buen perfil técnico.',
    'Me interesa mucho esta oportunidad.',
    95.50,
    '/uploads/cv/1.pdf'
),
(
    2,
    2,
    'Postulado',
    'LinkedIn',
    'Pendiente de revisión.',
    'Espero poder participar en el proceso.',
    88.00,
    '/uploads/cv/2.pdf'
);

-- ============================================================
-- ENTREVISTA DEMO
-- ============================================================

INSERT INTO entrevistas (
    postulacion_id,
    candidato_id,
    vacante_id,
    modalidad,
    fecha,
    duracion,
    lugar,
    enlace,
    estado,
    resultado,
    observaciones
)
VALUES
(
    1,
    1,
    1,
    'Google Meet',
    DATE_ADD(NOW(), INTERVAL 2 DAY),
    60,
    'Virtual',
    'https://meet.google.com/demo-entrevista',
    'Programada',
    'Pendiente',
    'Primera entrevista técnica.'
);

-- ============================================================
-- NOTIFICACIONES DEMO
-- ============================================================

INSERT INTO notificaciones (
    candidato_id,
    titulo,
    mensaje,
    tipo,
    icono,
    color,
    url,
    leida
)
VALUES
(
    1,
    'Entrevista programada',
    'Tu entrevista fue programada para dentro de dos días.',
    'Entrevista',
    'Calendar',
    '#3B82F6',
    '/portal/candidato/entrevistas',
    FALSE
),
(
    2,
    'Postulación recibida',
    'Hemos recibido tu hoja de vida correctamente.',
    'RH',
    'CheckCircle',
    '#10B981',
    '/portal/candidato/postulaciones',
    FALSE
);

    SET FOREIGN_KEY_CHECKS=1;

    -- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- DEMO DATA
-- SOLO PARA DESARROLLO Y PRUEBAS
-- NO EJECUTAR EN PRODUCCIÓN
-- ============================================================