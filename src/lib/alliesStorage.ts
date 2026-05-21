import {
  ALLY_STORAGE_KEY,
  DEFAULT_COMMERCIAL_ALLIES,
  resolveAllyDepartment,
  type CommercialAlly,
} from '@/config/allies';

function normalizeAllyRecord(record: Partial<CommercialAlly>): CommercialAlly | null {
  if (!record.id || !record.name || !record.categorySlug || !record.subcategory) {
    return null;
  }

  const now = new Date().toISOString();
  return {
    id: record.id,
    name: record.name,
    departamento: resolveAllyDepartment(record.departamento),
    municipio: record.municipio ?? '',
    categorySlug: record.categorySlug,
    subcategory: record.subcategory,
    discountLabel: record.discountLabel ?? '',
    url: record.url ?? '',
    logo: record.logo ?? '',
    address: record.address ?? '',
    whatsappNumber: record.whatsappNumber ?? '',
    whatsappTemplate: record.whatsappTemplate ?? '',
    actionLabel: record.actionLabel ?? 'Mas informacion',
    featured: record.featured ?? true,
    loginId: record.loginId ?? '',
    loginPassword: record.loginPassword ?? '',
    description: record.description ?? '',
    containerStyle: record.containerStyle,
    innerStyle: record.innerStyle,
    glowStyle: record.glowStyle,
    logoStyle: record.logoStyle,
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
  };
}

export function getDefaultCommercialAllies() {
  return DEFAULT_COMMERCIAL_ALLIES.map((ally) => ({ ...ally }));
}

export function readCommercialAllies() {
  if (typeof window === 'undefined') {
    return getDefaultCommercialAllies();
  }

  const raw = window.localStorage.getItem(ALLY_STORAGE_KEY);
  if (!raw) {
    return getDefaultCommercialAllies();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return getDefaultCommercialAllies();
    }

    const normalized = parsed
      .map((record) => normalizeAllyRecord(record as Partial<CommercialAlly>))
      .filter(Boolean) as CommercialAlly[];

    return normalized.length > 0 ? normalized : getDefaultCommercialAllies();
  } catch {
    return getDefaultCommercialAllies();
  }
}

export function writeCommercialAllies(allies: CommercialAlly[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(ALLY_STORAGE_KEY, JSON.stringify(allies));
}

export function upsertCommercialAlly(allies: CommercialAlly[], ally: CommercialAlly) {
  const index = allies.findIndex((item) => item.id === ally.id);
  if (index === -1) {
    return [ally, ...allies];
  }
  const copy = [...allies];
  copy[index] = ally;
  return copy;
}

export function removeCommercialAlly(allies: CommercialAlly[], id: string) {
  return allies.filter((ally) => ally.id !== id);
}
