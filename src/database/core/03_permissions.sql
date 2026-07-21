-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 03_permissions.sql
-- Descripción: Catálogo de permisos del sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS permissions (

-- Identificador
id INT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,

-- Información
modulo VARCHAR(80)
        NOT NULL
        COMMENT 'Módulo al que pertenece el permiso',

    codigo VARCHAR(120)
        NOT NULL
        COMMENT 'Código único del permiso'
        UNIQUE,

    nombre VARCHAR(150)
        NOT NULL
        COMMENT 'Nombre visible',

    descripcion VARCHAR(255)
        DEFAULT NULL
        COMMENT 'Descripción del permiso',

    accion ENUM(
        'VIEW',
        'CREATE',
        'UPDATE',
        'DELETE',
        'EXPORT',
        'IMPORT',
        'APPROVE',
        'MANAGE'
    )
        NOT NULL
        COMMENT 'Tipo de acción',

    es_sistema BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    activo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP NULL
        DEFAULT NULL

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Catálogo de permisos del sistema';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_permissions_modulo ON permissions (modulo);

CREATE INDEX idx_permissions_codigo ON permissions (codigo);

CREATE INDEX idx_permissions_accion ON permissions (accion);

CREATE INDEX idx_permissions_activo ON permissions (activo);

CREATE INDEX idx_permissions_deleted ON permissions (deleted_at);