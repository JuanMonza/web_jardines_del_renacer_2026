import { NextRequest, NextResponse } from 'next/server';
import { deactivateVacancyInDB, getVacancyByIdFromDB, updateVacancyInDB } from '@/lib/vacanciesStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { recordVacancyAudit } from '@/lib/vacancy-audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.view');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const vacancy = await getVacancyByIdFromDB(params.id);
    if (!vacancy) return NextResponse.json({ success: false, message: 'Vacante no encontrada.' }, { status: 404 });
    return NextResponse.json({ success: true, data: vacancy });
  } catch (error) {
    console.error('Error consultando vacante:', error);
    return NextResponse.json({ success: false, message: 'Error interno.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.update');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const body = await request.json();
    await updateVacancyInDB(params.id, body);
    await recordVacancyAudit({ action: 'VACANTE_ACTUALIZADA', table: 'vacantes', recordId: params.id, description: `Administrador ${session.name} (ID ${session.userId}) actualizó la vacante “${body.title || params.id}”.` });
    return NextResponse.json({ success: true, message: 'Vacante actualizada correctamente.' });
  } catch (error) {
    console.error('Error actualizando vacante:', error);
    return NextResponse.json({ success: false, message: 'No se pudo actualizar la vacante.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.delete');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const vacancy = await getVacancyByIdFromDB(params.id);
    const affectedRows = await deactivateVacancyInDB(params.id);
    if (!affectedRows) return NextResponse.json({ success: false, message: 'Vacante no encontrada.' }, { status: 404 });
    await recordVacancyAudit({ action: 'VACANTE_ELIMINADA', table: 'vacantes', recordId: params.id, description: `Administrador ${session.name} (ID ${session.userId}) desactivó la vacante “${vacancy?.title || params.id}”.` });
    return NextResponse.json({ success: true, message: 'Vacante desactivada correctamente.' });
  } catch (error) {
    console.error('Error desactivando vacante:', error);
    return NextResponse.json({ success: false, message: 'No se pudo desactivar la vacante.' }, { status: 500 });
  }
}
