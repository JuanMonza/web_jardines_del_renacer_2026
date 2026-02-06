/**
 * Tipos para Clientes - Jardines del Renacer
 */

export type ClientStatus = 'active' | 'inactive' | 'suspended' | 'expired';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface Client {
  id: string;
  cedula: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  planId: string;
  planNombre: string;
  estado: ClientStatus;
  fechaInicio: Date;
  fechaExpiracion?: Date;
  beneficiarios?: Beneficiary[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Beneficiary {
  id: string;
  nombre: string;
  cedula: string;
  parentesco: string;
  fechaNacimiento: Date;
}

export interface Payment {
  id: string;
  clienteId: string;
  monto: number;
  fecha: Date;
  estado: PaymentStatus;
  metodoPago: 'tarjeta' | 'transferencia' | 'efectivo' | 'otro';
  referencia?: string;
  comprobante?: string;
  descripcion?: string;
}

export interface ClientLoginData {
  cedula: string;
}

export interface ClientDashboardData {
  client: Client;
  payments: Payment[];
  nextPayment?: Payment;
  planBenefits: string[];
}
