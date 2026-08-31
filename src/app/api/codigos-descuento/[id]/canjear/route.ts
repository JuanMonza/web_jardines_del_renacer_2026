import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.codes.redeem');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  return NextResponse.json(
    { message: 'La administración solo puede consultar códigos. El descuento debe aplicarlo el aliado autorizado.' },
    { status: 403 },
  );
}
