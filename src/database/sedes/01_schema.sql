-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MÓDULO: SEDES
-- Archivo: 01_schema.sql
-- Descripción:
-- Estructura principal del módulo de sedes.
--
-- Dependencias:
-- • Core
-- • Geo
--
-- Utilizado por:
-- • Obituarios
-- • Talleres
-- • Floristería
-- • Cotizaciones
-- • PQR
-- • Aliados
-- ============================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLA: sedes_tipos
-- Catálogo de tipos de sede
-- ============================================================

CREATE TABLE IF NOT EXISTS sedes_tipos (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno',
    uuid CHAR(36) NOT NULL DEFAULT(UUID()) UNIQUE COMMENT 'UUID público',
    nombre VARCHAR(100) NOT NULL COMMENT 'Nombre del tipo de sede',
    descripcion VARCHAR(255) DEFAULT NULL COMMENT 'Descripción',
    icono VARCHAR(80) DEFAULT NULL COMMENT 'Icono Material',
    color VARCHAR(20) DEFAULT NULL COMMENT 'Color hexadecimal',
    orden SMALLINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Orden de visualización',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED DEFAULT NULL,
    updated_by BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Catálogo de tipos de sedes';

-- ============================================================
-- TABLA: sedes
-- Información principal de cada sede
-- ============================================================

CREATE TABLE IF NOT EXISTS sedes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno',
    uuid CHAR(36) NOT NULL DEFAULT(UUID()) UNIQUE COMMENT 'UUID público',
    codigo VARCHAR(30) NOT NULL UNIQUE COMMENT 'Código interno',
    nombre VARCHAR(180) NOT NULL COMMENT 'Nombre de la sede',
    slug VARCHAR(180) NOT NULL UNIQUE COMMENT 'Slug SEO',
    tipo_id SMALLINT UNSIGNED NOT NULL COMMENT 'Tipo de sede',
    country_id SMALLINT UNSIGNED DEFAULT NULL COMMENT 'País',
    department_id SMALLINT UNSIGNED DEFAULT NULL COMMENT 'Departamento',
    city_id INT UNSIGNED DEFAULT NULL COMMENT 'Ciudad',
    direccion VARCHAR(255) NOT NULL COMMENT 'Dirección física',
    direccion_visible VARCHAR(255) DEFAULT NULL COMMENT 'Dirección amigable',
    codigo_postal VARCHAR(20) DEFAULT NULL COMMENT 'Código postal',
    latitud DECIMAL(10, 7) DEFAULT NULL,
    longitud DECIMAL(10, 7) DEFAULT NULL,
    email VARCHAR(180) DEFAULT NULL,
    sitio_web VARCHAR(255) DEFAULT NULL,
    descripcion TEXT DEFAULT NULL,
    instrucciones_llegada TEXT DEFAULT NULL,
    foto_principal_media_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'Imagen principal',
    responsable_admin_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'Administrador responsable',
    disponible_24_horas BOOLEAN NOT NULL DEFAULT FALSE,
    mostrar_en_web BOOLEAN NOT NULL DEFAULT TRUE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    observaciones TEXT DEFAULT NULL,
    created_by BIGINT UNSIGNED DEFAULT NULL,
    updated_by BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Sedes físicas de Jardines del Renacer';

-- ============================================================
-- TABLA: sedes_telefonos
-- Teléfonos de contacto de las sedes
-- ============================================================

CREATE TABLE IF NOT EXISTS sedes_telefonos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador interno',
    uuid CHAR(36) NOT NULL DEFAULT(UUID()) UNIQUE COMMENT 'UUID público',
    sede_id BIGINT UNSIGNED NOT NULL COMMENT 'Sede',
    tipo ENUM(
        'PBX',
        'Celular',
        'WhatsApp',
        'Emergencias',
        'Fax',
        'Otro'
    ) NOT NULL DEFAULT 'PBX' COMMENT 'Tipo de teléfono',
    numero VARCHAR(30) NOT NULL COMMENT 'Número telefónico',
    extension VARCHAR(15) DEFAULT NULL COMMENT 'Extensión',
    principal BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Teléfono principal',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED DEFAULT NULL,
    updated_by BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Teléfonos de las sedes';

-- ============================================================
-- TABLA: sedes_horarios
-- Horarios de atención
-- ============================================================

CREATE TABLE IF NOT EXISTS sedes_horarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL DEFAULT(UUID()) UNIQUE,
    sede_id BIGINT UNSIGNED NOT NULL,
    dia_semana ENUM(
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
        'Festivo'
    ) NOT NULL,
    hora_apertura TIME DEFAULT NULL,
    hora_cierre TIME DEFAULT NULL,
    atiende_24_horas BOOLEAN NOT NULL DEFAULT FALSE,
    observaciones VARCHAR(255) DEFAULT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED DEFAULT NULL,
    updated_by BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Horarios de atención de las sedes';

-- ============================================================
-- TABLA: sedes_servicios_catalogo
-- Catálogo de servicios
-- ============================================================

CREATE TABLE IF NOT EXISTS sedes_servicios_catalogo (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid CHAR(36) NOT NULL DEFAULT(UUID()) UNIQUE,
    nombre VARCHAR(120) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    icono VARCHAR(80) DEFAULT NULL,
    color VARCHAR(20) DEFAULT NULL,
    orden SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED DEFAULT NULL,
    updated_by BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Catálogo de servicios disponibles';

-- ============================================================
-- TABLA: sedes_servicios
-- Relación muchos a muchos
-- ============================================================

CREATE TABLE IF NOT EXISTS sedes_servicios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sede_id BIGINT UNSIGNED NOT NULL,
    servicio_id SMALLINT UNSIGNED NOT NULL,
    destacado BOOLEAN NOT NULL DEFAULT FALSE,
    observaciones TEXT DEFAULT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED DEFAULT NULL,
    updated_by BIGINT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    UNIQUE KEY uk_sede_servicio (sede_id, servicio_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Servicios ofrecidos por cada sede';