/**
 * Interfaz que define la estructura de un objeto de sorteo.
 */
export interface Giveaway {
  id: string;
  /** Fecha del sorteo en formato ISO 8601 (YYYY-MM-DDTHH:mm:ss-05:00) */
  date: string;
  /** Título o nombre del premio principal del sorteo */
  title: string;
  /** Descripción corta o eslogan del sorteo */
  description: string;
  /** Ruta a la imagen promocional del sorteo */
  image: string;
  /** Información del ganador (opcional, para sorteos pasados) */
  winner?: {
    name: string;
    ticket?: string;
  };
}

/**
 * Array con la información de todos los sorteos del año.
 * Aquí es donde puedes editar fechas, premios e imágenes.
 * - El popup y la página de sorteos se alimentan automáticamente de aquí.
 * - Para que un sorteo aparezca en "Ganadores Anteriores", solo agrega la propiedad `winner`.
 */
export const giveawaysData: readonly Giveaway[] = [
  // Sorteos Pasados (Ejemplos)
  {
    id: 'sorteo-may-2026',
    date: '2026-05-20T19:00:00-05:00',
    title: 'Bono de Mercado de $200.000',
    description: 'Sorteo especial del Día de la Madre.',
    image: '/images/sorteos/sorteo-placeholder-1.webp',
    winner: { name: 'Ana María Giraldo' },
  },
  {
    id: 'sorteo-jun-2026',
    date: '2026-06-18T19:00:00-05:00',
    title: 'Freidora de Aire (Air Fryer)',
    description: 'Celebra el Día del Padre con este increíble premio.',
    image: '/images/sorteos/sorteo-placeholder-2.webp',
    winner: { name: 'Carlos Restrepo' },
  },
  // Próximos Sorteos (Desde el mes actual)
  {
    id: 'sorteo-jul-2026',
    date: '2026-07-16T19:00:00-05:00',
    title: '¡Renovamos tu cocina!',
    description: 'Actualiza tus datos y participa.',
    image: '/images/sorteos_img/images.jpg',
  },
  {
    id: 'sorteo-ago-2026',
    date: '2026-08-18T19:00:00-05:00',
    title: '¡Cambiamos tu celular!',
    description: 'Actualiza tus datos y participa.',
    image: '/images/sorteos_img/Pixel10_001.webp',
  },
  {
    id: 'sorteo-sep-2026',
    date: '2026-09-16T19:00:00-05:00',
    title: '¡Celebramos el Amor y la Amistad!',
    description: 'Celebra con un bono de regalo',
    image: '/images/sorteos_img/stocksnap-people-2587249_1280.jpg',
  },
  {
    id: 'sorteo-oct-2026',
    date: '2026-10-16T19:00:00-05:00',
    title: '¡El Tiempo y la Música ahora son tuyos!',
    description: 'Participa en nuestro sorteo de aniversario.',
    image: '/images/sorteos_img/F9negroZL02negro_800x.webp',
  },
 
  {
    id: 'sorteo-nov-2026',
    date: '2026-11-17T19:00:00-05:00',
    title: '¡Adelantamos la Navidad!',
    description: 'Participa en nuestro sorteo de aniversario.',
    image: '/images/sorteos_img/61moVuRyfBL._AC_UF894,1000_QL80_.jpg',
  },

  {
    id: 'sorteo-dic-2026',
    date: '2026-12-16T19:00:00-05:00',
    title: '¡La Navidad va por nuestra cuenta!',
    description: 'Participa en nuestro sorteo de aniversario.',
    image: '/images/sorteos_img/ecooter-e5lite-blanci-2.jpg',
  },

];

