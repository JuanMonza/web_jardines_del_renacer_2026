import { NextResponse } from 'next/server';
import { getAlliesFromDB } from '@/lib/alliesStorageDB';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Catálogo público: no expone credenciales ni datos internos. */
export async function GET() {
  try {
    const allies = await getAlliesFromDB();
    return NextResponse.json({ data: allies.map(({ loginId, loginPassword, ...ally }) => ally) });
  } catch {
    return NextResponse.json({ message: 'No fue posible consultar el catálogo de aliados.' }, { status: 500 });
  }
}
