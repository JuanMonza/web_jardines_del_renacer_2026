-- ============================================================
-- JARDINES DEL RENACER
-- DATABASE 2.0
-- MÓDULO: SEDES
-- Archivo: 02_constraints.sql
--
-- Claves foráneas
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABLA: sedes
-- ============================================================

ALTER TABLE sedes
ADD CONSTRAINT fk_sedes_tipo FOREIGN KEY (tipo_id) REFERENCES sedes_tipos (id) ON UPDATE CASCADE ON DELETE RESTRICT,
ADD CONSTRAINT fk_sedes_country FOREIGN KEY (country_id) REFERENCES countries (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_department FOREIGN KEY (department_id) REFERENCES departments (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_city FOREIGN KEY (city_id) REFERENCES cities (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_responsable FOREIGN KEY (responsable_admin_id) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_media FOREIGN KEY (foto_principal_media_id) REFERENCES media (id) ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================
-- TABLA: sedes_telefonos
-- ============================================================

ALTER TABLE sedes_telefonos
ADD CONSTRAINT fk_sedes_telefonos_sede FOREIGN KEY (sede_id) REFERENCES sedes (id) ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================================
-- TABLA: sedes_horarios
-- ============================================================

ALTER TABLE sedes_horarios
ADD CONSTRAINT fk_sedes_horarios_sede FOREIGN KEY (sede_id) REFERENCES sedes (id) ON UPDATE CASCADE ON DELETE CASCADE;

-- ============================================================
-- TABLA: sedes_servicios
-- ============================================================

ALTER TABLE sedes_servicios
ADD CONSTRAINT fk_sedes_servicio_sede FOREIGN KEY (sede_id) REFERENCES sedes (id) ON UPDATE CASCADE ON DELETE CASCADE,
ADD CONSTRAINT fk_sedes_servicio_catalogo FOREIGN KEY (servicio_id) REFERENCES sedes_servicios_catalogo (id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- ============================================================
-- TABLA: sedes_cobertura
-- ============================================================

ALTER TABLE sedes_cobertura
ADD CONSTRAINT fk_sedes_cobertura_sede FOREIGN KEY (sede_id) REFERENCES sedes (id) ON UPDATE CASCADE ON DELETE CASCADE,
ADD CONSTRAINT fk_sedes_cobertura_country FOREIGN KEY (country_id) REFERENCES countries (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_cobertura_department FOREIGN KEY (department_id) REFERENCES departments (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_cobertura_city FOREIGN KEY (city_id) REFERENCES cities (id) ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================
-- TABLA: sedes_salas
-- ============================================================

ALTER TABLE sedes_salas
ADD CONSTRAINT fk_sedes_salas_sede FOREIGN KEY (sede_id) REFERENCES sedes (id) ON UPDATE CASCADE ON DELETE CASCADE,
ADD CONSTRAINT fk_sedes_salas_media FOREIGN KEY (foto_media_id) REFERENCES media (id) ON UPDATE CASCADE ON DELETE SET NULL;

-- ============================================================
-- AUDITORÍA
-- ============================================================

ALTER TABLE sedes_tipos
ADD CONSTRAINT fk_sedes_tipos_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_tipos_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE sedes
ADD CONSTRAINT fk_sedes_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE sedes_telefonos
ADD CONSTRAINT fk_sedes_telefonos_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_telefonos_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE sedes_horarios
ADD CONSTRAINT fk_sedes_horarios_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_horarios_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE sedes_servicios_catalogo
ADD CONSTRAINT fk_sedes_servicios_catalogo_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_servicios_catalogo_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE sedes_servicios
ADD CONSTRAINT fk_sedes_servicios_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_servicios_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE sedes_cobertura
ADD CONSTRAINT fk_sedes_cobertura_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_cobertura_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE sedes_salas
ADD CONSTRAINT fk_sedes_salas_created_by FOREIGN KEY (created_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL,
ADD CONSTRAINT fk_sedes_salas_updated_by FOREIGN KEY (updated_by) REFERENCES admin_users (id) ON UPDATE CASCADE ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;