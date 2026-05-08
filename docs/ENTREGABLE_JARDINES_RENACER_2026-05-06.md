# Entregable Jardines del Renacer - 2026-05-06

## Proyecto correcto

Los cambios de este entregable pertenecen a:

`C:\Users\Mercadeo\Desktop\web_jardines_del_renacer_2026`

El servidor local activo para revisar es:

`http://localhost:3000`

## Cambios aplicados

- Navbar: el submenu de Servicios ahora incluye `Condolencias Digitales` y `Cláusulas`.
- Navbar: el boton `Ingresar` envia a `/proximamente`.
- Cotizador: se elimino el campo `Servicio de traslado`.
- Cotizador: `Canal preferido` quedo mas compacto.
- Cotizador: si se llega desde una tarjeta con `?plan=...`, se precargan tipo de contratacion y plan.
- Planes: los valores `Valor por definir` fueron reemplazados por `Cotizar ahora`.
- Tarjetas de planes: el boton posterior ahora dice `Cotizar ahora`.
- Cláusulas: se agrego `/clausulas` con visor PDF sin toolbar nativo de navegador.
- Cláusulas: se agregaron los archivos publicos `Clausulas_membrete_2026_final.pdf` y `pdf.worker.min.mjs`.
- Condolencias digitales: se agrego la ruta placeholder `/servicios/condolencias-digitales`.
- Obituarios admin: el selector de sede usa `src/data/sedes.ts`.
- Build: se corrigieron dos rutas con `useSearchParams()` envolviendolas en `Suspense`.

## Archivos principales

- `src/components/layout/Navbar.tsx`: enlaces del menu superior y submenu de servicios.
- `src/components/cotizar/CotizarQuoteForm.tsx`: formulario de cotizacion y mensaje de WhatsApp.
- `src/config/plans.ts`: informacion base de planes.
- `src/components/cards/PlanFlipCard.tsx`: tarjetas de planes.
- `src/app/clausulas/page.tsx`: pagina del documento oficial.
- `src/components/clausulas/SecurePdfViewer.tsx`: visor renderizado en canvas.
- `src/app/servicios/condolencias-digitales/page.tsx`: placeholder temporal.
- `src/app/proximamente/page.tsx`: placeholder del boton Ingresar.
- `src/app/dashboard/obituarios/page.tsx`: selector de sedes reales.

## Validacion

Comandos ejecutados:

```bash
npm run build
npm run type-check
```

Resultado:

- Build correcto.
- Type-check correcto.
- Rutas verificadas en local:
  - `http://localhost:3000/clausulas`
  - `http://localhost:3000/cotizar?plan=tranquilidad-total`
  - `http://localhost:3000/servicios/condolencias-digitales`
  - `http://localhost:3000/proximamente`

## Pendientes de negocio

- Pagar Plan: falta definir las URL reales de Wompi y PSE/PSD para reemplazar la simulacion actual por redireccion directa.
- Condolencias Digitales: falta la URL definitiva para cambiar el placeholder por redireccion real.
- Proteccion PDF: el visor bloquea toolbar, guardar, imprimir, copiar y click derecho dentro de la pagina. Ningun sitio web puede impedir al 100% una captura externa del sistema operativo o de otro dispositivo.
