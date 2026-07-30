import { query } from '@/lib/db';
import { cleanDocument } from '@/lib/allyMembershipStorageDB';

export type MembershipClient = { cedula: string; nombre: string; apellido: string; email: string; telefono: string; estado: 'activo' | 'inactivo' };

export async function findActiveMembershipClient(cedula: string): Promise<MembershipClient | null> {
  const rows = await query<MembershipClient>('SELECT cedula, nombres AS nombre, apellidos AS apellido, email, telefono, estado FROM clientes_membresia WHERE cedula = ? AND estado = \'activo\' LIMIT 1', [cleanDocument(cedula)]);
  return rows[0] ?? null;
}
