import { NextRequest, NextResponse } from 'next/server';
import { createAllyInDB, getAlliesFromDB } from '@/lib/alliesStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { recordAllyAudit } from '@/lib/ally-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function validText(value: unknown, max: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= max;
}

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.view');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try { return NextResponse.json({ data: await getAlliesFromDB() }); }
  catch { return NextResponse.json({ message: 'No fue posible consultar los aliados.' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.create');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try {
    const body = await request.json() as Record<string, unknown>;
    if (!validText(body.name, 150) || !validText(body.loginId, 20) || !validText(body.departamento, 80) || !validText(body.municipio, 80) || !validText(body.logo, 2000)) {
      return NextResponse.json({ message: 'Los datos obligatorios del aliado son inválidos.' }, { status: 422 });
    }
    const ally = await createAllyInDB(body);
    if (!ally) return NextResponse.json({ message: 'No fue posible crear el aliado.' }, { status: 500 });
    await recordAllyAudit({ allyId: ally.id, adminUserId: session.userId, actorType: 'ADMIN', eventType: 'ALLY_CREATED', entityType: 'aliados', entityId: ally.id, details: { name: ally.name, loginId: ally.loginId, category: ally.categorySlug }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'), userAgent: request.headers.get('user-agent') });
    return NextResponse.json({ data: ally }, { status: 201 });
  } catch { return NextResponse.json({ message: 'No fue posible crear el aliado.' }, { status: 500 }); }
}
