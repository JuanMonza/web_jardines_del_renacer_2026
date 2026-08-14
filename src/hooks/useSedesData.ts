'use client';

import { useState, useEffect, useMemo } from 'react';
import { SEDES_UPDATED_EVENT } from '@/lib/sedesStorage';
import { SEDES, computeDepartamentos, type Sede, type DepartamentoInfo } from '@/data/sedes';

/**
 * Devuelve las sedes y departamentos en tiempo real.
 * Se actualiza automáticamente cuando el admin guarda cambios,
 * tanto en la misma pestaña como en otras.
 */
export function useSedesData(): { sedes: Sede[]; departamentos: DepartamentoInfo[] } {
  // El catálogo local permite que las páginas públicas nunca empiecen vacías.
  // Cuando MySQL responde, sus datos reemplazan este respaldo de inmediato.
  const [sedes, setSedes] = useState<Sede[]>(SEDES);

  useEffect(() => {
    let mounted = true;
    const update = async () => {
      try {
        const response = await fetch('/api/sedes/public');
        const payload = await response.json() as { data?: Sede[] };
        if (mounted && response.ok) setSedes(payload.data ?? []);
      } catch { /* Se mantiene el catálogo de respaldo hasta que la API esté disponible. */ }
    };
    void update();

    const channel = typeof BroadcastChannel !== 'undefined'
      ? new BroadcastChannel('jdr-sedes')
      : null;
    channel?.addEventListener('message', update);

    window.addEventListener(SEDES_UPDATED_EVENT, update);
    window.addEventListener('storage', update); // sincronización entre pestañas

    return () => {
      mounted = false;
      channel?.removeEventListener('message', update);
      channel?.close();
      window.removeEventListener(SEDES_UPDATED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const departamentos = useMemo(() => computeDepartamentos(sedes), [sedes]);

  return { sedes, departamentos };
}
