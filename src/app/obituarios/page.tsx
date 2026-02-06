'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ObituaryCard from '@/components/cards/ObituaryCard';
import FadeIn from '@/components/animations/FadeIn';
import type { Obituary } from '@/types/obituary';

// Datos de ejemplo - esto conectarás a tu DB
const mockObituaries: Obituary[] = [
  {
    id: '1',
    nombre: 'María González Pérez',
    fechaNacimiento: '1950-03-15',
    fechaFallecimiento: '2026-01-28',
    foto: '/images/obituarios/maria.jpg',
    cedula: '1234567890',
    descripcion: 'Con profundo dolor despedimos a nuestra querida madre, abuela y amiga. Su amor y dedicación permanecerán por siempre en nuestros corazones.',
    sala: 'Sala de la Paz',
    ubicacionSala: 'Sede Principal, Primer Piso',
    inicioVelacion: '2026-01-28T09:00',
    cierreVelacion: '2026-01-28T18:00',
    sede: 'principal',
    mensajeFamilia: 'Con profundo dolor despedimos a nuestra querida madre, abuela y amiga.',
    horarios: '9:00 AM - 6:00 PM',
    estado: 'active' as const,
    permitirCondolencias: true,
    direccionServicio: 'Calle Principal 123, Centro',
    direccionCementerio: 'Jardines del Descanso, Avenida Norte 456',
    horaDestinoFinal: '14:00',
    ubicacionMapa: 'Sede Principal Jardines del Renacer',
    servicios: ['Cafetería', 'Florería', 'Estacionamiento', 'Wifi', 'Capilla Ecuménica'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    nombre: 'THANIA ROCIO REYES NERI',
    fechaNacimiento: '1989-12-30',
    fechaFallecimiento: '2025-06-11',
    foto: '/images/obituarios/placeholder.jpg',
    cedula: '9876543210',
    descripcion: 'En memoria de una vida llena de amor y alegría',
    sala: 'Sala Magna 4',
    ubicacionSala: 'San Pedro Garza García - Agencia Capilla Martínez',
    inicioVelacion: '2025-06-12T14:00',
    cierreVelacion: '2025-06-13T13:00',
    sede: 'norte',
    mensajeFamilia: 'Su luz seguirá brillando en nuestros corazones',
    horarios: '2:00 PM - 1:00 PM',
    estado: 'active' as const,
    permitirCondolencias: true,
    direccionServicio: 'Del servicio ceremonial: Av. Principal 789',
    direccionCementerio: 'Cementerio Jardines del Descanso: Carrera 45 #123',
    horaDestinoFinal: '14:00',
    ubicacionMapa: 'San Pedro Garza García',
    servicios: ['Cafetería', 'Florería', 'Crematorio', 'Estacionamiento', 'Wifi', 'Accesibilidad', 'Nichos', 'Capilla Ecuménica'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Agrega más obituarios de ejemplo
];

export default function ObituariosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sedeFilter, setSedeFilter] = useState('todas');
  const [filteredObituaries, setFilteredObituaries] = useState(mockObituaries);

  // Filtrar automáticamente cuando cambian los valores
  useEffect(() => {
    const filtered = mockObituaries.filter(obit => {
      const matchesName = obit.nombre.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSede = sedeFilter === 'todas' || obit.sede === sedeFilter;
      return matchesName && matchesSede;
    });
    setFilteredObituaries(filtered);
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
                  <option value="principal">Sede Principal</option>
                  <option value="norte">Sede Norte</option>
                  <option value="sur">Sede Sur</option>
                  <option value="oriente">Sede Oriente</option>
                  <option value="occidente">Sede Occidente</option>
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
