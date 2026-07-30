import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { getRecentSedeActivity } from '@/lib/sede-audit';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  if (!await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'sites.view')) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try { return NextResponse.json({ data: await getRecentSedeActivity() }); } catch { return NextResponse.json({ message: 'No fue posible consultar la bitácora.' }, { status: 500 }); }
}
