-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 08_notifications.sql
-- Descripción: Centro de notificaciones del sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (

-- Identificador
id BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,

-- Destinatario
admin_user_id BIGINT UNSIGNED NOT NULL COMMENT 'Administrador destinatario',

-- Información
titulo VARCHAR(180)
        NOT NULL
        COMMENT 'Título de la notificación',

    mensaje TEXT
        NOT NULL
        COMMENT 'Contenido',

    tipo ENUM(
        'INFO',
        'SUCCESS',
        'WARNING',
        'ERROR'
    )
        NOT NULL
        DEFAULT 'INFO'
        COMMENT 'Tipo de notificación',

    canal ENUM(
        'SYSTEM',
        'EMAIL',
        'PUSH',
        'SMS',
        'WHATSAPP'
    )
        NOT NULL
        DEFAULT 'SYSTEM'
        COMMENT 'Canal de envío',

    modulo VARCHAR(80)
        DEFAULT NULL
        COMMENT 'Módulo origen',

    referencia VARCHAR(100)
        DEFAULT NULL
        COMMENT 'UUID o código relacionado',

    url VARCHAR(255)
        DEFAULT NULL
        COMMENT 'Ruta a abrir',

    icono VARCHAR(80)
        DEFAULT NULL
        COMMENT 'Icono de la notificación',

    color VARCHAR(20)
        DEFAULT NULL
        COMMENT 'Color utilizado en la interfaz',

    prioridad ENUM(
        'LOW',
        'NORMAL',
        'HIGH',
        'CRITICAL'
    )
        NOT NULL
        DEFAULT 'NORMAL'
        COMMENT 'Prioridad',

    leida BOOLEAN
        NOT NULL
        DEFAULT FALSE
        COMMENT 'Estado de lectura',

    enviada BOOLEAN
        NOT NULL
        DEFAULT FALSE
        COMMENT 'Indica si ya fue enviada',

    leida_en DATETIME
        DEFAULT NULL
        COMMENT 'Fecha de lectura',

    enviada_en DATETIME
        DEFAULT NULL
        COMMENT 'Fecha de envío',

    programada_para DATETIME
        DEFAULT NULL
        COMMENT 'Fecha programada',

    expira_en DATETIME
        DEFAULT NULL
        COMMENT 'Fecha de expiración',

    metadata JSON
        DEFAULT NULL
        COMMENT 'Información adicional',

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_admin

        FOREIGN KEY (admin_user_id)

        REFERENCES admin_users(id)

        ON UPDATE CASCADE

        ON DELETE CASCADE

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Centro de notificaciones del sistema';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_notification_admin ON notifications (admin_user_id);

CREATE INDEX idx_notification_tipo ON notifications (tipo);

CREATE INDEX idx_notification_canal ON notifications (canal);

CREATE INDEX idx_notification_modulo ON notifications (modulo);

CREATE INDEX idx_notification_leida ON notifications (leida);

CREATE INDEX idx_notification_enviada ON notifications (enviada);

CREATE INDEX idx_notification_prioridad ON notifications (prioridad);

CREATE INDEX idx_notification_fecha ON notifications (created_at);

CREATE INDEX idx_notification_programada ON notifications (programada_para);