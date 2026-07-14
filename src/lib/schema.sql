-- ────────────────────────────────────────────────────────────────
-- JARDINES DEL RENACER — Esquema MySQL para Backend
-- Versión: 1.1 (Ajustado para coincidir con interfaces TypeScript)
-- ────────────────────────────────────────────────────────────────

--
-- Tabla: sedes
-- Propósito: Almacena los puntos de atención y sedes físicas.
--
CREATE TABLE sedes (
  id               VARCHAR(20)  PRIMARY KEY,
  nombre           VARCHAR(120) NOT NULL,
  departamento     VARCHAR(80)  NOT NULL,
  ciudad           VARCHAR(80)  NOT NULL,
  direccion        VARCHAR(200),
  direccion_visible VARCHAR(200),
  administradora   VARCHAR(120),
  telefono         VARCHAR(30),
  foto_url         TEXT,
  lat              DECIMAL(10,7),
  lng              DECIMAL(10,7),
  activa           TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  actualizado_en   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_departamento (departamento),
  INDEX idx_ciudad (ciudad)
);

--
-- Tabla: talleres_duelo
-- Propósito: Registra los talleres de acompañamiento al duelo.
--
CREATE TABLE talleres_duelo (
  id        VARCHAR(20)  PRIMARY KEY,
  fecha     VARCHAR(30)  NOT NULL,
  titulo    VARCHAR(200) NOT NULL,
  lugar     VARCHAR(150) NOT NULL,
  activo    TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

--
-- Tabla: obituarios
-- Propósito: Almacena los homenajes y registros de obituarios.
--
CREATE TABLE obituarios (
  id             CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  cedula         VARCHAR(15)  NOT NULL UNIQUE,
  nombre         VARCHAR(150) NOT NULL,
  fecha_nac      DATE,
  fecha_fal      DATE         NOT NULL,
  sede_id        VARCHAR(20)  REFERENCES sedes(id),
  ubicacion_sala VARCHAR(100),
  foto_url       TEXT,
  mensaje        TEXT,
  activo         TINYINT(1)   NOT NULL DEFAULT 1,
  creado_en      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cedula (cedula),
  INDEX idx_sede (sede_id)
);

--
-- Tabla: admin_users
-- Propósito: Usuarios administradores para los paneles de gestión.
--
CREATE TABLE admin_users (
  id            INT          AUTO_INCREMENT PRIMARY KEY,
  cedula        VARCHAR(15)  NOT NULL UNIQUE,
  nombre        VARCHAR(120) NOT NULL,
  rol           ENUM('admin','admin_aliados','admin_vacantes') NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  activo        TINYINT(1)   DEFAULT 1,
  creado_en     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

--
-- Tabla: vacantes
-- Propósito: Ofertas laborales publicadas en "Trabaja con nosotros".
-- Coincide con la interfaz `JobVacancy`.
--
CREATE TABLE vacantes (
  id            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  title         VARCHAR(200) NOT NULL,
  area          VARCHAR(80)  NOT NULL,
  department    VARCHAR(80)  NOT NULL,
  city          VARCHAR(80)  NOT NULL,
  modality      ENUM('Presencial','Hibrido','Remoto') NOT NULL,
  contract_type VARCHAR(100),
  schedule      VARCHAR(100),
  summary       TEXT,
  requirements  JSON,
  benefits      JSON,
  salary        VARCHAR(60),
  featured      TINYINT(1)   DEFAULT 0,
  active        TINYINT(1)   DEFAULT 1,
  posted_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_area (area),
  INDEX idx_department (department)
);

--
-- Tabla: postulaciones
-- Propósito: Almacena las postulaciones de candidatos a las vacantes.
-- Coincide con la interfaz `JobApplication`.
--
CREATE TABLE postulaciones (
  id                 CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  candidate_document VARCHAR(15) NOT NULL,
  candidate_name     VARCHAR(150) NOT NULL,
  candidate_email    VARCHAR(150) NOT NULL,
  candidate_phone    VARCHAR(30),
  city               VARCHAR(80),
  department         VARCHAR(80),
  vacancy_id         CHAR(36)    REFERENCES vacantes(id),
  resume_filename    TEXT,
  resume_filedata    MEDIUMBLOB,
  status             ENUM('Recibida','En revision','Entrevista','Prueba tecnica','Seleccionado', 'No continua') DEFAULT 'Recibida',
  admin_notes        TEXT,
  applied_at         TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cedula (candidate_document),
  INDEX idx_email (candidate_email),
  INDEX idx_vacante (vacancy_id)
);

--
-- Tabla: aliados
-- Propósito: Aliados comerciales del programa de beneficios.
-- Coincide con la interfaz `CommercialAlly`.
--
CREATE TABLE aliados (
  id                CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  login_id          VARCHAR(20)  NOT NULL UNIQUE,
  name              VARCHAR(150) NOT NULL,
  category_slug     VARCHAR(80),
  subcategory       VARCHAR(80),
  discount_label    VARCHAR(100),
  departamento      VARCHAR(80),
  municipio         VARCHAR(80),
  address           TEXT,
  url               TEXT,
  logo              TEXT,
  whatsapp_number   VARCHAR(30),
  whatsapp_template TEXT,
  featured          TINYINT(1)   DEFAULT 1,
  email             VARCHAR(150),
  telefono          VARCHAR(30),
  description       TEXT,
  login_password    VARCHAR(255),
  active            TINYINT(1)   DEFAULT 1,
  created_at        TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

--
-- Tabla: pqr
-- Propósito: Recepción de Peticiones, Quejas y Reclamos.
--
CREATE TABLE pqr (
  id        CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  tipo      ENUM('peticion','queja','reclamo','sugerencia') NOT NULL,
  nombre    VARCHAR(150) NOT NULL,
  email     VARCHAR(150) NOT NULL,
  telefono  VARCHAR(30),
  mensaje   TEXT        NOT NULL,
  estado    ENUM('recibido','en_proceso','resuelto') DEFAULT 'recibido',
  creado_en TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

--
-- Tabla: pagos
-- Propósito: Registro de transacciones de pasarelas de pago (Wompi/PSE).
--
CREATE TABLE pagos (
  id            CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
  referencia    VARCHAR(100) NOT NULL UNIQUE,
  monto         DECIMAL(12,2) NOT NULL,
  moneda        CHAR(3)     DEFAULT 'COP',
  estado        ENUM('pendiente','aprobado','rechazado','devuelto') DEFAULT 'pendiente',
  proveedor     ENUM('wompi','pse') NOT NULL,
  correo_payer  VARCHAR(150),
  plan_id       VARCHAR(60),
  metadata      JSON,
  creado_en     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_referencia (referencia)
);

--
-- Tabla: cotizaciones
-- Propósito: Captura de leads desde el formulario de cotización.
--
CREATE TABLE cotizaciones (
  id                 CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  nombre             VARCHAR(150) NOT NULL,
  telefono           VARCHAR(30)  NOT NULL,
  ciudad             VARCHAR(80)  NOT NULL,
  email              VARCHAR(150),
  plan_id            VARCHAR(60)  NOT NULL,
  plan_nombre        VARCHAR(120),
  cobertura          ENUM('individual','familiar','segmentado','especial','corporativo','independiente') NOT NULL,
  num_beneficiarios  TINYINT UNSIGNED DEFAULT 1,
  contacto_preferido ENUM('WhatsApp','Llamada') NOT NULL DEFAULT 'WhatsApp',
  estado             ENUM('nuevo','contactado','en_negociacion','convertido','descartado') NOT NULL DEFAULT 'nuevo',
  notas_asesor       TEXT,
  asesor_id          INT REFERENCES admin_users(id),
  creado_en          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  actualizado_en     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_estado   (estado),
  INDEX idx_plan     (plan_id),
  INDEX idx_ciudad   (ciudad)
);

--
-- Tabla: codigos_descuento
-- Propósito: Códigos generados para afiliados en el programa de aliados.
-- Coincide con la interfaz `AllyDiscountRequest`.
--
CREATE TABLE codigos_descuento (
  id                   CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
  codigo               VARCHAR(20)  NOT NULL UNIQUE,
  cliente_cedula       VARCHAR(15)  NOT NULL,
  cliente_nombre       VARCHAR(150) NOT NULL,
  aliado_id            CHAR(36)     NOT NULL REFERENCES aliados(id),
  aliado_nombre        VARCHAR(150) NOT NULL,
  aliado_login_id      VARCHAR(20)  NOT NULL,
  aliado_departamento  VARCHAR(80),
  aliado_municipio     VARCHAR(80),
  aliado_categoria     VARCHAR(80),
  aliado_subcategoria  VARCHAR(80),
  descuento_etiqueta   VARCHAR(60),
  descuento_porcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
  estado               ENUM('active','redeemed','expired','deleted') NOT NULL DEFAULT 'active',
  valor_consumido      DECIMAL(12,2),
  valor_descuento      DECIMAL(12,2),
  total_despues_dto    DECIMAL(12,2),
  canjeado_por         VARCHAR(150),
  canjeado_en          TIMESTAMP,
  eliminado_en         TIMESTAMP,
  creado_en            TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  expira_en            TIMESTAMP    NOT NULL,
  INDEX idx_codigo          (codigo),
  INDEX idx_cliente_cedula  (cliente_cedula),
  INDEX idx_aliado          (aliado_id),
  INDEX idx_estado          (estado),
  INDEX idx_expira          (expira_en)
);

--
-- Tabla: flores_ordenes
-- Propósito: Almacena las órdenes de la florería.
-- Coincide con la interfaz `FlowerOrderRecord`.
--
CREATE TABLE flores_ordenes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    order_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('Creada', 'Confirmada', 'En preparacion', 'En ruta', 'Entregada') NOT NULL DEFAULT 'Creada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    customer_email VARCHAR(150),
    recipient_name VARCHAR(150) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_date VARCHAR(50),
    card_message TEXT,
    items JSON,
    total DECIMAL(12, 2) NOT NULL,
    source ENUM('single', 'cart') NOT NULL,
    events JSON,
    payment_status ENUM('pendiente', 'aprobado', 'rechazado', 'error'),
    payment_provider ENUM('wompi'),
    payment_reference VARCHAR(255),
    payment_transaction_id VARCHAR(255),
    payment_method_type VARCHAR(100),
    paid_at TIMESTAMP NULL,
    INDEX idx_order_code (order_code),
    INDEX idx_customer_phone (customer_phone),
    INDEX idx_status (status)
);