import { NextRequest, NextResponse } from 'next/server';
import { APPLICATION_STATUS_OPTIONS, type ApplicationStatus } from '@/config/candidates';
import { deactivateCandidateFromApplicationInDB, updateApplicationStatusInDB } from '@/lib/candidateStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission, verifyAdminPassword } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.update');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const body = await request.json() as { status?: ApplicationStatus; notes?: string };
    if (!body.status || !APPLICATION_STATUS_OPTIONS.includes(body.status)) return NextResponse.json({ success: false, message: 'Estado de postulación inválido.' }, { status: 422 });
    const { id } = await params;
    if (!await updateApplicationStatusInDB({ id, status: body.status, notes: body.notes, adminName: session.name, adminUserId: session.userId })) return NextResponse.json({ success: false, message: 'Postulación no encontrada.' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ success: false, message: 'No fue posible actualizar la postulación.' }, { status: 500 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.delete');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const body = await request.json() as { password?: string };
    if (!(await verifyAdminPassword(session, body.password))) {
      return NextResponse.json({ success: false, message: 'La contraseña del administrador no es correcta.' }, { status: 401 });
    }
    const { id } = await params;
    const candidate = await deactivateCandidateFromApplicationInDB({
      applicationId: id,
      adminUserId: session.userId,
      adminName: session.name,
    });
    if (!candidate) return NextResponse.json({ success: false, message: 'Postulante no encontrado o ya eliminado.' }, { status: 404 });
    return NextResponse.json({ success: true, data: { email: candidate.email, name: candidate.name } });
  } catch (error) {
    console.error('No fue posible eliminar el postulante:', error);
    return NextResponse.json({ success: false, message: 'No fue posible eliminar el postulante.' }, { status: 500 });
  }
}
