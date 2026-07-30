import { NextRequest, NextResponse } from 'next/server';
import { APPLICATION_STATUS_OPTIONS, type ApplicationStatus } from '@/config/candidates';
import { updateApplicationStatusInDB } from '@/lib/candidateStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.update');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const body = await request.json() as { status?: ApplicationStatus; notes?: string };
    if (!body.status || !APPLICATION_STATUS_OPTIONS.includes(body.status)) return NextResponse.json({ success: false, message: 'Estado de postulación inválido.' }, { status: 422 });
    const { id } = await params;
    if (!await updateApplicationStatusInDB({ id, status: body.status, notes: body.notes })) return NextResponse.json({ success: false, message: 'Postulación no encontrada.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, message: 'No fue posible actualizar la postulación.' }, { status: 500 }); }
}
