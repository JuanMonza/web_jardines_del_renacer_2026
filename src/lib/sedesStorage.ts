import { SEDES, type Sede } from '@/data/sedes';

/** Nombre del evento custom para notificar cambios en la misma pestaña */
export const SEDES_UPDATED_EVENT = 'jdr:sedes-updated';

const STORAGE_KEY = 'jdr.admin.sedes.v1';

/** Lee sedes desde localStorage; usa el arreglo estático como fallback */
export function loadSedes(): Sede[] {
  if (typeof window === 'undefined') return SEDES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...SEDES];
    const parsed = JSON.parse(raw) as Sede[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...SEDES];
  } catch {
    return [...SEDES];
  }
}

/** Persiste sedes en localStorage y notifica a todos los listeners de la misma pestaña */
export function saveSedes(sedes: Sede[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sedes));
    // Notificar a otros componentes en la misma pestaña
    window.dispatchEvent(new CustomEvent(SEDES_UPDATED_EVENT));
  } catch {
    // Ignorar errores de cuota de almacenamiento
  }
}
