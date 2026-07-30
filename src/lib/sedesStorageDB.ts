import { execute, query } from '@/lib/db';
import type { Sede } from '@/data/sedes';
import { getCiudadImagePath } from '@/config/ciudades';

type SedeRow = {
  id: string; nombre: string; direccion: string | null; direccion_visible: string | null;
  administradora: string | null; lat: number | string | null; lng: number | string | null;
  telefono: string | null; foto_url: string | null; departamento: string; ciudad: string; estado_operativo: Sede['estadoOperativo'] | null;
};

const columns = 'id, nombre, direccion, direccion_visible, administradora, lat, lng, telefono, foto_url, departamento, ciudad, estado_operativo';
const mapSede = (row: SedeRow): Sede => ({ id: row.id, nombre: row.nombre, direccion: row.direccion ?? '', direccionVisible: row.direccion_visible ?? '', administradora: row.administradora ?? '', lat: Number(row.lat ?? 0), lng: Number(row.lng ?? 0), telefono: row.telefono ?? '', fotoUrl: row.foto_url ?? '', departamento: row.departamento, ciudad: row.ciudad, estadoOperativo: row.estado_operativo ?? 'Activa' });

export async function getSedesFromDB() {
  const rows = await query<SedeRow>(`SELECT ${columns} FROM sedes WHERE activa = TRUE ORDER BY departamento, ciudad, nombre`);
  return rows.map(mapSede);
}

function normalize(input: Partial<Sede>) {
  return {
    nombre: String(input.nombre ?? '').trim(), departamento: String(input.departamento ?? '').trim(), ciudad: String(input.ciudad ?? '').trim(), direccion: String(input.direccion ?? '').trim(), direccionVisible: String(input.direccionVisible ?? '').trim(), administradora: String(input.administradora ?? '').trim(), telefono: String(input.telefono ?? '').trim(), fotoUrl: String(input.fotoUrl ?? '').trim(), lat: Number(input.lat ?? 0), lng: Number(input.lng ?? 0), estadoOperativo: input.estadoOperativo === 'Cerrada temporalmente' || input.estadoOperativo === 'Próxima apertura' || input.estadoOperativo === 'En revisión' ? input.estadoOperativo : 'Activa' as const,
  };
}

export async function createSedeInDB(input: Partial<Sede>) {
  const sede = normalize(input);
  if (!sede.nombre || !sede.departamento || !sede.ciudad) throw new Error('Nombre, departamento y ciudad son obligatorios.');
  const prefix = sede.departamento.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').slice(0, 3).toLowerCase() || 'sed';
  const id = `${prefix}-${Date.now().toString(36)}`.slice(0, 20);
  const fotoUrl = sede.fotoUrl || getCiudadImagePath(sede.departamento, sede.ciudad) || '';
  await execute('INSERT INTO sedes (id, nombre, departamento, ciudad, direccion, direccion_visible, administradora, telefono, foto_url, lat, lng, estado_operativo, activa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)', [id, sede.nombre, sede.departamento, sede.ciudad, sede.direccion, sede.direccionVisible || null, sede.administradora || null, sede.telefono || null, fotoUrl || null, sede.lat, sede.lng, sede.estadoOperativo]);
  return { id, ...sede, fotoUrl } as Sede;
}

export async function updateSedeInDB(id: string, input: Partial<Sede>) {
  const sede = normalize(input);
  if (!sede.nombre || !sede.departamento || !sede.ciudad) throw new Error('Nombre, departamento y ciudad son obligatorios.');
  const fotoUrl = sede.fotoUrl || getCiudadImagePath(sede.departamento, sede.ciudad) || '';
  const result = await execute('UPDATE sedes SET nombre = ?, departamento = ?, ciudad = ?, direccion = ?, direccion_visible = ?, administradora = ?, telefono = ?, foto_url = ?, lat = ?, lng = ?, estado_operativo = ? WHERE id = ? AND activa = TRUE', [sede.nombre, sede.departamento, sede.ciudad, sede.direccion, sede.direccionVisible || null, sede.administradora || null, sede.telefono || null, fotoUrl || null, sede.lat, sede.lng, sede.estadoOperativo, id]);
  return result.affectedRows ? ({ id, ...sede, fotoUrl } as Sede) : null;
}

export async function deactivateSedeInDB(id: string) {
  const result = await execute('UPDATE sedes SET activa = FALSE WHERE id = ? AND activa = TRUE', [id]);
  return result.affectedRows > 0;
}
