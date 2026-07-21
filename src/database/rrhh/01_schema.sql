-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MySQL 8+
-- Engine: InnoDB
-- Charset: utf8mb4
-- ============================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS jardinesweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE jardinesweb;

-- ============================================================
-- TABLA CANDIDATOS
-- Perfil único del postulante
-- ============================================================

CREATE TABLE IF NOT EXISTS candidatos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    documento VARCHAR(30) NOT NULL UNIQUE,
    tipo_documento ENUM(
        'CC',
        'CE',
        'TI',
        'PASAPORTE',
        'PEP',
        'PPT'
    ) DEFAULT 'CC',
    nombres VARCHAR(120) NOT NULL,
    apellidos VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    telefono VARCHAR(30),
    fecha_nacimiento DATE NULL,
    genero ENUM(
        'M',
        'F',
        'OTRO',
        'NO_DESEA_DECIR'
    ) DEFAULT 'NO_DESEA_DECIR',
    direccion VARCHAR(250),
    ciudad VARCHAR(120),
    departamento VARCHAR(120),
    pais VARCHAR(120) DEFAULT 'Colombia',
    profesion VARCHAR(200),
    experiencia TEXT,
    educacion TEXT,
    habilidades TEXT,
    idiomas TEXT,
    linkedin VARCHAR(255),
    github VARCHAR(255),
    portfolio VARCHAR(255),
    foto_url VARCHAR(255),
    cv_url VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    ultimo_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA VACANTES
-- ============================================================

CREATE TABLE IF NOT EXISTS vacantes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE,
    descripcion LONGTEXT,
    requisitos LONGTEXT,
    responsabilidades LONGTEXT,
    beneficios LONGTEXT,
    ciudad VARCHAR(120),
    departamento VARCHAR(120),
    modalidad ENUM(
        'Presencial',
        'Híbrido',
        'Remoto'
    ) DEFAULT 'Presencial',
    tipo_contrato ENUM(
        'Indefinido',
        'Fijo',
        'Prestación de Servicios',
        'Aprendiz',
        'Prácticas'
    ),
    salario_desde DECIMAL(12, 2),
    salario_hasta DECIMAL(12, 2),
    mostrar_salario BOOLEAN DEFAULT TRUE,
    cantidad_vacantes INT DEFAULT 1,
    estado ENUM(
        'Borrador',
        'Publicada',
        'Pausada',
        'Cerrada'
    ) DEFAULT 'Borrador',
    destacada BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    applications_count INT DEFAULT 0,
    fecha_publicacion DATETIME,
    fecha_cierre DATETIME,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA ESTADOS DE POSTULACIÓN
-- Estados configurables del proceso de selección
-- ============================================================

CREATE TABLE IF NOT EXISTS estados_postulacion (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    color VARCHAR(30) DEFAULT '#3B82F6',
    icono VARCHAR(80),
    orden INT NOT NULL,
    es_final BOOLEAN DEFAULT FALSE,
    permite_edicion BOOLEAN DEFAULT TRUE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA POSTULACIONES
-- Relaciona candidatos con vacantes
-- ============================================================

CREATE TABLE IF NOT EXISTS postulaciones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    candidato_id BIGINT UNSIGNED NOT NULL,
    vacante_id BIGINT UNSIGNED NOT NULL,
    estado ENUM(
        'Postulado',
        'Recibido',
        'En revisión',
        'Filtro RH',
        'Prueba técnica',
        'Entrevista RH',
        'Entrevista Técnica',
        'Finalista',
        'Contratado',
        'No seleccionado',
        'Proceso cerrado'
    ) DEFAULT 'Postulado',
    fuente ENUM(
        'Portal Web',
        'LinkedIn',
        'Computrabajo',
        'Indeed',
        'Referido',
        'Manual'
    ) DEFAULT 'Portal Web',
    observaciones_rh TEXT,
    observaciones_candidato TEXT,
    puntuacion DECIMAL(5, 2) DEFAULT 0,
    cv_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA ENTREVISTAS
-- ============================================================

CREATE TABLE IF NOT EXISTS entrevistas (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    postulacion_id BIGINT UNSIGNED NOT NULL,
    candidato_id BIGINT UNSIGNED NOT NULL,
    vacante_id BIGINT UNSIGNED NOT NULL,
    entrevistador BIGINT UNSIGNED NULL,
    modalidad ENUM(
        'Presencial',
        'Google Meet',
        'Microsoft Teams',
        'Zoom',
        'Llamada Telefónica'
    ) DEFAULT 'Google Meet',
    fecha DATETIME NOT NULL,
    duracion INT DEFAULT 60,
    lugar VARCHAR(255),
    enlace VARCHAR(255),
    estado ENUM(
        'Programada',
        'Realizada',
        'Cancelada',
        'Reagendada'
    ) DEFAULT 'Programada',
    resultado ENUM(
        'Pendiente',
        'Aprobado',
        'Rechazado'
    ) DEFAULT 'Pendiente',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA NOTIFICACIONES
-- ============================================================

CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    candidato_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo ENUM(
        'Sistema',
        'Vacante',
        'Entrevista',
        'RH',
        'Cuenta'
    ) DEFAULT 'Sistema',
    icono VARCHAR(100),
    color VARCHAR(50),
    url VARCHAR(255),
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA PASSWORD RESET TOKENS
-- ============================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    candidato_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA ACTIVITY LOGS
-- Auditoría del sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_tipo ENUM(
        'Admin',
        'Candidato',
        'Sistema'
    ) NOT NULL,
    usuario_id BIGINT UNSIGNED,
    accion VARCHAR(200) NOT NULL,
    modulo VARCHAR(150),
    tabla_afectada VARCHAR(150),
    registro_id BIGINT UNSIGNED,
    descripcion TEXT,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA HISTORIAL DE POSTULACIONES
-- Guarda todos los cambios del proceso de selección
-- ============================================================

CREATE TABLE IF NOT EXISTS historial_postulacion (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    postulacion_id BIGINT UNSIGNED NOT NULL,
    estado_id BIGINT UNSIGNED NOT NULL,
    cambiado_por BIGINT UNSIGNED NULL,
    comentario TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_historial_postulacion (postulacion_id),
    INDEX idx_historial_estado (estado_id),
    INDEX idx_historial_fecha (fecha_cambio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- TABLA ARCHIVOS DEL CANDIDATO
-- Permite almacenar múltiples archivos por candidato
-- ============================================================

CREATE TABLE IF NOT EXISTS archivos_candidato (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    candidato_id BIGINT UNSIGNED NOT NULL,
    tipo ENUM(
        'CV',
        'Foto',
        'Cedula',
        'Pasaporte',
        'Diploma',
        'Certificado',
        'Carta Laboral',
        'Portafolio',
        'Otro'
    ) NOT NULL,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    mime_type VARCHAR(120),
    extension VARCHAR(20),
    tamano BIGINT,
    version INT DEFAULT 1,
    principal BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ============================================================
-- DEPARTAMENTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS departamentos (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    codigo_dane VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- ============================================================
-- CIUDADES
-- ============================================================

CREATE TABLE IF NOT EXISTS ciudades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    departamento_id SMALLINT UNSIGNED NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    codigo_dane VARCHAR(10),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS tipos_contrato (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS modalidades_trabajo (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS areas_empresa (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120),
    descripcion VARCHAR(255),
    icono VARCHAR(100),
    color VARCHAR(30),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS cargos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    area_id SMALLINT UNSIGNED,
    nombre VARCHAR(150),
    descripcion TEXT,
    nivel ENUM(
        'Junior',
        'Semi Senior',
        'Senior',
        'Coordinador',
        'Jefe',
        'Director',
        'Gerente'
    ),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS habilidades (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150),
    categoria VARCHAR(120),
    color VARCHAR(30),
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS candidato_habilidades (
    candidato_id BIGINT UNSIGNED,
    habilidad_id INT UNSIGNED,
    nivel ENUM(
        'Básico',
        'Intermedio',
        'Avanzado',
        'Experto'
    ),
    años DECIMAL(4, 1),
    PRIMARY KEY (candidato_id, habilidad_id)
);

CREATE TABLE IF NOT EXISTS vacante_habilidades (
    vacante_id BIGINT UNSIGNED,
    habilidad_id INT UNSIGNED,
    obligatoria BOOLEAN DEFAULT TRUE,
    nivel ENUM(
        'Básico',
        'Intermedio',
        'Avanzado',
        'Experto'
    ),
    PRIMARY KEY (vacante_id, habilidad_id)
);