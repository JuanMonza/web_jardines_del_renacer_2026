import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.view');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const data = await query<{ createdAt: Date | string; action: string; description: string }>(
      `SELECT created_at AS createdAt, accion AS action, descripcion FROM activity_logs
       WHERE modulo = 'Vacantes' ORDER BY created_at DESC, id DESC LIMIT 500`,
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('No fue posible consultar la auditoría de vacantes:', error);
    return NextResponse.json({ success: false, message: 'No fue posible consultar los movimientos.' }, { status: 500 });
  }
}
