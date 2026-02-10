/**
 * Datos de clientes de ejemplo para el sistema de pago
 * En producción, estos datos vendrían de una base de datos
 */

export interface ClientData {
  cedula: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  planId: string;
  planNombre: string;
  valorMensual: number;
  estado: 'activo' | 'inactivo';
}

export const mockClients: ClientData[] = [
  {
    cedula: '1234567890',
    nombre: 'Juan',
    apellido: 'Pérez García',
    email: 'juan.perez@email.com',
    telefono: '3001234567',
    direccion: 'Calle 123 #45-67, Bogotá',
    planId: 'excellence',
    planNombre: 'Excellence',
    valorMensual: 150000,
    estado: 'activo',
  },
  {
    cedula: '9876543210',
    nombre: 'María',
    apellido: 'González López',
    email: 'maria.gonzalez@email.com',
    telefono: '3109876543',
    direccion: 'Carrera 45 #12-34, Medellín',
    planId: 'premium',
    planNombre: 'Premium',
    valorMensual: 200000,
    estado: 'activo',
  },
  {
    cedula: '5555555555',
    nombre: 'Carlos',
    apellido: 'Rodríguez Martínez',
    email: 'carlos.rodriguez@email.com',
    telefono: '3205555555',
    direccion: 'Avenida 80 #56-78, Cali',
    planId: 'familiar',
    planNombre: 'Familiar',
    valorMensual: 120000,
    estado: 'activo',
  },
  {
    cedula: '1111111111',
    nombre: 'Ana',
    apellido: 'Ramírez Silva',
    email: 'ana.ramirez@email.com',
    telefono: '3151111111',
    direccion: 'Transversal 20 #30-40, Barranquilla',
    planId: 'exequial',
    planNombre: 'Exequial',
    valorMensual: 100000,
    estado: 'activo',
  },
  {
    cedula: '7777777777',
    nombre: 'Pedro',
    apellido: 'Sánchez Torres',
    email: 'pedro.sanchez@email.com',
    telefono: '3007777777',
    direccion: 'Diagonal 15 #22-33, Cartagena',
    planId: 'premium',
    planNombre: 'Premium',
    valorMensual: 200000,
    estado: 'activo',
  },
];

/**
 * Busca un cliente por número de cédula
 * @param cedula Número de cédula del cliente
 * @returns Datos del cliente o undefined si no se encuentra
 */
export function buscarClientePorCedula(cedula: string): ClientData | undefined {
  return mockClients.find(client => client.cedula === cedula);
}
