# Ambiente de pruebas en VPS HostGator (acceso por MobaXterm)

Destino público: `https://jardinesdelrenacer.com/ambiente-de-pruebas-jr/`.
La instalación local conserva el puerto `3000`. En el VPS, producción usa `127.0.0.1:3000` y **Aura** (`/var/www/aura`, `aura.service`) ocupa `127.0.0.1:3001`; **ninguno de esos puertos se reutiliza**. El proceso de capacitación debe escuchar solo en `127.0.0.1` y en un puerto libre configurado mediante `TRAINING_PORT`. No publicar ese puerto en el firewall.

**Despliegue existente recuperado del repositorio:** `.github/workflows/deploy-vps.yml` ejecuta automáticamente en cada push a `main`: actualiza `/var/www/jardines-renacer`, instala dependencias, ejecuta una migración, compila producción, reinicia el servicio `jardines-renacer` y verifica `127.0.0.1:3000`. Por ello, **un push a `main` sí modifica producción**. No usarlo como método para publicar inicialmente el ambiente de pruebas; preparar primero una entrega separada en el VPS y planear la sincronización de código sin activar por accidente el flujo de producción.

## 0. Reconocer el VPS antes de modificarlo

En MobaXterm abrir una sesión **SSH** hacia la IP del VPS HostGator con el usuario autorizado. El puerto habitual del VPS es `22`, salvo que se haya cambiado. MobaXterm es solo el cliente de conexión: no determina si el servidor web usa Apache, Nginx o cPanel/WHM. No compartir aquí contraseñas, claves SSH ni el contenido de archivos `.env`.

Ejecutar estos comandos **solo de lectura** y registrar sus salidas (sin secretos):

```bash
cat /etc/os-release
id
command -v node
command -v npm
systemctl is-active nginx httpd apache2 2>/dev/null
test -d /usr/local/cpanel && echo "cPanel/WHM presente" || echo "Sin cPanel local"
ss -ltnp | grep -E ':(80|443|3000|3001|3002)\b'
```

Comprobado el 18/09/2026 con una captura del VPS: **AlmaLinux 9.8, Nginx activo, Apache inactivo y sin cPanel local**. Por tanto, para este servidor corresponde la ruta de Nginx indicada abajo. Aún falta identificar el archivo del dominio y los puertos ocupados. Ejecutar solo lectura:

```bash
nginx -t
grep -Rnl --include='*.conf' 'jardinesdelrenacer.com' /etc/nginx 2>/dev/null
ss -ltnp | grep -E ':(80|443|3000|3001|3002)\b'
command -v node npm mysql mariadb
```

La salida recibida confirma Nginx válido, producción en `/etc/nginx/conf.d/jardines-renacer.conf` → `127.0.0.1:3000` y Aura en `/etc/nginx/conf.d/aura.conf` → `127.0.0.1:3001`. **No detener ni sobrescribir esos procesos**. `3002` no tenía listener en la comprobación, pero confirmar de nuevo inmediatamente antes de iniciarlo. La base real `jardinesweb` está en el contenedor Docker `jardines-mysql` (`mysql:8.0`), publicado solo en `127.0.0.1:3307`. Recursos observados: 7,5 GiB de RAM total, 6,0 GiB disponible, sin swap; 178 GiB libres en el volumen de `/var/www`.

## 1. Preparar la base y los usuarios

Contenedor de pruebas creado el 18/09/2026: `jdr-training-mysql`, volumen propio `jdr-training-mysql-data`, MySQL 8.0.46, puerto publicado solo en `127.0.0.1:3308`, límite de 1 GiB y una CPU. El log confirmó `ready for connections`. La conexión real con `jdr_pruebas` confirmó que solo ve `jdr_capacitacion` y las bases de sistema; la base de pruebas empieza con cero tablas. No crear la base de capacitación dentro de `jardines-mysql` ni montar su volumen. No copiar hojas de vida, clientes ni otras filas reales.

Para copiar **solo estructura y catálogos de permisos** una vez, `training:setup` puede leer `/var/www/jardines-renacer/.env.local` mediante `TRAINING_SCHEMA_SOURCE_ENV_FILE` durante una ejecución administrativa puntual. La conexión fuente se establece con transacciones `READ ONLY`; el código no escribe allí. Después retirar esta variable del entorno de servicio y asegurarse de que el usuario del servicio de pruebas no pueda leer `.env.local` de producción. No enviar ni duplicar la contraseña de producción en el chat o en la carpeta de pruebas.

## 2. Instalación de aplicación separada

Crear una carpeta y usuario de sistema propios, por ejemplo `/opt/jdr-training` y `jdr-training`; desplegar allí una copia del código. No compartir la carpeta de producción `/var/www/jardines-renacer`, `.next`, `.env.local` ni `public/uploads`. Ejecutar `npm ci` en esta copia. No detener ni modificar el servicio `jardines-renacer` de producción. Como `main` tiene despliegue automático, la primera entrega se transfiere mediante `jdr-training-release.tar.gz` por la sesión SFTP de MobaXterm, sin commit/push. El paquete incluye solo aplicación, recursos públicos y tres scripts de pruebas; excluye archivos `.env*`, cargas, catálogos de datos y archivos generados. Su SHA-256 local es `92A69B672E963630C8836238D9FAB9DFFF0F3897F92694C65D411C7AF73FE0C3`. Comprobar esa suma en el VPS antes de extraerlo.

Crear `/opt/jdr-training/.env.training.local` con permisos `0600`, propiedad del usuario `jdr-training` y estos valores (sin subirlo a Git):

```dotenv
TRAINING_BASE_PATH=/ambiente-de-pruebas-jr
TRAINING_PORT=3002
TRAINING_DB_HOST=127.0.0.1
TRAINING_DB_PORT=3308
TRAINING_DB_USER=jdr_pruebas
TRAINING_DB_PASSWORD=CONTRASENA_ALEATORIA_UNICA
TRAINING_DB_DATABASE=jdr_capacitacion
TRAINING_EMAIL_RECIPIENT=prueba.smtp@jardinesdelrenacer.co
TRAINING_AUTH_JWT_SECRET=SECRETO_ALEATORIO_EXCLUSIVO_DE_AL_MENOS_32_CARACTERES
TRAINING_CANDIDATE_JWT_SECRET=OTRO_SECRETO_ALEATORIO_EXCLUSIVO_DE_AL_MENOS_32_CARACTERES
TRAINING_ADMIN_PASSWORD=CONTRASENA_EXCLUSIVA_PARA_LOS_USUARIOS_FICTICIOS

# Credenciales de un emisor SMTP de pruebas. Jamás publicar claves de producción aquí.
SMTP_HOST=HOST_SMTP_DE_PRUEBAS
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=CUENTA_SMTP_DE_PRUEBAS
SMTP_PASS=CLAVE_SMTP_DE_PRUEBAS
SMTP_FROM=CUENTA_SMTP_DE_PRUEBAS
```

Generar secretos con `openssl rand -hex 32`. La contraseña compartida usada en prácticas locales no debe ser la única barrera de una URL pública. Mantener además autenticación HTTP/VPN y, preferiblemente, rotar a una contraseña exclusiva del VPS. No configurar claves Wompi reales ni `RESEND_API_KEY` de producción.

Inicializar **una sola vez** con `TRAINING_SCHEMA_SOURCE_ENV_FILE=/var/www/jardines-renacer/.env.local npm run training:setup` ejecutado desde la copia de pruebas en una sesión administrativa puntual. Lee el esquema y los catálogos de permisos de `jardinesweb` y escribe datos ficticios únicamente en el contenedor nuevo. Revisar el resultado antes de continuar. El servicio de ejecución no debe definir `DB_*` ni `TRAINING_SCHEMA_SOURCE_ENV_FILE`. No volver a correr `training:setup` sin revisar el efecto en los ejercicios existentes.

En este VPS quedó asignado el puerto `3002`, escuchando solo en `127.0.0.1`. Compilar con `npm run build:training:vps`. La unidad instalada desde `deploy/jdr-training.service` usa `User=jdr-training`, `WorkingDirectory=/opt/jdr-training` y `ExecStart=/usr/bin/node /opt/jdr-training/scripts/run-training-vps.js start`. Bloquea el acceso del proceso a `/var/www/jardines-renacer`, `/var/www/aura` y `/root`; solo permite escrituras en la compilación y cargas propias. El servicio quedó `active` y `enabled`.

## 3. Proxy web y acceso

El bloque HTTPS existente de `/etc/nginx/conf.d/jardines-renacer.conf` incluye, antes de `location /`, la línea `include /etc/nginx/conf.d/jdr-training-routes.inc;`. El archivo incluido proviene de `deploy/jdr-training-routes.inc` y contiene una sola ubicación que cubre la ruta base con o sin barra final y todas sus subrutas:

```nginx
location ~ ^/ambiente-de-pruebas-jr(?:/|$) {
    auth_basic "Jardines del Renacer - capacitacion";
    auth_basic_user_file /etc/nginx/.htpasswd-jdr-training;
    add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://127.0.0.1:3002;
}
```

No redirigir `/ambiente-de-pruebas-jr` hacia una variante con barra final: Next.js 14 puede redirigirla de vuelta y crear un bucle. `htpasswd` no estaba instalado; se generó una contraseña aleatoria con OpenSSL, guardada solo en `/root/jdr-training-secrets/http-basic`, y un hash SHA-512 crypt en `/etc/nginx/.htpasswd-jdr-training` (`root:nginx`, modo `640`). La cuenta HTTP se llama `capacitacion`. La configuración original quedó respaldada en `/root/jdr-training-secrets/jardines-renacer.conf.pre-training`. `nginx -t` pasó antes de recargar. En las comprobaciones directas usar `curl --noproxy '*'`: sin esa opción, el proxy de entorno del servidor devolvía un falso `404`; la respuesta real sin clave es `401`, con clave `200`, y la portada real sigue en `200`.

Si el dominio usa **Apache administrado por cPanel/WHM**, no pegar la configuración Nginx ni editar directamente `httpd.conf`, porque WHM puede regenerarlo. El proxy y la autenticación se deben colocar en un *userdata include* del virtual host SSL correspondiente al usuario cPanel y al dominio; luego se valida la sintaxis, se reconstruye la configuración mediante los scripts oficiales de cPanel y se reinicia Apache de forma controlada. La ruta exacta del include depende del usuario y del virtual host observados en el VPS. Si cPanel tiene su **Nginx reverse proxy** instalado, confirmar primero cuál capa atiende la ruta pública y usar sus mecanismos de configuración persistentes. No ejecutar esta etapa hasta identificar la configuración real del servidor y preparar un respaldo.

## 4. Verificación antes de invitar al equipo

1. Comprobar que `https://jardinesdelrenacer.com/` sigue sirviendo producción y no muestra “Modo prueba activo”.
2. Comprobar que la ruta nueva pide autenticación HTTP y muestra “Modo prueba activo”.
3. Entrar con cada cuenta ficticia y navegar por los siete módulos, incluyendo formularios, imágenes, historial y descargas. En la pestaña Network, **ninguna** petición del entorno de prácticas debe ir a `/api/...` sin `/ambiente-de-pruebas-jr`.
4. Crear un registro ficticio; comprobar que aparece solo en `jdr_capacitacion`, no en producción. Verificar que iniciar/cerrar sesión en pruebas no cambia la sesión de producción. **El SMTP de pruebas aún no está configurado:** no ejecutar ejercicios que dependan de enviar correos hasta disponer de credenciales aisladas y comprobar la redirección exclusiva a `TRAINING_EMAIL_RECIPIENT`.
5. Intentar una operación de pago ficticia y confirmar que el sistema la bloquea. La protección de enlaces externos de la interfaz de capacitación debe impedir abrir WhatsApp, teléfono, correo, Wompi o páginas fuera del prefijo y mostrar un aviso; confirmar esto en el navegador. Si cualquiera de estas pruebas falla, no compartir la clave HTTP con el equipo y revisar antes de continuar.

Los comandos SQL, `systemd` y Nginx son una plantilla: revisar nombres de base, versión del sistema y configuración actual antes de ejecutarlos. No compartir contraseñas por chat ni guardarlas en el repositorio.
