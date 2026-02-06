/**
 * Índice central de tipos - Jardines del Renacer
 * Exporta todos los tipos desde un solo punto de entrada
 */

// Obituarios
export type {
  Obituary,
  ObituaryStatus,
  Condolence,
  ObituarySearchParams,
  ObituaryFormData,
} from './obituary';

// Planes
export type {
  Plan,
  PlanCategory,
  PlanQuote,
} from './plan';

// Clientes
export type {
  Client,
  ClientStatus,
  PaymentStatus,
  Beneficiary,
  Payment,
} from './client';

// Comunes
export type {
  ContactFormData,
  VisitFormData,
  ApiResponse,
  PaginatedResponse,
} from './common';
