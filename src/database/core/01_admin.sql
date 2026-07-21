-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 01_admin.sql
-- Descripción: Usuarios administradores del sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (

-- Identificación
id BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,
cedula VARCHAR(20) NOT NULL COMMENT 'Documento de identidad' UNIQUE,

-- Información personal
nombres VARCHAR(120) NOT NULL COMMENT 'Nombres del administrador',
apellidos VARCHAR(120) NOT NULL COMMENT 'Apellidos del administrador',
email VARCHAR(180) NOT NULL COMMENT 'Correo electrónico' UNIQUE,
telefono VARCHAR(30) DEFAULT NULL COMMENT 'Teléfono de contacto',

-- Seguridad
password_hash VARCHAR(255) NOT NULL COMMENT 'Contraseña cifrada (Argon2 o BCrypt)',
email_verificado BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Indica si el correo fue verificado',
intentos_fallidos SMALLINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Intentos fallidos de inicio de sesión',
bloqueado_hasta DATETIME DEFAULT NULL COMMENT 'Fecha hasta la cual permanece bloqueada la cuenta',
ultimo_login DATETIME DEFAULT NULL COMMENT 'Último inicio de sesión',
ultimo_ip VARCHAR(45) DEFAULT NULL COMMENT 'Última dirección IP utilizada',

-- Multimedia
foto_media_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'Referencia a la tabla media (se agregará posteriormente)',

-- Estado
activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado del usuario',
observaciones TEXT COMMENT 'Observaciones internas',

-- Auditoría
created_by BIGINT UNSIGNED
        DEFAULT NULL
        COMMENT 'Administrador que creó el registro',

    updated_by BIGINT UNSIGNED
        DEFAULT NULL
        COMMENT 'Administrador que actualizó el registro',

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Fecha de creación',

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
        COMMENT 'Fecha de última actualización',

    deleted_at TIMESTAMP NULL
        DEFAULT NULL
        COMMENT 'Soft Delete'

)
ENGINE = InnoDB
DEFAULT CHARSET = utf8mb4
COLLATE = utf8mb4_unicode_ci
COMMENT = 'Usuarios administradores del sistema';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_admin_uuid ON admin_users (uuid);

CREATE INDEX idx_admin_cedula ON admin_users (cedula);

CREATE INDEX idx_admin_email ON admin_users (email);

CREATE INDEX idx_admin_activo ON admin_users (activo);

CREATE INDEX idx_admin_login ON admin_users (ultimo_login);

CREATE INDEX idx_admin_deleted ON admin_users (deleted_at);

-- ============================================================
-- NOTAS
-- ============================================================
-- 1. Los roles NO se almacenan en esta tabla.
--    Se manejarán mediante:
--      - roles
--      - permissions
--      - admin_user_roles
--      - role_permissions
--
-- 2. foto_media_id tendrá una FOREIGN KEY cuando exista
--    la tabla core/media.
--
-- 3. created_by y updated_by tendrán FOREIGN KEY hacia
--    admin_users cuando el módulo Core esté completo.
--
-- ============================================================