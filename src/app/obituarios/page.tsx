'use client';

import { useMemo, useState } from 'react';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/50">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Obituarios"
              subtitle="Honrando la memoria de nuestros seres queridos"
            />
          </FadeIn>

          {/* Buscador */}
          <FadeIn delay={0.2}>
            <div className="max-w-4xl mx-auto mt-8">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={sedeFilter}
                  onChange={(e) => setSedeFilter(e.target.value)}
                  className="px-4 py-3 rounded-lg glass border border-border text-text bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-w-[200px]"
                >
                  <option value="todas">Todas las sedes</option>
                  {sedeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {(searchQuery || sedeFilter !== 'todas') && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSedeFilter('todas');
                    }}
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-12 pb-20">
        <Container>
          {filteredObituaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredObituaries.map((obituary, index) => (
                <ObituaryCard 
                  key={obituary.id} 
                  obituary={obituary} 
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-textLight text-lg">
                No se encontraron obituarios con ese criterio
              </p>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
