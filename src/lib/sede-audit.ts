import { execute, query } from '@/lib/db';

export async function recordSedeAudit(entry: { sedeId: string; adminUserId: number; eventType: string; details?: Record<string, unknown>; ip?: string | null; userAgent?: string | null }) {
  await execute('INSERT INTO sede_activity_logs (sede_id, admin_user_id, event_type, details, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)', [entry.sedeId, entry.adminUserId, entry.eventType, entry.details ? JSON.stringify(entry.details) : null, entry.ip?.slice(0, 45) ?? null, entry.userAgent?.slice(0, 500) ?? null]);
}

export async function getRecentSedeActivity() {
  return query<{ id: number; sede_name: string; event_type: string; admin_name: string; created_at: Date }>(`SELECT l.id, s.nombre AS sede_name, l.event_type, CONCAT(u.nombres, ' ', u.apellidos) AS admin_name, l.created_at FROM sede_activity_logs l INNER JOIN sedes s ON s.id = l.sede_id INNER JOIN admin_users u ON u.id = l.admin_user_id ORDER BY l.created_at DESC LIMIT 8`);
}
