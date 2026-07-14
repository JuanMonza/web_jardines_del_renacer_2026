# Guía de Accesos - Jardines del Renacer

## Sistema de Autenticación Dual

El sitio web cuenta con **DOS sistemas de login separados** para diferentes tipos de usuarios:

---

## Portal de Clientes

**URL de Acceso:** `/login` o botón "Ingresar" en el Navbar

### Propósito
Portal para clientes que tienen un plan contratado con Jardines del Renacer.

### Funcionalidades
- Ver detalles del plan contratado
- Acceder a documentos y facturas
- Realizar pagos
- Agendar visitas
- Contactar soporte

### Credenciales de Prueba
```
Cédula:     9876543210
Contraseña: cliente123
```

### Ruta del Dashboard
Una vez autenticado: `/cliente/dashboard`

---

## Portal Administrativo de Obituarios

**URL de Acceso:** `/login/admin` (acceso directo por URL)

### Propósito
Panel exclusivo para el administrador encargado de la gestión diaria de obituarios.

### Funcionalidades
- **Gestión completa de obituarios**
  - Crear nuevos obituarios
  - Editar dirección de velación
  - Editar sala asignada
  - Editar horarios de velación
  
- **Búsqueda por cédula**
  - Búsqueda rápida de fallecidos por número de cédula
  
- **Estadísticas en tiempo real**
  - Total de obituarios registrados
  - Balance mensual de obituarios
  - Balance anual de obituarios
  - Contador de visitas a la página web

- **Gestión por sedes**
  - Sede Principal
  - Sede Norte
  - Sede Sur
  - Sede Oriente
  - Sede Occidente

### Credenciales de Prueba
```
Cédula:     1234567890
Contraseña: admin123
```

### Ruta del Dashboard
Una vez autenticado: `/dashboard` (simplificado, sin pagos ni clientes)

---

## Estructura de Datos del Obituario

Cada obituario contiene:
- Nombre completo del fallecido
- Número de cédula
- Fecha de nacimiento
- Fecha de fallecimiento
- Sede (principal, norte, sur, oriente, occidente)
- Sala de velación
- Ubicación exacta de la sala
- Horario de inicio de velación
- Horario de cierre de velación
- Descripción/mensaje
- Foto (placeholder por defecto)

---

## Diseño

Ambos portales de login comparten el **mismo diseño premium** con:
- Fondos animados con gradientes
- Tarjetas de vidrio (glass effect)
- Iconos y animaciones suaves
- Indicadores de seguridad (SSL, encriptación)
- Responsive design
- Credenciales de prueba visibles para desarrollo

---

## Rutas Importantes

### Públicas
- `/` - Inicio
- `/obituarios` - Ver obituarios públicos
- `/planes` - Ver planes disponibles
- `/contacto` - Formulario de contacto
- `/recorrido-360` - Tour virtual
- `/agendar-visita` - Agendar visita

### Clientes (requiere login)
- `/login` - Login de clientes
- `/cliente/dashboard` - Dashboard de cliente

### Administración (requiere login admin)
- `/login/admin` - Login administrativo
- `/dashboard` - Dashboard simplificado
- `/dashboard/obituarios` - CRUD completo de obituarios con estadísticas
- `/dashboard/sedes` - CRUD completo de sedes

---

## Seguridad

### Desarrollo (Actual)
- Autenticación basada en `localStorage`
- Credenciales hardcodeadas para pruebas
- Validación de cédula (6-10 dígitos)

### Producción (Recomendado)
- Implementar JWT tokens
- Backend con base de datos real
- Encriptación de contraseñas (bcrypt)
- Validación de cédula contra API de Registraduría
- Rate limiting para prevenir ataques
- 2FA opcional para admin

---

## Contacto de Soporte

Para solicitar acceso administrativo real:
- Página de contacto: `/contacto`
- Email: info@jardindesdelrenacer.com (configurar)
- Teléfono: +57 XXX XXX XXXX (configurar)

---

## Versión

**Sistema:** v1.4
**Última actualización:** Febrero 2026
**Desarrollado por:** Juan Monsalve

---

## Notas Importantes

1. El login administrativo **NO está visible en el menú**. Solo se accede con la URL directa `/login/admin`
2. El botón "Ingresar" del Navbar siempre lleva al login de **clientes** (`/login`)
3. Las estadísticas de visitas son **simuladas** en desarrollo. En producción deberán conectarse a Google Analytics o similar
4. Los obituarios se almacenan en memoria (se pierden al recargar). Requiere base de datos en producción
