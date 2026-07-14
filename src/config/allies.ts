import type { CSSProperties } from 'react';
import { CONTACT_INFO } from '@/config/contact';
import { getAllDepartamentos } from '@/data/sedes';

export interface AllyCategoryConfig {
  slug: string;
  label: string;
  subcategories: string[];
}

export interface CommercialAlly {
  id: string;
  name: string;
  departamento: string;
  municipio: string;
  categorySlug: string;
  subcategory: string;
  discountLabel: string;
  url?: string;
  logo: string;
  address: string;
  email?: string;
  telefono?: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  actionLabel: string;
  featured: boolean;
  loginId?: string;
  loginPassword?: string;
  description?: string;
  containerStyle?: CSSProperties;
  innerStyle?: CSSProperties;
  glowStyle?: CSSProperties;
  logoStyle?: CSSProperties;
  createdAt: string;
  updatedAt: string;
}

export const ALLY_STORAGE_KEY = 'jdr.commercial-allies.v1';

const DEPARTAMENTOS = getAllDepartamentos();
export const ALLY_DEPARTMENTS = DEPARTAMENTOS.map((departamento) => departamento.nombre);
export const DEFAULT_ALLY_DEPARTMENT = ALLY_DEPARTMENTS[0] ?? 'Risaralda';

export const ALLY_CATEGORIES: AllyCategoryConfig[] = [
  {
    slug: 'salud',
    label: 'Salud',
    subcategories: [
      'Especialistas',
      'Salud oral',
      'Salud visual',
      'Esteticas',
      'Esteticas Spa',
      'Tienda Naturista',
      'Psicologia',
      'Sexologia',
    ],
  },
  {
    slug: 'mascotas',
    label: 'Mascotas',
    subcategories: [
      'Pet shop',
      'Clinica veterinaria',
      'Spa Mascotas',
      'Peluqueria canina',
      'Guarderia Mascotas',
      'Entretenimiento Mascota',
      'Salud y nutricion',
      'Psicologia mascotas',
    ],
  },
  {
    slug: 'turismo',
    label: 'Turismo',
    subcategories: [
      'Agencia de viaje Nacional e internacional',
      'Agencia de turismo Nacional e internacional',
      'Parques',
      'Hoteles',
      'Eventos',
    ],
  },
  {
    slug: 'deportes',
    label: 'Deportes',
    subcategories: [
      'Gimnasios',
      'Academias Pool Dance',
      'Pilates',
      'Direccion deportiva',
    ],
  },
  {
    slug: 'educacion',
    label: 'Educacion',
    subcategories: [
      'Escuelas de Conduccion',
      'Institutos Academicos',
      'Colegios',
      'Universidades',
      'Academias de Idiomas',
      'Academias de baile',
    ],
  },
  {
    slug: 'automotores',
    label: 'Automotores',
    subcategories: [
      'Repuestos Vehiculares y Motos',
      'Llantas y Accesorios',
      'Tecnomecanica',
      'Soat',
      'Seguros',
      'Pintura y Mas',
      'Limpieza y pulido',
    ],
  },
  {
    slug: 'hogar',
    label: 'Hogar',
    subcategories: [
      'Limpieza de hogar',
      'Fumigacion',
      'Ferreteria',
      'Floristeria',
      'Marmolerias',
      'Plomeria y Gas',
      'Muebles y Cocina',
      'Colchones',
      'Camas',
      'Linea Blanca',
      'Mobiliarios',
    ],
  },
  {
    slug: 'tecnologia',
    label: 'Tecnologia',
    subcategories: [
      'Celulares',
      'Tablets',
      'Computadores',
      'Portatiles',
      'Accessories',
      'Impresoras',
    ],
  },
  {
    slug: 'social-cultura',
    label: 'Social y cultura',
    subcategories: ['Fundaciones'],
  },
  {
    slug: 'finanzas',
    label: 'Finanzas',
    subcategories: ['Financieras', 'Cooperativas', 'Fondos de ahorro'],
  },
  {
    slug: 'gastrobares',
    label: 'Gastrobares',
    subcategories: [
      'Restaurantes',
      'Bares',
      'Restaurante Campestre',
      'Desayunos sorpresas',
      'Comida rapida',
    ],
  },
  {
    slug: 'alimento',
    label: 'Alimento',
    subcategories: ['Lacteos', 'Carnes', 'Cafe', 'No perecederos'],
  },
  {
    slug: 'tatuajes-perforaciones',
    label: 'Tatuajes y perforaciones',
    subcategories: ['Tatuajes y perforaciones'],
  },
  {
    slug: 'productora-musical',
    label: 'Productora musical',
    subcategories: ['Productora musical'],
  },
  {
    slug: 'papelerias',
    label: 'Papelerias',
    subcategories: ['Papelerias'],
  },
  {
    slug: 'parqueaderos',
    label: 'Parqueaderos',
    subcategories: ['Parqueaderos'],
  },
  {
    slug: 'farmaceutico',
    label: 'Farmaceutico',
    subcategories: ['Farmaceutico'],
  },
];

const ISO_NOW = new Date().toISOString();
const DEFAULT_TEMPLATE = 'Hola, quiero mas informacion de "{{nombre}}".';

export const DEFAULT_COMMERCIAL_ALLIES: CommercialAlly[] = [
  {
    id: 'renacer-mascotas',
    name: 'Renacer Mascotas',
    departamento: 'Risaralda',
    municipio: 'Pereira',
    categorySlug: 'mascotas',
    subcategory: 'Clinica veterinaria',
    discountLabel: '10% de descuento',
    logo: '/images/logos_aliados_jr/renacer_mascotas.png',
    url: '',
    address: 'Cobertura nacional',
    whatsappNumber: CONTACT_INFO.whatsappNumber,
    whatsappTemplate: 'Hola, quiero mas informacion de "{{nombre}}" para mascotas.',
    actionLabel: 'Mas informacion',
    featured: true,
    loginId: 'RM1001',
    loginPassword: 'JR1001',
    description: 'Servicios para mascotas y acompanamiento especializado.',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
  {
    id: 'parque-conmemorativo',
    name: 'Parque Conmemorativo',
    departamento: 'Valle del Cauca',
    municipio: 'Tulua',
    categorySlug: 'turismo',
    subcategory: 'Parques',
    discountLabel: 'Beneficio preferencial',
    logo: '/images/logos_aliados_jr/conmemorativo.png',
    url: '',
    address: 'Parque Conmemorativo Jardines del Renacer',
    whatsappNumber: CONTACT_INFO.whatsappNumber,
    whatsappTemplate: 'Hola, quiero mas informacion de "{{nombre}}".',
    actionLabel: 'Contactar aliado',
    featured: true,
    loginId: 'PC1002',
    loginPassword: 'JR1002',
    description: 'Espacios conmemorativos y acompanamiento familiar.',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
  {
    id: 'renacer-seguros',
    name: 'Renacer Seguros',
    departamento: 'Cundinamarca',
    municipio: 'Bogota',
    categorySlug: 'finanzas',
    subcategory: 'Financieras',
    discountLabel: 'Beneficio preferencial',
    logo: '/images/logos_aliados_jr/renacer_seguros.png',
    url: '',
    address: 'Atencion nacional en linea',
    whatsappNumber: CONTACT_INFO.whatsappNumber,
    whatsappTemplate: 'Hola, quiero mas informacion de "{{nombre}}" en servicios financieros.',
    actionLabel: 'Asesoria',
    featured: true,
    loginId: 'RS1003',
    loginPassword: 'JR1003',
    description: 'Soluciones de proteccion y respaldo financiero.',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
  {
    id: 'renacer-abogados',
    name: 'Renacer Abogados',
    departamento: 'Caldas',
    municipio: 'Manizales',
    categorySlug: 'social-cultura',
    subcategory: 'Fundaciones',
    discountLabel: 'Beneficio preferencial',
    logo: '/images/logos_aliados_jr/renacer_abogados.png',
    url: '',
    address: 'Atencion juridica especializada',
    whatsappNumber: CONTACT_INFO.whatsappNumber,
    whatsappTemplate: 'Hola, quiero mas informacion de "{{nombre}}".',
    actionLabel: 'Solicitar orientacion',
    featured: true,
    loginId: 'RA1004',
    loginPassword: 'JR1004',
    description: 'Orientacion legal y acompanamiento profesional.',
    containerStyle: {
      backgroundColor: '#141412',
      borderColor: '#2f2c24',
    },
    innerStyle: {
      borderColor: 'rgba(92, 74, 27, 0.25)',
      background: 'linear-gradient(135deg, #26241f 0%, #171612 55%, #0f0f0d 100%)',
    },
    glowStyle: {
      background:
        'radial-gradient(circle at top, rgba(214, 179, 92, 0.22), rgba(255, 255, 255, 0))',
    },
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
  {
    id: 'vive-mas',
    name: 'Vive Mas',
    departamento: 'Antioquia',
    municipio: 'Medellin',
    categorySlug: 'salud',
    subcategory: 'Especialistas',
    discountLabel: 'Beneficio preferencial',
    logo: '/images/logos_aliados_jr/vive+.png',
    url: '',
    address: 'Atencion nacional',
    whatsappNumber: CONTACT_INFO.whatsappNumber,
    whatsappTemplate: 'Hola, necesito mas informacion de "{{nombre}}" este especialista.',
    actionLabel: 'Pedir informacion',
    featured: true,
    loginId: 'VM1005',
    loginPassword: 'JR1005',
    description: 'Red de bienestar y servicios de salud.',
    createdAt: ISO_NOW,
    updatedAt: ISO_NOW,
  },
];

export const allies = DEFAULT_COMMERCIAL_ALLIES;

export function getCategoryBySlug(slug: string) {
  return ALLY_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function getCategoryLabel(slug: string) {
  return getCategoryBySlug(slug)?.label ?? 'Aliados Comerciales';
}

export function getSubcategoriesByCategory(slug: string) {
  return getCategoryBySlug(slug)?.subcategories ?? [];
}

export function resolveAllyDepartment(value: string | undefined) {
  const normalized = value?.trim() ?? '';
  if (normalized) {
    return normalized;
  }
  return DEFAULT_ALLY_DEPARTMENT;
}

export function getDefaultAllyTemplate(categorySlug: string, subcategory: string) {
  if (categorySlug === 'salud' && subcategory.toLowerCase().includes('especialista')) {
    return 'Hola, necesito mas informacion de "{{nombre}}" este especialista.';
  }
  const categoryLabel = getCategoryLabel(categorySlug);
  if (!subcategory) {
    return `Hola, quiero mas informacion de "{{nombre}}" en ${categoryLabel}.`;
  }
  return `Hola, quiero mas informacion de "{{nombre}}" en ${categoryLabel} - ${subcategory}.`;
}

export function sanitizeWhatsAppNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return CONTACT_INFO.whatsappNumber;
  }
  if (digits.startsWith('57')) {
    return digits;
  }
  if (digits.length >= 10) {
    return `57${digits}`;
  }
  return digits;
}

export function resolveAllyWhatsAppMessage(ally: Pick<CommercialAlly, 'name' | 'categorySlug' | 'subcategory' | 'whatsappTemplate'>) {
  const template = ally.whatsappTemplate?.trim()
    ? ally.whatsappTemplate
    : getDefaultAllyTemplate(ally.categorySlug, ally.subcategory);

  return template.replace(/{{\s*nombre\s*}}/gi, ally.name);
}

export function buildAllyWhatsAppUrl(ally: Pick<CommercialAlly, 'name' | 'categorySlug' | 'subcategory' | 'whatsappTemplate' | 'whatsappNumber'>) {
  const normalizedNumber = sanitizeWhatsAppNumber(ally.whatsappNumber);
  const message = resolveAllyWhatsAppMessage(ally);
  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export function createEmptyAlly(): CommercialAlly {
  const defaultCategory = ALLY_CATEGORIES[0];
  return {
    id: '',
    name: '',
    departamento: DEFAULT_ALLY_DEPARTMENT,
    municipio: '',
    categorySlug: defaultCategory.slug,
    subcategory: defaultCategory.subcategories[0] ?? '',
    discountLabel: '',
    logo: '',
    url: '',
    address: '',
    email: '',
    telefono: '',
    whatsappNumber: CONTACT_INFO.whatsappNumber,
    whatsappTemplate: DEFAULT_TEMPLATE,
    actionLabel: 'Mas informacion',
    featured: true,
    loginId: '',
    loginPassword: '',
    description: '',
    createdAt: '',
    updatedAt: '',
  };
}
