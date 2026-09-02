import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AuraObituary = {
  id?: string;
  name?: string;
  surname?: string;
  dob?: string | null;
  dod?: string | null;
  sala?: string;
  timeStart?: string | null;
  timeEnd?: string | null;
  cemetery?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  massTime?: string | null;
  massChurch?: string | null;
  massChurchType?: string | null;
  massAddress?: string | null;
  sede?: {
    id?: string;
    nombre?: string;
    ciudad?: string;
    departamento?: string;
  } | null;
};

const AURA_PUBLIC_URL = (
  process.env.AURA_PUBLIC_URL || 'https://aura.jardinesdelrenacer.com'
).replace(/\/$/, '');

function toIsoDate(value?: string | null) {
  if (!value) return null;
  const isoMatch = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const colombiaMatch = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return colombiaMatch ? `${colombiaMatch[3]}-${colombiaMatch[2]}-${colombiaMatch[1]}` : null;
}

function toDateTime(date: string | null, time?: string | null) {
  const safeDate = date || new Date().toISOString().slice(0, 10);
  const safeTime = time && /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : '00:00';
  return `${safeDate}T${safeTime}`;
}

function toWebsiteObituary(obituary: AuraObituary) {
  const nombre = [obituary.name, obituary.surname].filter(Boolean).join(' ').trim();
  if (!obituary.id || !nombre) return null;

  const sedeNombre = obituary.sede?.nombre || 'Jardines del Renacer';
  const sedeUbicacion = [obituary.sede?.ciudad, obituary.sede?.departamento]
    .filter(Boolean)
    .join(', ');
  const ubicacionSala = sedeUbicacion
    ? `Sede ${sedeNombre} - ${sedeUbicacion}`
    : `Sede ${sedeNombre}`;
  const nacimiento = toIsoDate(obituary.dob) || toIsoDate(obituary.dod) || '1970-01-01';
  const fallecimiento = toIsoDate(obituary.dod) || new Date().toISOString().slice(0, 10);
  const ceremonia = [obituary.massChurchType, obituary.massChurch]
    .filter(Boolean)
    .join(' ')
    .trim();

  return {
    id: obituary.id,
    nombre,
    fechaNacimiento: nacimiento,
    fechaFallecimiento: fallecimiento,
    foto: '/images/fondo_obituarios.png',
    cedula: '',
    descripcion: 'Acompañamos a su familia y seres queridos en este momento.',
    sala: obituary.sala || 'Sala por confirmar',
    ubicacionSala,
    inicioVelacion: toDateTime(toIsoDate(obituary.dod), obituary.timeStart),
    cierreVelacion: toDateTime(toIsoDate(obituary.endDate) || toIsoDate(obituary.dod), obituary.timeEnd),
    sede: obituary.sede?.id || sedeNombre,
    ciudad: obituary.sede?.ciudad || '',
    mensajeFamilia: 'La familia agradece sus palabras de apoyo.',
    horarios: [obituary.timeStart, obituary.timeEnd].filter(Boolean).join(' - ') || 'Horario por confirmar',
    estado: 'active',
    permitirCondolencias: true,
    direccionServicio: obituary.massAddress || ubicacionSala,
    direccionCementerio: obituary.cemetery || undefined,
    nombreCementerio: obituary.cemetery || undefined,
    horaDestinoFinal: obituary.endTime || undefined,
    ubicacionMapa: obituary.massAddress || ubicacionSala,
    servicios: [],
    tieneCeremonia: Boolean(ceremonia),
    nombreIglesia: ceremonia || undefined,
    direccionIglesia: obituary.massAddress || undefined,
    horaCeremonia: obituary.massTime || undefined,
    lugarCeremonia: obituary.massChurchType || undefined,
  };
}

export async function GET() {
  try {
    const response = await fetch(`${AURA_PUBLIC_URL}/api/public/obituarios`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Aura respondio con ${response.status}`);
    }

    const payload = (await response.json()) as { success?: boolean; data?: AuraObituary[] };
    if (!payload.success || !Array.isArray(payload.data)) {
      throw new Error('Respuesta invalida de Aura');
    }

    const data = payload.data
      .map(toWebsiteObituary)
      .filter((obituary): obituary is NonNullable<typeof obituary> => Boolean(obituary));

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    console.error('No fue posible sincronizar obituarios desde Aura:', error);
    return NextResponse.json(
      { success: false, error: 'No fue posible consultar los obituarios publicados.', data: [] },
      { status: 502, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }
}
