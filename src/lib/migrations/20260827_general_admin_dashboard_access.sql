-- Visibilidad centralizada para Administrador General.
-- Ejecutar una sola vez después de contar con los roles y permisos IAM.
-- Otorga consulta de paneles especializados; no concede acciones de edición.

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT general_role.id, permission.id
FROM roles AS general_role
INNER JOIN permissions AS permission
  ON permission.codigo IN (
    'dashboard.aliados.view',
    'dashboard.sedes.view',
    'dashboard.vacantes.view',
    'allies.view',
    'vacancies.applications.view',
    'quotes.view'
  )
WHERE general_role.nombre = 'Administrador General'
  AND general_role.activo = TRUE
  AND general_role.deleted_at IS NULL
  AND permission.activo = TRUE
  AND permission.deleted_at IS NULL;
