/**
 * Sedes - Jardines del Renacer
 * Directorio nacional de puntos de atención
 */

export interface Sede {
  id: string; // Identificador único de la sede
  nombre: string; // Nombre de la sede (ej: Pereira - La 27)

  direccion: string; 
  // Dirección técnica (puede ser:
  // - Dirección normal
  // - Plus Code de Google Maps (más preciso))

  direccionVisible?: string; 
  // Dirección que verá el usuario (opcional)
  // Si existe, se usa en lugar de "direccion"

  administradora: string; // Nombre del responsable
  lat: number;
  lng: number;
  telefono: string; // Teléfono de contacto
  departamento: string; // Departamento (ej: Risaralda)
  ciudad: string; // Ciudad (ej: Pereira)
}

export interface DepartamentoInfo {
  nombre: string; // Nombre del departamento
  slug: string; // Versión limpia para URLs (ej: risaralda)
  count: number; // Cantidad de sedes en ese departamento
  ciudades: string[]; // Lista de ciudades únicas
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

export function getDepartamentoSlug(departamento: string): string {
  return departamento
    .toLowerCase() // todo a minúsculas
    .normalize('NFD')                 // separa letras y acentos
    .replace(/[\u0300-\u036f]/g, '') // elimina acentos
    .replace(/\./g, '')             // elimina puntos
    .trim()                        // elimina espacios al inicio y fin
    .replace(/\s+/g, '-')         // espacios → guiones
    .replace(/[^a-z0-9-]/g, ''); // elimina caracteres raros
}

// Filtra sedes por departamento usando el slug
export function getSedesByDepartamento(slug: string): Sede[] {
  return SEDES.filter(
    (s) => getDepartamentoSlug(s.departamento) === slug
  );
}

// Agrupa todas las sedes por departamento
export function getAllDepartamentos(): DepartamentoInfo[] {
  const map = new Map<string, DepartamentoInfo>();

  for (const sede of SEDES) {
    const slug = getDepartamentoSlug(sede.departamento);

    // Si el departamento no existe en el mapa, lo crea
    if (!map.has(slug)) {
      map.set(slug, {
        nombre: sede.departamento,
        slug,
        count: 0,
        ciudades: [],
      });
    }

    const dep = map.get(slug)!;

    dep.count++; // suma una sede más

    // Agrega la ciudad si no existe aún
    if (!dep.ciudades.includes(sede.ciudad)) {
      dep.ciudades.push(sede.ciudad);
    }
  }

  // Convierte el Map a array y lo ordena alfabéticamente
  return Array.from(map.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es')
  );
}

//HELPER CLAVE
//Decide qué dirección mostrar al usuario
export function getDireccionLabel(sede: Sede): string {
  return sede.direccionVisible || sede.direccion;

  // Si existe direccionVisible → se usa (UX)
  // Si no → usa direccion (fallback)
}

// ──────────────────────────────────────────────────────────────
// Data - SEDES
// ──────────────────────────────────────────────────────────────

export const SEDES: Sede[] = [

  // ── RISARALDA ───────────────────────────────────────────────

  {
    id: 'rs-07',
    nombre: 'Pereira - La 27',
    direccion: 'CALLE 27 # 6-22', // Dirección real usable directamente
    direccionVisible: 'Calle 27 # 6-22, Pereira', // Versión para UI, más amigable
    administradora: '',
    lat: 4.8145,
    lng: -75.6946,
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },

  {
    id: 'rs-01',
    nombre: 'Pereira - 30 de agosto',
    direccion: 'R78J+73 Pereira, Risaralda, Colombia', //PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Av. 30 de Agosto, Pereira', //Versión para UI, más amigable
    lat: 4.8157,
    lng: -75.7198,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },

  {
    id: 'rs-08',
    nombre: 'Pereira - Cuba',
    direccion: 'CALLE 68 BIS # 25 - 40',// PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Calle 68 Bis # 25-40, Pereira', // Versión para UI, más amigable
    lat: 4.7922,
    lng: -75.724,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Pereira',
  },

  {
    id: 'rs-09',
    nombre: 'Dosquebradas - La Badea',
    direccion: 'R8F4+7C Dosquebradas, Risaralda, Colombia', //PLUS CODE → máxima precisión para mapas
    direccionVisible: 'La Badea, Dosquebradas', //Versión para UI, más amigable
    lat: 4.8232,
    lng: -75.6939,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Dosquebradas',
  },

  {
    id: 'rs-10',
    nombre: 'Apía',
    direccion: 'CRA 8 # 10-35', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Cra 8 # 10-35, Apía', // Versión para UI, más amigable
    lat: 5.101,
    lng: -75.942,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Apía',
  },

  {
    id: 'rs-11',
    nombre: 'Santuario',
    direccion: 'CRA 7 # 7-04', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Cra 7 # 7-04, Santuario', // Versión para UI, más amigable
    lat: 5.072,
    lng: -75.966,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Santuario',
  },

  {
    id: 'rs-12',
    nombre: 'La Virginia',
    direccion: 'CRA 9 # 6-23', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Cra 9 # 6-23, La Virginia', // Versión para UI, más amigable
    lat: 4.898,
    lng: -75.86,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'La Virginia',
  },

  {
    id: 'rs-13',
    nombre: 'Marsella',
    direccion: 'CRA 9 # 18-36', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Cra 9 # 18-36, Marsella', // Versión para UI, más amigable
    lat: 4.933,
    lng: -75.739,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Marsella',
  },

  {
    id: 'rs-14',
    nombre: 'Santa Rosa',
    direccion: 'Calle 13 # 11-75', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Calle 13 # 11-75, Santa Rosa', // Versión para UI, más amigable
    lat: 4.87,
    lng: -75.617,
    administradora: '',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Santa Rosa',
  },

  {
    id: 'rs-15',
    nombre: 'Belén de Umbría',
    direccion: 'Calle 6 # 11-33', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Calle 6 # 11-33, Belén de Umbría', // Versión para UI, más amigable
    lat: 5.197,
    lng: -75.87,
    administradora: 'Gina Hazbleidy Zapata Roman',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Belén de Umbría',
  },

  {
    id: 'rs-16',
    nombre: 'Guática',
    direccion: 'Carrera 5 # 9-16', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Carrera 5 # 9-16, Guática', // Versión para UI, más amigable
    lat: 5.315,
    lng: -75.79,
    administradora: 'Maria Fernanda Ramirez Garcia',
    telefono: '3128280052',
    departamento: 'Risaralda',
    ciudad: 'Guática',
  },

  {
    id: 'rs-17',
    nombre: 'Mistrató',
    direccion: 'Carrera 6 # 6-18', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Carrera 6 # 6-18, Mistrató', // Versión para UI, más amigable
    lat: 5.298,
    lng: -75.88,
    administradora: 'Daniela González Román', 
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Mistrató',
  },

  {
    id: 'rs-18',
    nombre: 'Quinchía',
    direccion: 'Carrera 6 # 4-42', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Carrera 6 # 4-42, Quinchía', // Versión para UI, más amigable
    lat: 5.33,
    lng: -75.72,
    administradora: 'Yeifer Alejandra Ferrer Mapura',
    telefono: '',
    departamento: 'Risaralda',
    ciudad: 'Quinchía',
  },

  // ── ANTIOQUIA ───────────────────────────────────────────────
  { id: 'an-01', 
    nombre: 'Medellín',
    direccion: '7C6M+4M Medellín, Antioquia, Colombia',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CRA 51D # 61-88 AV. Juan V del Corral, Medellín', // Versión para UI, más amigable
    lat: 6.2604,
    lng: -75.566,
    administradora: 'Ana Maria Betancur - Admon Regional', 
    telefono: '3116262976 servicios', 
    departamento: 'Antioquia', ciudad: 'Medellín'
  },

  { id: 'an-02', 
    nombre: 'Itagüí', 
    direccion: 'Calle 50A # 48-39 queda a cuadra y media del parque principal',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Calle 50A # 48-39, Itagüí', // Versión para UI, más amigable
    lat: 6.173,
    lng: -75.61,
    administradora: 'DEICY YOHANA ORTIZ', 
    telefono: '(604) 4310645', 
    departamento: 'Antioquia', 
    ciudad: 'Itagüí' 
  },

  { id: 'an-03', 
    nombre: 'La Pintada', 
    direccion: 'Calle 35 # 33-17 Barrio Pueblo Nuevo',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Calle 35 # 33-17, La Pintada', // Versión para UI, más amigable
    lat: 5.74,
    lng: -75.605,
    administradora: 'Angie Vanessa Piedrahita Villada', 
    telefono: '3134649079', 
    departamento: 'Antioquia', 
    ciudad: 'La Pintada' 
  },

  { id: 'an-04', 
    nombre: 'Valparaíso', 
    direccion: 'Carrera 10 Bolivar # 10-19',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Carrera 10 Bolivar # 10-19, Valparaíso', // Versión para UI, más amigable
    lat: 5.62,
    lng: -75.62,
    administradora: 'Olga Stella Ospina Montoya', 
    telefono: '3228147176', 
    departamento: 'Antioquia', 
    ciudad: 'Valparaíso' 
  },

  { id: 'an-05', 
    nombre: 'Caramanta', 
    direccion: 'Cra 20 #20-43 Cordoba',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'Cra 20 #20-43, Caramanta', // Versión para UI, más amigable
    lat: 5.54,
    lng: -75.64,
    administradora: 'Cristina Marcela Guiral Puerta', 
    telefono: '3228147221', 
    departamento: 'Antioquia', 
    ciudad: 'Caramanta' 
  },

  // ── QUINDÍO ──────────────────────────────────────────────────

  { id: 'qu-01', 
    nombre: 'Génova', 
    direccion: 'CRA 10 NUM 26 -40 ( 24-52)',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CRA 10 NUM 26 -40 ( 24-52), Génova', // Versión para UI, más amigable
    lat: 4.2,
    lng: -75.76,
    administradora: 'LEIDY CAROLINA SUAREZ', 
    telefono: '606 732931 EXT 214', 
    departamento: 'Quindío', 
    ciudad: 'Génova' 
  },

  { id: 'qu-02', 
    nombre: 'Quimbaya', 
    direccion: 'CRA 3 # 15-47 ESQUINA',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CRA 3 # 15-47, Quimbaya', // Versión para UI, más amigable
    lat: 4.62,
    lng: -75.75,
    administradora: 'ANGELICA SANCHEZ', 
    telefono: '6067329231', 
    departamento: 'Quindío', 
    ciudad: 'Quimbaya' 
  },

  { id: 'qu-03', 
    nombre: 'Calarca', 
    direccion: 'CALLE 38 25-36', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CALLE 38 25-36, Calarca', // Versión para UI, más amigable
    lat: 4.52,
    lng: -75.64,
    administradora: 'ANA CAROLINA CASTAÑO', 
    telefono: '6067329131', 
    departamento: 'Quindío', 
    ciudad: 'Calarca' 
  },
    
  { id: 'qu-04', 
    nombre: 'Barcelona', 
    direccion: 'CRA 10 # 10-02',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CRA 10 # 10-02, Barcelona', // Versión para UI, más amigable
    lat: 4.47,
    lng: -75.68,
    administradora: 'NICOL SOFIA BUITRAGO VASQUEZ', 
    telefono: '', 
    departamento: 'Quindío', 
    ciudad: 'Barcelona' 
  },

  { id: 'qu-05', 
    nombre: 'Pijao', 
    direccion: 'CRA6 CALLE13 #6-09', // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CRA6 CALLE13 #6-09, Pijao',  // Versión para UI, más amigable
    lat: 4.33,
    lng: -75.71,
    administradora: 'HELEIN YINELA AGUDELO HERRERA',  
    telefono: '606-7329231', 
    departamento: 'Quindío', 
    ciudad: 'Pijao' 
  },

  { id: 'qu-06', 
    nombre: 'Cordoba', 
    direccion: 'CALLE 14 # 10 - 35 CENTRO',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CALLE 14 # 10 - 35, Cordoba', // Versión para UI, más amigable
    lat: 4.4,
    lng: -75.68,
    administradora: 'MOISES CORTES', 
    telefono: '6067329231', 
    departamento: 'Quindío', 
    ciudad: 'Cordoba' 
  },

  { id: 'qu-07', 
    nombre: 'Circasia', 
    direccion: 'CARRERA 11#5-55',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CARRERA 11#5-55, Circasia', // Versión para UI, más amigable
    lat: 4.61,
    lng: -75.63,
    administradora: 'JOHANA CAROLINA ZAMBRANO', 
    telefono: '6067329231', 
    departamento: 'Quindío', 
    ciudad: 'Circasia' 
  },

  { id: 'qu-08', 
    nombre: 'Tebaida', 
    direccion: 'CRA 8 NUMERO 10-18',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CRA 8 NUMERO 10-18, Tebaida', // Versión para UI, más amigable
    lat: 4.45,
    lng: -75.78,
    administradora: 'KAROL ANGELY VILLEGAS GARCIA', 
    telefono: '6067329231', 
    departamento: 'Quindío', 
    ciudad: 'Tebaida' 
  },

  { id: 'qu-09', 
    nombre: 'Montenegro', 
    direccion: 'calle 15# 5-37 piso 1',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'calle 15# 5-37 piso 1, Montenegro', // Versión para UI, más amigable
    lat: 4.56,
    lng: -75.75,
    administradora: 'NATHALY PIEDRAHITA PACHON', 
    telefono: '317 4358467', 
    departamento: 'Quindío', 
    ciudad: 'Montenegro' 
  },

  { id: 'qu-10', 
    nombre: 'Armenia', 
    direccion: 'CRA 13 # 23 - 55',  // PLUS CODE → máxima precisión para mapas
    direccionVisible: 'CRA 13 # 23 - 55, Armenia', // Versión para UI, más amigable
    lat: 4.53,
    lng: -75.68,
    administradora: 'PAOLA ANDREA CRUZ CAMPOS', 
    telefono: '3105563221', 
    departamento: 'Quindío', 
    ciudad: 'Armenia' 
  },

  // ── VALLE DEL CAUCA ──────────────────────────────────────────

    { id: 'vc-01', 
      nombre: 'Tuluá', 
      direccion: 'calle 26 # 38-25',  
      direccionVisible: 'calle 26 # 38-25, Tuluá', 
      lat: 4.08,
      lng: -76.19,
      administradora: 'katheriner Santa', 
      telefono: '3115343146', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Tuluá' 
    },

    { id: 'vc-05', 
      nombre: 'Riofrío', 
      direccion: 'calle 5 #10-28', 
      direccionVisible: 'calle 5 #10-28, Riofrío', 
      lat: 4.15,
      lng: -76.28,
      administradora: 'YESSENIA JARAMILLO-NICOLLE', 
      telefono: '6023800914', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Riofrío' 
    },

    { id: 'vc-06', 
      nombre: 'Trujillo', 
      direccion: 'Carrera 19# 20-74', 
      direccionVisible: 'Carrera 19# 20-74, Trujillo',
      lat: 4.24,
      lng: -76.32,
      administradora: 'YAMILETH CORREA', 
      telefono: '', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Trujillo' 
    },

    { id: 'vc-07', 
      nombre: 'Andalucía', 
      direccion: 'carrera 4 # 17-02', 
      direccionVisible: 'carrera 4 # 17-02, Andalucía',
      lat: 4.17,
      lng: -76.17,
      administradora: 'DIGNORA XASTAÑO', 
      telefono: '', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Andalucía' 
    },

    { id: 'vc-08', 
      nombre: 'Guacarí', 
      direccion: 'CALLE 4 # 2-150', 
      direccionVisible: 'CALLE 4 # 2-150, Guacarí',
      lat: 3.76,
      lng: -76.33,
      administradora: 'YESICA NILLERAY DUQUE', 
      telefono: '3116681849, (606) 3419500', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Guacarí' 
    },

    { id: 'vc-09', 
      nombre: 'Bugalagrande', 
      direccion: 'Cra 6 # 4-03', 
      direccionVisible: 'Cra 6 # 4-03, Bugalagrande',
      lat: 4.21,
      lng: -76.15,
      administradora: 'PAOLA TELLO', 
      telefono: '3112062478', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Bugalagrande' 
    },

    { id: 'vc-10', 
      nombre: 'Sevilla', 
      direccion: 'CALLE 48 #47-32', 
      direccionVisible: 'CALLE 48 #47-32, Sevilla',
      lat: 4.26,
      lng: -75.93,
      administradora: 'NORMA CONSTANZA GRANADA', 
      telefono: '6067329231', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Sevilla' 
    },

    { id: 'vc-11', 
      nombre: 'Caicedonia', 
      direccion: 'CARRERA 16 # 7-33', 
      direccionVisible: 'CARRERA 16 # 7-33, Caicedonia',
      lat: 4.33,
      lng: -75.84,
      administradora: 'MILDREY MARIN', 
      telefono: '6067329231', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Caicedonia' 
    },

    { id: 'vc-12',
      nombre: 'Bolívar', 
      direccion: 'Calle 4 #3-22,', 
      direccionVisible: 'Calle 4 #3-22, Bolívar',
      lat: 4.31,
      lng: -76.19,
      administradora: 'VANESA TAPASCO MONDRAGON', 
      telefono: '', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Bolívar' 
      },

    { id: 'vc-13', 
      nombre: 'Palmira', 
      direccion: 'Calle 32 # 31-81', 
      direccionVisible: 'Calle 32 # 31-81, Palmira',
      lat: 3.53,
      lng: -76.3,
      administradora: 'jessica maria dominguez', 
      telefono: '3232216871, 6023896438', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Palmira' 
    },

    { id: 'vc-18', 
      nombre: 'Florida', 
      direccion: 'Carrera 17 # 8-54', 
      direccionVisible: 'Carrera 17 # 8-54, Florida',
      lat: 3.32,
      lng: -76.23,
      administradora: 'Leidy Marcela Gonzalez Pedroza', 
      telefono: '6023896438', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Florida' 
    },

    { id: 'vc-19', 
      nombre: 'Pradera', 
      direccion: 'Carrera 10 9-23', 
      direccionVisible: 'Carrera 10 9-23, Pradera',
      lat: 3.41,
      lng: -76.24,
      administradora: 'Alba Rivera Rivera', 
      telefono: '6023896438', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Pradera' 
    },

    { id: 'vc-20', 
      nombre: 'Cali', 
      direccion: 'Av 3Bis Norte # 24-85', 
      direccionVisible: 'Av 3Bis Norte # 24-85, Cali',
      lat: 3.46,
      lng: -76.53,
      administradora: 'Karen Lorena Arango Riascos', 
      telefono: '3229446453', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Cali' 
    },

    { id: 'vc-24', 
      nombre: 'Yumbo', 
      direccion: 'Carrera 4#3-59', 
      direccionVisible: 'Carrera 4#3-59, Yumbo',
      lat: 3.58,
      lng: -76.49,
      administradora: 'yuri ocampo', 
      telefono: '', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Yumbo' 
    },

    { id: 'vc-25', 
      nombre: 'Argelia', 
      direccion: 'CALLE 4 # 7-28', 
      direccionVisible: 'CALLE 4 # 7-28, Argelia',
      lat: 4.71,
      lng: -76.12,
      administradora: 'LUZ EDILMA BOTERO', 
      telefono: '', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Argelia' 
    },
    
    { id: 'vc-26', 
      nombre: 'La Unión', 
      direccion: 'CALLE 14 # 10-81', 
      direccionVisible: 'CALLE 14 # 10-81, La Unión',
      lat: 4.96,
      lng: -76.1,
      administradora: 'VALENTINA RESTREPO', 
      telefono: '6023800913', 
      departamento: 'Valle del Cauca', 
      ciudad: 'La Unión' 
    },

    { id: 'vc-27', 
      nombre: 'Zarzal',
      direccion: 'CRA 9 # 9-94', 
      direccionVisible: 'CRA 9 # 9-94, Zarzal', 
      lat: 4.39,
      lng: -76.07,
      administradora: 'MARTHA LUCIA GIRALDO', 
      telefono: '3136628996, 6023800913', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Zarzal' },

    { id: 'vc-28', 
      nombre: 'Anserma Nuevo', 
      direccion: 'CALLE 6 # 6-22', 
      direccionVisible: 'CALLE 6 # 6-22, Anserma Nuevo', 
      lat: 4.76,
      lng: -76.03,
      administradora: 'GOMEZ PARRA LUZ AIDA', 
      telefono: '6023800913', 
      departamento: 'Valle del Cauca',
      ciudad: 'Anserma Nuevo' 
      },

    { id: 'vc-29', 
      nombre: 'Cartago', 
      direccion: 'Calle 11 #2-54 y calle 11#2-60 piso 01', 
      direccionVisible: 'Calle 11 #2-54 y calle 11#2-60 piso 01, Cartago', 
      lat: 4.74,
      lng: -75.91,
      administradora: 'CLAUDIA PATRICIA CHAVARRIAGA', 
      telefono: '3216061919 SERVICIOS CORPORATIVO ADMON 3117050357, 6023800913', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Cartago' 
    },

    { id: 'vc-30', 
      nombre: 'El Águila', 
      direccion: 'CALLE 6 # 6-08', 
      direccionVisible: 'CALLE 6 # 6-08, El Águila',
      lat: 4.91,
      lng: -76.04,
      administradora: 'NOREÑA ROLDAN HERNAN DARIO', 
      telefono: '3136628987', 
      departamento: 'Valle del Cauca', 
      ciudad: 'El Águila' 
    },

    { id: 'vc-31', 
      nombre: 'El Dovio', 
      direccion: 'CRA 7 N 5-22', 
      direccionVisible: 'CRA 7 N 5-22, El Dovio',
      lat: 4.51,
      lng: -76.23,
      administradora: 'URDINOLA PINILLOS CLAUDIA PATRICIA', 
      telefono: '3136628941', 
      departamento: 'Valle del Cauca', 
      ciudad: 'El Dovio' 
    },

    { id: 'vc-32', 
      nombre: 'La Victoria', 
      direccion: 'CALLE 9 N 7-12', 
      direccionVisible: 'CALLE 9 N 7-12, La Victoria',
      lat: 4.51,
      lng: -76.05,
      administradora: 'LEIDY OSORIO', 
      telefono: '3116681902, 6023800913', 
      departamento: 'Valle del Cauca', 
      ciudad: 'La Victoria' 
    },
    { id: 'vc-33', 
      nombre: 'Obando', 
      direccion: 'CALLE 4 N 2-05', 
      direccionVisible: 'CALLE 4 N 2-05, Obando',
      lat: 4.57,
      lng: -75.96,
      administradora: 'PULIDO SABOGAL GLORIA CECILIA', 
      telefono: '3103334276, 6023800913', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Obando' 
    },
    { id: 'vc-34', 
      nombre: 'Roldanillo', 
      direccion: 'CRA 7 N 9-58', 
      direccionVisible: 'CRA 7 N 9-58, Roldanillo',
      lat: 4.41,
      lng: -76.15,
      administradora: 'CARDONA MARLYN DANIELA', 
      telefono: '6023800913', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Roldanillo' 
    },
    { id: 'vc-35', 
      nombre: 'Toro', 
      direccion: 'CALLE 11 N 2-58CCC', 
      direccionVisible: 'CALLE 11 N 2-58CCC, Toro',
      lat: 4.61,
      lng: -76.08,
      administradora: 'MYRIAN ALEJANDRA VASQUEZ', 
      telefono: '3113769908, 6023800913', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Toro' 
    },
    { id: 'vc-36', 
      nombre: 'Versalles', 
      direccion: 'CALLE 8 # 4-13 BARRIO GUAYABITO', 
      direccionVisible: 'CALLE 8 # 4-13 BARRIO GUAYABITO, Versalles',
      lat: 4.58,
      lng: -76.21,
      administradora: 'GEICY YURANY TRUJILLO', 
      telefono: '3219141777', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Versalles'
    },

    { id: 'vc-38', 
      nombre: 'Alcalá', 
      direccion: 'CRA 9 # 4-15',
      direccionVisible: 'CRA 9 # 4-15, Alcalá',
      lat: 4.67,
      lng: -75.78,
      administradora: 'YORLEN MARITZA VILLA MATUTE', 
      telefono: '6067329231', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Alcalá' 
    },

    { id: 'vc-39', 
      nombre: 'Ulloa', 
      direccion: 'CALLE 5 # 2-43 PARQUE PRINCIPAL', 
      direccionVisible: 'CALLE 5 # 2-43 PARQUE PRINCIPAL, Ulloa',
      lat: 4.71,
      lng: -75.74,
      administradora: 'LINA USUGA PINO',
      telefono: '6067329231', 
      departamento: 'Valle del Cauca', 
      ciudad: 'Ulloa' },

  // ── CUNDINAMARCA ─────────────────────────────────────────────
  
    { id: 'cu-01', 
      nombre: 'Cachipay', 
      direccion: 'CALLE 3 # 2-56 CENTRO',  // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 3 # 2-56 CENTRO, Cachipay', // Versión para UI, más amigable
      lat: 4.73,
      lng: -74.44,
      administradora: 'HUSMARY VALENTINA FONSECA TORRES', 
      telefono: '601 - 7948497', 
      departamento: 'Cundinamarca', 
      ciudad: 'Cachipay' 
    },

    { id: 'cu-02', 
      nombre: 'Facatativá', 
      direccion: 'CARRERA 3 #4-14 CENTRO',  // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CARRERA 3 #4-14 CENTRO, Facatativá', // Versión para UI, más amigable
      lat: 4.81,
      lng: -74.35,
      administradora: 'ANGIE LICETH NUÑEZ NIETO', 
      telefono: '3228147818, 601- 794 8497', 
      departamento: 'Cundinamarca', 
      ciudad: 'Facatativá' 
    },

    { id: 'cu-03', 
      nombre: 'Fusagasugá', 
      direccion: 'CARRERA 7 # 4-26 CENTRO',  // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CARRERA 7 # 4-26 CENTRO, Fusagasugá', // Versión para UI, más amigable
      lat: 4.33,
      lng: -74.36,
      administradora: 'WLEYDY STHEFANY GONZALEZ GONZALEZ', 
      telefono: '3229449886, 601- 794 8497', 
      departamento: 'Cundinamarca', 
      ciudad: 'Fusagasugá' 
    },
    { id: 'cu-04', 
      nombre: 'Bogotá Teusaquillo', 
      direccion: 'Calle 34 # 16-09 Teusaquillo',  // PLUS CODE → máxima precisión para mapas  
      direccionVisible: 'Calle 34 # 16-09 Teusaquillo, Bogotá', // Versión para UI, más amigable
      lat: 4.62,
      lng: -74.07,
      administradora: 'Lina Marcela Caviedes Calderón', 
      telefono: '3145881602, 4874893', 
      departamento: 'Cundinamarca', 
      ciudad: 'Bogotá' 
    },
    { id: 'cu-05', 
      nombre: 'Bogotá Kennedy', 
      direccion: 'Carrera 73 D # 26-37', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'Carrera 73 D # 26-37, Bogotá', // Versión para UI, más amigable
      lat: 4.63,
      lng: -74.14,
      administradora: 'Yessenia Maria Gutierrez Zuluaga', 
      telefono: '', 
      departamento: 'Cundinamarca', 
      ciudad: 'Bogotá' 
    },

  // ── TOLIMA ───────────────────────────────────────────────────
    { id: 'to-01', 
      nombre: 'Girardot', 
      direccion: 'CALLE 19 # 11-80 SUCRE', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 19 # 11-80 SUCRE, Girardot', // Versión para UI, más amigable
      lat: 4.3,
      lng: -74.8,
      administradora: 'LUISA FERNANDA CASTRO MENDEZ', 
      telefono: '3229449895', 
      departamento: 'Tolima', 
      ciudad: 'Girardot' 
    },

    { id: 'to-02', 
      nombre: 'Anapoima', 
      direccion: 'CALLE 5 # 1-39', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 5 # 1-39, Anapoima', // Versión para UI, más amigable
      lat: 4.55,
      lng: -74.53,
      administradora: 'MARIANA ACOSTA ALFONSO', 
      telefono: '601-7948497', 
      departamento: 'Tolima', 
      ciudad: 'Anapoima' 
    },
    { id: 'to-03', 
      nombre: 'Tocaima', 
      direccion: 'CALLE 2 # 8-98', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 2 # 8-98, Tocaima', // Versión para UI, más amigable
      lat: 4.45,
      lng: -74.63,
      administradora: 'MARGARITA BERRIO SERENO', 
      telefono: '3112062575', 
      departamento: 'Tolima', 
      ciudad: 'Tocaima' 
    },
    { id: 'to-04', 
      nombre: 'Melgar', 
      direccion: 'CALLE 10 # 21-07 BARRIO YAJAIRA', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 10 # 21-07 BARRIO YAJAIRA, Melgar', // Versión para UI, más amigable
      lat: 4.2,
      lng: -74.64,
      administradora: 'MAYRA ALEJANDRA SANCHEZ CASTAÑO', 
      telefono: '601- 794 8497', 
      departamento: 'Tolima', 
      ciudad: 'Melgar' 
    },
    { id: 'to-05', 
      nombre: 'Espinal', 
      direccion: 'CALLE 9 # 8 -92 CENTRO', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 9 # 8 -92 CENTRO, Espinal', // Versión para UI, más amigable
      lat: 4.15,
      lng: -74.88,
      administradora: 'LEIDY PAOLA ORTIZ SANCHEZ', 
      telefono: '601- 794 8497', 
      departamento: 'Tolima', 
      ciudad: 'Espinal' 
    },

    { id: 'to-06', 
      nombre: 'Villarrica', 
      direccion: 'CALLE 5 # 3-17 CENTRO', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 5 # 3-17 CENTRO, Villarrica', // Versión para UI, más amigable
      lat: 3.94,
      lng: -74.61,
      administradora: 'MICHAEL STIVEN AVILA LONDOÑO', 
      telefono: '3112062652', 
      departamento: 'Tolima', 
      ciudad: 'Villarrica'
    },

    { id: 'to-08', 
      nombre: 'Ibagué', 
      direccion: 'CRA 4B # 31 - 04 CADIZ', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CRA 4B # 31 - 04 CADIZ, Ibagué', // Versión para UI, más amigable
      lat: 4.43,
      lng: -75.2,
      administradora: 'Yesenia beltran', 
      telefono: '3214958867', 
      departamento: 'Tolima', 
      ciudad: 'Ibagué' 
    },

    { id: 'to-09', 
      nombre: 'Anzoategui', 
      direccion: 'CRA 2 # 6 67 SECTOR HOSPITAL', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CRA 2 # 6 67 SECTOR HOSPITAL, Anzoategui', // Versión para UI, más amigable
      lat: 4.63,
      lng: -75.1,
      administradora: 'Lucy Bibiana Cespedes Rodríguez', 
      telefono: '3143651736', 
      departamento: 'Tolima', 
      ciudad: 'Anzoategui' 
    },
    

    { id: 'to-10', 
      nombre: 'Venadillo', 
      direccion: 'CRA 5 # 4-57 SANTA BARBARA', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CRA 5 # 4-57 SANTA BARBARA, Venadillo', // Versión para UI, más amigable
      lat: 4.6,
      lng: -74.93,
      administradora: 'Yeimi Paola Lozano Rodríguez', 
      telefono: '3229482923', 
      departamento: 'Tolima', 
      ciudad: 'Venadillo' 
    },

    { id: 'to-11', 
      nombre: 'Lerida', 
      direccion: 'CRA 12 # 2A - 46 AV PALMAS', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CRA 12 # 2A - 46 AV PALMAS, Lerida', // Versión para UI, más amigable
      lat: 4.85,
      lng: -74.91,
      administradora: 'Gisela Del Pilar Mahecha Acosta', 
      telefono: '3245717546', 
      departamento: 'Tolima', 
      ciudad: 'Lerida' 
    },
    
    { id: 'to-12', 
      nombre: 'Líbano', 
      direccion: 'CALLE 4 # 3-100 B/EL CARMEN', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE 4 # 3-100 B/EL CARMEN, Líbano', // Versión para UI, más amigable
      lat: 4.92,
      lng: -75.06,
      administradora: 'Russ Belly Pineda Sánchez', 
      telefono: '3214279398', 
      departamento: 'Tolima', 
      ciudad: 'Líbano' 
    },

    { id: 'to-13', 
      nombre: 'Villahermosa', 
      direccion: 'CLL 8 LOCAL 3 PARROQUIA NUESTRA SEÑORA DE LAS MERCEDES', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CLL 8 LOCAL 3 PARROQUIA NUESTRA SEÑORA DE LAS MERCEDES, Villahermosa', // Versión para UI, más amigable
      lat: 5.06,
      lng: -75.1,
      administradora: 'Luz Nidia Orrego', 
      telefono: '3106676261', 
      departamento: 'Tolima', 
      ciudad: 'Villahermosa' 
    },

    { id: 'to-14', 
      nombre: 'Santaisabel', 
      direccion: 'CALLE PRINCIPAL CR 2 # 4-20',   // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CALLE PRINCIPAL CR 2 # 4-20, Santaisabel', // Versión para UI, más amigable
      lat: 4.66,
      lng: -75.1,
      administradora: 'Ana Sofia Guzman Vela', 
      telefono: '3133447254', 
      departamento: 'Tolima', 
      ciudad: 'Santaisabel' 
    },

    { id: 'to-15', 
      nombre: 'Fresno', 
      direccion: 'carrera 9 con cll 5 esquina sector la variante',  // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'carrera 9 con cll 5 esquina sector la variante, Fresno', // Versión para UI, más amigable
      lat: 5.15,
      lng: -75.03,
      administradora: 'Leidy Jhoana Hincapie Hincapie', 
      telefono: '3114369645', 
      departamento: 'Tolima', 
      ciudad: 'Fresno' 
    },

    { id: 'to-16', 
      nombre: 'Mariquita',
      direccion: 'CRA 4 # 8-39', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CRA 4 # 8-39 EL CARMEN, Mariquita', // Versión para UI, más amigable
      lat: 5.19,
      lng: -74.89,
      administradora: 'Nini Jhoana Lopez',
      telefono:'3223813279',
      departamento:'Tolima',
      ciudad:'Mariquita'
    },

    { id: 'to-17', 
      nombre: 'Rovira', 
      direccion: 'CRA 3 #4-61', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CRA 3 #4-61, Rovira', // Versión para UI, más amigable
      lat: 4.24,
      lng: -75.24,
      administradora: 'Maria Juanita Sanchez', 
      telefono: '3103677915', 
      departamento: 'Tolima', 
      ciudad: 'Rovira' },

    { id: 'to-18', 
      nombre: 'Honda', 
      direccion: 'CRA 12 # 16a-01', // PLUS CODE → máxima precisión para mapas
      direccionVisible: 'CRA 12 # 16a-01 EL CARMEN, Honda', 
      lat: 5.2,
      lng: -74.73,
      administradora: 'rosemberg sepulveda', 
      telefono:'3208568338', 
      departamento: 'Tolima', 
      ciudad:'Honda' 
    },

    { id: 'to-19', 
      nombre:'Ibagué', 
      direccion:'CRA 4 B No 31 - 04 CADIZ', 
      direccionVisible:'CRA 4 B No 31 - 04 CADIZ, Ibagué', 
      lat: 4.438,
      lng: -75.20,
      administradora:'Alexandra galeano', 
      telefono: '', 
      departamento:'Tolima', 
      ciudad:'Ibagué' 
    },
    

  // ── CAUCA ────────────────────────────────────────────────────
    { id: 'ca-01', 
      nombre: 'Santander de Quilichao', 
      direccion: 'calle 8 # 11-81 Barrio Centenario', 
      direccionVisible: 'calle 8 # 11-81 Barrio Centenario, Santander de Quilichao', 
      lat: 2.99,
      lng: -76.48,
      administradora: 'gina alexandra armero', 
      telefono: '', 
      departamento: 'Cauca', 
      ciudad: 'Santander de Quilichao' 
    },

    { id: 'ca-02', 
      nombre: 'Popayán', 
      direccion: 'Calle 4 # 10-49 el cadillal', 
      direccionVisible: 'Calle 4 # 10-49 el cadillal, Popayán', 
      lat: 2.44,
      lng: -76.61,
      administradora: 'Yessica Serna', 
      telefono: '3209891670', 
      departamento: 'Cauca', 
      ciudad: 'Popayán' },

  // ── HUILA ────────────────────────────────────────────────────
    { id: 'hu-01', 
      nombre: 'Aipe', 
      direccion: 'Carrera 4 N° 2-102 Maria Auxiliadora', 
      direccionVisible: 'Carrera 4 N° 2-102 Maria Auxiliadora, Aipe', 
      lat: 3.21,
      lng: -75.25,
      administradora: 'Ana Marcela Murcia Paloma', 
      telefono: '3229449891', 
      departamento: 'Huila', 
      ciudad: 'Aipe' 
    },

    { id: 'hu-02', 
      nombre: 'Garzon', 
      direccion: 'calle 7 No. 12-39 barrio el Rosario enseguida de motos Auteco', 
      direccionVisible: 'calle 7 No. 12-39 barrio el Rosario enseguida de motos Auteco, Garzon', 
      lat: 2.19,
      lng: -75.62,
      administradora: 'Leidy Johanna Urbano Potosi', 
      telefono: '3228356688', 
      departamento: 'Huila', 
      ciudad: 'Garzon' 
    },

    { id: 'hu-03',
      nombre: 'La Plata', 
      direccion: 'Calle 7 N° 3-09 Local 2 Centro', 
      direccionVisible: 'Calle 7 N° 3-09 Local 2 Centro, La Plata', 
      lat: 2.39,
      lng: -75.89,
      administradora: 'Angie Paola Urbano Martinez', 
      telefono: '3226911894', 
      departamento: 'Huila', 
      ciudad: 'La Plata' },

    { id: 'hu-04', 
      nombre: 'Neiva', 
      direccion: 'Carrera 7 N° 14 - 42 Quirinal', 
      direccionVisible: 'Carrera 7 N° 14 - 42 Quirinal, Neiva', 
      lat: 2.93,
      lng: -75.28,
      administradora: 'Ana Cristina Cuellar Ospina', 
      telefono: '3206921292', 
      departamento: 'Huila', 
      ciudad: 'Neiva' 
    },

    { id: 'hu-09', 
      nombre: 'Pitalito', 
      direccion: 'Carrera 4 N° 10-69  Centro', 
      direccionVisible: 'Carrera 4 N° 10-69  Centro, Pitalito', 
      lat: 1.85,
      lng: -76.05,
      administradora: 'Gina Graciela Encizo Alvarez', 
      telefono: '3116465358', 
      departamento: 'Huila', 
      ciudad: 'Pitalito' },

  // ── PUTUMAYO ─────────────────────────────────────────────────
    { id: 'pu-01', 
      nombre: 'Mocoa', 
      direccion: 'Calle 4 N° 5-102 Homero Bajo', 
      direccionVisible: 'Calle 4 N° 5-102 Homero Bajo, Mocoa', 
      lat: 1.15,
      lng: -76.64,
      administradora: 'Yolanda Andrea Corboba Hoyos', 
      telefono: '3103332920', 
      departamento: 'Putumayo', 
      ciudad: 'Mocoa' },

  // ── META ──────────────────────────────────────────────────────
    { id: 'me-01', 
      nombre: 'Acacías', 
      direccion: 'CARRERA 20 # 13-59 BARRIO COOPERATIVO', 
      direccionVisible: 'CARRERA 20 # 13-59 BARRIO COOPERATIVO, Acacías', 
      lat: 3.99,
      lng: -73.76,
      administradora: 'KELLY ALEXANDRA CASTRO CARDENAS', 
      telefono: '606-3419500', 
      departamento: 'Meta', 
      ciudad: 'Acacías' 
    },

    { id: 'me-02', 
      nombre: 'Villavicencio',
      direccion: 'CARRERA  39 # 35-20 BARRIO BARZAL', 
      direccionVisible: 'CARRERA  39 # 35-20 BARRIO BARZAL, Villavicencio', 
      lat: 4.13,
      lng: -73.63,
      administradora: 'MARIA VALENTINA REY PARRA', 
      telefono: '606-3419500', 
      departamento: 'Meta', 
      ciudad: 'Villavicencio' },

  // ── SANTANDER ─────────────────────────────────────────────────
    { id: 'sa-01', 
      nombre: 'Bucaramaga', 
      direccion: 'Calle 36 # 22-30', 
      direccionVisible: 'Calle 36 # 22-30, Bucaramaga', 
      lat: 7.12,
      lng: -73.12,
      administradora: 'Sandra Noriega Grozo', 
      telefono: '315 3948469', 
      departamento: 'Santander', 
      ciudad: 'Bucaramaga' 
    },
    { id: 'sa-02', 
      nombre: 'San Gil', 
      direccion: 'Calle 19 # 7-17 Barrio Cristo Resucitado', 
      direccionVisible: 'Calle 19 # 7-17 Barrio Cristo Resucitado, San Gil', 
      lat: 6.55,
      lng: -73.13,
      administradora: 'Kendry Dayana Delgado', 
      telefono: '314 3292099', 
      departamento: 'Santander', 
      ciudad: 'San Gil' 
    },

  // ── CALDAS ────────────────────────────────────────────────────
    { id: 'cal-01', 
      nombre: 'Anserma', 
      direccion: 'Cra 4 # 15-28',
      direccionVisible: 'Cra 4 # 15-28, Anserma', 
      lat: 5.23,
      lng: -75.77,
      administradora: 'Claudia Patricia Arroyave Montes - Coordinadora De Cartera', 
      telefono: 'Depto Servicios 3217537333, (606) 3419500', 
      departamento: 'Caldas', 
      ciudad: 'Anserma' 
    },

    { id: 'cal-02', 
      nombre: 'Arauca', 
      direccion: 'Cra 3 #6a-18/ Piso 1 arauca caldas colombia ',
      direccionVisible: 'Cra 3 #6a-18/ Piso 1 arauca caldas colombia ', 
      lat: 5.08,
      lng: -75.65,
      administradora: 'Valencia Castro', 
      telefono: '', 
      departamento: 'Caldas', 
      ciudad: 'Arauca' 
    },

    { id: 'cal-03', 
      nombre: 'Belalcazar', 
      direccion: 'Cra 3 # 7-10', 
      direccionVisible: 'Cra 3 # 7-10, Belalcazar',
      lat: 5.0,
      lng: -75.81,
      administradora: 'Paula Andrea Rodriguez Garcia', 
      telefono: '', 
      departamento: 'Caldas', 
      ciudad: 'Belalcazar' 
    },

    { id: 'cal-04', 
      nombre: 'Chinchina', 
      direccion: 'Calle 13 # 8-35', 
      direccionVisible: 'Calle 13 # 8-35, Chinchina',
      lat: 4.98,
      lng: -75.6,
      administradora: 'Blanca Cielo Vasco Salcedo', 
      telefono: '3215716884', 
      departamento: 'Caldas', 
      ciudad: 'Chinchina' 
    },

    { id: 'cal-05', 
      nombre: 'Manizales', 
      direccion: 'Calle 45 # 23-41 Parque Cristo Rey', 
      direccionVisible: 'Calle 45 # 23-41 Parque Cristo Rey, Manizales',
      lat: 5.06,
      lng: -75.5,
      administradora: 'Dahiana Lorena Gonzalez Vargas', 
      telefono: '3206663993', 
      departamento: 'Caldas', 
      ciudad: 'Manizales' 
    },

    { id: 'cal-06', 
      nombre: 'Marmato', 
      direccion: 'Salida a Marmato 23', 
      direccionVisible: 'Salida a Marmato 23, Marmato',
      lat: 5.47,
      lng: -75.59,
      administradora: 'Luz Idalba Moreno Bolaños', 
      telefono: '3228147207', 
      departamento: 'Caldas', 
      ciudad: 'Marmato' 
    },

    { id: 'cal-07', 
      nombre: 'Neira', 
      direccion: 'Calle 8 # 10-18, Local 1', 
      direccionVisible: 'Calle 8 # 10-18, Local 1, Neira',
      lat: 5.16,
      lng: -75.52,
      administradora: 'Jacinto Luís Gonzalez Lopez', 
      telefono: '', 
      departamento: 'Caldas', 
      ciudad: 'Neira' 
    },

    { id: 'cal-08', 
      nombre: 'Pacora', 
      direccion: 'Carrera 4 # 4-36', 
      direccionVisible: 'Carrera 4 # 4-36 sector malpaso Pacora',
      lat: 5.52,
      lng: -75.45,
      administradora: 'Diana María González García', 
      telefono: '3228147221', 
      departamento: 'Caldas', 
      ciudad: 'Pacora' 
    },

    { id: 'cal-09', 
      nombre: 'Palestina', 
      direccion: 'Calle 8 # 7-26 Centro', 
      direccionVisible: 'Calle 8 # 7-26 Centro, Palestina',
      lat: 4.92,
      lng: -75.63,
      administradora: 'Yeraldine Martinez Pineda', 
      telefono: '3128378788', 
      departamento: 'Caldas', 
      ciudad: 'Palestina' 
    },

    { id: 'cal-10', 
      nombre: 'Riosucio', 
      direccion: 'Calle 6 # 7-21 Av El Cipres', 
      direccionVisible: 'Calle 6 # 7-21 Av El Cipres, Riosucio',
      lat: 5.42,
      lng: -75.7,
      administradora: 'Luz Adriana Patiño Palau', 
      telefono: '3206920037', 
      departamento: 'Caldas', 
      ciudad: 'Riosucio' 
    },

    { id: 'cal-11', 
      nombre: 'Risaralda', 
      direccion: 'Carrera 2 # 3-25 Centro', 
      direccionVisible: 'Carrera 2 # 3-25 Centro, Risaralda',
      lat: 5.16,
      lng: -75.76,
      administradora: 'Luz María Villada Montoya', 
      telefono: '3229446458', 
      departamento: 'Caldas', 
      ciudad: 'Risaralda' 
    },

    { id: 'cal-12', 
      nombre: 'Salamina', 
      direccion: 'Calle 7 # 8 14 La Octava O El Refugio', 
      direccionVisible: 'Calle 7 # 8 14 La Octava O El Refugio, Salamina',
      lat: 5.4,
      lng: -75.48,
      administradora: 'Erika Lorena Garcia Carmona', 
      telefono: '3229446455', 
      departamento: 'Caldas', 
      ciudad: 'Salamina' 
    },

    { id: 'cal-13', 
      nombre: 'San Lorenzo', 
      direccion: '', 
      direccionVisible: '', 
      lat: 5.45,
      lng: -75.3,
      administradora: 'Yulieth Emilse Bueno Bueno', 
      telefono: '', 
      departamento: 'Caldas', 
      ciudad: 'San Lorenzo' 
    },

    { id: 'cal-14', 
      nombre: 'Supia', 
      direccion: 'Carrera 6 # 33-38 Barrio La Pista', 
      direccionVisible: 'Carrera 6 # 33-38 Barrio La Pista, Supia',
      lat: 5.45,
      lng: -75.65,
      administradora: 'Luz Marina Bueno', 
      telefono: '', 
      departamento: 'Caldas', 
      ciudad: 'Supia' 
    },

    { id: 'cal-15', 
      nombre: 'Viterbo', 
      direccion: 'Calle 8 # 6-18', 
      direccionVisible: 'Calle 8 # 6-18, Viterbo',
      lat: 5.06,
      lng: -75.87,
      administradora: 'Jennifer Echeverry Giraldo', 
      telefono: '3208276786', 
      departamento: 'Caldas', 
      ciudad: 'Viterbo' 
    },
    { id: 'cal-16', 
      nombre: 'La Dorada', 
      direccion: 'CALLE 12 # 2-68 CENTRO', 
      direccionVisible: 'CALLE 12 # 2-68 CENTRO, La Dorada',
      lat: 5.45,
      lng: -74.66,
      administradora: 'Viviana Galindo Triviño', 
      telefono: '3164550991', 
      departamento: 'Caldas', 
      ciudad: 'La Dorada' },


  // ── ATLÁNTICO ─────────────────────────────────────────────────
    { id: 'at-01', 
      nombre: 'Barranquilla', 
      direccion: 'Calle 65b #38b-50 el recreo', 
      direccionVisible: 'Calle 65b #38b-50 el recreo, Barranquilla',
      lat: 10.98,
      lng: -74.79,
      administradora: 'Yoleidis Pino Urieles', 
      telefono: '3105563288, 3059641', 
      departamento: 'Atlántico', 
      ciudad: 'Barranquilla' 
    },

    { id: 'at-02', 
      nombre: 'Soledad', 
      direccion: 'Calle 65 carrera 9-40 Mall tu plaza local 105 - Soledad/Atlántico', 
      direccionVisible: 'Calle 65 carrera 9-40 Mall tu plaza local 105 - Soledad/Atlántico, Soledad',
      lat: 10.91,
      lng: -74.76,
      administradora: 'Valentina Andrea Manjarres Cañate', 
      telefono: '', 
      departamento: 'Atlántico', 
      ciudad: 'Soledad' 
    },

  // ── BOYACÁ ────────────────────────────────────────────────────
    { id: 'boy-01', 
      nombre: 'Puerto Boyacá', 
      direccion: 'CARRERA 4 # 11-60', 
      direccionVisible: 'CARRERA 4 # 11-60 BARRIO CENTRO, Puerto Boyacá',
      lat: 5.97,
      lng: -74.59,
      administradora: 'Laura Julieth Rubiano Campos', 
      telefono: '3147947963', 
      departamento: 'Boyacá', 
      ciudad: 'Puerto Boyacá' },

  // ── CHOCÓ ─────────────────────────────────────────────────────
    { id: 'ch-01', 
      nombre: 'San José del Palmar', 
      direccion: 'AV QUIBDO', 
      direccionVisible: 'AV QUIBDO, San José del Palmar',
      lat: 4.87,
      lng: -76.23,
      administradora: 'VEGA LERMA JASMIN', 
      telefono: '', 
      departamento: 'Chocó', 
      ciudad: 'San José del Palmar' },
];