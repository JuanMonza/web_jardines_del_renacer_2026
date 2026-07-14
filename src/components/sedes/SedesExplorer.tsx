'use client';

import { useState, useMemo } from 'react';
import type { DepartamentoInfo, Sede } from '@/data/sedes';
import DepartamentoFlipCard from '@/components/cards/DepartamentoFlipCard';
import SedeCard from '@/components/cards/SedeCard';
import { useSedesData } from '@/hooks/useSedesData';

interface SedesExplorerProps {
  departamentos: DepartamentoInfo[];
  sedes: Sede[];
}

export default function SedesExplorer({ departamentos: ssrDepts, sedes: ssrSedes }: SedesExplorerProps) {
  const { sedes: liveSedes, departamentos: liveDepts } = useSedesData();

  // Usa datos en vivo una vez hidratado, datos SSR como fallback inicial
  const sedes = liveSedes.length > 0 ? liveSedes : ssrSedes;
  const departamentos = liveSedes.length > 0 ? liveDepts : ssrDepts;
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();

  const filteredDepartamentos = useMemo(() => {
    if (!trimmed) return departamentos;
    return departamentos.filter(
      (dep) =>
        dep.nombre.toLowerCase().includes(trimmed) ||
        dep.ciudades.some((c: string) => c.toLowerCase().includes(trimmed))
    );
  }, [trimmed, departamentos]);

  const matchingSedes = useMemo(() => {
    if (!trimmed) return [];
    return sedes.filter(
      (s) =>
        s.nombre.toLowerCase().includes(trimmed) ||
        s.ciudad.toLowerCase().includes(trimmed) ||
        s.departamento.toLowerCase().includes(trimmed) ||
        s.direccion.toLowerCase().includes(trimmed)
    );
  }, [trimmed, sedes]);

  /* Cuando hay búsqueda y el término coincide mejor con sedes individuales
     que con departamentos, mostramos las sedes directamente */
  const showSedes = trimmed !== '' && matchingSedes.length > 0 && filteredDepartamentos.length === 0;
  const showDepts = !showSedes;

  const resultCount = showSedes ? matchingSedes.length : filteredDepartamentos.length;
  const resultLabel = showSedes
    ? `${resultCount} sede${resultCount !== 1 ? 's' : ''} encontrada${resultCount !== 1 ? 's' : ''}`
    : `${resultCount} departamento${resultCount !== 1 ? 's' : ''} encontrado${resultCount !== 1 ? 's' : ''}`;

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Buscador ─────────────────────────────────────────── */}
        <div className="mb-10 max-w-xl mx-auto">
          <div className="relative">
            {/* Icono lupa */}
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
            </span>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por sede, ciudad o departamento…"
              aria-label="Buscar sede o departamento"
              className="w-full glass rounded-2xl pl-12 pr-5 py-3.5 text-text placeholder:text-textLight text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
            />

            {/* Botón limpiar */}
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-textLight hover:text-primary transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Contador de resultados */}
          {trimmed && (
            <p className="text-textLight text-xs mt-2.5 text-center">
              {resultCount === 0
                ? 'Sin resultados. Intenta con otro término.'
                : resultLabel}
            </p>
          )}
        </div>

        {/* ── Departamentos ────────────────────────────────────── */}
        {showDepts && filteredDepartamentos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDepartamentos.map((dep) => (
              <DepartamentoFlipCard
                key={dep.slug}
                nombre={dep.nombre}
                slug={dep.slug}
                count={dep.count}
                ciudades={dep.ciudades}
              />
            ))}
          </div>
        )}

        {/* ── Sedes individuales (resultado directo de búsqueda) ── */}
        {showSedes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingSedes.map((sede) => (
              <SedeCard key={sede.id} sede={sede} />
            ))}
          </div>
        )}

        {/* ── Estado vacío ──────────────────────────────────────── */}
        {trimmed && resultCount === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <div>
              <p className="text-text font-semibold">No encontramos resultados</p>
              <p className="text-textLight text-sm mt-1">
                Intenta buscar por nombre de sede, ciudad o departamento.
              </p>
            </div>
            <button
              onClick={() => setQuery('')}
              className="mt-2 text-primary text-sm font-semibold hover:underline"
            >
              Ver todos los departamentos
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
