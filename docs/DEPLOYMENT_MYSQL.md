# Pruebas MySQL y accesos de desarrollo

La aplicación se conecta a MySQL 8 mediante `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_DATABASE`. Antes de iniciar Next.js, define también `AUTH_JWT_SECRET` con un valor aleatorio de al menos 32 caracteres. No reutilices ese secreto entre ambientes.

## Instalación de esquema

Desde `src/database`, con la base de datos creada y seleccionada, ejecuta:

```powershell
mysql -u <usuario> -p <base_de_datos> < 00_install.sql
```

El instalador crea Core, GEO, Sedes, RRHH, la migración de postulantes y las cuentas de desarrollo. Los procedimientos, triggers y eventos de Sedes se mantienen fuera del instalador hasta que se actualicen al contrato vigente de auditoría. No ejecutes `core/12_development_access_seed.sql` ni `core/13_development_candidate_seed.sql` en producción.

## Accesos de prueba

| Panel | Cédula | Contraseña temporal |
| --- | --- | --- |
| `/login/admin` | `9000000001` | `JDR-Admin-2026!` |
| `/login/admin-vacantes` | `9000000002` | `JDR-Vacantes-2026!` |
| `/login/admin-aliados` | `9000000003` | `JDR-Aliados-2026!` |

## Acceso de postulante de prueba

| Portal | Documento | Correo | Contraseña temporal |
| --- | --- | --- | --- |
| `/login/usuario-vacantes` | `9000000004` | `postulante.pruebas@jardines.local` | `JDR-Postulante-2026!` |

Estas claves solo existen como hashes BCrypt en MySQL. Deben ser sustituidas o eliminadas antes del despliegue real.
