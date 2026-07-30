-- ============================================================
-- JARDINES DEL RENACER | DATABASE 2.0
-- Instalador local de desarrollo y pruebas MySQL 8
-- ============================================================
-- Ejecútalo desde este directorio con una base de datos ya creada y seleccionada:
--   mysql -u <usuario> -p <base_de_datos> < 00_install.sql
-- No incluye credenciales ni secretos. El archivo 12 solo crea accesos de desarrollo.

SOURCE core/01_admin.sql;
SOURCE core/02_roles.sql;
SOURCE core/03_permissions.sql;
SOURCE core/04_role_permissions.sql;
SOURCE core/05_admin_user_roles.sql;
SOURCE core/06_sessions.sql;
SOURCE core/07_audit_logs.sql;
SOURCE core/08_notifications.sql;
SOURCE core/09_media.sql;
SOURCE core/10_system_settings.sql;
SOURCE core/11_iam_seed.sql;

SOURCE geo/01_schema.sql;
SOURCE geo/02_constraints.sql;
SOURCE geo/03_indexes.sql;
SOURCE geo/04_seed_countries.sql;
SOURCE geo/05_seed_departments.sql;
SOURCE geo/06_seed_cities.sql;
SOURCE geo/07_views.sql;

SOURCE sedes/01_schema.sql;
SOURCE sedes/02_constraints.sql;
SOURCE sedes/03_indexes.sql;
SOURCE sedes/04_views.sql;
SOURCE sedes/05_seed.sql;
SOURCE sedes/10_audit_schema.sql;
-- 07_procedures.sql, 08_triggers.sql y 09_events.sql se ejecutan después
-- de validar su contrato de auditoría con el Core vigente. No se incluyen
-- aquí para evitar que un trigger legado bloquee la instalación completa.

SOURCE rrhh/01_schema.sql;
SOURCE rrhh/02_constraints.sql;
SOURCE rrhh/03_indexes.sql;
SOURCE rrhh/04_views.sql;
SOURCE rrhh/05_kpis.sql;
SOURCE rrhh/06_triggers.sql;
SOURCE rrhh/07_seed.sql;

SOURCE aliados/01_schema.sql;
SOURCE aliados/02_access_schema.sql;
SOURCE aliados/03_password_reset_schema.sql;
SOURCE aliados/04_expand_logo_column.sql;
SOURCE aliados/05_seed.sql;
SOURCE aliados/06_audit_schema.sql;
SOURCE aliados/07_membership_clients.sql;
SOURCE aliados/08_client_access_schema.sql;

SOURCE ../lib/migrations/20260721_postulantes_candidatos.sql;
SOURCE core/12_development_access_seed.sql;
SOURCE core/13_development_candidate_seed.sql;
