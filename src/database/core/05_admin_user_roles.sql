-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 05_admin_user_roles.sql
-- Descripción: Asignación de roles a administradores
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_user_roles (

-- Relaciones
admin_user_id BIGINT UNSIGNED NOT NULL COMMENT 'Administrador',
role_id SMALLINT UNSIGNED NOT NULL COMMENT 'Rol asignado',

-- Auditoría
asignado_por BIGINT UNSIGNED
        DEFAULT NULL
        COMMENT 'Administrador que asignó el rol',

    fecha_asignacion TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Fecha de asignación',

    fecha_expiracion DATETIME
        DEFAULT NULL
        COMMENT 'Permite asignaciones temporales',

    activo BOOLEAN
        NOT NULL
        DEFAULT TRUE
        COMMENT 'Estado de la asignación',

    observaciones VARCHAR(255)
        DEFAULT NULL
        COMMENT 'Observaciones',

    PRIMARY KEY (
        admin_user_id,
        role_id
    ),

    CONSTRAINT fk_admin_roles_user
        FOREIGN KEY (admin_user_id)
        REFERENCES admin_users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_admin_roles_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_admin_roles_asignado
        FOREIGN KEY (asignado_por)
        REFERENCES admin_users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Relación entre administradores y roles';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_admin_roles_user ON admin_user_roles (admin_user_id);

CREATE INDEX idx_admin_roles_role ON admin_user_roles (role_id);

CREATE INDEX idx_admin_roles_activo ON admin_user_roles (activo);

CREATE INDEX idx_admin_roles_expiracion ON admin_user_roles (fecha_expiracion);