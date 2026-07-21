-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 02_roles.sql
-- Descripción: Roles del sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (

-- Identificador
id SMALLINT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,

-- Información
nombre VARCHAR(80) NOT NULL COMMENT 'Nombre único del rol' UNIQUE,
descripcion VARCHAR(255) DEFAULT NULL COMMENT 'Descripción del rol',
color VARCHAR(20) DEFAULT '#6B7280' COMMENT 'Color identificador para la interfaz',
icono VARCHAR(100) DEFAULT NULL COMMENT 'Icono del panel administrativo',
prioridad SMALLINT UNSIGNED NOT NULL DEFAULT 100 COMMENT 'Menor número = mayor prioridad',
es_sistema BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Evita eliminar roles críticos',
activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado del rol',

-- Auditoría
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
COMMENT='Roles disponibles para el sistema';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_roles_nombre ON roles (nombre);

CREATE INDEX idx_roles_activo ON roles (activo);

CREATE INDEX idx_roles_prioridad ON roles (prioridad);

CREATE INDEX idx_roles_deleted ON roles (deleted_at);