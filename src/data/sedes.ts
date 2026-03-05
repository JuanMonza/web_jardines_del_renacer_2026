/**
 * Sedes - Jardines del Renacer
 * Directorio nacional de puntos de atención
 */

export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  administradora: string;
  telefono: string;
  departamento: string;
  ciudad: string;
}

export interface DepartamentoInfo {
  nombre: string;
  slug: string;
  count: number;
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

export function getDepartamentoSlug(departamento: string): string {
  return departamento
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\./g, '')              // remove dots
    .trim()
    .replace(/\s+/g, '-')           // spaces → hyphens
    .replace(/[^a-z0-9-]/g, '');    // remove remaining special chars
}

export function getSedesByDepartamento(slug: string): Sede[] {
  return SEDES.filter((s) => getDepartamentoSlug(s.departamento) === slug);
}

export function getAllDepartamentos(): DepartamentoInfo[] {
  const map = new Map<string, DepartamentoInfo>();
  for (const sede of SEDES) {
    const slug = getDepartamentoSlug(sede.departamento);
    if (!map.has(slug)) {
      map.set(slug, { nombre: sede.departamento, slug, count: 0 });
    }
    map.get(slug)!.count++;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es'),
  );
}

// ──────────────────────────────────────────────────────────────
// Data
// ──────────────────────────────────────────────────────────────

export const SEDES: Sede[] = [
  // ── ANTIOQUIA ───────────────────────────────────────────────
  {
    id: 'an-01',
    nombre: 'Medellín',
    direccion: 'Cra 51D #61-88',
    administradora: '',
    telefono: '321 9141765',
    departamento: 'Antioquia',
    ciudad: 'Medellín',
  },
  {
    id: 'an-02',
    nombre: 'Itagüí',
    direccion: 'Calle 50A #48-39',
    administradora: '',
    telefono: '321 7378730',
    departamento: 'Antioquia',
    ciudad: 'Itagüí',
  },
  {
    id: 'an-03',
    nombre: 'La Pintada',
    direccion: 'Calle 35 #33-17',
    administradora: '',
    telefono: '313 4649079',
    departamento: 'Antioquia',
    ciudad: 'La Pintada',
  },
  {
    id: 'an-04',
    nombre: 'Valparaíso',
    direccion: 'Cra 10 Bolívar #10-19',
    administradora: '',
    telefono: '312 7558517',
    departamento: 'Antioquia',
    ciudad: 'Valparaíso',
  },

  // ── ARAUCA ──────────────────────────────────────────────────
  {
    id: 'ar-01',
    nombre: 'Arauca',
    direccion: 'Cra 3 #6A-18',
    administradora: '',
    telefono: '321 6699249',
    departamento: 'Arauca',
    ciudad: 'Arauca',
  },

  // ── ATLÁNTICO ───────────────────────────────────────────────
  {
    id: 'at-01',
    nombre: 'Barranquilla',
    direccion: 'Calle 65B #38B-50',
    administradora: '',
    telefono: '302 2659897',
    departamento: 'Atlántico',
    ciudad: 'Barranquilla',
  },
  {
    id: 'at-02',
    nombre: 'Soledad',
    direccion: 'Calle 65 Cra 9-40 Mall Tu Plaza',
    administradora: '',
    telefono: '321 9141765',
    departamento: 'Atlántico',
    ciudad: 'Soledad',
  },

  // ── BOGOTÁ D.C ───────────────────────────────────────────────
  {
    id: 'bg-01',
    nombre: 'Bogotá',
    direccion: 'Calle 34 #16-09',
    administradora: '',
    telefono: '314 5881602',
    departamento: 'Bogotá D.C',
    ciudad: 'Bogotá',
  },

  // ── CAUCA ───────────────────────────────────────────────────
  {
    id: 'ca-01',
    nombre: 'Santander de Quilichao',
    direccion: 'Calle 8 #11-81',
    administradora: '',
    telefono: '305 2977209',
    departamento: 'Cauca',
    ciudad: 'Santander de Quilichao',
  },
  {
    id: 'ca-02',
    nombre: 'Popayán',
    direccion: 'Calle 4 #10-49 Barrio El Cadillal',
    administradora: '',
    telefono: '320 9891670',
    departamento: 'Cauca',
    ciudad: 'Popayán',
  },
  {
    id: 'ca-03',
    nombre: 'Villa Rica',
    direccion: 'Calle 5 #3-17',
    administradora: '',
    telefono: '313 3088293',
    departamento: 'Cauca',
    ciudad: 'Villa Rica',
  },

  // ── CUNDINAMARCA ────────────────────────────────────────────
  {
    id: 'cu-01',
    nombre: 'Facatativá',
    direccion: 'Cra 3 #4-14',
    administradora: '',
    telefono: '323 4169789',
    departamento: 'Cundinamarca',
    ciudad: 'Facatativá',
  },
  {
    id: 'cu-02',
    nombre: 'Cachipay',
    direccion: 'Calle 3 #2-56',
    administradora: '',
    telefono: '320 2327806',
    departamento: 'Cundinamarca',
    ciudad: 'Cachipay',
  },
  {
    id: 'cu-03',
    nombre: 'Fusagasugá',
    direccion: 'Cra 7 #4-26',
    administradora: '',
    telefono: '321 2540408',
    departamento: 'Cundinamarca',
    ciudad: 'Fusagasugá',
  },
  {
    id: 'cu-04',
    nombre: 'Girardot',
    direccion: 'Calle 19 #11-80',
    administradora: '',
    telefono: '322 9449895',
    departamento: 'Cundinamarca',
    ciudad: 'Girardot',
  },
  {
    id: 'cu-05',
    nombre: 'Tocaima',
    direccion: 'Calle 2 #8-98',
    administradora: '',
    telefono: '312 4330665',
    departamento: 'Cundinamarca',
    ciudad: 'Tocaima',
  },
  {
    id: 'cu-06',
    nombre: 'Anapoima',
    direccion: 'Calle 5 #1-39',
    administradora: '',
    telefono: '312 3660897',
    departamento: 'Cundinamarca',
    ciudad: 'Anapoima',
  },

  // ── HUILA ───────────────────────────────────────────────────
  {
    id: 'hu-01',
    nombre: 'Neiva',
    direccion: 'Cra 7 #14-42',
    administradora: '',
    telefono: '320 6921292',
    departamento: 'Huila',
    ciudad: 'Neiva',
  },
  {
    id: 'hu-02',
    nombre: 'Garzón',
    direccion: 'Cra 13 #7-81',
    administradora: '',
    telefono: '322 8356688',
    departamento: 'Huila',
    ciudad: 'Garzón',
  },
  {
    id: 'hu-03',
    nombre: 'La Plata',
    direccion: 'Calle 7 #3-09',
    administradora: '',
    telefono: '107 7840762',
    departamento: 'Huila',
    ciudad: 'La Plata',
  },
  {
    id: 'hu-04',
    nombre: 'Pitalito',
    direccion: 'Cra 4 #10-69',
    administradora: '',
    telefono: '311 6465358',
    departamento: 'Huila',
    ciudad: 'Pitalito',
  },

  // ── META ────────────────────────────────────────────────────
  {
    id: 'me-01',
    nombre: 'Villavicencio',
    direccion: 'Cra 39 #35-20 Barrio Barzal',
    administradora: '',
    telefono: '310 5474344',
    departamento: 'Meta',
    ciudad: 'Villavicencio',
  },
  {
    id: 'me-02',
    nombre: 'Acacías',
    direccion: 'Cra 20-13-59',
    administradora: '',
    telefono: '310 7563736',
    departamento: 'Meta',
    ciudad: 'Acacías',
  },

  // ── RISARALDA ───────────────────────────────────────────────
  {
    id: 'rs-01',
    nombre: 'Maraya 1',
    direccion: 'Cra 10 #46-88 / Cra 10 #46-98',
    administradora: '',
    telefono: '311 6681922',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },
  {
    id: 'rs-02',
    nombre: 'Maraya 2',
    direccion: 'Carrera 10 #46-47',
    administradora: '',
    telefono: '311 6681922',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },
  {
    id: 'rs-03',
    nombre: 'Maraya 3',
    direccion: 'Carrera 10 #46-30 Maraya',
    administradora: '',
    telefono: '311 6681922',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },
  {
    id: 'rs-04',
    nombre: 'Cuba',
    direccion: 'Calle 68 Bis #25-40',
    administradora: '',
    telefono: '313 6628941',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },
  {
    id: 'rs-05',
    nombre: 'La Badea',
    direccion: 'Av. Turín La Popa Calle 9 #5-162',
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Dosquebradas',
  },
  {
    id: 'rs-06',
    nombre: 'Av 30 de Agosto',
    direccion: 'Av. 30 de Agosto 48-111',
    administradora: '',
    telefono: '313 4462383',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },
  {
    id: 'rs-07',
    nombre: 'Apía',
    direccion: 'Cra 8 #10-35 Barrio Jamarraya',
    administradora: '',
    telefono: '323 7025742',
    departamento: 'Risaralda',
    ciudad: 'Apía',
  },
  {
    id: 'rs-08',
    nombre: 'Santuario',
    direccion: 'Cra 7 #7-04',
    administradora: '',
    telefono: '321 7064475',
    departamento: 'Risaralda',
    ciudad: 'Santuario',
  },
  {
    id: 'rs-09',
    nombre: 'La Virginia',
    direccion: 'Carrera 9 #6-23',
    administradora: '',
    telefono: '310 5122382',
    departamento: 'Risaralda',
    ciudad: 'La Virginia',
  },
  {
    id: 'rs-10',
    nombre: 'Marsella',
    direccion: 'Cra 10 #8-40 / Cra 9 #18-38',
    administradora: '',
    telefono: '314 7214284',
    departamento: 'Risaralda',
    ciudad: 'Marsella',
  },
  {
    id: 'rs-11',
    nombre: 'Mistrató',
    direccion: 'Cra 6 #6-18 Piso 1',
    administradora: '',
    telefono: '322 6996603',
    departamento: 'Risaralda',
    ciudad: 'Mistrató',
  },
  {
    id: 'rs-12',
    nombre: 'Guática',
    direccion: 'Cra 5 #9-16',
    administradora: '',
    telefono: '319 3677527',
    departamento: 'Risaralda',
    ciudad: 'Guática',
  },
  {
    id: 'rs-13',
    nombre: 'Quinchía',
    direccion: 'Cra 6 #4-42 Barrio Plazuela',
    administradora: '',
    telefono: '314 6700320',
    departamento: 'Risaralda',
    ciudad: 'Quinchía',
  },

  // ── SANTANDER ───────────────────────────────────────────────
  {
    id: 'sa-01',
    nombre: 'Bucaramanga',
    direccion: 'Calle 36 #22-30 Edificio Coazzi',
    administradora: '',
    telefono: '315 3948469',
    departamento: 'Santander',
    ciudad: 'Bucaramanga',
  },
  {
    id: 'sa-02',
    nombre: 'San Gil',
    direccion: 'Calle 19 #7-17',
    administradora: '',
    telefono: '320 6925164',
    departamento: 'Santander',
    ciudad: 'San Gil',
  },

  // ── TOLIMA ──────────────────────────────────────────────────
  {
    id: 'to-01',
    nombre: 'Ibagué',
    direccion: 'Cra 4B #31-04',
    administradora: '',
    telefono: '322 9449895',
    departamento: 'Tolima',
    ciudad: 'Ibagué',
  },
  {
    id: 'to-02',
    nombre: 'Líbano',
    direccion: 'Calle 4 #3-100',
    administradora: '',
    telefono: '321 4279398',
    departamento: 'Tolima',
    ciudad: 'Líbano',
  },
  {
    id: 'to-03',
    nombre: 'Honda',
    direccion: 'Cra 12 #16A-01',
    administradora: '',
    telefono: '320 8568338',
    departamento: 'Tolima',
    ciudad: 'Honda',
  },
  {
    id: 'to-04',
    nombre: 'Mariquita',
    direccion: 'Calle 4 #3-39',
    administradora: '',
    telefono: '301 6301869',
    departamento: 'Tolima',
    ciudad: 'Mariquita',
  },
  {
    id: 'to-05',
    nombre: 'Rovira',
    direccion: 'Cra 3 #4-61',
    administradora: '',
    telefono: '310 3677915',
    departamento: 'Tolima',
    ciudad: 'Rovira',
  },
  {
    id: 'to-06',
    nombre: 'Venadillo',
    direccion: 'Cra 5 #4-57',
    administradora: '',
    telefono: '314 3545613',
    departamento: 'Tolima',
    ciudad: 'Venadillo',
  },
  {
    id: 'to-07',
    nombre: 'Espinal',
    direccion: 'Calle 9 #8-92',
    administradora: '',
    telefono: '300 7546997',
    departamento: 'Tolima',
    ciudad: 'Espinal',
  },
  {
    id: 'to-08',
    nombre: 'Armero',
    direccion: 'Cra 7 #6-15',
    administradora: '',
    telefono: '316 5488346',
    departamento: 'Tolima',
    ciudad: 'Armero',
  },
  {
    id: 'to-09',
    nombre: 'Melgar',
    direccion: 'Calle 10 #21-07',
    administradora: '',
    telefono: '320 430093',
    departamento: 'Tolima',
    ciudad: 'Melgar',
  },

  // ── VALLE DEL CAUCA — Norte ──────────────────────────────────
  {
    id: 'vc-01',
    nombre: 'El Águila',
    direccion: 'Calle 6 #6-08',
    administradora: '',
    telefono: '320 3818716',
    departamento: 'Valle del Cauca',
    ciudad: 'El Águila',
  },
  {
    id: 'vc-02',
    nombre: 'Toro',
    direccion: 'Calle 11 #5-58',
    administradora: '',
    telefono: '311 3769908',
    departamento: 'Valle del Cauca',
    ciudad: 'Toro',
  },
  {
    id: 'vc-03',
    nombre: 'El Dovio',
    direccion: 'Cra 7 #5-22',
    administradora: '',
    telefono: '313 6628941',
    departamento: 'Valle del Cauca',
    ciudad: 'El Dovio',
  },
  {
    id: 'vc-04',
    nombre: 'Roldanillo',
    direccion: 'Cra 7 #9-58',
    administradora: '',
    telefono: '301 4210516',
    departamento: 'Valle del Cauca',
    ciudad: 'Roldanillo',
  },
  {
    id: 'vc-05',
    nombre: 'La Unión',
    direccion: 'Calle 14 #10-81',
    administradora: '',
    telefono: '314 2133805',
    departamento: 'Valle del Cauca',
    ciudad: 'La Unión',
  },
  {
    id: 'vc-06',
    nombre: 'Versalles',
    direccion: 'Cra 4 #4-13',
    administradora: '',
    telefono: '323 5301458',
    departamento: 'Valle del Cauca',
    ciudad: 'Versalles',
  },
  {
    id: 'vc-07',
    nombre: 'Zarzal',
    direccion: 'Cra 9 #9-94',
    administradora: '',
    telefono: '313 6868720',
    departamento: 'Valle del Cauca',
    ciudad: 'Zarzal',
  },
  {
    id: 'vc-08',
    nombre: 'Cartago',
    direccion: 'Calle 11 #2-54',
    administradora: '',
    telefono: '311 7050357',
    departamento: 'Valle del Cauca',
    ciudad: 'Cartago',
  },

  // ── VALLE DEL CAUCA — Centro ─────────────────────────────────
  {
    id: 'vc-09',
    nombre: 'Bugalagrande',
    direccion: 'Calle 6 #4-07',
    administradora: '',
    telefono: '310 4238939',
    departamento: 'Valle del Cauca',
    ciudad: 'Bugalagrande',
  },
  {
    id: 'vc-10',
    nombre: 'Andalucía',
    direccion: 'Cra 4 #17-02',
    administradora: '',
    telefono: '317 8948957',
    departamento: 'Valle del Cauca',
    ciudad: 'Andalucía',
  },
  {
    id: 'vc-11',
    nombre: 'Tuluá',
    direccion: 'Calle 26 #38-25',
    administradora: '',
    telefono: '320 6923877',
    departamento: 'Valle del Cauca',
    ciudad: 'Tuluá',
  },
  {
    id: 'vc-12',
    nombre: 'Riofrío',
    direccion: 'Calle 5 #10-20',
    administradora: '',
    telefono: '315 6257151',
    departamento: 'Valle del Cauca',
    ciudad: 'Riofrío',
  },
  {
    id: 'vc-13',
    nombre: 'Trujillo',
    direccion: 'Cra 19 #20-74',
    administradora: '',
    telefono: '315 4104416',
    departamento: 'Valle del Cauca',
    ciudad: 'Trujillo',
  },
  {
    id: 'vc-14',
    nombre: 'Sevilla',
    direccion: 'Calle 48 #47-32',
    administradora: '',
    telefono: '322 8216514',
    departamento: 'Valle del Cauca',
    ciudad: 'Sevilla',
  },
  {
    id: 'vc-15',
    nombre: 'Caicedonia',
    direccion: 'Cra 16 #7-33',
    administradora: '',
    telefono: '310 5042094',
    departamento: 'Valle del Cauca',
    ciudad: 'Caicedonia',
  },
  {
    id: 'vc-16',
    nombre: 'Alcalá',
    direccion: 'Cra 9 #4-15',
    administradora: '',
    telefono: '310 4900078',
    departamento: 'Valle del Cauca',
    ciudad: 'Alcalá',
  },

  // ── VALLE DEL CAUCA — Sur ────────────────────────────────────
  {
    id: 'vc-17',
    nombre: 'Cali Servicios',
    direccion: 'Av 3 Bis #24N-95',
    administradora: '',
    telefono: '311 5275168',
    departamento: 'Valle del Cauca',
    ciudad: 'Cali',
  },
  {
    id: 'vc-18',
    nombre: 'Cali Administrativa',
    direccion: 'Av 3A Norte #24AN-85',
    administradora: '',
    telefono: '',
    departamento: 'Valle del Cauca',
    ciudad: 'Cali',
  },
  {
    id: 'vc-19',
    nombre: 'Palmira',
    direccion: 'Calle 32 #31-81',
    administradora: '',
    telefono: '323 8229647',
    departamento: 'Valle del Cauca',
    ciudad: 'Palmira',
  },
  {
    id: 'vc-20',
    nombre: 'Yumbo',
    direccion: 'Cra 4 #3-59 Barrio Belalcázar',
    administradora: '',
    telefono: '321 7420615',
    departamento: 'Valle del Cauca',
    ciudad: 'Yumbo',
  },
  {
    id: 'vc-21',
    nombre: 'Florida',
    direccion: 'Cra 17 #8-54',
    administradora: '',
    telefono: '312 8790988',
    departamento: 'Valle del Cauca',
    ciudad: 'Florida',
  },
  {
    id: 'vc-22',
    nombre: 'Pradera',
    direccion: 'Cra 10 #9-23',
    administradora: '',
    telefono: '313 7208858',
    departamento: 'Valle del Cauca',
    ciudad: 'Pradera',
  },
  {
    id: 'vc-23',
    nombre: 'Guacarí',
    direccion: 'Calle 4 #2-150',
    administradora: '',
    telefono: '314 8054736',
    departamento: 'Valle del Cauca',
    ciudad: 'Guacarí',
  },
];
