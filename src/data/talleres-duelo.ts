/**
 * Talleres de Acompañamiento en Duelo
 */

export interface TallerDuelo {
  id: string;
  fecha: string; // Ej: "25 DE JUNIO"
  titulo: string;
  lugar: string;
  activo: boolean; // Para mostrarlo u ocultarlo
}

// Por ahora, los datos viven aquí. En el futuro, vendrán de una base de datos.
export const TALLERES_DUELO: TallerDuelo[] = [
  { id: 'td-1', fecha: '25 DE JUNIO', titulo: 'Taller de duelo "Día del Padre"', lugar: 'Parque Conmemorativo Espiritual', activo: true },
  { id: 'td-2', fecha: '28 DE JULIO', titulo: 'Taller de duelo "Aún estás en mi corazón"', lugar: 'Sede Calarcá', activo: true },
  { id: 'td-3', fecha: '15 DE AGOSTO', titulo: 'Taller de duelo "Cometa - Globo"', lugar: 'Parque Conmemorativo Espiritual', activo: true },
  { id: 'td-4', fecha: '20 DE SEPTIEMBRE', titulo: 'Taller de duelo "Origami"', lugar: 'Día de Amor y Amistad', activo: true },
  { id: 'td-5', fecha: '31 DE OCTUBRE', titulo: 'Taller de duelo por pérdida perinatal o gestacional', lugar: 'Parque Conmemorativo', activo: false },
  { id: 'td-6', fecha: '18 DE NOVIEMBRE', titulo: 'Taller de duelo por pérdida de mascota', lugar: 'Medellín', activo: false },
  { id: 'td-7', fecha: '12 DE DICIEMBRE', titulo: 'Taller de duelo en fechas especiales (Navidad)', lugar: 'Parque Conmemorativo Espiritual', activo: false },
];

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

