import {
  TALLERES_DUELO,
  TALLERES_DUELO_ALBUMS,
  type DueloGalleryAlbum,
  type DueloGalleryImage,
  type TallerDuelo,
} from '@/data/talleres-duelo';

const TALLERES_STORAGE_KEY = 'jdr.admin.talleres-duelo.v1';
const ALBUMS_STORAGE_KEY = 'jdr.admin.talleres-duelo.albumes.v1';

export const TALLERES_DUELO_UPDATED_EVENT = 'jdr:talleres-duelo-updated';

function cloneTalleres() {
  return TALLERES_DUELO.map((taller) => ({ ...taller }));
}

function cloneAlbums() {
  return TALLERES_DUELO_ALBUMS.map((album) => ({
    ...album,
    images: album.images.map((image) => ({ ...image })),
  }));
}

function readArray<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function writeArray<T>(key: string, records: T[]) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(key, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(TALLERES_DUELO_UPDATED_EVENT));
}

function normalizeTaller(record: Partial<TallerDuelo>): TallerDuelo | null {
  if (!record.id || !record.fecha || !record.titulo || !record.lugar) {
    return null;
  }

  return {
    id: record.id,
    fecha: record.fecha,
    fechaISO: record.fechaISO,
    titulo: record.titulo,
    lugar: record.lugar,
    activo: Boolean(record.activo),
  };
}

function normalizeImage(record: Partial<DueloGalleryImage>): DueloGalleryImage | null {
  if (!record.id || !record.src || !record.alt) {
    return null;
  }

  return {
    id: record.id,
    src: record.src,
    alt: record.alt,
    caption: record.caption ?? '',
  };
}

function normalizeAlbum(record: Partial<DueloGalleryAlbum>): DueloGalleryAlbum | null {
  if (!record.id || !record.tallerId || !record.titulo || !record.fecha || !record.fechaISO) {
    return null;
  }

  const now = new Date().toISOString();
  const images = Array.isArray(record.images)
    ? record.images
        .map((image) => normalizeImage(image))
        .filter(Boolean) as DueloGalleryImage[]
    : [];

  return {
    id: record.id,
    tallerId: record.tallerId,
    titulo: record.titulo,
    fecha: record.fecha,
    fechaISO: record.fechaISO,
    descripcion: record.descripcion ?? '',
    activo: Boolean(record.activo),
    images,
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
  };
}

export function loadTalleresDuelo(): TallerDuelo[] {
  const stored = readArray<Partial<TallerDuelo>>(TALLERES_STORAGE_KEY, cloneTalleres());
  const normalized = stored.map((record) => normalizeTaller(record)).filter(Boolean) as TallerDuelo[];
  return normalized.length > 0 ? normalized : cloneTalleres();
}

export function saveTalleresDuelo(talleres: TallerDuelo[]) {
  writeArray(TALLERES_STORAGE_KEY, talleres);
}

export function loadDueloAlbums(): DueloGalleryAlbum[] {
  const stored = readArray<Partial<DueloGalleryAlbum>>(ALBUMS_STORAGE_KEY, cloneAlbums());
  const normalized = stored.map((record) => normalizeAlbum(record)).filter(Boolean) as DueloGalleryAlbum[];
  return normalized.sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));
}

export function saveDueloAlbums(albums: DueloGalleryAlbum[]) {
  writeArray(ALBUMS_STORAGE_KEY, albums);
}

export function getStoredActiveTalleres(): TallerDuelo[] {
  return loadTalleresDuelo().filter((taller) => taller.activo);
}

export function getTallerTitle(talleres: TallerDuelo[], tallerId: string) {
  return talleres.find((taller) => taller.id === tallerId)?.titulo ?? 'Taller no relacionado';
}
