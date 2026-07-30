import { NextRequest, NextResponse } from 'next/server';
import { getAllyByIdFromDB } from '@/lib/alliesStorageDB';
import { cleanDocument, createDiscountRequestInDB } from '@/lib/allyMembershipStorageDB';
import { findActiveMembershipClient } from '@/lib/membership-clients';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cedula?: string; allyId?: string };
    const cedula = cleanDocument(String(body.cedula ?? ''));
    const allyId = String(body.allyId ?? '');
    const client = await findActiveMembershipClient(cedula);
    const ally = await getAllyByIdFromDB(allyId);
    if (!client || !ally) return NextResponse.json({ message: 'No fue posible validar la membresía o el aliado seleccionado.' }, { status: 422 });
    const data = await createDiscountRequestInDB(client, ally);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/codigos-descuento/public]', error);
    return NextResponse.json({ message: 'No fue posible generar el código de descuento.' }, { status: 500 });
  }
}
