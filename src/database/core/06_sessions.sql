-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 06_sessions.sql
-- Descripción: Control de sesiones de administradores
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_sessions (

-- Identificador
id BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,

-- Usuario
admin_user_id BIGINT UNSIGNED NOT NULL COMMENT 'Administrador propietario de la sesión',

-- Seguridad
session_token CHAR(64) NOT NULL COMMENT 'Token único de sesión' UNIQUE,
refresh_token CHAR(64) DEFAULT NULL COMMENT 'Token de renovación' UNIQUE,

-- Dispositivo
dispositivo VARCHAR(120) DEFAULT NULL COMMENT 'Nombre del dispositivo',
navegador VARCHAR(120) DEFAULT NULL COMMENT 'Navegador utilizado',
sistema_operativo VARCHAR(120) DEFAULT NULL COMMENT 'Sistema operativo',
user_agent TEXT COMMENT 'User Agent completo',

-- Red
ip VARCHAR(45) NOT NULL COMMENT 'Dirección IP',
pais VARCHAR(100) DEFAULT NULL COMMENT 'País',
departamento VARCHAR(100) DEFAULT NULL COMMENT 'Departamento',
ciudad VARCHAR(100) DEFAULT NULL COMMENT 'Ciudad',
latitud DECIMAL(10, 7) DEFAULT NULL COMMENT 'Latitud aproximada',
longitud DECIMAL(10, 7) DEFAULT NULL COMMENT 'Longitud aproximada',

-- Estado
iniciada_en DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Inicio de sesión',

    ultima_actividad DATETIME
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Última actividad registrada',

    expira_en DATETIME
        NOT NULL
        COMMENT 'Fecha de expiración',

    cerrada_en DATETIME
        DEFAULT NULL
        COMMENT 'Fecha de cierre',

    motivo_cierre ENUM(
        'LOGOUT',
        'EXPIRADA',
        'REVOCADA',
        'CAMBIO_PASSWORD',
        'ADMIN',
        'INACTIVIDAD'
    )
        DEFAULT NULL
        COMMENT 'Motivo del cierre',

    activa BOOLEAN
        NOT NULL
        DEFAULT TRUE
        COMMENT 'Estado de la sesión',

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_admin

        FOREIGN KEY (admin_user_id)

        REFERENCES admin_users(id)

        ON UPDATE CASCADE

        ON DELETE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Sesiones activas e históricas de administradores';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_session_admin ON admin_sessions (admin_user_id);

CREATE INDEX idx_session_token ON admin_sessions (session_token);

CREATE INDEX idx_session_ip ON admin_sessions (ip);

CREATE INDEX idx_session_activa ON admin_sessions (activa);

CREATE INDEX idx_session_expira ON admin_sessions (expira_en);

CREATE INDEX idx_session_last_activity ON admin_sessions (ultima_actividad);