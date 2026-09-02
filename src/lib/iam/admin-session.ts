import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { execute, query } from '@/lib/db';
import { hasPermission, signAdminToken, type AdminTokenSession, verifyAdminToken } from '@/lib/iam/admin-token';

export const ADMIN_SESSION_COOKIE = 'jdr_admin_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type AdminUserRow = { id: number; uuid: string; nombres: string; apellidos: string; email: string; password_hash: string; activo: number; bloqueado_hasta: Date | null };
type PermissionRow = { codigo: string };
export type AdminSession = AdminTokenSession;
function tokenHash(value: string) { return createHash('sha256').update(value).digest('hex'); }
export { hasPermission };

export async function authenticateAdmin(input: { cedula: unknown; password: unknown; requiredPermission: string; ip: string; userAgent: string }) {
  const cedula = typeof input.cedula === 'string' ? input.cedula.replace(/\D/g, '') : '';
  const password = typeof input.password === 'string' ? input.password : '';
  if (!/^\d{6,20}$/.test(cedula) || !password || password.length > 512) return null;
  const users = await query<AdminUserRow>('SELECT id, uuid, nombres, apellidos, email, password_hash, activo, bloqueado_hasta FROM admin_users WHERE cedula = ? AND deleted_at IS NULL LIMIT 1', [cedula]);
  const user = users[0];
  const blocked = user?.bloqueado_hasta && user.bloqueado_hasta.getTime() > Date.now();
  if (!user || !user.activo || blocked || !(await bcrypt.compare(password, user.password_hash))) {
    if (user) await execute("UPDATE admin_users SET intentos_fallidos = intentos_fallidos + 1, bloqueado_hasta = CASE WHEN intentos_fallidos + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) ELSE bloqueado_hasta END WHERE id = ?", [user.id]);
    return null;
  }
  const rows = await query<PermissionRow>('SELECT DISTINCT p.codigo FROM permissions p INNER JOIN role_permissions rp ON rp.permission_id = p.id INNER JOIN admin_user_roles aur ON aur.role_id = rp.role_id WHERE aur.admin_user_id = ? AND aur.activo = TRUE AND (aur.fecha_expiracion IS NULL OR aur.fecha_expiracion > NOW()) AND p.activo = TRUE AND p.deleted_at IS NULL', [user.id]);
  const permissions = rows.map(({ codigo }) => codigo);
  if (!hasPermission({ permissions }, input.requiredPermission)) return null;
  const sessionId = randomBytes(32).toString('hex');
  const expiration = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  await execute('INSERT INTO admin_sessions (admin_user_id, session_token, ip, user_agent, expira_en) VALUES (?, ?, ?, ?, ?)', [user.id, tokenHash(sessionId), input.ip.slice(0, 45), input.userAgent.slice(0, 2000), expiration]);
  await execute('UPDATE admin_users SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_login = NOW(), ultimo_ip = ? WHERE id = ?', [input.ip.slice(0, 45), user.id]);
  return { sessionId, userId: user.id, userUuid: user.uuid, name: `${user.nombres} ${user.apellidos}`.trim(), email: user.email, permissions } satisfies AdminSession;
}
export const signAdminSession = signAdminToken;
export const verifyAdminSession = verifyAdminToken;
export async function revokeAdminSession(sessionId: string) { await execute("UPDATE admin_sessions SET activa = FALSE, cerrada_en = NOW(), motivo_cierre = 'LOGOUT' WHERE session_token = ? AND activa = TRUE", [tokenHash(sessionId)]); }

/** Validación de defensa en profundidad para endpoints Node.js. */
export async function requireAdminPermission(token: string | undefined, permission: string) {
  const session = await verifyAdminSession(token);
  if (!session || !hasPermission(session, permission)) return null;
  const active = await query<{ id: number }>(
    `SELECT s.id
     FROM admin_sessions s INNER JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.session_token = ? AND s.activa = TRUE AND s.expira_en > NOW()
       AND u.id = ? AND u.activo = TRUE AND u.deleted_at IS NULL
     LIMIT 1`,
    [tokenHash(session.sessionId), session.userId],
  );
  return active[0] ? session : null;
}

export async function getActiveAdminSession(token: string | undefined) {
  const session = await verifyAdminSession(token);
  if (!session) return null;
  const active = await query<{ id: number }>(
    `SELECT s.id FROM admin_sessions s INNER JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.session_token = ? AND s.activa = TRUE AND s.expira_en > NOW()
       AND u.id = ? AND u.activo = TRUE AND u.deleted_at IS NULL LIMIT 1`,
    [tokenHash(session.sessionId), session.userId],
  );
  return active[0] ? session : null;
}

/** Confirma la identidad del administrador antes de una operación sensible. */
export async function verifyAdminPassword(session: AdminSession, password: unknown) {
  const value = typeof password === 'string' ? password : '';
  if (!value || value.length > 512) return false;
  const users = await query<{ password_hash: string; activo: number }>(
    'SELECT password_hash, activo FROM admin_users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
    [session.userId],
  );
  const user = users[0];
  return Boolean(user?.activo && user.password_hash && await bcrypt.compare(value, user.password_hash));
}
