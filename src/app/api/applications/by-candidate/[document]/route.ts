import { NextRequest, NextResponse } from 'next/server';
import { getApplicationsByCandidateFromDB } from '@/lib/candidateStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { document: string } }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.view');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const data = await getApplicationsByCandidateFromDB(params.document);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('No fue posible consultar postulaciones del usuario:', error);
    return NextResponse.json({ success: false, message: 'No fue posible consultar las postulaciones.' }, { status: 500 });
  }
}
