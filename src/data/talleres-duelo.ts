/**
 * Talleres de Acompañamiento en Duelo
 */

export interface TallerDuelo {
  id: string;
  fecha: string; // Ej: "25 DE JUNIO"
  fechaISO?: string; // Ej: "2026-06-25" para ordenar y relacionar albumes
  titulo: string;
  lugar: string;
  activo: boolean; // Para mostrarlo u ocultarlo
}

export interface DueloGalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface DueloGalleryAlbum {
  id: string;
  tallerId: string;
  titulo: string;
  fecha: string;
  fechaISO: string;
  descripcion?: string;
  activo: boolean;
  images: DueloGalleryImage[];
  createdAt: string;
  updatedAt: string;
}

// Por ahora, los datos viven aquí. En el futuro, vendrán de una base de datos.
export const TALLERES_DUELO: TallerDuelo[] = [
  { id: 'td-1', fecha: '25 DE JUNIO', fechaISO: '2026-06-25', titulo: 'Taller de duelo "Día del Padre"', lugar: 'Parque Conmemorativo Espiritual', activo: true },
  { id: 'td-2', fecha: '28 DE JULIO', fechaISO: '2026-07-28', titulo: 'Taller de duelo "Aún estás en mi corazón"', lugar: 'Sede Calarcá', activo: true },
  { id: 'td-3', fecha: '15 DE AGOSTO', fechaISO: '2026-08-15', titulo: 'Taller de duelo "Cometa - Globo"', lugar: 'Parque Conmemorativo Espiritual', activo: true },
  { id: 'td-4', fecha: '20 DE SEPTIEMBRE', fechaISO: '2026-09-20', titulo: 'Taller de duelo "Origami"', lugar: 'Día de Amor y Amistad', activo: true },
  { id: 'td-5', fecha: '31 DE OCTUBRE', fechaISO: '2026-10-31', titulo: 'Taller de duelo por pérdida perinatal o gestacional', lugar: 'Parque Conmemorativo', activo: false },
  { id: 'td-6', fecha: '18 DE NOVIEMBRE', fechaISO: '2026-11-18', titulo: 'Taller de duelo por pérdida de mascota', lugar: 'Medellín', activo: false },
  { id: 'td-7', fecha: '12 DE DICIEMBRE', fechaISO: '2026-12-12', titulo: 'Taller de duelo en fechas especiales (Navidad)', lugar: 'Parque Conmemorativo Espiritual', activo: false },
];

export const TALLERES_DUELO_ALBUMS: DueloGalleryAlbum[] = [];

/**
 * Devuelve solo los talleres que están marcados como activos.
 * @returns {TallerDuelo[]}
 */
export function getTalleresActivos(): TallerDuelo[] {
  return TALLERES_DUELO.filter(taller => taller.activo);
}

/**
 * Devuelve todos los talleres para el panel de administración.
 * @returns {TallerDuelo[]}
 */
export function getAllTalleres(): TallerDuelo[] {
  return TALLERES_DUELO;
}

