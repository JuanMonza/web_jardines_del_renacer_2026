'use client';

import { useMemo, useState } from 'react';
import { Search, X, MapPin, Wind } from 'lucide-react';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import ObituaryCard from '@/components/cards/ObituaryCard';
import FadeIn from '@/components/animations/FadeIn';
import { OBITUARIOS_MOCK, getObituarySedeLabel } from '@/data/obituaries';

export default function ObituariosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sedeFilter, setSedeFilter] = useState('todas');

  const sedeOptions = useMemo(() => {
    const unique = new Map<string, string>();
    for (const obituary of OBITUARIOS_MOCK) {
      if (!unique.has(obituary.sede)) {
        unique.set(obituary.sede, getObituarySedeLabel(obituary));
      }
    }
    return Array.from(unique.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'es'));
  }, []);

  const filteredObituaries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return OBITUARIOS_MOCK.filter((obituary) => {
      const matchesName = obituary.nombre.toLowerCase().includes(query);
      const matchesSede = sedeFilter === 'todas' || obituary.sede === sedeFilter;
      return matchesName && matchesSede;
    });
  }, [searchQuery, sedeFilter]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background-light">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-300 to-transparent" />

      <PageHero
        title="Obituarios"
        subtitle="Un espacio para honrar y recordar a quienes han partido, acompañando a sus familias en la distancia."
        image="/images/images-baners/obituarios.webp"
        imageAlt="Obituarios Jardines del Renacer"
        className="relative z-10"
      />

      <section className="relative z-10 -mt-16 pb-20">
        <Container>
          {/* Controles de Búsqueda y Filtro */}
          <FadeIn delay={0.2}>
            <div className="glass rounded-2xl border border-primary/15 p-4 md:p-6 max-w-4xl mx-auto shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] lg:grid-cols-[1fr_1fr_auto] gap-4 items-center">
                
                {/* Campo de Búsqueda con Ícono */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-textLight" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre del ser querido..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white/80 py-3 pl-12 pr-4 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  />
                </div>

                {/* Selector de Sede con Ícono */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-textLight" />
                  <select
                    value={sedeFilter}
                    onChange={(e) => setSedeFilter(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-white/80 py-3 pl-12 pr-10 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                  >
                    <option value="todas">Todas las sedes</option>
                    {sedeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Botón para Limpiar Filtros */}
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSedeFilter('todas');
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!searchQuery && sedeFilter === 'todas'}
                  aria-label="Limpiar filtros de búsqueda"
                >
                  <X className="h-4 w-4" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>
          </FadeIn>
          {/* Resultados */}
          {filteredObituaries.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredObituaries.map((obituary, index) => (
                <FadeIn key={obituary.id} delay={index * 0.05}>
                  <ObituaryCard obituary={obituary} />
                </FadeIn>
              ))}
            </div>
          ) : (
            // Estado Vacío Mejorado
            <FadeIn delay={0.3}>
              <div className="mt-12 text-center py-20 glass rounded-2xl border border-primary/10">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                  <Wind className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display text-text">No se encontraron resultados</h3>
                <p className="mt-2 text-textLight max-w-md mx-auto">
                  Intenta ajustar los términos de búsqueda o selecciona "Todas las sedes" para ver todos los servicios activos.
                </p>
              </div>
            </FadeIn>
          )}
        </Container>
      </section>
    </main>
  );
}
