# Sprint Talento Humano — alcance y horas

## Objetivo

Consolidar el módulo de vacantes y postulantes como una herramienta operativa, trazable y adaptable a dispositivos móviles, incorporando el histórico laboral, comunicaciones institucionales, seguimiento de selección y reportes administrativos.

## Estimación de esfuerzo humano

Las cifras corresponden a horas-persona estimadas para planeación Scrum, implementación, revisión y pruebas. No representan tiempo de ejecución automática ni un registro de facturación.

| ID | Historia o bloque de trabajo | Análisis / UX | Backend / datos | Frontend | QA / seguridad | Total |
|---|---|---:|---:|---:|---:|---:|
| TH-01 | Responsividad de dashboards, menú hamburguesa, paneles y modales centrados | 4 | 0 | 12 | 4 | 20 |
| TH-02 | Semáforos de seis estados en postulantes, historial, resumen, configuración y Excel | 3 | 4 | 7 | 3 | 17 |
| TH-03 | Trazabilidad de movimientos y correos con fechas, responsable y observación | 3 | 9 | 5 | 4 | 21 |
| TH-04 | Ciclo de vacantes: pausar, reanudar, cerrar, motivos e historial de vacantes | 3 | 8 | 6 | 4 | 21 |
| TH-05 | Importación del histórico de hojas de vida, normalización de Excel y conservación de campos | 6 | 18 | 6 | 8 | 38 |
| TH-06 | Consulta histórica con búsqueda automática, filtros, paginación 10–100, edición, detalle y eliminación protegida | 4 | 10 | 12 | 5 | 31 |
| TH-07 | Perfil ampliado: licencia, formación académica, profesión, ubicación dependiente, hoja de vida y validaciones | 3 | 8 | 10 | 4 | 25 |
| TH-08 | Traslado interno entre vacantes, bloqueos de vacantes no disponibles y auditoría sin notificación externa | 3 | 10 | 7 | 5 | 25 |
| TH-09 | Creación interna de postulantes con cuenta, contraseña cifrada, asignación y correo de bienvenida | 4 | 12 | 10 | 6 | 32 |
| TH-10 | Conservación de postulaciones mediante captura del perfil y de la vacante | 3 | 10 | 3 | 5 | 21 |
| TH-11 | Ficha de selección editable y múltiples entrevistas estructuradas | 4 | 11 | 10 | 6 | 31 |
| TH-12 | Registro automático del proceso completo en el historial laboral al contratar | 2 | 8 | 2 | 4 | 16 |
| TH-13 | Excel consolidado con seis hojas, filtros de fecha, auditoría y semáforos visuales | 4 | 12 | 5 | 6 | 27 |
| TH-14 | Reutilización de perfiles y profesiones; asignación a nuevas vacantes sin duplicar datos | 4 | 10 | 10 | 5 | 29 |
| TH-15 | Plantillas SMTP institucionales, datos de acceso seguros, logo, enlaces legales y trazabilidad de envío | 4 | 10 | 4 | 6 | 24 |
| TH-16 | Pruebas técnicas, lint, compilación, revisión de secretos y preparación de despliegue | 2 | 3 | 2 | 12 | 19 |
|  | **Total estimado** | **56** | **143** | **111** | **87** | **397 horas-persona** |

## Distribución sugerida del equipo

| Rol | Horas estimadas |
|---|---:|
| Análisis funcional y UX/UI | 56 |
| Desarrollo backend y base de datos | 143 |
| Desarrollo frontend responsive | 111 |
| QA, seguridad y validación | 87 |
| **Total** | **397** |

## Criterios generales de terminado

- Los cambios quedan almacenados en MySQL y no dependen únicamente del navegador.
- Los movimientos sensibles registran responsable, fecha, acción y observación.
- Las contraseñas permanecen cifradas y no se envían en texto plano.
- Los correos usan identidad institucional y reportan su resultado en trazabilidad.
- Los reportes aplican filtros de fecha y muestran datos suficientes para auditoría.
- Las vistas principales funcionan en escritorio, tablet y celular.
- TypeScript, ESLint y la compilación de producción finalizan correctamente.
