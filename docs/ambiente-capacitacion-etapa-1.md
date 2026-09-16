# Ambiente de capacitación — Etapa 1

Este ambiente ejecuta el mismo sistema con una base de datos independiente, datos ficticios, correos redirigidos y pagos desactivados. Nunca se debe usar una copia de datos personales de producción.

## Preparación local

1. Opcionalmente copiar `.env.training.example` como `.env.training.local` si la base de capacitación usará otra conexión. Si no existe, se usa el mismo servidor local y se crea otra base con el sufijo `_capacitacion_local`.
2. Ejecutar `npm run training:setup`. El proceso crea una base separada, copia únicamente la estructura y los catálogos de permisos y genera cuentas y postulantes ficticios.
3. Si no se definió `TRAINING_ADMIN_PASSWORD`, el proceso genera una contraseña segura en `.training-access.local.txt`. Este archivo está excluido de Git.
4. Cerrar previamente cualquier proceso del proyecto que esté usando el puerto 3000 y ejecutar `npm run dev:training`. El comando usa obligatoriamente el puerto 3000 y nunca cambia al 3001.
5. Abrir `http://localhost:3000`. Dentro de los paneles, “Modo prueba activo” aparece en verde debajo de “Cerrar sesión”, junto a “Guía paso a paso”.

## Accesos ficticios

Todos usan la contraseña definida en `TRAINING_ADMIN_PASSWORD` o generada localmente en `.training-access.local.txt`.

- `9100000001`: Administración general.
- `9100000002`: Vacantes y Talento Humano.
- `9100000003`: Aliados.
- `9100000004`: Sedes.
- `9100000005`: Talleres.
- `9100000006`: Mercadeo (incentivos y sorteos).
- `9100000007`: Gestor de cotizaciones. El usuario `9100000001` actúa como coordinador y puede asignarle prospectos.

## Ejercicios preparados

- Administración general: revisar las cuentas ficticias, sus roles y los accesos disponibles por módulo.
- Cotizaciones: consultar prospectos nuevos, contactados, en negociación, convertidos y descartados.
- Asignar la cotización nueva al gestor `9100000007` y practicar notas, seguimientos y cambios de estado.
- Revisar un seguimiento próximo y otro vencido, consultar el historial y descargar el reporte.
- La guía se abre solo al pulsar “Guía paso a paso” en el menú, debajo de “Cerrar sesión”. No aparecen avisos automáticos sobre el contenido. Las explicaciones contextuales se muestran únicamente al pasar el cursor sobre el signo “?” o al tocarlo en un dispositivo móvil.
- En el menú lateral y en los formularios, las ayudas se abren solo al pasar el mouse sobre el signo “?”, enfocarlo con el teclado o tocarlo en pantallas táctiles. Solo aparecen en modo prueba.
- Historial laboral tiene ayudas en importación, eliminación protegida, búsqueda, filtros, Excel, estados, apertura de fichas, paginación, edición, entrevistas y traslados. Nunca se deben importar hojas de vida reales al ambiente de práctica.
- Talento Humano también muestra ayudas en Postulantes (filtros, etapas, observaciones, ficha, entrevistas y traslados), Analítica (embudo, métricas, auditoría y Excel), Notificaciones (semaforo y fechas) y Configuración (correo, etapas y retención). La guía completa incluye estas secciones.
- Historial de vacantes explica la búsqueda, el detalle de postulantes de una vacante cerrada y la opción de reutilizar sus datos sin alterar el registro original.

## Protecciones activas

- El sistema rechaza usar el mismo nombre de base configurado para producción.
- Todos los correos SMTP y Resend se redirigen a `TRAINING_EMAIL_RECIPIENT` y llevan el prefijo `[CAPACITACIÓN]`.
- El correo muestra el destinatario ficticio original para validar el ejercicio.
- Los pagos Wompi están bloqueados.
- Google Tag Manager no se carga.
- Las respuestas incluyen `noindex`, `nofollow` y `noarchive` para impedir la indexación del ambiente.
- En los dashboards, “Modo prueba activo” y “Guía paso a paso” están juntos debajo de “Cerrar sesión”. En páginas públicas y accesos se muestra un indicador compacto verde.

## Datos permitidos

Solo se deben crear nombres, documentos, teléfonos, direcciones, hojas de vida y correos inventados. Se recomienda utilizar siempre los dominios `example.invalid` para impedir entregas accidentales.
