-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MÓDULO: SEDES
-- Archivo: 03_indexes.sql
-- ============================================================

-- ============================================================
-- TABLA: sedes_tipos
-- ============================================================

CREATE INDEX idx_sedes_tipos_nombre ON sedes_tipos (nombre);

CREATE INDEX idx_sedes_tipos_activo ON sedes_tipos (activo);

CREATE INDEX idx_sedes_tipos_orden ON sedes_tipos (orden);

-- ============================================================
-- TABLA: sedes
-- ============================================================

CREATE INDEX idx_sedes_nombre ON sedes (nombre);

CREATE INDEX idx_sedes_slug ON sedes (slug);

CREATE INDEX idx_sedes_codigo ON sedes (codigo);

CREATE INDEX idx_sedes_tipo ON sedes (tipo_id);

CREATE INDEX idx_sedes_country ON sedes (country_id);

CREATE INDEX idx_sedes_department ON sedes (department_id);

CREATE INDEX idx_sedes_city ON sedes (city_id);

CREATE INDEX idx_sedes_activo ON sedes (activo);

CREATE INDEX idx_sedes_web ON sedes (mostrar_en_web);

CREATE INDEX idx_sedes_disponible24 ON sedes (disponible_24_horas);

CREATE INDEX idx_sedes_responsable ON sedes (responsable_admin_id);

CREATE INDEX idx_sedes_deleted ON sedes (deleted_at);

CREATE INDEX idx_sedes_created ON sedes (created_at);

-- ============================================================
-- Búsquedas geográficas
-- ============================================================

CREATE INDEX idx_sedes_geo ON sedes (
    country_id,
    department_id,
    city_id
);

CREATE INDEX idx_sedes_tipo_ciudad ON sedes (tipo_id, city_id);

CREATE INDEX idx_sedes_publicas ON sedes (mostrar_en_web, activo);

-- ============================================================
-- TABLA: sedes_telefonos
-- ============================================================

CREATE INDEX idx_tel_sede ON sedes_telefonos (sede_id);

CREATE INDEX idx_tel_principal ON sedes_telefonos (principal);

CREATE INDEX idx_tel_tipo ON sedes_telefonos (tipo);

CREATE INDEX idx_tel_activo ON sedes_telefonos (activo);

-- ============================================================
-- TABLA: sedes_horarios
-- ============================================================

CREATE INDEX idx_horario_sede ON sedes_horarios (sede_id);

CREATE INDEX idx_horario_dia ON sedes_horarios (dia_semana);

CREATE INDEX idx_horario_24 ON sedes_horarios (atiende_24_horas);

CREATE INDEX idx_horario_activo ON sedes_horarios (activo);

CREATE INDEX idx_horario_sede_dia ON sedes_horarios (sede_id, dia_semana);

-- ============================================================
-- TABLA: sedes_servicios_catalogo
-- ============================================================

CREATE INDEX idx_catalogo_nombre ON sedes_servicios_catalogo (nombre);

CREATE INDEX idx_catalogo_orden ON sedes_servicios_catalogo (orden);

CREATE INDEX idx_catalogo_activo ON sedes_servicios_catalogo (activo);

-- ============================================================
-- TABLA: sedes_servicios
-- ============================================================

CREATE INDEX idx_servicio_sede ON sedes_servicios (sede_id);

CREATE INDEX idx_servicio_catalogo ON sedes_servicios (servicio_id);

CREATE INDEX idx_servicio_destacado ON sedes_servicios (destacado);

CREATE INDEX idx_servicio_activo ON sedes_servicios (activo);

CREATE INDEX idx_servicio_sede_activo ON sedes_servicios (sede_id, activo);

-- ============================================================
-- TABLA: sedes_cobertura
-- ============================================================

CREATE INDEX idx_cobertura_sede ON sedes_cobertura (sede_id);

CREATE INDEX idx_cobertura_country ON sedes_cobertura (country_id);

CREATE INDEX idx_cobertura_department ON sedes_cobertura (department_id);

CREATE INDEX idx_cobertura_city ON sedes_cobertura (city_id);

CREATE INDEX idx_cobertura_24 ON sedes_cobertura (cobertura_24h);

CREATE INDEX idx_cobertura_geo ON sedes_cobertura (
    country_id,
    department_id,
    city_id
);

-- ============================================================
-- TABLA: sedes_salas
-- ============================================================

CREATE INDEX idx_salas_sede ON sedes_salas (sede_id);

CREATE INDEX idx_salas_codigo ON sedes_salas (codigo);

CREATE INDEX idx_salas_nombre ON sedes_salas (nombre);

CREATE INDEX idx_salas_disponible ON sedes_salas (disponible);

CREATE INDEX idx_salas_activa ON sedes_salas (activa);

CREATE INDEX idx_salas_capacidad ON sedes_salas (capacidad);

CREATE INDEX idx_salas_sede_estado ON sedes_salas (sede_id, activa, disponible);