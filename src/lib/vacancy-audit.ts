import { execute } from '@/lib/db';

export async function recordVacancyAudit(input: {
  action: string;
  table: 'vacantes' | 'postulaciones' | 'candidatos';
  recordId: string | number;
  description: string;
}) {
  await execute(
    'INSERT INTO activity_logs (usuario_tipo, accion, modulo, tabla_afectada, registro_id, descripcion) VALUES (?,?,?,?,?,?)',
    ['Admin', input.action, 'Vacantes', input.table, input.recordId, input.description],
  );
}
