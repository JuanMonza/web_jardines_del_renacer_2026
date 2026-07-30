import { NextRequest, NextResponse } from 'next/server';
import { getRecentAllyActivityFromDB } from '@/lib/alliesStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    'allies.view',
  );
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });

  try {
    return NextResponse.json({ data: await getRecentAllyActivityFromDB() });
  } catch {
    return NextResponse.json({ message: 'No fue posible consultar la bitácora.' }, { status: 500 });
  }
}
