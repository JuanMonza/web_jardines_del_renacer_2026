-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 07_audit_logs.sql
-- Descripción: Auditoría general del sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (

-- Identificador
id BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,

-- Usuario
admin_user_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'Administrador que realizó la acción',
session_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'Sesión desde donde se ejecutó la acción',

-- Acción
modulo VARCHAR(80) NOT NULL COMMENT 'Módulo afectado',
entidad VARCHAR(80) NOT NULL COMMENT 'Tabla o entidad afectada',
registro_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'ID del registro afectado',
accion ENUM(
    'LOGIN',
    'LOGOUT',
    'CREATE',
    'UPDATE',
    'DELETE',
    'RESTORE',
    'VIEW',
    'EXPORT',
    'IMPORT',
    'APPROVE',
    'REJECT',
    'UPLOAD',
    'DOWNLOAD',
    'CONFIG'
) NOT NULL COMMENT 'Acción ejecutada',
descripcion VARCHAR(255) DEFAULT NULL COMMENT 'Descripción resumida',

-- Datos
datos_anteriores JSON DEFAULT NULL COMMENT 'Estado antes del cambio',
datos_nuevos JSON DEFAULT NULL COMMENT 'Estado después del cambio',
cambios JSON DEFAULT NULL COMMENT 'Campos modificados',

-- Red
ip VARCHAR(45)
        DEFAULT NULL
        COMMENT 'Dirección IP',

    user_agent TEXT
        COMMENT 'Navegador del usuario',

    metodo_http VARCHAR(10)
        DEFAULT NULL
        COMMENT 'GET, POST, PUT, DELETE',

    endpoint VARCHAR(255)
        DEFAULT NULL
        COMMENT 'Ruta consumida',

    codigo_respuesta SMALLINT UNSIGNED
        DEFAULT NULL
        COMMENT 'Código HTTP',

    exito BOOLEAN
        NOT NULL
        DEFAULT TRUE
        COMMENT 'Resultado de la operación',

    mensaje_error TEXT
        DEFAULT NULL
        COMMENT 'Error registrado',

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Fecha del evento',

    CONSTRAINT fk_audit_admin
        FOREIGN KEY (admin_user_id)
        REFERENCES admin_users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_audit_session
        FOREIGN KEY (session_id)
        REFERENCES admin_sessions(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de auditoría del sistema';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_audit_admin ON audit_logs (admin_user_id);

CREATE INDEX idx_audit_session ON audit_logs (session_id);

CREATE INDEX idx_audit_modulo ON audit_logs (modulo);

CREATE INDEX idx_audit_entidad ON audit_logs (entidad);

CREATE INDEX idx_audit_registro ON audit_logs (registro_id);

CREATE INDEX idx_audit_accion ON audit_logs (accion);

CREATE INDEX idx_audit_fecha ON audit_logs (created_at);

CREATE INDEX idx_audit_ip ON audit_logs (ip);

CREATE INDEX idx_audit_exito ON audit_logs (exito);