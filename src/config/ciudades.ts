import { getDepartamentoSlug } from '@/data/sedes';

function normalizeLookup(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\./g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const DEPARTAMENTO_IMAGE_FOLDERS: Record<string, string> = {
  antioquia: 'antioquia',
  atlantico: 'atlantico',
  boyaca: 'boyaca',
  caldas: 'caldas',
  cauca: 'cauca',
  choco: 'choco',
  cundinamarca: 'cundinamarca',
  huila: 'huila',
  meta: 'meta',
  putumayo: 'putumayo',
  quindio: 'quindio',
  risaralda: 'risaralda',
  santander: 'santander',
  tolima: 'tolima',
  'valle-del-cauca': 'valledelcauca',
};

const CIUDAD_ALIASES: Record<string, string> = {
  bucaramaga: 'bucaramanga',
};

const CIUDAD_IMAGE_FILES: Record<string, Record<string, string>> = {
  risaralda: {
    pereira: 'pereira2026.webp',
    dosquebradas: 'dqs2026.webp',
    apia: 'apia2026.webp',
    santuario: 'santuario2026.webp',
    'la-virginia': 'la-virginia.webp',
    marsella: 'marsella2026.webp',
    'santa-rosa': 'santa-rosa2026.webp',
    'belen-de-umbria': 'umbria2026.webp',
    guatica: 'Guatica2026.webp',
    mistrato: 'mistrato2026.webp',
    quinchia: 'quinchia2026.webp',
  },
  antioquia: {
    medellin: 'medellin2026.webp',
    itagui: 'Itagui2026.webp',
    'la-pintada': 'LaPintada2026-.webp',
    valparaiso: 'valparaiso2026.webp',
    caramanta: 'caramanta2026.webp',
  },
  quindio: {
    genova: 'genova2026.webp',
    quimbaya: 'quimbaya2026.webp',
    calarca: 'calarca2026.webp',
    barcelona: 'barcelona2026.webp',
    pijao: 'pijao2026.webp',
    cordoba: 'cordoba2026.webp',
    circasia: 'circasia2026.webp',
    tebaida: 'tebaida2026.webp',
    montenegro: 'montenegro2026.webp',
    armenia: 'armenia2026.webp',
  },
  'valle-del-cauca': {
    tulua: 'tulua_2026.webp',
    riofrio: 'Riofrioo_2026.webp',
    trujillo: 'trujillo_2026.webp',
    andalucia: 'andalucia_2026.avif',
    guacari: 'Guacari_2026.webp',
    bugalagrande: 'bugalagrande_2026.webp',
    sevilla: 'sevilla_2026.webp',
    caicedonia: 'caicedonia_2026.webp',
    bolivar: 'bolivar_2026.webp',
    palmira: 'palmira_2026.webp',
    florida: 'florida_2026.webp',
    pradera: 'pradera_2026.webp',
    cali: 'cali_2026.webp',
    yumbo: 'yumbo_2026.webp',
    argelia: 'argelia_2026.webp',
    'la-union': 'launion_2026.webp',
    zarzal: 'zarzal_2026.webp',
    'anserma-nuevo': 'ansermanuevo_2026.webp',
    cartago: 'Cartago_2026.webp',
    'el-aguila': 'elaguila_2026.webp',
    'el-dovio': 'eldovio_2026.webp',
    'la-victoria': 'Victoria_2026.webp',
    obando: 'Obando_2026.webp',
    roldanillo: 'roldanillo_2026.webp',
    toro: 'toro_2026.webp',
    versalles: 'versalles_2026.webp',
    zaragoza: 'zaragoza_2026.webp',
    alcala: 'alcala_2026.webp',
    ulloa: 'ulloa_2026.webp',
  },
  cundinamarca: {
    cachipay: 'Cachipay2026.jpg',
    facatativa: 'facatativa2026.jpg',
    fusagasuga: 'Fusagasuga2026.webp',
    bogota: 'bogotadc2026.webp',
  },
  tolima: {
    girardot: 'Girardot_2026.webp',
    anapoima: 'anapoima_2026.avif',
    tocaima: 'tocaima_2026.webp',
    melgar: 'melgar_2026.webp',
    espinal: 'espinal_2026.webp',
    villarrica: 'villarrica_2026.webp',
    icononzo: 'icononzo_2026.webp',
    ibague: 'ibague_2026.webp',
    anzoategui: 'anzoategui_2026.webp',
    venadillo: 'venadillo_2026.webp',
    lerida: 'lerida_2026.webp',
    libano: 'libano_2026.webp',
    villahermosa: 'villahermosa_2026.webp',
    santaisabel: 'santaisabel_2026.webp',
    fresno: 'fresno_2026.webp',
    mariquita: 'mariquita_2026.webp',
    rovira: 'rovira.webp',
    honda: 'honda_2026.avif',
  },
  cauca: {
    'santander-de-quilichao': 'santanderdequilichao2026.webp',
    popayan: 'popayan2026.webp',
  },
  huila: {
    aipe: 'aipe2026.webp',
    garzon: 'garzon2026.webp',
    'la-plata': 'laplata2026.webp',
    neiva: 'neiva2026.webp',
    pitalito: 'pitalito2026.webp',
  },
  putumayo: {
    mocoa: 'mocoa2026.webp',
  },
  meta: {
    acacias: 'acacias2026.webp',
    villavicencio: 'villavicencio2026.webp',
  },
  santander: {
    bucaramanga: 'bucaramanga2026.webp',
    'san-gil': 'sangil2026.webp',
  },
  caldas: {
    anserma: 'anserma_2026.jpg',
    arauca: 'arauca_2026.webp',
    belalcazar: 'belalcazar_2026.webp',
    manizales: 'manizales_2026.png',
    marmato: 'marmato_2026.webp',
    neira: 'niera_2026.webp',
    pacora: 'pacora_2026.webp',
    palestina: 'palestina_2026.webp',
    riosucio: 'riosucio_2026.webp',
    risaralda: 'risaralda_caldas_2026.webp',
    salamina: 'salamina_2026.webp',
    supia: 'supia_2026.webp',
    viterbo: 'viterbo_2026.webp',
    'la-dorada': 'dorada_2026.webp',
  },
  atlantico: {
    barranquilla: 'barraquilla.webp',
    soledad: 'Soledad-2026.webp',
  },
  boyaca: {
    'puerto-boyaca': 'PuertoBoyaca2026.jpg',
  },
  choco: {
    'san-jose-del-palmar': 'palmar.webp',
  },
};

export function getCiudadImagePath(
  departamento: string,
  ciudad: string,
): string | null {
  const departamentoKey = getDepartamentoSlug(departamento);
  const folder = DEPARTAMENTO_IMAGE_FOLDERS[departamentoKey];

  if (!folder) {
    return null;
  }

  const rawCityKey = normalizeLookup(ciudad);
  const cityKey = CIUDAD_ALIASES[rawCityKey] ?? rawCityKey;
  const fileName = CIUDAD_IMAGE_FILES[departamentoKey]?.[cityKey];

  if (!fileName) {
    return null;
  }

  return `/images/ciudades/${folder}/${fileName}`;
}
