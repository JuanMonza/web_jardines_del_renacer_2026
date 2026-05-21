import { CONTACT_INFO } from '@/config/contact';
import {
  ALLY_CATEGORIES,
  getDefaultAllyTemplate,
  type CommercialAlly,
} from '@/config/allies';
import { readCommercialAllies, upsertCommercialAlly, writeCommercialAllies } from '@/lib/alliesStorage';

const ALLIES_DATA_URL = '/data/base-aliados-actualizados-tics.json';
const EXCEL_SEED_MARKER_KEY = 'jdr.commercial-allies.excel-seeded.v1';
const FALLBACK_LOGO = '/logo-oficial.webp';

type ExcelAllyRow = {
  DEPARTAMENTO?: string;
  MUNICIPIOS?: string;
  ALIADO?: string;
  CATEGORIA?: string;
  DESCUENTOS?: string;
};

function normalizeText(value: string) {
  return value
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function toTitleCase(value: string) {
  const normalized = normalizeText(value).toLowerCase();
  return normalized.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value: string) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stableNumber(value: string, offset: number) {
  let hash = offset + 1000;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9000;
  }
  return (hash + 1000).toString().slice(-4);
}

function buildLoginId(name: string, index: number) {
  const initials = normalizeText(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  return `${initials || 'AL'}${stableNumber(name, index)}`;
}

function mapCategory(rawCategory: string) {
  const normalized = normalizeText(rawCategory).toUpperCase();
  const categoryMap: Record<string, string> = {
    ALIMENTOS: 'alimento',
    AUTOMOTOR: 'automotores',
    AUTOMOTORES: 'automotores',
    CREDITO: 'finanzas',
    DEPORTE: 'deportes',
    EDUCACION: 'educacion',
    ESTETICA: 'salud',
    'ESTETICA-SPA': 'salud',
    EVENTOS: 'turismo',
    'EVENTOS/PRODUCTORA': 'productora-musical',
    FARMACEUTICO: 'farmaceutico',
    FERRETERIA: 'hogar',
    FONDO: 'finanzas',
    GASTROBAR: 'gastrobares',
    HOGAR: 'hogar',
    HOTEL: 'turismo',
    MASCOTAS: 'mascotas',
    PAPELERIA: 'papelerias',
    PARQUEADEROS: 'parqueaderos',
    PSICOLOGIA: 'salud',
    SALUD: 'salud',
    'SALUD NATURISTA': 'salud',
    'SALUD ORAL': 'salud',
    'SALUD VISUAL': 'salud',
    SEXOLOGO: 'salud',
    'SOCIAL Y CULTURAL': 'social-cultura',
    TATUAJES: 'tatuajes-perforaciones',
    TECNOLOGIA: 'tecnologia',
    TURISMO: 'turismo',
  };

  const slug = categoryMap[normalized] ?? 'salud';
  const category = ALLY_CATEGORIES.find((item) => item.slug === slug);

  return {
    categorySlug: category?.slug ?? 'salud',
    subcategory: toTitleCase(rawCategory || category?.label || 'Aliado'),
  };
}

export async function loadAlliesFromExcel() {
  const response = await fetch(ALLIES_DATA_URL);
  if (!response.ok) {
    throw new Error('No se pudo cargar la base de aliados.');
  }

  const rows = (await response.json()) as ExcelAllyRow[];
  const now = new Date().toISOString();

  return rows
    .map((row, index): CommercialAlly | null => {
      const name = normalizeText(row.ALIADO ?? '');
      if (!name) {
        return null;
      }

      const departamento = toTitleCase(row.DEPARTAMENTO ?? 'Nacional');
      const municipio = toTitleCase(row.MUNICIPIOS ?? 'Nacional');
      const rawDiscount = normalizeText(row.DESCUENTOS ?? '');
      const { categorySlug, subcategory } = mapCategory(row.CATEGORIA ?? '');
      const loginId = buildLoginId(name, index);

      return {
        id: `excel-${slugify(departamento)}-${slugify(municipio)}-${slugify(name)}-${index}`,
        name,
        departamento,
        municipio,
        categorySlug,
        subcategory,
        discountLabel: rawDiscount || 'Descuento sujeto a condiciones',
        logo: FALLBACK_LOGO,
        url: '',
        address: municipio && municipio !== 'Nacional' ? municipio : departamento,
        whatsappNumber: CONTACT_INFO.whatsappNumber,
        whatsappTemplate: getDefaultAllyTemplate(categorySlug, subcategory),
        actionLabel: 'Generar codigo',
        featured: true,
        loginId,
        loginPassword: `JR${stableNumber(name, index)}`,
        description: '',
        createdAt: now,
        updatedAt: now,
      };
    })
    .filter(Boolean) as CommercialAlly[];
}

export async function ensureExcelAlliesSeeded() {
  if (typeof window === 'undefined') {
    return readCommercialAllies();
  }

  const existing = readCommercialAllies();
  const alreadySeeded = window.localStorage.getItem(EXCEL_SEED_MARKER_KEY) === 'true';
  if (alreadySeeded) {
    return existing;
  }

  const excelAllies = await loadAlliesFromExcel();
  const merged = excelAllies.reduce(
    (acc, ally) => upsertCommercialAlly(acc, ally),
    existing,
  );

  writeCommercialAllies(merged);
  window.localStorage.setItem(EXCEL_SEED_MARKER_KEY, 'true');
  return merged;
}
