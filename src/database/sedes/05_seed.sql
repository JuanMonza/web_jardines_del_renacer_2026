-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MÓDULO: SEDES
-- Archivo: 05_seed.sql
--
-- Datos maestros del módulo
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TIPOS DE SEDE
-- ============================================================

INSERT INTO
    sedes_tipos (
        nombre,
        descripcion,
        icono,
        color,
        orden
    )
VALUES (
        'Oficina Principal',
        'Sede administrativa principal',
        'corporate_fare',
        '#005A9C',
        1
    ),
    (
        'Sala de Velación',
        'Instalaciones para ceremonias y acompañamiento',
        'meeting_room',
        '#7A5C3E',
        2
    ),
    (
        'Parque Cementerio',
        'Parque memorial y cementerio',
        'park',
        '#2E7D32',
        3
    ),
    (
        'Centro de Atención',
        'Punto de atención al cliente',
        'support_agent',
        '#1565C0',
        4
    ),
    (
        'Sucursal',
        'Sucursal comercial',
        'store',
        '#6A1B9A',
        5
    );

-- ============================================================
-- CATÁLOGO DE SERVICIOS
-- ============================================================

INSERT INTO
    sedes_servicios_catalogo (
        nombre,
        descripcion,
        icono,
        color,
        orden
    )
VALUES (
        'Velación',
        'Servicio de salas de velación',
        'church',
        '#4E342E',
        1
    ),
    (
        'Cremación',
        'Servicio de cremación',
        'local_fire_department',
        '#EF6C00',
        2
    ),
    (
        'Inhumación',
        'Servicio de sepultura',
        'landscape',
        '#2E7D32',
        3
    ),
    (
        'Atención 24 Horas',
        'Disponibilidad permanente',
        'schedule',
        '#1565C0',
        4
    ),
    (
        'Venta de Lotes',
        'Venta de lotes y bóvedas',
        'location_city',
        '#00897B',
        5
    ),
    (
        'Capilla',
        'Capilla para ceremonias religiosas',
        'account_balance',
        '#8E24AA',
        6
    ),
    (
        'Cafetería',
        'Servicio de cafetería',
        'coffee',
        '#6D4C41',
        7
    ),
    (
        'Parqueadero',
        'Parqueadero para visitantes',
        'local_parking',
        '#3949AB',
        8
    ),
    (
        'Floristería',
        'Venta de arreglos florales',
        'local_florist',
        '#D81B60',
        9
    ),
    (
        'Asesor Comercial',
        'Atención comercial personalizada',
        'groups',
        '#00838F',
        10
    ),
    (
        'Acompañamiento en Duelo',
        'Programas psicológicos y espirituales',
        'volunteer_activism',
        '#5E35B1',
        11
    ),
    (
        'Mascotas',
        'Servicios exequiales para mascotas',
        'pets',
        '#43A047',
        12
    ),
    (
        'Seguros',
        'Seguros y protección familiar',
        'verified_user',
        '#F9A825',
        13
    ),
    (
        'Asistencia Jurídica',
        'Servicios legales complementarios',
        'gavel',
        '#455A64',
        14
    ),
    (
        'Atención Empresarial',
        'Convenios corporativos',
        'business_center',
        '#283593',
        15
    );

SET FOREIGN_KEY_CHECKS = 1;