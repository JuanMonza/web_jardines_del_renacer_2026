/**
 * Tipos para Obituarios - Jardines del Renacer
 */

export type ObituaryStatus = 'active' | 'scheduled' | 'finished' | 'draft';

export interface Obituary {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  fechaFallecimiento: string;
  foto: string;
  cedula: string;
  descripcion?: string;
  sala: string;
  ubicacionSala: string;
  inicioVelacion: string;
  cierreVelacion: string;
  sede: string;
  fotoPrincipal?: string;
  mensajeFamilia?: string;
  horarios?: string;
  videoUrl?: string;
  galeria?: string[];
  estado?: ObituaryStatus;
  permitirCondolencias?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  fechaInicio?: Date;
  fechaFin?: Date;
  // Nuevos campos
  direccionServicio?: string;
  direccionCementerio?: string;
  nombreCementerio?: string; // Nombre del cementerio destino final
  horaDestinoFinal?: string; // Hora de llegada al cementerio
  ubicacionMapa?: string; // Para el mapa de Google
  servicios?: string[]; // cafetería, florería, etc.
  // Campos de la misa/ceremonia
  tieneCeremonia?: boolean;
  nombreIglesia?: string;
  direccionIglesia?: string;
  horaCeremonia?: string;
  lugarCeremonia?: string; // Lugar de la misa
}

export interface Condolence {
  id: string;
  obituarioId: string;
  nombrePersona: string;
  email?: string;
  mensaje: string;
  fecha: Date;
  aprobado: boolean;
  ip?: string;
}

export interface ObituarySearchParams {
  query?: string;
  sala?: string;
  fecha?: string;
  estado?: ObituaryStatus;
}

export interface ObituaryFormData {
  nombre: string;
  fechaNacimiento: string;
  fechaFallecimiento: string;
  mensajeFamilia: string;
  sala: string;
  horarios: string;
  permitirCondolencias: boolean;
  fotoPrincipal?: File;
  videoUrl?: string;
  estado: ObituaryStatus;
}
