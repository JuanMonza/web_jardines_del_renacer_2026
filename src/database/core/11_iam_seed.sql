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
  ,('DASHBOARD', 'dashboard.talleres.view', 'Acceder al dashboard de talleres', 'Acceso al panel administrativo de talleres de duelo.', 'VIEW', TRUE, TRUE)
  ,('DASHBOARD', 'dashboard.sorteos.view', 'Acceder al dashboard de sorteos', 'Acceso al panel administrativo de sorteos.', 'VIEW', TRUE, TRUE)
  ,('TALLERES', 'workshops.view', 'Consultar talleres', 'Consultar talleres, álbumes e imágenes.', 'VIEW', TRUE, TRUE)
  ,('TALLERES', 'workshops.create', 'Crear talleres', 'Crear talleres y álbumes.', 'CREATE', TRUE, TRUE)
  ,('TALLERES', 'workshops.update', 'Actualizar talleres', 'Editar talleres, galerías e imágenes.', 'UPDATE', TRUE, TRUE)
  ,('TALLERES', 'workshops.delete', 'Desactivar talleres', 'Desactivar talleres y álbumes.', 'DELETE', TRUE, TRUE)
  ,('SORTEOS', 'giveaways.view', 'Consultar sorteos', 'Consultar sorteos, participantes y ganadores.', 'VIEW', TRUE, TRUE)
  ,('SORTEOS', 'giveaways.create', 'Crear sorteos', 'Crear sorteos y cargar participantes.', 'CREATE', TRUE, TRUE)
  ,('SORTEOS', 'giveaways.update', 'Gestionar sorteos', 'Actualizar sorteos y validar ganadores.', 'UPDATE', TRUE, TRUE)
  ,('SORTEOS', 'giveaways.draw', 'Ejecutar selección aleatoria', 'Seleccionar ganadores de forma auditable.', 'UPDATE', TRUE, TRUE)
  ,('SORTEOS', 'giveaways.delete', 'Cancelar sorteos', 'Cancelar sorteos.', 'DELETE', TRUE, TRUE)
  ,('DASHBOARD', 'dashboard.sedes.view', 'Acceder al dashboard de sedes', 'Acceso al panel administrativo de sedes.', 'VIEW', TRUE, TRUE)
  ,('VACANTES', 'vacancies.create', 'Crear vacantes', 'Crear nuevas vacantes laborales.', 'CREATE', TRUE, TRUE)
  ,('VACANTES', 'vacancies.update', 'Actualizar vacantes', 'Modificar vacantes laborales.', 'UPDATE', TRUE, TRUE)
  ,('VACANTES', 'vacancies.delete', 'Desactivar vacantes', 'Desactivar vacantes laborales.', 'DELETE', TRUE, TRUE)
  ,('VACANTES', 'vacancies.applications.view', 'Consultar postulaciones', 'Consultar postulaciones a vacantes.', 'VIEW', TRUE, TRUE)
  ,('VACANTES', 'vacancies.applications.update', 'Gestionar postulaciones', 'Actualizar el estado y notificar postulaciones.', 'UPDATE', TRUE, TRUE)
  ,('ALIADOS', 'allies.codes.generate', 'Generar códigos de aliado', 'Generar códigos de descuento para aliados.', 'CREATE', TRUE, TRUE)
  ,('ALIADOS', 'allies.codes.redeem', 'Canjear códigos de aliado', 'Verificar y canjear códigos de descuento.', 'UPDATE', TRUE, TRUE)
  ,('ALIADOS', 'allies.view', 'Consultar aliados', 'Consultar aliados comerciales.', 'VIEW', TRUE, TRUE)
  ,('ALIADOS', 'allies.create', 'Crear aliados', 'Crear aliados comerciales.', 'CREATE', TRUE, TRUE)
  ,('ALIADOS', 'allies.update', 'Actualizar aliados', 'Actualizar aliados comerciales.', 'UPDATE', TRUE, TRUE)
  ,('ALIADOS', 'allies.delete', 'Desactivar aliados', 'Desactivar aliados comerciales.', 'DELETE', TRUE, TRUE)
  ,('SEDES', 'sites.view', 'Consultar sedes', 'Consultar sedes y puntos de atención.', 'VIEW', TRUE, TRUE)
  ,('SEDES', 'sites.create', 'Crear sedes', 'Crear nuevos puntos de atención.', 'CREATE', TRUE, TRUE)
  ,('SEDES', 'sites.update', 'Actualizar sedes', 'Modificar puntos de atención.', 'UPDATE', TRUE, TRUE)
  ,('SEDES', 'sites.delete', 'Desactivar sedes', 'Desactivar puntos de atención.', 'DELETE', TRUE, TRUE)
  ,('COTIZACIONES', 'quotes.view', 'Consultar cotizaciones', 'Consultar prospectos y cotizaciones.', 'VIEW', TRUE, TRUE)
  ,('COTIZACIONES', 'quotes.update', 'Gestionar cotizaciones', 'Actualizar el estado de cotizaciones.', 'UPDATE', TRUE, TRUE)
  ,('COTIZACIONES', 'quotes.view.all', 'Ver todas las cotizaciones', 'Consultar y asignar cotizaciones de todo el equipo.', 'VIEW', TRUE, TRUE)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion), activo = TRUE, deleted_at = NULL;
