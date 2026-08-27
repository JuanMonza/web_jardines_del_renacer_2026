import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute, query } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';

type RoleRow = { id: number; nombre: string; descripcion: string | null; color: string | null };

async function requireAdministrator(request: NextRequest) {
  return requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    'dashboard.admin.view',
  );
}

export async function GET(request: NextRequest) {
  const session = await requireAdministrator(request);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });

  const [users, roles] = await Promise.all([
    query<{
      id: number;
      cedula: string;
      nombres: string;
      apellidos: string;
      email: string;
      activo: number;
      ultimo_login: string | null;
      bloqueado_hasta: string | null;
      roles: string | null;
    }>(
      `SELECT
        u.id, u.cedula, u.nombres, u.apellidos, u.email, u.activo,
        u.ultimo_login, u.bloqueado_hasta,
        GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.prioridad SEPARATOR ' | ') AS roles
       FROM admin_users u
       LEFT JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE
       LEFT JOIN roles r ON r.id = aur.role_id AND r.activo = TRUE AND r.deleted_at IS NULL
       WHERE u.deleted_at IS NULL
       GROUP BY u.id, u.cedula, u.nombres, u.apellidos, u.email, u.activo, u.ultimo_login, u.bloqueado_hasta
       ORDER BY u.activo DESC, u.nombres, u.apellidos`,
    ),
    query<RoleRow>(
      `SELECT id, nombre, descripcion, color
       FROM roles
       WHERE activo = TRUE AND deleted_at IS NULL
       ORDER BY prioridad, nombre`,
    ),
  ]);

  return NextResponse.json({ data: users, roles });
}

export async function POST(request: NextRequest) {
  const session = await requireAdministrator(request);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });

  try {
    const body = (await request.json()) as {
      cedula?: string;
      nombres?: string;
      apellidos?: string;
      email?: string;
      password?: string;
      roleId?: number;
    };
    const cedula = body.cedula?.replace(/\D/g, '') ?? '';
    const nombres = body.nombres?.trim() ?? '';
    const apellidos = body.apellidos?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';
    const roleId = Number(body.roleId);

    if (!/^\d{6,20}$/.test(cedula) || !/^[\p{L}\s'.-]{2,120}$/u.test(nombres) || !/^[\p{L}\s'.-]{2,120}$/u.test(apellidos) || !/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || password.length > 128 || !Number.isInteger(roleId)) {
      return NextResponse.json({ message: 'Revisa los datos. La contraseña debe tener entre 12 y 128 caracteres.' }, { status: 422 });
    }

    const [duplicate, role] = await Promise.all([
      query<{ id: number }>('SELECT id FROM admin_users WHERE (cedula = ? OR email = ?) AND deleted_at IS NULL LIMIT 1', [cedula, email]),
      query<RoleRow>('SELECT id, nombre, descripcion, color FROM roles WHERE id = ? AND activo = TRUE AND deleted_at IS NULL LIMIT 1', [roleId]),
    ]);
    if (duplicate[0]) return NextResponse.json({ message: 'Ya existe un administrador con esa cédula o correo.' }, { status: 409 });
    if (!role[0]) return NextResponse.json({ message: 'El rol seleccionado no está disponible.' }, { status: 422 });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await execute(
      `INSERT INTO admin_users (cedula, nombres, apellidos, email, password_hash, email_verificado, activo, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, TRUE, TRUE, ?, ?)`,
      [cedula, nombres, apellidos, email, passwordHash, session.userId, session.userId],
    );
    await execute('INSERT INTO admin_user_roles (admin_user_id, role_id, activo) VALUES (?, ?, TRUE)', [result.insertId, roleId]);
    return NextResponse.json({ ok: true, message: 'Administrador creado correctamente.' }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/iam/admin/users]', error);
    return NextResponse.json({ message: 'No fue posible crear el administrador.' }, { status: 500 });
  }
}
