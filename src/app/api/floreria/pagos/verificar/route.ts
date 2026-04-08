import { NextRequest, NextResponse } from 'next/server';
import { getWompiConfig } from '@/lib/wompi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseAsPositiveInt(value: string | null) {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId =
      searchParams.get('id')?.trim() || searchParams.get('transactionId')?.trim() || '';
    const expectedReference =
      searchParams.get('reference')?.trim().toUpperCase() ||
      searchParams.get('orderCode')?.trim().toUpperCase() ||
      '';
    const expectedAmountInCents = parseAsPositiveInt(
      searchParams.get('amountInCents'),
    );

    if (!transactionId) {
      return NextResponse.json(
        { ok: false, message: 'Falta el id de transacción para verificar.' },
        { status: 400 },
      );
    }

    // Este atajo nos sirve para pruebas internas cuando aún no hay credenciales productivas.
    const demoMode =
      transactionId.startsWith('DEMO-') || searchParams.get('demo') === '1';
    if (demoMode) {
      return NextResponse.json({
        ok: true,
        approved: true,
        status: 'APPROVED',
        reference: expectedReference || 'DEMO-REFERENCE',
        amountInCents: expectedAmountInCents ?? 0,
        currency: 'COP',
        paymentMethodType: 'DEMO',
        transactionId,
        finalizedAt: new Date().toISOString(),
      });
    }

    const config = getWompiConfig();
    const authToken = config.privateKey || config.publicKey;

    if (!authToken) {
      return NextResponse.json(
        {
          ok: false,
          message:
            'Wompi no está configurado. Define WOMPI_PRIVATE_KEY o NEXT_PUBLIC_WOMPI_PUBLIC_KEY.',
        },
        { status: 500 },
      );
    }

    // Consultamos Wompi en tiempo real para no depender de estados cacheados.
    const wompiResponse = await fetch(
      `${config.apiBaseUrl}/transactions/${encodeURIComponent(transactionId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    );

    if (!wompiResponse.ok) {
      const detail = await wompiResponse.text();
      return NextResponse.json(
        {
          ok: false,
          message: 'No fue posible consultar la transacción en Wompi.',
          detail,
        },
        { status: wompiResponse.status },
      );
    }

    const payload = (await wompiResponse.json()) as {
      data?: {
        id?: string;
        status?: string;
        reference?: string;
        amount_in_cents?: number;
        currency?: string;
        payment_method_type?: string;
        finalized_at?: string;
      };
    };

    const transaction = payload.data;
    const status = transaction?.status ?? 'ERROR';
    const reference = (transaction?.reference ?? '').toUpperCase();
    const amountInCents = Number(transaction?.amount_in_cents ?? 0);
    const referenceMatches = expectedReference ? reference === expectedReference : true;
    const amountMatches = expectedAmountInCents
      ? amountInCents === expectedAmountInCents
      : true;
    // Solo marcamos aprobado cuando todo coincide: estado, referencia y valor.
    const approved = status === 'APPROVED' && referenceMatches && amountMatches;

    return NextResponse.json({
      ok: true,
      approved,
      status,
      reference,
      amountInCents,
      currency: transaction?.currency ?? 'COP',
      paymentMethodType: transaction?.payment_method_type ?? '',
      transactionId: transaction?.id ?? transactionId,
      finalizedAt: transaction?.finalized_at ?? '',
      referenceMatches,
      amountMatches,
    });
  } catch (error) {
    console.error('Error verificando pago de florería:', error);
    return NextResponse.json(
      { ok: false, message: 'Ocurrió un error verificando la transacción.' },
      { status: 500 },
    );
  }
}
