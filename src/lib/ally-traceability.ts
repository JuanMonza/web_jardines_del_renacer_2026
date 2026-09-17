import { query } from '@/lib/db';

export const ALLY_TRACE_EVENTS = ['ALLY_CREATED', 'ALLY_DEACTIVATED', 'ALLY_UPDATED'] as const;
export type AllyTraceType = typeof ALLY_TRACE_EVENTS[number];
export type AllyTraceEvent = {
  id: number;
  allyId: number;
  allyName: string;
  loginId: string;
  department: string;
  city: string;
  category: string;
  type: AllyTraceType;
  actor: string;
  changedFields: string;
  date: string;
};

type TraceRow = {
  id: number; ally_id: number; name: string | null; login_id: string | null;
  departamento: string | null; municipio: string | null; category_slug: string | null;
  event_type: AllyTraceType; admin_name: string | null; details: string | Record<string, unknown> | null; created_at: Date;
};

export function allyTraceFilters(from: string, to: string) {
  const clauses = ["l.event_type IN ('ALLY_CREATED','ALLY_DEACTIVATED','ALLY_UPDATED')"];
  const params: (string | number)[] = [];
  if (from) { clauses.push('l.created_at >= ?'); params.push(`${from} 00:00:00`); }
  if (to) { clauses.push('l.created_at < DATE_ADD(?, INTERVAL 1 DAY)'); params.push(`${to} 00:00:00`); }
  return { where: clauses.join(' AND '), params };
}

export async function getAllyTraceSummary(from: string, to: string) {
  const { where, params } = allyTraceFilters(from, to);
  const rows = await query<{ event_type: AllyTraceType; movements: number; allies: number }>(`
    SELECT l.event_type, COUNT(*) AS movements, COUNT(DISTINCT l.aliado_id) AS allies
    FROM ally_activity_logs l WHERE ${where} GROUP BY l.event_type`, params);
  const summary = { created: 0, deactivated: 0, updated: 0, updatedMovements: 0 };
  for (const row of rows) {
    if (row.event_type === 'ALLY_CREATED') summary.created = Number(row.allies);
    if (row.event_type === 'ALLY_DEACTIVATED') summary.deactivated = Number(row.allies);
    if (row.event_type === 'ALLY_UPDATED') { summary.updated = Number(row.allies); summary.updatedMovements = Number(row.movements); }
  }
  return summary;
}

export async function getAllyTraceEvents(from: string, to: string, limit: number, offset = 0): Promise<AllyTraceEvent[]> {
  const { where, params } = allyTraceFilters(from, to);
  const rows = await query<TraceRow>(`
    SELECT l.id,l.aliado_id AS ally_id,a.name,a.login_id,a.departamento,a.municipio,a.category_slug,
      l.event_type,CONCAT(u.nombres,' ',u.apellidos) AS admin_name,l.details,l.created_at
    FROM ally_activity_logs l
    LEFT JOIN aliados a ON a.id=l.aliado_id
    LEFT JOIN admin_users u ON u.id=l.admin_user_id
    WHERE ${where} ORDER BY l.created_at DESC,l.id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  return rows.map(row => {
    let details: Record<string, unknown> = {};
    try { details = typeof row.details === 'string' ? JSON.parse(row.details) : row.details || {}; } catch {}
    return {
      id: Number(row.id), allyId: Number(row.ally_id),
      allyName: String(row.name || details.currentName || details.name || `Aliado ${row.ally_id}`),
      loginId: String(row.login_id || details.loginId || ''),
      department: String(row.departamento || ''), city: String(row.municipio || ''), category: String(row.category_slug || details.category || ''),
      type: row.event_type, actor: String(row.admin_name || 'Sistema'),
      changedFields: Array.isArray(details.changedFields) ? details.changedFields.map(String).join(', ') : '',
      date: new Date(row.created_at).toISOString(),
    };
  });
}

export async function getAllyTraceCount(from: string, to: string) {
  const { where, params } = allyTraceFilters(from, to);
  const rows = await query<{ total: number }>(`SELECT COUNT(*) AS total FROM ally_activity_logs l WHERE ${where}`, params);
  return Number(rows[0]?.total || 0);
}
