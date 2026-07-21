INSERT INTO
    estados_postulacion (
        nombre,
        descripcion,
        color,
        icono,
        orden,
        es_final,
        activo
    )
VALUES (
        'Postulado',
        'El candidato creó la postulación.',
        '#3B82F6',
        'Send',
        1,
        0,
        1
    ),
    (
        'Recibido',
        'La postulación fue recibida por RH.',
        '#06B6D4',
        'Inbox',
        2,
        0,
        1
    ),
    (
        'En revisión',
        'RH revisa la hoja de vida.',
        '#F59E0B',
        'Search',
        3,
        0,
        1
    ),
    (
        'Filtro RH',
        'Proceso de validación inicial.',
        '#8B5CF6',
        'Filter',
        4,
        0,
        1
    ),
    (
        'Prueba Técnica',
        'Pendiente prueba técnica.',
        '#EC4899',
        'Code',
        5,
        0,
        1
    ),
    (
        'Entrevista RH',
        'Entrevista con Talento Humano.',
        '#10B981',
        'Users',
        6,
        0,
        1
    ),
    (
        'Entrevista Técnica',
        'Entrevista técnica.',
        '#14B8A6',
        'Laptop',
        7,
        0,
        1
    ),
    (
        'Finalista',
        'Candidato finalista.',
        '#6366F1',
        'Award',
        8,
        0,
        1
    ),
    (
        'Oferta Laboral',
        'Oferta enviada.',
        '#059669',
        'FileCheck',
        9,
        0,
        1
    ),
    (
        'Contratado',
        'Proceso exitoso.',
        '#16A34A',
        'BadgeCheck',
        10,
        1,
        1
    ),
    (
        'No Seleccionado',
        'Proceso finalizado sin contratación.',
        '#DC2626',
        'XCircle',
        11,
        1,
        1
    ),
    (
        'Proceso Cerrado',
        'Vacante cerrada.',
        '#6B7280',
        'Lock',
        12,
        1,
        1
    );

INSERT INTO
    modalidades_trabajo (nombre)
VALUES ('Presencial'),
    ('Remoto'),
    ('Híbrido');

INSERT INTO
    tipos_contrato (nombre)
VALUES ('Indefinido'),
    ('Fijo'),
    ('Obra Labor'),
    ('Prestación de Servicios'),
    ('Aprendiz'),
    ('Prácticas');

INSERT INTO
    areas_empresa (nombre, icono, color)
VALUES (
        'Tecnología',
        'Laptop',
        '#2563EB'
    ),
    (
        'Marketing',
        'Megaphone',
        '#EC4899'
    ),
    (
        'Ventas',
        'TrendingUp',
        '#10B981'
    ),
    (
        'Operaciones',
        'Briefcase',
        '#F59E0B'
    ),
    (
        'Call Center',
        'Phone',
        '#06B6D4'
    ),
    (
        'Psicología',
        'Brain',
        '#8B5CF6'
    ),
    (
        'Jurídica',
        'Scale',
        '#DC2626'
    ),
    (
        'Administración',
        'Building',
        '#64748B'
    ),
    (
        'Talento Humano',
        'Users',
        '#059669'
    ),
    (
        'Finanzas',
        'DollarSign',
        '#16A34A'
    );

INSERT INTO
    cargos (area_id, nombre, nivel)
VALUES (
        1,
        'Desarrollador Frontend',
        'Junior'
    ),
    (
        1,
        'Desarrollador Frontend',
        'Senior'
    ),
    (
        1,
        'Desarrollador Backend',
        'Senior'
    ),
    (1, 'Full Stack', 'Senior'),
    (
        2,
        'Diseñador UX/UI',
        'Senior'
    ),
    (
        2,
        'Community Manager',
        'Junior'
    ),
    (
        2,
        'Marketing Digital',
        'Senior'
    ),
    (
        3,
        'Asesor Comercial',
        'Junior'
    ),
    (
        4,
        'Coordinador Operativo',
        'Coordinador'
    ),
    (9, 'Analista RRHH', 'Senior');

INSERT INTO
    habilidades (nombre, categoria, color)
VALUES (
        'React',
        'Frontend',
        '#61DAFB'
    ),
    (
        'Next.js',
        'Frontend',
        '#000000'
    ),
    (
        'TypeScript',
        'Frontend',
        '#3178C6'
    ),
    (
        'JavaScript',
        'Frontend',
        '#F7DF1E'
    ),
    (
        'Node.js',
        'Backend',
        '#339933'
    ),
    (
        'Express',
        'Backend',
        '#444444'
    ),
    ('PHP', 'Backend', '#777BB4'),
    (
        'Laravel',
        'Backend',
        '#FF2D20'
    ),
    (
        'MySQL',
        'Database',
        '#00758F'
    ),
    (
        'PostgreSQL',
        'Database',
        '#336791'
    ),
    ('Git', 'DevOps', '#F05032'),
    ('Docker', 'DevOps', '#2496ED'),
    (
        'Power BI',
        'Analytics',
        '#F2C811'
    ),
    ('Excel', 'Office', '#217346'),
    (
        'Ventas',
        'Comercial',
        '#16A34A'
    ),
    (
        'Servicio al Cliente',
        'Soft Skill',
        '#0EA5E9'
    ),
    (
        'Comunicación',
        'Soft Skill',
        '#8B5CF6'
    ),
    (
        'Trabajo en Equipo',
        'Soft Skill',
        '#EC4899'
    );

CREATE TABLE IF NOT EXISTS tipos_documento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80),
    codigo VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE
);

INSERT INTO
    tipos_documento (nombre, codigo)
VALUES ('Cédula de Ciudadanía', 'CC'),
    ('Cédula de Extranjería', 'CE'),
    ('Tarjeta de Identidad', 'TI'),
    ('Pasaporte', 'PAS'),
    (
        'Permiso por Protección Temporal',
        'PPT'
    );

CREATE TABLE IF NOT EXISTS configuracion (
    id INT PRIMARY KEY AUTO_INCREMENT,
    empresa VARCHAR(255),
    email_rrhh VARCHAR(255),
    telefono VARCHAR(50),
    pais VARCHAR(100),
    moneda VARCHAR(20),
    timezone VARCHAR(100)
);

INSERT INTO
    configuracion (
        empresa,
        email_rrhh,
        telefono,
        pais,
        moneda,
        timezone
    )
VALUES (
        'Jardines del Renacer',
        'rrhh@jardinesdelrenacer.com',
        '+57',
        'Colombia',
        'COP',
        'America/Bogota'
    );