import { NextRequest, NextResponse } from 'next/server';
import { createSedeInDB, getSedesFromDB } from '@/lib/sedesStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { recordSedeAudit } from '@/lib/sede-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  if (!await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'sites.view')) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try { return NextResponse.json({ data: await getSedesFromDB() }); } catch { return NextResponse.json({ message: 'No fue posible consultar las sedes.' }, { status: 500 }); }
}
export async function POST(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'sites.create');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try { const sede = await createSedeInDB(await request.json()); await recordSedeAudit({ sedeId: sede.id, adminUserId: session.userId, eventType: 'SEDE_CREATED', details: { name: sede.nombre, city: sede.ciudad }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(), userAgent: request.headers.get('user-agent') }); return NextResponse.json({ data: sede }, { status: 201 }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : 'No fue posible crear la sede.' }, { status: 422 }); }
}
