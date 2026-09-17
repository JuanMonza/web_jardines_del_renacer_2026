import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx-js-style';
import { execute, query } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, requireAdminPermission, verifyAdminPassword } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';

type AdminExportRow = {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  activo: number;
  roles: string | null;
  created_at: Date | string | null;
  ultimo_login: Date | string | null;
};

function safeCell(value: string | null | undefined) {
  const text = String(value ?? '');
  return /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
}

function formatDate(value: Date | string | null) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('es-CO', { timeZone: 'America/Bogota' });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    'dashboard.admin.view',
  );
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  if (!(await verifyAdminPassword(session, body.password))) {
    return NextResponse.json({ message: 'La contraseña de confirmación no es correcta.' }, { status: 403 });
  }

  try {
    const users = await query<AdminExportRow>(`
      SELECT u.cedula, u.nombres, u.apellidos, u.email, u.activo,
        u.created_at, u.ultimo_login,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.prioridad SEPARATOR ' | ') AS roles
      FROM admin_users u
      LEFT JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE
        AND (aur.fecha_expiracion IS NULL OR aur.fecha_expiracion > NOW())
      LEFT JOIN roles r ON r.id = aur.role_id AND r.activo = TRUE AND r.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
      GROUP BY u.id, u.cedula, u.nombres, u.apellidos, u.email, u.activo, u.created_at, u.ultimo_login
      ORDER BY u.activo DESC, u.nombres, u.apellidos`);

    const headings = ['Cédula', 'Nombres', 'Apellidos', 'Correo', 'Roles', 'Estado', 'Creación', 'Último acceso'];
    const sheet = XLSX.utils.aoa_to_sheet([
      headings,
      ...users.map(user => [
        safeCell(user.cedula), safeCell(user.nombres), safeCell(user.apellidos), safeCell(user.email),
        safeCell(user.roles), user.activo ? 'Activo' : 'Inactivo',
        formatDate(user.created_at), formatDate(user.ultimo_login),
      ]),
    ]);
    sheet['!cols'] = [18, 24, 24, 38, 42, 14, 23, 23].map(wch => ({ wch }));
    sheet['!autofilter'] = { ref: `A1:H${users.length + 1}` };
    for (let column = 0; column < headings.length; column++) {
      const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: column })];
      cell.s = { font: { bold: true, color: { rgb: 'FFFFFF' } }, fill: { fgColor: { rgb: '244F8A' } } };
    }
    users.forEach((user, index) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: index + 1, c: 5 })];
      if (cell) cell.s = user.activo
        ? { font: { color: { rgb: '166534' }, bold: true }, fill: { fgColor: { rgb: 'DCFCE7' } } }
        : { font: { color: { rgb: '991B1B' }, bold: true }, fill: { fgColor: { rgb: 'FEE2E2' } } };
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Administradores');
    const file = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer;

    await execute(`INSERT INTO activity_logs (usuario_tipo, accion, modulo, tabla_afectada, registro_id, descripcion)
      VALUES ('Admin', 'ADMIN_USERS_EXPORTED', 'IAM', 'admin_users', ?, ?)`,
    [session.userId, `${session.name} (ID ${session.userId}) descargó el directorio de ${users.length} administradores sin contraseñas.`]);

    return new NextResponse(new Blob([Uint8Array.from(file)]), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="administradores-jardines-del-renacer.xlsx"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[iam] Exportación de administradores:', error);
    return NextResponse.json({ message: 'No fue posible descargar el directorio de administradores.' }, { status: 500 });
  }
}
