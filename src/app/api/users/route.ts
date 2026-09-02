import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.view');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const data = await query(`SELECT c.documento AS candidateDocument, CONCAT(c.nombres, ' ', c.apellidos) AS candidateName, c.email AS candidateEmail, c.telefono AS candidatePhone, MAX(p.created_at) AS appliedAt
      FROM candidatos c LEFT JOIN postulaciones p ON p.candidato_id = c.id AND p.deleted_at IS NULL
      WHERE c.deleted_at IS NULL AND c.activo = TRUE
      GROUP BY c.id, c.documento, c.nombres, c.apellidos, c.email, c.telefono
      ORDER BY appliedAt DESC, c.created_at DESC`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('No fue posible consultar usuarios registrados:', error);
    return NextResponse.json({ success: false, message: 'No fue posible cargar los usuarios registrados.' }, { status: 500 });
  }
}
