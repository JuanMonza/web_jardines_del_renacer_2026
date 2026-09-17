import { execute, query } from '@/lib/db';
import { hasPermission, type AdminSession } from '@/lib/iam/admin-session';

let schemaPromise: Promise<void> | null = null;

export function ensureAllyReportAccessSchema() {
  return schemaPromise ??= execute(`CREATE TABLE IF NOT EXISTS ally_report_access (
    admin_user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_export BOOLEAN NOT NULL DEFAULT FALSE,
    granted_by BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ally_report_user FOREIGN KEY (admin_user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ally_report_granter FOREIGN KEY (granted_by) REFERENCES admin_users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`).then(() => undefined)
    .catch(error => { schemaPromise = null; throw error; });
}

export type AllyReportAccess = { canView: boolean; canExport: boolean };

export async function getAllyReportAccess(session: AdminSession): Promise<AllyReportAccess> {
  if (hasPermission(session, 'dashboard.admin.view')) return { canView: true, canExport: true };
  await ensureAllyReportAccessSchema();
  const rows = await query<{ can_view: number; can_export: number }>(
    `SELECT access.can_view, access.can_export FROM ally_report_access access
     INNER JOIN admin_users user ON user.id=access.admin_user_id
     WHERE access.admin_user_id=? AND user.activo=TRUE AND user.deleted_at IS NULL LIMIT 1`,
    [session.userId],
  );
  return { canView: Boolean(rows[0]?.can_view), canExport: Boolean(rows[0]?.can_export) };
}
