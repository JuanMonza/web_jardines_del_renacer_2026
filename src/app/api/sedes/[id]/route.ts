import { NextRequest, NextResponse } from 'next/server';
import { deactivateSedeInDB, updateSedeInDB } from '@/lib/sedesStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { recordSedeAudit } from '@/lib/sede-audit';

export const runtime = 'nodejs';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'sites.update');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try { const { id } = await params; const body = await request.json() as Record<string, unknown>; const sede = await updateSedeInDB(id, body); if (sede) await recordSedeAudit({ sedeId: id, adminUserId: session.userId, eventType: 'SEDE_UPDATED', details: { changedFields: Object.keys(body) }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(), userAgent: request.headers.get('user-agent') }); return sede ? NextResponse.json({ data: sede }) : NextResponse.json({ message: 'Sede no encontrada.' }, { status: 404 }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : 'No fue posible actualizar la sede.' }, { status: 422 }); }
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'sites.delete');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  const { id } = await params;
  const removed = await deactivateSedeInDB(id);
  if (removed) await recordSedeAudit({ sedeId: id, adminUserId: session.userId, eventType: 'SEDE_DEACTIVATED', ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(), userAgent: request.headers.get('user-agent') });
  return removed ? new NextResponse(null, { status: 204 }) : NextResponse.json({ message: 'Sede no encontrada.' }, { status: 404 });
}
