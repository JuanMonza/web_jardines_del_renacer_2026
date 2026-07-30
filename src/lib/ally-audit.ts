import { execute } from '@/lib/db';

type AllyAuditEntry = {
  allyId: string | number;
  actorType: 'ALLY' | 'ADMIN' | 'SYSTEM';
  eventType: string;
  entityType: string;
  entityId?: string;
  allyAccountId?: number;
  adminUserId?: number;
  details?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
};

export async function recordAllyAudit(entry: AllyAuditEntry) {
  await execute(
    `INSERT INTO ally_activity_logs
      (aliado_id, ally_account_id, admin_user_id, actor_type, event_type, entity_type, entity_id, details, ip, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [entry.allyId, entry.allyAccountId ?? null, entry.adminUserId ?? null, entry.actorType, entry.eventType, entry.entityType, entry.entityId ?? null, entry.details ? JSON.stringify(entry.details) : null, entry.ip?.slice(0, 45) ?? null, entry.userAgent?.slice(0, 500) ?? null],
  );
}
