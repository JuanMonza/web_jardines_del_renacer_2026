-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 10_system_settings.sql
-- Descripción: Configuración global del sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS system_settings (

-- Identificador
id INT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,

-- Organización
categoria VARCHAR(100) NOT NULL COMMENT 'Grupo de configuración',
clave VARCHAR(150) NOT NULL COMMENT 'Clave única' UNIQUE,
nombre VARCHAR(180) NOT NULL COMMENT 'Nombre visible',
descripcion VARCHAR(255) DEFAULT NULL COMMENT 'Descripción de la configuración',

-- Valor
tipo ENUM(
    'STRING',
    'TEXT',
    'INTEGER',
    'DECIMAL',
    'BOOLEAN',
    'JSON',
    'DATE',
    'DATETIME'
) NOT NULL DEFAULT 'STRING' COMMENT 'Tipo de dato',
valor LONGTEXT COMMENT 'Valor almacenado',
valor_por_defecto LONGTEXT COMMENT 'Valor por defecto',
requerido BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Configuración obligatoria',
editable BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Permite editar desde el panel',
visible BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Visible para administradores',
orden SMALLINT UNSIGNED DEFAULT 0 COMMENT 'Orden de visualización',

-- Auditoría

updated_by BIGINT UNSIGNED
        DEFAULT NULL
        COMMENT 'Administrador que realizó el último cambio',

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_settings_updated_by

        FOREIGN KEY (updated_by)

        REFERENCES admin_users(id)

        ON UPDATE CASCADE

        ON DELETE SET NULL

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Configuración general del sistema';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_settings_categoria ON system_settings (categoria);

CREATE INDEX idx_settings_clave ON system_settings (clave);

CREATE INDEX idx_settings_tipo ON system_settings (tipo);

CREATE INDEX idx_settings_editable ON system_settings (editable);

CREATE INDEX idx_settings_visible ON system_settings (visible);

CREATE INDEX idx_settings_orden ON system_settings (orden);

-- ============================================================
-- CONFIGURACIÓN GENERAL
-- ============================================================

INSERT INTO
    system_settings (
        categoria,
        clave,
        nombre,
        tipo,
        valor,
        requerido
    )
VALUES (
        'EMPRESA',
        'company_name',
        'Nombre de la empresa',
        'STRING',
        'Jardines del Renacer',
        TRUE
    ),
    (
        'EMPRESA',
        'company_nit',
        'NIT',
        'STRING',
        '',
        FALSE
    ),
    (
        'EMPRESA',
        'company_email',
        'Correo principal',
        'STRING',
        '',
        FALSE
    ),
    (
        'EMPRESA',
        'company_phone',
        'Teléfono',
        'STRING',
        '',
        FALSE
    ),
    (
        'EMPRESA',
        'company_address',
        'Dirección',
        'TEXT',
        '',
        FALSE
    ),
    (
        'EMPRESA',
        'company_logo',
        'Logo principal',
        'STRING',
        '',
        FALSE
    ),
    (
        'EMPRESA',
        'company_favicon',
        'Favicon',
        'STRING',
        '',
        FALSE
    ),
    (
        'AUTH',
        'session_timeout',
        'Tiempo de sesión (minutos)',
        'INTEGER',
        '60',
        TRUE
    ),
    (
        'AUTH',
        'max_login_attempts',
        'Intentos máximos',
        'INTEGER',
        '5',
        TRUE
    ),
    (
        'AUTH',
        'password_expiration_days',
        'Expiración contraseña',
        'INTEGER',
        '90',
        TRUE
    ),
    (
        'EMAIL',
        'smtp_host',
        'Servidor SMTP',
        'STRING',
        '',
        FALSE
    ),
    (
        'EMAIL',
        'smtp_port',
        'Puerto SMTP',
        'INTEGER',
        '587',
        FALSE
    ),
    (
        'EMAIL',
        'smtp_user',
        'Usuario SMTP',
        'STRING',
        '',
        FALSE
    ),
    (
        'EMAIL',
        'smtp_password',
        'Contraseña SMTP',
        'STRING',
        '',
        FALSE
    ),
    (
        'WHATSAPP',
        'api_url',
        'API WhatsApp',
        'STRING',
        '',
        FALSE
    ),
    (
        'WHATSAPP',
        'api_token',
        'Token API',
        'STRING',
        '',
        FALSE
    ),
    (
        'STORAGE',
        'driver',
        'Proveedor de almacenamiento',
        'STRING',
        'LOCAL',
        TRUE
    ),
    (
        'STORAGE',
        'max_upload_mb',
        'Peso máximo de archivos',
        'INTEGER',
        '25',
        TRUE
    ),
    (
        'SYSTEM',
        'maintenance_mode',
        'Modo mantenimiento',
        'BOOLEAN',
        'false',
        TRUE
    ),
    (
        'SYSTEM',
        'timezone',
        'Zona horaria',
        'STRING',
        'America/Bogota',
        TRUE
    ),
    (
        'SYSTEM',
        'locale',
        'Idioma',
        'STRING',
        'es-CO',
        TRUE
    );