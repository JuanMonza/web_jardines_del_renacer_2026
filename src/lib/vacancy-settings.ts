import { execute, query } from '@/lib/db';
import type { ApplicationStatus } from '@/config/candidates';

export const VACANCY_NOTIFICATION_STATUSES: ApplicationStatus[] = [
  'Recibida',
  'En revision',
  'Entrevista',
  'Prueba tecnica',
  'Seleccionado',
  'No continua',
];

export type VacancySettings = {
  notificationsEnabled: boolean;
  notificationStatuses: ApplicationStatus[];
  retentionMonths: number;
};

export const DEFAULT_VACANCY_SETTINGS: VacancySettings = {
  notificationsEnabled: true,
  notificationStatuses: [...VACANCY_NOTIFICATION_STATUSES],
  retentionMonths: 24,
};

async function ensureSettingsTable() {
  await execute(`CREATE TABLE IF NOT EXISTS vacancy_module_settings (
    setting_key VARCHAR(80) NOT NULL PRIMARY KEY,
    setting_value JSON NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
}

function normalize(value: unknown): VacancySettings {
  const source = value && typeof value === 'object' ? value as Partial<VacancySettings> : {};
  const notificationStatuses = Array.isArray(source.notificationStatuses)
    ? source.notificationStatuses.filter((status): status is ApplicationStatus => VACANCY_NOTIFICATION_STATUSES.includes(status as ApplicationStatus))
    : DEFAULT_VACANCY_SETTINGS.notificationStatuses;
  const retentionMonths = Number(source.retentionMonths);
  return {
    notificationsEnabled: typeof source.notificationsEnabled === 'boolean' ? source.notificationsEnabled : DEFAULT_VACANCY_SETTINGS.notificationsEnabled,
    notificationStatuses,
    retentionMonths: Number.isFinite(retentionMonths) && retentionMonths >= 1 && retentionMonths <= 120 ? retentionMonths : DEFAULT_VACANCY_SETTINGS.retentionMonths,
  };
}

export async function getVacancySettings(): Promise<VacancySettings> {
  try {
    await ensureSettingsTable();
    const rows = await query<{ setting_value: string | VacancySettings }>(
      'SELECT setting_value FROM vacancy_module_settings WHERE setting_key = ?',
      ['general'],
    );
    if (!rows[0]) return { ...DEFAULT_VACANCY_SETTINGS, notificationStatuses: [...DEFAULT_VACANCY_SETTINGS.notificationStatuses] };
    const raw = rows[0].setting_value;
    return normalize(typeof raw === 'string' ? JSON.parse(raw) : raw);
  } catch (error) {
    console.error('No fue posible leer la configuración de vacantes:', error);
    return { ...DEFAULT_VACANCY_SETTINGS, notificationStatuses: [...DEFAULT_VACANCY_SETTINGS.notificationStatuses] };
  }
}

export async function saveVacancySettings(value: Partial<VacancySettings>) {
  const settings = normalize(value);
  await ensureSettingsTable();
  await execute(
    `INSERT INTO vacancy_module_settings (setting_key, setting_value)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP`,
    ['general', JSON.stringify(settings)],
  );
  return settings;
}
