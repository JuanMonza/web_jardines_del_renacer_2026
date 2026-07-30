CREATE TABLE IF NOT EXISTS clientes_membresia (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  cedula VARCHAR(20) NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(150) DEFAULT NULL,
  telefono VARCHAR(30) DEFAULT NULL,
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_clientes_membresia_cedula (cedula),
  KEY idx_clientes_membresia_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO clientes_membresia (cedula, nombres, apellidos, email, telefono, estado) VALUES
('1234567890', 'Juan', 'Pérez García', 'juan.perez@email.com', '3001234567', 'activo'),
('9876543210', 'María', 'González López', 'maria.gonzalez@email.com', '3109876543', 'activo'),
('5555555555', 'Carlos', 'Rodríguez Martínez', 'carlos.rodriguez@email.com', '3205555555', 'activo'),
('1111111111', 'Ana', 'Ramírez Silva', 'ana.ramirez@email.com', '3151111111', 'activo'),
('7777777777', 'Pedro', 'Sánchez Torres', 'pedro.sanchez@email.com', '3007777777', 'activo')
ON DUPLICATE KEY UPDATE nombres=VALUES(nombres), apellidos=VALUES(apellidos), email=VALUES(email), telefono=VALUES(telefono), estado=VALUES(estado);
