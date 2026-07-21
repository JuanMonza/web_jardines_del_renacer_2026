-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- CORE
-- Archivo: 09_media.sql
-- Descripción: Gestor centralizado de archivos multimedia
-- ============================================================

CREATE TABLE IF NOT EXISTS media (

-- Identificación
id BIGINT UNSIGNED AUTO_INCREMENT COMMENT 'Identificador interno' PRIMARY KEY,
uuid CHAR(36) NOT NULL DEFAULT(UUID()) COMMENT 'Identificador público' UNIQUE,

-- Información del archivo
nombre VARCHAR(255) NOT NULL COMMENT 'Nombre original del archivo',
nombre_sistema VARCHAR(255) NOT NULL COMMENT 'Nombre físico almacenado',
extension VARCHAR(20) NOT NULL COMMENT 'Extensión del archivo',
mime_type VARCHAR(120) NOT NULL COMMENT 'Tipo MIME',
categoria ENUM(
    'IMAGE',
    'VIDEO',
    'DOCUMENT',
    'AUDIO',
    'PDF',
    'SPREADSHEET',
    'PRESENTATION',
    'ZIP',
    'OTHER'
) NOT NULL COMMENT 'Categoría del archivo',
tamano BIGINT UNSIGNED NOT NULL COMMENT 'Tamaño en bytes',
ancho INT UNSIGNED DEFAULT NULL COMMENT 'Ancho en píxeles',
alto INT UNSIGNED DEFAULT NULL COMMENT 'Alto en píxeles',
duracion INT UNSIGNED DEFAULT NULL COMMENT 'Duración en segundos',

-- Ubicación
almacenamiento ENUM(
    'LOCAL',
    'S3',
    'CLOUDINARY',
    'AZURE',
    'GCS'
) NOT NULL DEFAULT 'LOCAL' COMMENT 'Proveedor de almacenamiento',
ruta VARCHAR(500) NOT NULL COMMENT 'Ruta física o URL',
carpeta VARCHAR(255) DEFAULT NULL COMMENT 'Carpeta lógica',
thumbnail VARCHAR(500) DEFAULT NULL COMMENT 'Miniatura',
checksum CHAR(64) DEFAULT NULL COMMENT 'Hash SHA-256',

-- Relación genérica
modulo VARCHAR(80) DEFAULT NULL COMMENT 'Módulo relacionado',
entidad VARCHAR(80) DEFAULT NULL COMMENT 'Entidad relacionada',
entidad_id BIGINT UNSIGNED DEFAULT NULL COMMENT 'Registro relacionado',

-- Información adicional
titulo VARCHAR(255) DEFAULT NULL COMMENT 'Título',
descripcion TEXT DEFAULT NULL COMMENT 'Descripción',
alt_text VARCHAR(255) DEFAULT NULL COMMENT 'Texto alternativo',
etiquetas JSON DEFAULT NULL COMMENT 'Etiquetas',
metadata JSON DEFAULT NULL COMMENT 'Metadatos EXIF u otros',

-- Estado
publico BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Visible públicamente',
activo BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Estado',

-- Auditoría
uploaded_by BIGINT UNSIGNED
        DEFAULT NULL
        COMMENT 'Administrador que cargó el archivo',

    created_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    deleted_at TIMESTAMP
        DEFAULT NULL,

    CONSTRAINT fk_media_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFERENCES admin_users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL

)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci
COMMENT='Repositorio centralizado de archivos multimedia';

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX idx_media_uuid ON media (uuid);

CREATE INDEX idx_media_categoria ON media (categoria);

CREATE INDEX idx_media_modulo ON media (modulo);

CREATE INDEX idx_media_entidad ON media (entidad);

CREATE INDEX idx_media_entidad_id ON media (entidad_id);

CREATE INDEX idx_media_uploaded_by ON media (uploaded_by);

CREATE INDEX idx_media_publico ON media (publico);

CREATE INDEX idx_media_activo ON media (activo);

CREATE INDEX idx_media_deleted ON media (deleted_at);

CREATE INDEX idx_media_checksum ON media (checksum);