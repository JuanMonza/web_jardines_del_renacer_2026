import { SEDES } from '@/data/sedes';
import type { Obituary } from '@/types/obituary';

const OBITUARIO_BACKGROUND_IMAGE = '/images/white-tulips-sunlight.jpg';

function getSedeById(sedeId: string) {
  return SEDES.find((sede) => sede.id === sedeId) ?? SEDES[0];
}

function buildSedeLocationText(sedeId: string) {
  const sede = getSedeById(sedeId);
  return `Sede ${sede.nombre} - ${sede.ciudad}, ${sede.departamento}`;
}

function buildSedeAddressText(sedeId: string) {
  const sede = getSedeById(sedeId);
  return `${sede.direccion}, ${sede.ciudad}, ${sede.departamento}, Colombia`;
}

export function getObituarySedeLabel(obituary: Obituary) {
  return buildSedeLocationText(obituary.sede);
}

export function buildObituaryMapQuery(obituary: Obituary) {
  return obituary.direccionServicio || obituary.ubicacionMapa || obituary.ubicacionSala;
}

export const OBITUARIOS_MOCK: Obituary[] = [
  {
    id: '1',
    nombre: 'Maria Gonzalez Perez',
    fechaNacimiento: '1950-03-15',
    fechaFallecimiento: '2026-01-28',
    foto: OBITUARIO_BACKGROUND_IMAGE,
    cedula: '1234567890',
    descripcion:
      'Con profundo dolor despedimos a nuestra querida madre, abuela y amiga. Su amor y dedicacion permaneceran por siempre en nuestros corazones.',
    sala: 'Sala de la Paz',
    ubicacionSala: buildSedeLocationText('rs-07'),
    inicioVelacion: '2026-01-28T09:00',
    cierreVelacion: '2026-01-28T18:00',
    sede: 'rs-07',
    mensajeFamilia:
      'Con profundo dolor despedimos a nuestra querida madre, abuela y amiga.',
    horarios: '9:00 AM - 6:00 PM',
    estado: 'active',
    permitirCondolencias: true,
    direccionServicio: buildSedeAddressText('rs-07'),
    direccionCementerio: 'Parque Cementerio Jardines del Renacer, Pereira, Colombia',
    horaDestinoFinal: '14:00',
    ubicacionMapa: buildSedeAddressText('rs-07'),
    servicios: ['Cafeteria', 'Floreria', 'Estacionamiento', 'Wifi', 'Capilla Ecumenica'],
    createdAt: new Date('2026-01-28T08:00:00'),
    updatedAt: new Date('2026-01-28T08:00:00'),
  },
  {
    id: '2',
    nombre: 'Thania Rocio Reyes Neri',
    fechaNacimiento: '1989-12-30',
    fechaFallecimiento: '2026-04-09',
    foto: OBITUARIO_BACKGROUND_IMAGE,
    cedula: '9876543210',
    descripcion: 'En memoria de una vida llena de amor y alegria.',
    sala: 'Sala Magna 4',
    ubicacionSala: buildSedeLocationText('an-01'),
    inicioVelacion: '2026-04-10T14:00',
    cierreVelacion: '2026-04-11T13:00',
    sede: 'an-01',
    mensajeFamilia: 'Su luz seguira brillando en nuestros corazones.',
    horarios: '2:00 PM - 1:00 PM',
    estado: 'active',
    permitirCondolencias: true,
    direccionServicio: buildSedeAddressText('an-01'),
    direccionCementerio: 'Parque Cementerio Jardines del Renacer, Medellin, Colombia',
    horaDestinoFinal: '15:00',
    ubicacionMapa: buildSedeAddressText('an-01'),
    servicios: [
      'Cafeteria',
      'Floreria',
      'Crematorio',
      'Estacionamiento',
      'Wifi',
      'Accesibilidad',
      'Nichos',
      'Capilla Ecumenica',
    ],
    createdAt: new Date('2026-04-09T12:00:00'),
    updatedAt: new Date('2026-04-10T07:00:00'),
  },
  {
    id: '3',
    nombre: 'Carlos Alberto Ramirez',
    fechaNacimiento: '1948-11-05',
    fechaFallecimiento: '2026-04-08',
    foto: OBITUARIO_BACKGROUND_IMAGE,
    cedula: '5566778899',
    descripcion: 'Recordamos su legado de servicio, respeto y amor por su familia.',
    sala: 'Sala Serenidad',
    ubicacionSala: buildSedeLocationText('cu-04'),
    inicioVelacion: '2026-04-09T08:00',
    cierreVelacion: '2026-04-10T10:30',
    sede: 'cu-04',
    mensajeFamilia: 'Gracias por acompanarnos en este momento de despedida.',
    horarios: '8:00 AM - 10:30 AM',
    estado: 'active',
    permitirCondolencias: true,
    direccionServicio: buildSedeAddressText('cu-04'),
    direccionCementerio: 'Parque Cementerio Jardines del Renacer, Bogota, Colombia',
    horaDestinoFinal: '11:00',
    ubicacionMapa: buildSedeAddressText('cu-04'),
    servicios: ['Cafeteria', 'Floreria', 'Estacionamiento', 'Wifi', 'Capilla Ecumenica'],
    createdAt: new Date('2026-04-08T14:00:00'),
    updatedAt: new Date('2026-04-09T09:00:00'),
  },
];

export function getObituaryById(id: string) {
  return OBITUARIOS_MOCK.find((obituary) => obituary.id === id) ?? null;
}
