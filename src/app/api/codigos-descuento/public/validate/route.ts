import { NextRequest, NextResponse } from 'next/server';
import { findActiveMembershipClient } from '@/lib/membership-clients';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const body = await request.json() as { cedula?: string };
  const client = await findActiveMembershipClient(String(body.cedula ?? ''));
  return client
    ? NextResponse.json({ data: client })
    : NextResponse.json({ message: 'No encontramos una membresía activa con esa cédula.' }, { status: 404 });
}
