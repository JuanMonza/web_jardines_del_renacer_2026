import { NextRequest, NextResponse } from 'next/server';
import {
  createDiscountRequestInDB,
  findActiveClientByCedula,
  findRequestForVerificationFromDB,
  redeemDiscountRequestInDB,
} from '@/lib/allyMembershipStorageDB';
import { getAllyByIdFromDB } from '@/lib/alliesStorageDB';

export const dynamic = 'force-dynamic';

/**
 * GET /api/aliados/codigos
 * Busca y valida un código de descuento.
 * Usado por el panel del aliado para verificar un código antes de canjearlo.
 * Query Params: ?cedula=...&codigo=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cedula = searchParams.get('cedula');
    const code = searchParams.get('codigo');

    if (!cedula || !code) {
      return NextResponse.json({ message: 'La cédula y el código son requeridos.' }, { status: 400 });
    }

    const discountRequest = await findRequestForVerificationFromDB({ cedula, code });

    if (!discountRequest) {
      return NextResponse.json({ message: 'El código no fue encontrado o no es válido.' }, { status: 404 });
    }

    return NextResponse.json(discountRequest);
  } catch (error) {
    console.error('Error en API /api/aliados/codigos (GET):', error);
    return NextResponse.json({ message: 'Error interno al validar el código.' }, { status: 500 });
  }
}

/**
 * POST /api/aliados/codigos
 * Crea una nueva solicitud de código de descuento.
 * Usado por el cliente desde la sección de aliados.
 * Body: { "cedula": "...", "allyId": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const { cedula, allyId } = await request.json();

    if (!cedula || !allyId) {
      return NextResponse.json({ message: 'La cédula y el ID del aliado son requeridos.' }, { status: 400 });
    }

    const client = findActiveClientByCedula(cedula);
    if (!client) {
      return NextResponse.json({ message: 'El cliente no se encuentra activo.' }, { status: 403 });
    }

    const ally = await getAllyByIdFromDB(allyId);
    if (!ally) {
      return NextResponse.json({ message: 'El aliado comercial no fue encontrado.' }, { status: 404 });
    }

    const newDiscountRequest = await createDiscountRequestInDB(client, ally);

    return NextResponse.json(newDiscountRequest, { status: 201 });
  } catch (error) {
    console.error('Error en API /api/aliados/codigos (POST):', error);
    return NextResponse.json({ message: 'Error interno al generar el código.' }, { status: 500 });
  }
}

/**
 * PUT /api/aliados/codigos
 * Canjea (redime) un código de descuento.
 * Usado por el panel del aliado para marcar un código como utilizado.
 * Body: { "requestId": "...", "consumedValue": ..., "redeemedBy": "..." }
 */
export async function PUT(request: NextRequest) {
  try {
    const { requestId, consumedValue, redeemedBy } = await request.json();

    if (!requestId || consumedValue === undefined || !redeemedBy) {
      return NextResponse.json({ message: 'El ID de la solicitud, el valor consumido y el responsable son requeridos.' }, { status: 400 });
    }

    const consumedValueNumber = Number(consumedValue);
    if (isNaN(consumedValueNumber) || consumedValueNumber <= 0) {
      return NextResponse.json({ message: 'El valor consumido debe ser un número positivo.' }, { status: 400 });
    }

    const redeemedRequest = await redeemDiscountRequestInDB({
      requestId,
      consumedValue: consumedValueNumber,
      redeemedBy,
    });

    if (!redeemedRequest) {
      return NextResponse.json({ message: 'El código no pudo ser canjeado. Es posible que ya no esté activo.' }, { status: 409 });
    }

    return NextResponse.json(redeemedRequest);
  } catch (error) {
    console.error('Error en API /api/aliados/codigos (PUT):', error);
    return NextResponse.json({ message: 'Error interno al canjear el código.' }, { status: 500 });
  }
}
