import { NextRequest, NextResponse } from 'next/server';
import { deleteAllyFromDB, getAllyByIdFromDB, updateAllyInDB } from '@/lib/alliesStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { recordAllyAudit } from '@/lib/ally-audit';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.update');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    if (!id || Object.keys(body).length === 0) return NextResponse.json({ message: 'No hay cambios para guardar.' }, { status: 422 });
    const previous = await getAllyByIdFromDB(id);
    if (!await updateAllyInDB(id, body)) return NextResponse.json({ message: 'Aliado no encontrado.' }, { status: 404 });
    const ally = await getAllyByIdFromDB(id);
    if (ally) await recordAllyAudit({ allyId: id, adminUserId: session.userId, actorType: 'ADMIN', eventType: 'ALLY_UPDATED', entityType: 'aliados', entityId: id, details: { changedFields: Object.keys(body), previousName: previous?.name, currentName: ally.name }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'), userAgent: request.headers.get('user-agent') });
    return NextResponse.json({ data: ally });
  } catch (error) {
    // El detalle queda solo en el servidor para diagnosticar sin exponer datos de MySQL al navegador.
    console.error('[aliados] Error al actualizar aliado', error);
    const mysqlError = error as { code?: string };
    if (mysqlError.code === 'ER_DATA_TOO_LONG') {
      return NextResponse.json({ message: 'El archivo del logo supera el tamaño permitido. Usa una imagen más ligera o una URL pública.' }, { status: 422 });
    }
    return NextResponse.json({ message: 'No fue posible actualizar el aliado.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.delete');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try {
    const { id } = await params;
    const ally = await getAllyByIdFromDB(id);
    if (!await deleteAllyFromDB(id)) return NextResponse.json({ message: 'Aliado no encontrado.' }, { status: 404 });
    if (ally) await recordAllyAudit({ allyId: id, adminUserId: session.userId, actorType: 'ADMIN', eventType: 'ALLY_DEACTIVATED', entityType: 'aliados', entityId: id, details: { name: ally.name, loginId: ally.loginId }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'), userAgent: request.headers.get('user-agent') });
    return new NextResponse(null, { status: 204 });
  } catch { return NextResponse.json({ message: 'No fue posible desactivar el aliado.' }, { status: 500 }); }
}
