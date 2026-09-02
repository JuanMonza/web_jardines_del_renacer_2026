import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { recordVacancyAudit } from '@/lib/vacancy-audit';
import { getVacancySettings, saveVacancySettings, VACANCY_NOTIFICATION_STATUSES } from '@/lib/vacancy-settings';
import type { ApplicationStatus } from '@/config/candidates';

export const dynamic = 'force-dynamic';

function smtpDetails() {
  const sender = (process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || '').trim();
  const configured = Boolean((process.env.SMTP_USER || process.env.GMAIL_USER) && (process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD) && sender);
  return { configured, sender: sender || 'No configurado' };
}

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.view');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  return NextResponse.json({ success: true, data: await getVacancySettings(), smtp: smtpDetails() });
}

export async function PUT(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.update');
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
  try {
    const body = await request.json() as { notificationsEnabled?: unknown; notificationStatuses?: unknown; retentionMonths?: unknown };
    const notificationStatuses = Array.isArray(body.notificationStatuses)
      ? body.notificationStatuses.filter((status): status is ApplicationStatus => typeof status === 'string' && VACANCY_NOTIFICATION_STATUSES.includes(status as ApplicationStatus))
      : undefined;
    const settings = await saveVacancySettings({
      notificationsEnabled: typeof body.notificationsEnabled === 'boolean' ? body.notificationsEnabled : undefined,
      notificationStatuses,
      retentionMonths: Number(body.retentionMonths),
    });
    await recordVacancyAudit({
      action: 'CONFIGURACION_VACANTES_ACTUALIZADA', table: 'vacantes', recordId: 0,
      description: `Administrador ${session.name} (ID ${session.userId}) actualizó la configuración del módulo: correos automáticos ${settings.notificationsEnabled ? 'activos' : 'inactivos'}, ${settings.notificationStatuses.length} etapas con notificación y conservación de perfiles por ${settings.retentionMonths} meses.`,
    });
    return NextResponse.json({ success: true, data: settings, smtp: smtpDetails(), message: 'Configuración guardada correctamente.' });
  } catch (error) {
    console.error('No fue posible actualizar configuración de vacantes:', error);
    return NextResponse.json({ success: false, message: 'No fue posible guardar la configuración.' }, { status: 500 });
  }
}
