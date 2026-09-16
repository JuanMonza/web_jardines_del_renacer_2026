import { NextRequest, NextResponse } from 'next/server';
import {
  buildIntegritySignature,
  buildWompiCheckoutUrl,
  getWompiConfig,
  isWompiConfigured,
} from '@/lib/wompi';
import { isTrainingEnvironment } from '@/lib/training-environment';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Interfaz que define la estructura esperada del cuerpo de la petición (payload)
interface CreateFlowerCheckoutPayload {
  reference?: string;
  amountInCents?: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddressLine1?: string;
  shippingAddressCity?: string;
  shippingAddressPhone?: string;
  expirationTime?: string;
}

// Función auxiliar para asegurar que un valor sea de tipo texto y quitar espacios innecesarios
function asTrimmedText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Endpoint POST para crear un checkout de pago con Wompi para la Florería.
 * Recibe los datos del pedido y cliente, valida la configuración de Wompi,
 * genera la firma de integridad y devuelve la URL para redirigir al usuario
 * a la pasarela de pagos.
 * 
 * @param request La petición HTTP de Next.js
 * @returns Una respuesta JSON con la URL de redirección al checkout (o modo demo).
 */
export async function POST(request: NextRequest) {
  try {
    if (isTrainingEnvironment()) {
      return NextResponse.json({ ok: false, mode: 'training', message: 'Los pagos reales están desactivados en el ambiente de capacitación.' }, { status: 409 });
    }
    // 1. Extraer y tipar el payload recibido del cliente
    const payload = (await request.json()) as CreateFlowerCheckoutPayload;
    // Normalizamos desde el inicio para no guardar ruido (espacios, mayúsculas/minúsculas).
    const reference = asTrimmedText(payload.reference).toUpperCase();
    const amountInCents = Number(payload.amountInCents);
    const customerEmail = asTrimmedText(payload.customerEmail).toLowerCase();
    const customerName = asTrimmedText(payload.customerName);
    const customerPhone = asTrimmedText(payload.customerPhone);
    const shippingAddressLine1 = asTrimmedText(payload.shippingAddressLine1);
    const shippingAddressCity = asTrimmedText(payload.shippingAddressCity);
    const shippingAddressPhone =
      asTrimmedText(payload.shippingAddressPhone) || customerPhone;
    const expirationTime = asTrimmedText(payload.expirationTime) || undefined;

    // 2. Validación de campos críticos: Si referencia o monto vienen mal, no vale la pena seguir.
    if (!reference || !Number.isInteger(amountInCents) || amountInCents <= 0) {
      return NextResponse.json(
        { ok: false, message: 'Referencia o monto inválido para crear el pago.' },
        { status: 400 },
      );
    }

    // 3. Validación de datos obligatorios del cliente
    if (!customerEmail || !customerName || !customerPhone) {
      return NextResponse.json(
        { ok: false, message: 'Debes enviar datos completos del comprador.' },
        { status: 400 },
      );
    }

    // Siempre regresamos a esta vista para confirmar pago y continuar el flujo.
    const origin = request.headers.get('origin') ?? new URL(request.url).origin;
    const redirectUrl = `${origin}/floreria/pago?orderCode=${encodeURIComponent(reference)}`;

    // 4. Verificación de credenciales y configuración de Wompi
    const config = getWompiConfig();
    if (!isWompiConfigured(config)) {
      // En local permitimos modo demo para que el equipo pueda probar el front sin llaves reales.
      const allowDemoFallback =
        process.env.NODE_ENV !== 'production' ||
        process.env.WOMPI_ALLOW_DEMO_FALLBACK === 'true';

      if (!allowDemoFallback) {
        return NextResponse.json(
          {
            ok: false,
            message:
              'Wompi no está configurado. Define NEXT_PUBLIC_WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_SECRET.',
          },
          { status: 500 },
        );
      }

      const demoTransactionId = `DEMO-${Date.now()}`;
      const demoCheckoutUrl = `${redirectUrl}&id=${encodeURIComponent(
        demoTransactionId,
      )}&status=APPROVED&demo=1`;

      return NextResponse.json({
        ok: true,
        mode: 'demo',
        reference,
        checkoutUrl: demoCheckoutUrl,
        redirectUrl,
      });
    }

    // 5. Creación de la firma de integridad requerida por Wompi por seguridad
    const currency = 'COP';
    // Firma de integridad obligatoria para que Wompi valide referencia y monto.
    const integritySignature = buildIntegritySignature({
      reference,
      amountInCents,
      currency,
      integritySecret: config.integritySecret,
      expirationTime,
    });

    // 6. Generación de la URL final para el Web Checkout de Wompi
    const checkoutUrl = buildWompiCheckoutUrl({
      publicKey: config.publicKey,
      reference,
      amountInCents,
      currency,
      redirectUrl,
      integritySignature,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddressLine1: shippingAddressLine1 || 'Entrega por confirmar',
      shippingAddressCity: shippingAddressCity || 'Ciudad por confirmar',
      shippingAddressPhone,
      expirationTime,
    });

    // 7. Retornar al cliente los datos necesarios para realizar el pago
    return NextResponse.json({
      ok: true,
      reference,
      checkoutUrl,
      redirectUrl,
    });
  } catch (error) {
    console.error('Error creando checkout de florería:', error);
    return NextResponse.json(
      { ok: false, message: 'No fue posible iniciar el pago de florería.' },
      { status: 500 },
    );
  }
}
