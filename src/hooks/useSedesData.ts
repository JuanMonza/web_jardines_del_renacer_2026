'use client';

import { useState, useEffect, useMemo } from 'react';
import { loadSedes, SEDES_UPDATED_EVENT } from '@/lib/sedesStorage';
import { computeDepartamentos, type Sede, type DepartamentoInfo } from '@/data/sedes';

/**
 * Devuelve las sedes y departamentos en tiempo real.
 * Se actualiza automáticamente cuando el admin guarda cambios,
 * tanto en la misma pestaña como en otras.
 */
export function useSedesData(): { sedes: Sede[]; departamentos: DepartamentoInfo[] } {
  const [sedes, setSedes] = useState<Sede[]>([]);

  useEffect(() => {
    const update = () => setSedes(loadSedes());
    update(); // carga inicial

    window.addEventListener(SEDES_UPDATED_EVENT, update);
    window.addEventListener('storage', update); // sincronización entre pestañas

    return () => {
      window.removeEventListener(SEDES_UPDATED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const departamentos = useMemo(() => computeDepartamentos(sedes), [sedes]);

  return { sedes, departamentos };
}
