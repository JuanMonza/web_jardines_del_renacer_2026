import { NextRequest, NextResponse } from 'next/server';
import {
  buildIntegritySignature,
  buildWompiCheckoutUrl,
  getWompiConfig,
  isWompiConfigured,
} from '@/lib/wompi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

function asTrimmedText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: NextRequest) {
  try {
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

    // Si referencia o monto vienen mal, no vale la pena seguir.
    if (!reference || !Number.isInteger(amountInCents) || amountInCents <= 0) {
      return NextResponse.json(
        { ok: false, message: 'Referencia o monto inválido para crear el pago.' },
        { status: 400 },
      );
    }

    if (!customerEmail || !customerName || !customerPhone) {
      return NextResponse.json(
        { ok: false, message: 'Debes enviar datos completos del comprador.' },
        { status: 400 },
      );
    }

    // Siempre regresamos a esta vista para confirmar pago y continuar el flujo.
    const origin = request.headers.get('origin') ?? new URL(request.url).origin;
    const redirectUrl = `${origin}/floreria/pago?orderCode=${encodeURIComponent(reference)}`;

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

    const currency = 'COP';
    // Firma de integridad obligatoria para que Wompi valide referencia y monto.
    const integritySignature = buildIntegritySignature({
      reference,
      amountInCents,
      currency,
      integritySecret: config.integritySecret,
      expirationTime,
    });

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
