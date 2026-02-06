/**
 * Tipos generales compartidos - Jardines del Renacer
 */

export interface ContactFormData {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

export interface VisitFormData {
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  numeroPersonas: number;
  mensaje?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}
