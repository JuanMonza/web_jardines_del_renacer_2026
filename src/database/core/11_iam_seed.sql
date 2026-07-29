-- ============================================================
-- JARDINES DEL RENACER | DATABASE 2.0 | CORE
-- Archivo: 11_iam_seed.sql
-- Ejecutar después de 01_admin.sql a 10_system_settings.sql.
-- ============================================================
INSERT INTO permissions (modulo, codigo, nombre, descripcion, accion, es_sistema, activo)
VALUES
  ('DASHBOARD', 'dashboard.admin.view', 'Acceder al dashboard administrativo', 'Acceso al panel administrativo general.', 'VIEW', TRUE, TRUE),
  ('DASHBOARD', 'dashboard.aliados.view', 'Acceder al dashboard de aliados', 'Acceso al panel administrativo de aliados.', 'VIEW', TRUE, TRUE),
  ('DASHBOARD', 'dashboard.vacantes.view', 'Acceder al dashboard de vacantes', 'Acceso al panel administrativo de vacantes.', 'VIEW', TRUE, TRUE)
  ,('VACANTES', 'vacancies.create', 'Crear vacantes', 'Crear nuevas vacantes laborales.', 'CREATE', TRUE, TRUE)
  ,('VACANTES', 'vacancies.update', 'Actualizar vacantes', 'Modificar vacantes laborales.', 'UPDATE', TRUE, TRUE)
  ,('VACANTES', 'vacancies.delete', 'Desactivar vacantes', 'Desactivar vacantes laborales.', 'DELETE', TRUE, TRUE)
  ,('VACANTES', 'vacancies.applications.view', 'Consultar postulaciones', 'Consultar postulaciones a vacantes.', 'VIEW', TRUE, TRUE)
  ,('VACANTES', 'vacancies.applications.update', 'Gestionar postulaciones', 'Actualizar el estado y notificar postulaciones.', 'UPDATE', TRUE, TRUE)
  ,('ALIADOS', 'allies.codes.generate', 'Generar códigos de aliado', 'Generar códigos de descuento para aliados.', 'CREATE', TRUE, TRUE)
  ,('ALIADOS', 'allies.codes.redeem', 'Canjear códigos de aliado', 'Verificar y canjear códigos de descuento.', 'UPDATE', TRUE, TRUE)
  ,('COTIZACIONES', 'quotes.view', 'Consultar cotizaciones', 'Consultar prospectos y cotizaciones.', 'VIEW', TRUE, TRUE)
  ,('COTIZACIONES', 'quotes.update', 'Gestionar cotizaciones', 'Actualizar el estado de cotizaciones.', 'UPDATE', TRUE, TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), activo = TRUE, deleted_at = NULL;
