import {
  SEDES,
  getAllDepartamentos,
  getDepartamentoSlug,
  type DepartamentoInfo,
} from '@/data/sedes';

export interface SedeMapPoint {
  id: string;
  name: string;
  slug: string;
  x: number;
  y: number;
  href: string;
  count: number;
}

export interface Department {
  id: string;
  name: string;
  color: string;
  sedes: number;
  ciudades: string[];
  sedeList: SedeMapPoint[];
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  scale: number;
}

interface MapPoint {
  x: number;
  y: number;
}

interface DepartmentMapConfig extends MapPoint {
  id: string;
  translateX: number;
  translateY: number;
  scale: number;
}

const COVERAGE_COLOR = '#977660';

const departmentMapConfig: Record<string, DepartmentMapConfig> = {
  antioquia: {
    id: 'CO-ANT',
    x: 32,
    y: 22,
    translateX: 40,
    translateY: 35,
    scale: 1.45,
  },
  atlantico: {
    id: 'CO-ATL',
    x: 64,
    y: 10,
    translateX: 15,
    translateY: 80,
    scale: 1.45,
  },
  boyaca: {
    id: 'CO-BOY',
    x: 53,
    y: 29,
    translateX: -40,
    translateY: 25,
    scale: 1.45,
  },
  caldas: {
    id: 'CO-CAL',
    x: 40,
    y: 34,
    translateX: 20,
    translateY: 20,
    scale: 1.45,
  },
  cauca: {
    id: 'CO-CAU',
    x: 34,
    y: 48,
    translateX: 30,
    translateY: -20,
    scale: 1.45,
  },
  choco: {
    id: 'CO-CHO',
    x: 22,
    y: 30,
    translateX: 75,
    translateY: 20,
    scale: 1.45,
  },
  cundinamarca: {
    id: 'CO-CUN',
    x: 53,
    y: 38,
    translateX: -45,
    translateY: 5,
    scale: 1.45,
  },
  huila: {
    id: 'CO-HUI',
    x: 48,
    y: 52,
    translateX: -15,
    translateY: -35,
    scale: 1.45,
  },
  meta: {
    id: 'CO-MET',
    x: 61,
    y: 47,
    translateX: -65,
    translateY: -20,
    scale: 1.45,
  },
  putumayo: {
    id: 'CO-PUT',
    x: 48,
    y: 68,
    translateX: -10,
    translateY: -80,
    scale: 1.55,
  },
  quindio: {
    id: 'CO-QUI',
    x: 38,
    y: 38,
    translateX: 25,
    translateY: 5,
    scale: 1.55,
  },
  risaralda: {
    id: 'CO-RIS',
    x: 36,
    y: 36,
    translateX: 30,
    translateY: 15,
    scale: 1.55,
  },
  santander: {
    id: 'CO-SAN',
    x: 60,
    y: 26,
    translateX: -70,
    translateY: 30,
    scale: 1.45,
  },
  tolima: {
    id: 'CO-TOL',
    x: 46,
    y: 42,
    translateX: -15,
    translateY: -5,
    scale: 1.45,
  },
  'valle-del-cauca': {
    id: 'CO-VAC',
    x: 31,
    y: 43,
    translateX: 50,
    translateY: -5,
    scale: 1.55,
  },
};

function cityKey(department: string, city: string): string {
  return `${getDepartamentoSlug(department)}:${getDepartamentoSlug(city)}`;
}

const cityMapCoordinates: Record<string, MapPoint> = {
  [cityKey('Antioquia', 'Caramanta')]: { x: 31, y: 31 },
  [cityKey('Antioquia', 'Itagüí')]: { x: 32, y: 25 },
  [cityKey('Antioquia', 'La Pintada')]: { x: 34, y: 30 },
  [cityKey('Antioquia', 'Medellín')]: { x: 32, y: 24 },
  [cityKey('Antioquia', 'Valparaíso')]: { x: 31, y: 30 },

  [cityKey('Atlántico', 'Barranquilla')]: { x: 64, y: 9 },
  [cityKey('Atlántico', 'Soledad')]: { x: 65, y: 10 },

  [cityKey('Boyacá', 'Puerto Boyacá')]: { x: 50, y: 31 },

  [cityKey('Caldas', 'Anserma')]: { x: 37, y: 35 },
  [cityKey('Caldas', 'Arauca')]: { x: 39, y: 37 },
  [cityKey('Caldas', 'Belalcazar')]: { x: 37, y: 37 },
  [cityKey('Caldas', 'Chinchina')]: { x: 39, y: 36 },
  [cityKey('Caldas', 'La Dorada')]: { x: 47, y: 32 },
  [cityKey('Caldas', 'Manizales')]: { x: 40, y: 35 },
  [cityKey('Caldas', 'Marmato')]: { x: 37, y: 32 },
  [cityKey('Caldas', 'Neira')]: { x: 40, y: 34 },
  [cityKey('Caldas', 'Pacora')]: { x: 39, y: 32 },
  [cityKey('Caldas', 'Palestina')]: { x: 40, y: 36 },
  [cityKey('Caldas', 'Riosucio')]: { x: 36, y: 33 },
  [cityKey('Caldas', 'Risaralda')]: { x: 38, y: 37 },
  [cityKey('Caldas', 'Salamina')]: { x: 40, y: 32 },
  [cityKey('Caldas', 'San Lorenzo')]: { x: 38, y: 32 },
  [cityKey('Caldas', 'Supia')]: { x: 38, y: 33 },
  [cityKey('Caldas', 'Viterbo')]: { x: 38, y: 38 },

  [cityKey('Cauca', 'Popayán')]: { x: 34, y: 49 },
  [cityKey('Cauca', 'Santander de Quilichao')]: { x: 32, y: 47 },

  [cityKey('Chocó', 'San José del Palmar')]: { x: 30, y: 35 },

  [cityKey('Cundinamarca', 'Bogotá')]: { x: 53, y: 39 },
  [cityKey('Cundinamarca', 'Cachipay')]: { x: 49, y: 39 },
  [cityKey('Cundinamarca', 'Facatativá')]: { x: 50, y: 38 },
  [cityKey('Cundinamarca', 'Fusagasugá')]: { x: 50, y: 42 },

  [cityKey('Huila', 'Aipe')]: { x: 48, y: 48 },
  [cityKey('Huila', 'Garzon')]: { x: 46, y: 56 },
  [cityKey('Huila', 'La Plata')]: { x: 43, y: 58 },
  [cityKey('Huila', 'Neiva')]: { x: 48, y: 51 },
  [cityKey('Huila', 'Pitalito')]: { x: 45, y: 62 },

  [cityKey('Meta', 'Acacías')]: { x: 59, y: 46 },
  [cityKey('Meta', 'Villavicencio')]: { x: 59, y: 43 },

  [cityKey('Putumayo', 'Mocoa')]: { x: 48, y: 66 },

  [cityKey('Quindío', 'Armenia')]: { x: 38, y: 39 },
  [cityKey('Quindío', 'Barcelona')]: { x: 39, y: 40 },
  [cityKey('Quindío', 'Calarca')]: { x: 39, y: 39 },
  [cityKey('Quindío', 'Circasia')]: { x: 38, y: 38 },
  [cityKey('Quindío', 'Cordoba')]: { x: 40, y: 40 },
  [cityKey('Quindío', 'Génova')]: { x: 40, y: 43 },
  [cityKey('Quindío', 'Montenegro')]: { x: 37, y: 38 },
  [cityKey('Quindío', 'Pijao')]: { x: 40, y: 42 },
  [cityKey('Quindío', 'Quimbaya')]: { x: 37, y: 38 },
  [cityKey('Quindío', 'Tebaida')]: { x: 38, y: 40 },

  [cityKey('Risaralda', 'Apía')]: { x: 32, y: 37 },
  [cityKey('Risaralda', 'Belén de Umbría')]: { x: 33, y: 35 },
  [cityKey('Risaralda', 'Dosquebradas')]: { x: 37, y: 36 },
  [cityKey('Risaralda', 'Guática')]: { x: 34, y: 34 },
  [cityKey('Risaralda', 'La Virginia')]: { x: 34, y: 36 },
  [cityKey('Risaralda', 'Marsella')]: { x: 35, y: 35 },
  [cityKey('Risaralda', 'Mistrató')]: { x: 32, y: 34 },
  [cityKey('Risaralda', 'Pereira')]: { x: 36, y: 36 },
  [cityKey('Risaralda', 'Quinchía')]: { x: 35, y: 33 },
  [cityKey('Risaralda', 'Santa Rosa')]: { x: 38, y: 35 },
  [cityKey('Risaralda', 'Santuario')]: { x: 32, y: 38 },

  [cityKey('Santander', 'Bucaramaga')]: { x: 60, y: 25 },
  [cityKey('Santander', 'San Gil')]: { x: 58, y: 28 },

  [cityKey('Tolima', 'Anapoima')]: { x: 50, y: 41 },
  [cityKey('Tolima', 'Anzoategui')]: { x: 45, y: 39 },
  [cityKey('Tolima', 'Espinal')]: { x: 47, y: 44 },
  [cityKey('Tolima', 'Fresno')]: { x: 46, y: 35 },
  [cityKey('Tolima', 'Girardot')]: { x: 49, y: 43 },
  [cityKey('Tolima', 'Honda')]: { x: 49, y: 34 },
  [cityKey('Tolima', 'Ibagué')]: { x: 45, y: 42 },
  [cityKey('Tolima', 'Lerida')]: { x: 46, y: 38 },
  [cityKey('Tolima', 'Líbano')]: { x: 45, y: 37 },
  [cityKey('Tolima', 'Mariquita')]: { x: 47, y: 35 },
  [cityKey('Tolima', 'Melgar')]: { x: 48, y: 44 },
  [cityKey('Tolima', 'Rovira')]: { x: 45, y: 44 },
  [cityKey('Tolima', 'Santaisabel')]: { x: 44, y: 37 },
  [cityKey('Tolima', 'Tocaima')]: { x: 49, y: 42 },
  [cityKey('Tolima', 'Venadillo')]: { x: 46, y: 39 },
  [cityKey('Tolima', 'Villahermosa')]: { x: 45, y: 36 },
  [cityKey('Tolima', 'Villarrica')]: { x: 50, y: 46 },

  [cityKey('Valle del Cauca', 'Alcalá')]: { x: 34, y: 36 },
  [cityKey('Valle del Cauca', 'Andalucía')]: { x: 32, y: 40 },
  [cityKey('Valle del Cauca', 'Anserma Nuevo')]: { x: 31, y: 33 },
  [cityKey('Valle del Cauca', 'Argelia')]: { x: 29, y: 34 },
  [cityKey('Valle del Cauca', 'Bolívar')]: { x: 30, y: 37 },
  [cityKey('Valle del Cauca', 'Bugalagrande')]: { x: 32, y: 39 },
  [cityKey('Valle del Cauca', 'Caicedonia')]: { x: 35, y: 38 },
  [cityKey('Valle del Cauca', 'Cali')]: { x: 30, y: 46 },
  [cityKey('Valle del Cauca', 'Cartago')]: { x: 32, y: 34 },
  [cityKey('Valle del Cauca', 'El Águila')]: { x: 29, y: 33 },
  [cityKey('Valle del Cauca', 'El Dovio')]: { x: 30, y: 36 },
  [cityKey('Valle del Cauca', 'Florida')]: { x: 33, y: 47 },
  [cityKey('Valle del Cauca', 'Guacarí')]: { x: 31, y: 42 },
  [cityKey('Valle del Cauca', 'La Unión')]: { x: 31, y: 35 },
  [cityKey('Valle del Cauca', 'La Victoria')]: { x: 32, y: 35 },
  [cityKey('Valle del Cauca', 'Obando')]: { x: 30, y: 34 },
  [cityKey('Valle del Cauca', 'Palmira')]: { x: 31, y: 44 },
  [cityKey('Valle del Cauca', 'Pradera')]: { x: 32, y: 46 },
  [cityKey('Valle del Cauca', 'Riofrío')]: { x: 31, y: 39 },
  [cityKey('Valle del Cauca', 'Roldanillo')]: { x: 31, y: 35 },
  [cityKey('Valle del Cauca', 'Sevilla')]: { x: 34, y: 39 },
  [cityKey('Valle del Cauca', 'Toro')]: { x: 30, y: 35 },
  [cityKey('Valle del Cauca', 'Trujillo')]: { x: 31, y: 38 },
  [cityKey('Valle del Cauca', 'Tuluá')]: { x: 32, y: 40 },
  [cityKey('Valle del Cauca', 'Ulloa')]: { x: 34, y: 35 },
  [cityKey('Valle del Cauca', 'Versalles')]: { x: 29, y: 35 },
  [cityKey('Valle del Cauca', 'Yumbo')]: { x: 30, y: 44 },
  [cityKey('Valle del Cauca', 'Zarzal')]: { x: 32, y: 36 },
};

function fallbackPoint(config: DepartmentMapConfig, index: number, total: number): MapPoint {
  const angle = (Math.PI * 2 * index) / Math.max(total, 1);
  const radius = total > 8 ? 4 : 2.8;

  return {
    x: config.x + Math.cos(angle) * radius,
    y: config.y + Math.sin(angle) * radius,
  };
}

function buildSedeList(department: DepartamentoInfo, config: DepartmentMapConfig): SedeMapPoint[] {
  const sedesByCity = new Map<string, number>();

  SEDES.forEach((sede) => {
    if (getDepartamentoSlug(sede.departamento) !== department.slug) return;

    const citySlug = getDepartamentoSlug(sede.ciudad);
    sedesByCity.set(citySlug, (sedesByCity.get(citySlug) ?? 0) + 1);
  });

  const cities = [...department.ciudades].sort((a, b) => a.localeCompare(b, 'es'));

  return cities.map((city, index) => {
    const slug = getDepartamentoSlug(city);
    const count = sedesByCity.get(slug) ?? 0;
    const point =
      cityMapCoordinates[cityKey(department.nombre, city)] ??
      fallbackPoint(config, index, cities.length);

    return {
      id: `${department.slug}-${slug}`,
      name: count > 1 ? `${city} (${count} sedes)` : city,
      slug,
      x: point.x,
      y: point.y,
      href: `/sedes/${department.slug}`,
      count,
    };
  });
}

export const coverageData: Department[] = getAllDepartamentos().map((department, index) => {
  const config =
    departmentMapConfig[department.slug] ??
    ({
      id: `CO-${department.slug.slice(0, 3).toUpperCase()}`,
      x: 50,
      y: 40 + index,
      translateX: 0,
      translateY: 0,
      scale: 1.25,
    } satisfies DepartmentMapConfig);

  const ciudades = [...department.ciudades].sort((a, b) => a.localeCompare(b, 'es'));

  return {
    id: config.id,
    name: department.nombre,
    color: COVERAGE_COLOR,
    sedes: department.count,
    ciudades,
    sedeList: buildSedeList({ ...department, ciudades }, config),
    x: config.x,
    y: config.y,
    translateX: config.translateX,
    translateY: config.translateY,
    scale: config.scale,
  };
});
