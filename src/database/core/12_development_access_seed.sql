-- ============================================================
-- JARDINES DEL RENACER | DATABASE 2.0 | CORE
-- Archivo: 12_development_access_seed.sql
-- Propósito: accesos iniciales SOLO para desarrollo/pruebas internas.
-- Nunca ejecutar en producción. Cambiar o eliminar estas cuentas antes del despliegue.
-- ============================================================

INSERT INTO roles (nombre, descripcion, prioridad, es_sistema, activo)
VALUES
  ('Administrador General', 'Gestión administrativa general.', 20, TRUE, TRUE),
  ('Administrador de Vacantes', 'Gestión exclusiva del módulo de vacantes.', 40, TRUE, TRUE),
  ('Administrador de Aliados', 'Gestión exclusiva del módulo de aliados.', 40, TRUE, TRUE),
  ('Administrador de Sedes', 'Gestión exclusiva de sedes y cobertura.', 40, TRUE, TRUE)
  ,('Administrador de Talleres', 'Gestión exclusiva de talleres de duelo y galerías.', 40, TRUE, TRUE)
  ,('Administrador de Sorteos', 'Gestión exclusiva de sorteos, participantes y ganadores.', 40, TRUE, TRUE)
ON DUPLICATE KEY UPDATE descripcion = VALUES(descripcion), prioridad = VALUES(prioridad), activo = TRUE, deleted_at = NULL;

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permissions p ON p.codigo IN ('dashboard.admin.view', 'quotes.view', 'quotes.update', 'quotes.view.all', 'sites.view', 'sites.create', 'sites.update', 'sites.delete')
WHERE r.nombre = 'Administrador General';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permissions p ON p.codigo IN ('dashboard.vacantes.view', 'vacancies.create', 'vacancies.update', 'vacancies.delete', 'vacancies.applications.view', 'vacancies.applications.update')
WHERE r.nombre = 'Administrador de Vacantes';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permissions p ON p.codigo IN ('dashboard.aliados.view', 'allies.codes.generate', 'allies.codes.redeem', 'allies.view', 'allies.create', 'allies.update', 'allies.delete')
WHERE r.nombre = 'Administrador de Aliados';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
INNER JOIN permissions p ON p.codigo IN ('dashboard.sedes.view', 'sites.view', 'sites.create', 'sites.update', 'sites.delete')
WHERE r.nombre = 'Administrador de Sedes';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r INNER JOIN permissions p ON p.codigo IN ('dashboard.talleres.view','workshops.view','workshops.create','workshops.update','workshops.delete') WHERE r.nombre = 'Administrador de Talleres';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r INNER JOIN permissions p ON p.codigo IN ('dashboard.sorteos.view','giveaways.view','giveaways.create','giveaways.update','giveaways.draw','giveaways.delete') WHERE r.nombre = 'Administrador de Sorteos';

-- Las contraseñas se almacenan únicamente como BCrypt. Estas credenciales son
-- temporales y documentadas para que el equipo pueda probar los tres dashboards.
INSERT INTO admin_users (cedula, nombres, apellidos, email, password_hash, email_verificado, activo)
VALUES
  ('9000000001', 'Administrador', 'General', 'admin.general@jardines.local', '$2b$12$xwAK60L0ZdkrLOXz62wGx.QTIWej3PBlZ8z5E5DHHGBIvm.z1L4mi', TRUE, TRUE),
  ('9000000002', 'Administrador', 'Vacantes', 'admin.vacantes@jardines.local', '$2b$12$70JtJMEqLgHwOuO3VWoiPOKIgVK0HuyjEpMw4xoWGdc26pzIPezSq', TRUE, TRUE),
  ('9000000003', 'Administrador', 'Aliados', 'admin.aliados@jardines.local', '$2b$12$6pz2HCeNZ/KC8oeENAYXf.BF5M.dxgCjJQ1wjIDQUxEOnNQ0P.Sem', TRUE, TRUE),
  ('9000000005', 'Administrador', 'Sedes', 'admin.sedes@jardines.local', '$2b$12$utuavc.jsCkbSqknAWp.YebBJ5mhvR/xoPSeA.PL/ax3dnnEWpq3q', TRUE, TRUE)
ON DUPLICATE KEY UPDATE nombres = VALUES(nombres), apellidos = VALUES(apellidos), email = VALUES(email), password_hash = VALUES(password_hash), activo = TRUE, deleted_at = NULL;

INSERT IGNORE INTO admin_user_roles (admin_user_id, role_id, activo)
SELECT u.id, r.id, TRUE
FROM admin_users u
INNER JOIN roles r ON (
  (u.cedula = '9000000001' AND r.nombre = 'Administrador General') OR
  (u.cedula = '9000000002' AND r.nombre = 'Administrador de Vacantes') OR
  (u.cedula = '9000000003' AND r.nombre = 'Administrador de Aliados') OR
  (u.cedula = '9000000005' AND r.nombre = 'Administrador de Sedes')
)
WHERE u.cedula IN ('9000000001', '9000000002', '9000000003', '9000000005');
