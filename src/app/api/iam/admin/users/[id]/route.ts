import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { execute, query } from '@/lib/db';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const runtime = 'nodejs';

const GENERAL_ROLE = 'Administrador General';

async function requireAdministrator(request: NextRequest) {
  return requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    'dashboard.admin.view',
  );
}

function userIdFromParams(params: { id: string }) {
  const id = Number(params.id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function isLastActiveGeneralAdministrator(userId: number) {
  const result = await query<{ total: number }>(
    `SELECT COUNT(DISTINCT u.id) AS total
     FROM admin_users u
     INNER JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE
     INNER JOIN roles r ON r.id = aur.role_id AND r.nombre = ? AND r.activo = TRUE AND r.deleted_at IS NULL
     WHERE u.id = ? AND u.activo = TRUE AND u.deleted_at IS NULL`,
    [GENERAL_ROLE, userId],
  );
  if (!result[0]?.total) return false;
  const activeGenerals = await query<{ total: number }>(
    `SELECT COUNT(DISTINCT u.id) AS total
     FROM admin_users u
     INNER JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE
     INNER JOIN roles r ON r.id = aur.role_id AND r.nombre = ? AND r.activo = TRUE AND r.deleted_at IS NULL
     WHERE u.activo = TRUE AND u.deleted_at IS NULL`,
    [GENERAL_ROLE],
  );
  return Number(activeGenerals[0]?.total ?? 0) <= 1;
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  const session = await requireAdministrator(request);
  const userId = userIdFromParams(context.params);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  if (!userId) return NextResponse.json({ message: 'Administrador inválido.' }, { status: 422 });
  if (userId === session.userId) return NextResponse.json({ message: 'Por seguridad, no puedes modificar tu propia cuenta desde esta pantalla.' }, { status: 422 });

  try {
    const body = (await request.json()) as {
      nombres?: string;
      apellidos?: string;
      email?: string;
      password?: string;
      roleId?: number;
      activo?: boolean;
    };
    const existing = await query<{ id: number; activo: number }>('SELECT id, activo FROM admin_users WHERE id = ? AND deleted_at IS NULL LIMIT 1', [userId]);
    if (!existing[0]) return NextResponse.json({ message: 'No se encontró el administrador.' }, { status: 404 });

    const nombres = body.nombres?.trim() ?? '';
    const apellidos = body.apellidos?.trim() ?? '';
    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';
    const roleId = Number(body.roleId);
    const activo = body.activo === true;
    if (!/^[\p{L}\s'.-]{2,120}$/u.test(nombres) || !/^[\p{L}\s'.-]{2,120}$/u.test(apellidos) || !/^\S+@\S+\.\S+$/.test(email) || (password.length > 0 && (password.length < 12 || password.length > 128)) || !Number.isInteger(roleId)) {
      return NextResponse.json({ message: 'Revisa los datos. Si cambias la contraseña, debe tener entre 12 y 128 caracteres.' }, { status: 422 });
    }
    if (!activo && await isLastActiveGeneralAdministrator(userId)) {
      return NextResponse.json({ message: 'Debe permanecer al menos un Administrador General activo.' }, { status: 422 });
    }
    const [duplicate, role] = await Promise.all([
      query<{ id: number }>('SELECT id FROM admin_users WHERE email = ? AND id <> ? AND deleted_at IS NULL LIMIT 1', [email, userId]),
      query<{ id: number }>('SELECT id FROM roles WHERE id = ? AND activo = TRUE AND deleted_at IS NULL LIMIT 1', [roleId]),
    ]);
    if (duplicate[0]) return NextResponse.json({ message: 'Ya existe un administrador con ese correo.' }, { status: 409 });
    if (!role[0]) return NextResponse.json({ message: 'El rol seleccionado no está disponible.' }, { status: 422 });

    const passwordHash = password ? await bcrypt.hash(password, 12) : null;
    await execute(
      `UPDATE admin_users
       SET nombres = ?, apellidos = ?, email = ?, activo = ?, password_hash = COALESCE(?, password_hash), updated_by = ?
       WHERE id = ?`,
      [nombres, apellidos, email, activo, passwordHash, session.userId, userId],
    );
    await execute('UPDATE admin_user_roles SET activo = FALSE WHERE admin_user_id = ?', [userId]);
    await execute(
      `INSERT INTO admin_user_roles (admin_user_id, role_id, activo)
       VALUES (?, ?, TRUE)
       ON DUPLICATE KEY UPDATE activo = TRUE`,
      [userId, roleId],
    );
    return NextResponse.json({ ok: true, message: 'Administrador actualizado correctamente.' });
  } catch (error) {
    console.error('[PATCH /api/iam/admin/users/[id]]', error);
    return NextResponse.json({ message: 'No fue posible actualizar el administrador.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  const session = await requireAdministrator(request);
  const userId = userIdFromParams(context.params);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  if (!userId) return NextResponse.json({ message: 'Administrador inválido.' }, { status: 422 });
  if (userId === session.userId) return NextResponse.json({ message: 'No puedes eliminar tu propia cuenta.' }, { status: 422 });
  if (await isLastActiveGeneralAdministrator(userId)) return NextResponse.json({ message: 'Debe permanecer al menos un Administrador General activo.' }, { status: 422 });

  const result = await execute('UPDATE admin_users SET activo = FALSE, deleted_at = NOW(), updated_by = ? WHERE id = ? AND deleted_at IS NULL', [session.userId, userId]);
  if (!result.affectedRows) return NextResponse.json({ message: 'No se encontró el administrador.' }, { status: 404 });
  return NextResponse.json({ ok: true, message: 'Administrador desactivado correctamente.' });
}
