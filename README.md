# Jardines del Renacer

Plataforma digital de Jardines del Renacer para servicios funerarios, cotización de planes, florería, vacantes y paneles administrativos.

## Estado Actual (Abril 2026)

Estos módulos ya están funcionando en esta versión:

- `Cotizar`: formulario rediseñado, más limpio y con mejor estructura.
- `Cotizar`: selección de plan por tipo de cobertura (`individual`, `familiar`, `mascotas`, `empresarial`).
- `Cotizar`: opción de traslado (`No aplica`, `Repatriación`, `Expatriación`) y hora preferida de contacto.
- `Florería`: checkout de pago con Wompi (crear pago + verificar pago).
- `Florería`: confirmación de pago y continuidad del flujo por WhatsApp.
- `Florería`: selección por `departamento -> ciudad -> sede` reutilizando las sedes del proyecto.
- `Trabaja con nosotros`: perfil de postulante, carga de hoja de vida y consulta de postulaciones por documento/correo.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Usa `.env.example` como base y crea tu `.env.local`.

```env
# Base plataforma
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_me

# Wompi - Floreria Jardines del Renacer
# falta conexion y verificacion de rutas con ednpoints para completar pagos con wompi
NEXT_PUBLIC_WOMPI_PUBLIC_KEY=pub_test_replace_me
WOMPI_PRIVATE_KEY=prv_test_replace_me
WOMPI_INTEGRITY_SECRET=test_integrity_replace_me

# Opcional
WOMPI_API_BASE_URL=https://sandbox.wompi.co/v1
# WOMPI_CHECKOUT_BASE_URL=https://checkout.wompi.co/p/
# WOMPI_ALLOW_DEMO_FALLBACK=false
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## Flujo de Pago Florería (Wompi)

### Endpoints

- `POST /api/floreria/pagos/crear`
- `GET /api/floreria/pagos/verificar`

### Pantallas relacionadas

- `/floreria`
- `/floreria/pago`

### Nota de desarrollo

Si faltan credenciales de Wompi y estás en entorno local, el proyecto puede usar modo demo para no bloquear pruebas de interfaz. En producción debe quedar con llaves reales y verificación activa.

## Estructura General

```text
src/
├── app/
│   ├── api/floreria/pagos/crear/route.ts
│   ├── api/floreria/pagos/verificar/route.ts
│   ├── floreria/page.tsx
│   ├── floreria/pago/page.tsx
│   ├── cotizar/page.tsx
│   └── servicios/trabaja-con-nosotros/
├── components/
│   ├── cotizar/CotizarQuoteForm.tsx
│   ├── layout/
│   └── ui/
├── lib/
│   ├── wompi.ts
│   ├── flowerOrdersStorage.ts
│   ├── flowerPaymentStorage.ts
│   ├── flowerOrderWhatsApp.ts
│   └── candidateStorage.ts
└── config/
```

## Scripts útiles

```bash
npm run dev
npm run build
npm start
npx tsc --noEmit
```

## Pendientes Recomendados

- Integrar persistencia en base de datos para pedidos y postulaciones (hoy está con `localStorage` para flujo funcional inicial).
- Implementar notificaciones transaccionales (email/WhatsApp) por estado de pedido y estado de postulaciones.
- Generar comprobante/voucher de pago (PDF) para florería y anexarlo al proceso de soporte.

## Desarrollado por

**Juan Monsalve**  
Plataforma Digital Jardines del Renacer  
Versión 4.0.0 - 2026

## Licencia

Todos los derechos reservados - Jardines del Renacer 2026

## Soporte

- Email: desarrollo@jardinesdelrenacer.com
- WhatsApp: +57 300 123 4567
