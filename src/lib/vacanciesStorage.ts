import {
  DEFAULT_JOB_VACANCIES,
  VACANCIES_STORAGE_KEY,
  normalizeVacancyDepartment,
  type JobVacancy,
} from '@/config/vacancies';

function normalizeList(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }
  return values
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function normalizeVacancyRecord(record: Partial<JobVacancy>): JobVacancy | null {
  if (!record.id || !record.title || !record.area || !record.city) {
    return null;
  }

  const now = new Date().toISOString();
  const allowedModality = ['Presencial', 'Hibrido', 'Remoto'];
  const modality = allowedModality.includes(record.modality ?? '')
    ? (record.modality as JobVacancy['modality'])
    : 'Presencial';

  return {
    id: record.id,
    title: record.title,
    area: record.area,
    department: normalizeVacancyDepartment(record.department),
    city: record.city,
    modality,
    contractType: record.contractType ?? 'Tiempo completo',
    schedule: record.schedule ?? '',
    salary: record.salary ?? '',
    experience: record.experience ?? '',
    summary: record.summary ?? '',
    requirements: normalizeList(record.requirements),
    benefits: normalizeList(record.benefits),
    featured: record.featured ?? false,
    postedAt: record.postedAt ?? now.slice(0, 10),
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
    createdByCedula: record.createdByCedula ?? '',
    createdByName: record.createdByName ?? '',
  };
}

export function getDefaultJobVacancies() {
  return DEFAULT_JOB_VACANCIES.map((vacancy) => ({
    ...vacancy,
    requirements: [...vacancy.requirements],
    benefits: [...vacancy.benefits],
  }));
}

export function readJobVacancies() {
  if (typeof window === 'undefined') {
    return getDefaultJobVacancies();
  }

  const raw = window.localStorage.getItem(VACANCIES_STORAGE_KEY);
  if (!raw) {
    return getDefaultJobVacancies();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return getDefaultJobVacancies();
    }

    const normalized = parsed
      .map((record) => normalizeVacancyRecord(record as Partial<JobVacancy>))
      .filter(Boolean) as JobVacancy[];

    return normalized.length > 0 ? normalized : getDefaultJobVacancies();
  } catch {
    return getDefaultJobVacancies();
  }
}

export function writeJobVacancies(vacancies: JobVacancy[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(VACANCIES_STORAGE_KEY, JSON.stringify(vacancies));
}

export function upsertJobVacancy(vacancies: JobVacancy[], vacancy: JobVacancy) {
  const index = vacancies.findIndex((item) => item.id === vacancy.id);
  if (index === -1) {
    return [vacancy, ...vacancies];
  }
  const copy = [...vacancies];
  copy[index] = vacancy;
  return copy;
}

export function removeJobVacancy(vacancies: JobVacancy[], id: string) {
  return vacancies.filter((vacancy) => vacancy.id !== id);
}
