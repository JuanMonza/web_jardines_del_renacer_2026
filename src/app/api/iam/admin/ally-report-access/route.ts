import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { ensureAllyReportAccessSchema } from '@/lib/ally-report-access';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function administrator(request: NextRequest) {
  return requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'dashboard.admin.view');
}

export async function GET(request: NextRequest) {
  const session = await administrator(request);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try {
    await ensureAllyReportAccessSchema();
    const data = await query<{ id: number; name: string; active: number; canView: number; canExport: number; hasAllyPanel: number; isPrincipal: number }>(`
      SELECT u.id, CONCAT(u.nombres, ' ', u.apellidos) AS name, u.activo AS active,
        COALESCE(a.can_view, 0) AS canView, COALESCE(a.can_export, 0) AS canExport,
        EXISTS(SELECT 1 FROM admin_user_roles aur
          INNER JOIN role_permissions rp ON rp.role_id=aur.role_id
          INNER JOIN permissions p ON p.id=rp.permission_id AND p.codigo='dashboard.aliados.view'
          WHERE aur.admin_user_id=u.id AND aur.activo=TRUE
          AND (aur.fecha_expiracion IS NULL OR aur.fecha_expiracion>NOW())) AS hasAllyPanel,
        EXISTS(SELECT 1 FROM admin_user_roles aur
          INNER JOIN role_permissions rp ON rp.role_id=aur.role_id
          INNER JOIN permissions p ON p.id=rp.permission_id AND p.codigo='dashboard.admin.view'
          WHERE aur.admin_user_id=u.id AND aur.activo=TRUE
          AND (aur.fecha_expiracion IS NULL OR aur.fecha_expiracion>NOW())) AS isPrincipal
      FROM admin_users u LEFT JOIN ally_report_access a ON a.admin_user_id=u.id
      WHERE u.deleted_at IS NULL ORDER BY u.activo DESC, u.nombres, u.apellidos`);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('[aliados] Permisos del informe:', error);
    return NextResponse.json({ message: 'No fue posible consultar los permisos del informe.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await administrator(request);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const userId = Number(body.userId);
  if (!Number.isSafeInteger(userId) || userId < 1 || typeof body.canView !== 'boolean' || typeof body.canExport !== 'boolean' || (body.canExport && !body.canView)) {
    return NextResponse.json({ message: 'Selecciona permisos válidos. Descargar requiere permiso para ver.' }, { status: 422 });
  }
  try {
    await ensureAllyReportAccessSchema();
    const users = await query<{ id: number; activo: number; hasAllyPanel: number; isPrincipal: number }>(`
      SELECT u.id, u.activo,
        EXISTS(SELECT 1 FROM admin_user_roles aur
          INNER JOIN role_permissions rp ON rp.role_id=aur.role_id
          INNER JOIN permissions p ON p.id=rp.permission_id AND p.codigo='dashboard.aliados.view'
          WHERE aur.admin_user_id=u.id AND aur.activo=TRUE
          AND (aur.fecha_expiracion IS NULL OR aur.fecha_expiracion>NOW())) AS hasAllyPanel,
        EXISTS(SELECT 1 FROM admin_user_roles aur
          INNER JOIN role_permissions rp ON rp.role_id=aur.role_id
          INNER JOIN permissions p ON p.id=rp.permission_id AND p.codigo='dashboard.admin.view'
          WHERE aur.admin_user_id=u.id AND aur.activo=TRUE
          AND (aur.fecha_expiracion IS NULL OR aur.fecha_expiracion>NOW())) AS isPrincipal
      FROM admin_users u WHERE u.id=? AND u.deleted_at IS NULL LIMIT 1`, [userId]);
    if (!users[0]?.activo) return NextResponse.json({ message: 'El administrador no está activo.' }, { status: 404 });
    if (!users[0].hasAllyPanel || users[0].isPrincipal) return NextResponse.json({ message: 'Selecciona un administrador del panel Aliados.' }, { status: 422 });
    await execute(`INSERT INTO ally_report_access (admin_user_id,can_view,can_export,granted_by)
      VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE can_view=VALUES(can_view),can_export=VALUES(can_export),granted_by=VALUES(granted_by)`,
    [userId, body.canView, body.canExport, session.userId]);
    await execute(`INSERT INTO activity_logs (usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion)
      VALUES ('Admin','ALLY_REPORT_ACCESS_CHANGED','Aliados','ally_report_access',?,?)`,
    [userId, `Administrador ${session.name} (ID ${session.userId}) configuró informe de aliados para usuario ${userId}: ver=${body.canView}, descargar=${body.canExport}.`]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[aliados] Asignación de informe:', error);
    return NextResponse.json({ message: 'No fue posible guardar el permiso.' }, { status: 500 });
  }
}
