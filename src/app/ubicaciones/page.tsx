'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Input from '@/components/ui/Input';
import FadeIn from '@/components/animations/FadeIn';

interface Ubicacion {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  tipo: 'cementerio' | 'agencia' | 'mausoleo';
  lat: number;
  lng: number;
  imagen: string;
  servicios: string[];
}

const ubicaciones: Ubicacion[] = [
  {
    id: '1',
    nombre: 'Cementerio Jardines del Tiempo',
    direccion: 'Avenida 400, Parque Hundido, Sixto Gómez Palacios, Cija, México',
    ciudad: 'México',
    telefono: '(55) 1234 5678',
    tipo: 'cementerio',
    lat: 19.4326,
    lng: -99.1332,
    imagen: '/images/ubicaciones/cementerio1.jpg',
    servicios: ['Panteón', 'Capilla', 'Cremación']
  },
  {
    id: '2',
    nombre: 'Agencia Lomas Memorial',
    direccion: 'Carr. México-Toluca 5250, La Rosita, El Yaqui, Cuajimalpa de Morelos, 05340 Ciudad de México, CDMX, México',
    ciudad: 'México',
    telefono: '(55) 0800 0000',
    tipo: 'agencia',
    lat: 19.3910,
    lng: -99.2837,
    imagen: '/images/ubicaciones/agencia1.jpg',
    servicios: ['Mausoleos', 'Agencia', 'Velación']
  },
  {
    id: '3',
    nombre: 'Cementerio Jardines del Carmen',
    direccion: 'C. Decima Octava, Braulio Fernández Aguirre, Torreón, Coahuila, México',
    ciudad: 'Torreón',
    telefono: '(871) 682 3126',
    tipo: 'cementerio',
    lat: 25.5428,
    lng: -103.4068,
    imagen: '/images/ubicaciones/cementerio2.jpg',
    servicios: ['Cementerio', 'Capilla']
  },
  {
    id: '4',
    nombre: 'Cementerio Jardines Eternos',
    direccion: 'MARISTA Y DURANGO NO. 104, COL. JOSÉ LÓPEZ PORTILLO GÓMEZ PALACIO, DURANGO',
    ciudad: 'Durango',
    telefono: '(618) 682 3126',
    tipo: 'cementerio',
    lat: 25.5672,
    lng: -103.4972,
    imagen: '/images/ubicaciones/cementerio3.jpg',
    servicios: ['Cementerio', 'Capilla']
  },
  {
    id: '5',
    nombre: 'Agencia El Carmen',
    direccion: 'Av. México 2670, Ladrón de Guevara, 44600 Guadalajara, Jal., México',
    ciudad: 'Guadalajara',
    telefono: '(33) 6401 415',
    tipo: 'agencia',
    lat: 20.6737,
    lng: -103.3477,
    imagen: '/images/ubicaciones/agencia2.jpg',
    servicios: ['Agencia', 'Velación', 'Cafetería']
  },
  {
    id: '6',
    nombre: 'Cementerio San Ignacio',
    direccion: 'Av. Abelardo Louise Rodríguez, 20126 San Ignacio, Aguascalientes, México',
    ciudad: 'Aguascalientes',
    telefono: '(449) 123 4567',
    tipo: 'cementerio',
    lat: 21.8853,
    lng: -102.2916,
    imagen: '/images/ubicaciones/cementerio4.jpg',
    servicios: ['Cementerio', 'Capilla', 'Jardines']
  },
];

export default function UbicacionesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [selectedUbicacion, setSelectedUbicacion] = useState<Ubicacion | null>(null);

  const filteredUbicaciones = ubicaciones.filter(ubicacion => {
    const matchesSearch = ubicacion.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ubicacion.ciudad.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTipo = tipoFilter === 'todos' || ubicacion.tipo === tipoFilter;
    return matchesSearch && matchesTipo;
  });

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/50">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Ubicaciones"
              subtitle="Encuentra nuestras sedes y cementerios en todo el país"
            />
          </FadeIn>

          {/* Filtros */}
          <FadeIn delay={0.2}>
            <div className="max-w-4xl mx-auto mt-8 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Buscar por ubicación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setTipoFilter('todos')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      tipoFilter === 'todos'
                        ? 'glass border-2 border-primary text-primary'
                        : 'glass border border-border text-text hover:border-primary/50'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTipoFilter('cementerio')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      tipoFilter === 'cementerio'
                        ? 'glass border-2 border-primary text-primary'
                        : 'glass border border-border text-text hover:border-primary/50'
                    }`}
                  >
                    Cementerio
                  </button>
                  <button
                    onClick={() => setTipoFilter('agencia')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      tipoFilter === 'agencia'
                        ? 'glass border-2 border-primary text-primary'
                        : 'glass border border-border text-text hover:border-primary/50'
                    }`}
                  >
                    Agencia
                  </button>
                  <button
                    onClick={() => setTipoFilter('mausoleo')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      tipoFilter === 'mausoleo'
                        ? 'glass border-2 border-primary text-primary'
                        : 'glass border border-border text-text hover:border-primary/50'
                    }`}
                  >
                    ⭐ Mausoleo
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-12 pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista de Ubicaciones */}
            <div className="space-y-4 lg:max-h-[800px] lg:overflow-y-auto lg:pr-4 custom-scrollbar">
              {filteredUbicaciones.map((ubicacion, index) => (
                <FadeIn key={ubicacion.id} delay={index * 0.1}>
                  <div
                    onClick={() => setSelectedUbicacion(ubicacion)}
                    className={`glass p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-glass-lg ${
                      selectedUbicacion?.id === ubicacion.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Imagen */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-purple-500/20">
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          {ubicacion.tipo === 'cementerio' ? '' : ubicacion.tipo === 'agencia' ? '' : ''}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-bold text-text">{ubicacion.nombre}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ubicacion.tipo === 'cementerio'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : ubicacion.tipo === 'agencia'
                              ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                              : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                          }`}>
                            {ubicacion.tipo === 'cementerio' ? 'Cementerio' : ubicacion.tipo === 'agencia' ? 'Agencia' : 'Mausoleo'}
                          </span>
                        </div>

                        <p className="text-sm text-textLight mb-3 line-clamp-2">{ubicacion.direccion}</p>

                        <div className="flex items-center gap-2 text-sm text-primary mb-3">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          <a href={`tel:${ubicacion.telefono}`} className="hover:underline">{ubicacion.telefono}</a>
                        </div>

                        {/* Servicios */}
                        <div className="flex flex-wrap gap-2">
                          {ubicacion.servicios.map((servicio, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 rounded-lg text-xs glass border border-border text-textLight"
                            >
                              {servicio}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}

              {filteredUbicaciones.length === 0 && (
                <div className="glass p-12 rounded-2xl text-center">
                  <p className="text-textLight text-lg">No se encontraron ubicaciones</p>
                </div>
              )}
            </div>

            {/* Mapa */}
            <div className="lg:sticky lg:top-24 h-[500px] lg:h-[800px]">
              <FadeIn delay={0.3}>
                <div className="glass p-4 rounded-2xl border border-border h-full">
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10">
                    {/* Placeholder para el mapa */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-text mb-2">Mapa Interactivo</h3>
                      <p className="text-textLight mb-4">
                        Aquí se mostrará el mapa de Google con todas nuestras ubicaciones
                      </p>
                      {selectedUbicacion && (
                        <div className="glass p-4 rounded-xl border border-primary/30 max-w-md">
                          <p className="text-sm font-semibold text-primary mb-1">Ubicación seleccionada:</p>
                          <p className="text-text font-bold">{selectedUbicacion.nombre}</p>
                          <p className="text-sm text-textLight mt-2">{selectedUbicacion.ciudad}</p>
                        </div>
                      )}
                      
                      {/* Instrucciones de integración */}
                      <div className="mt-8 glass p-6 rounded-xl border border-border/50 max-w-lg">
                        <p className="text-xs text-textLight text-left">
                          <strong className="text-primary">Para integrar Google Maps:</strong><br/>
                          1. Obtén una API Key de Google Maps<br/>
                          2. Instala: <code className="bg-background/50 px-2 py-1 rounded">npm install @vis.gl/react-google-maps</code><br/>
                          3. Reemplaza este div con el componente Map<br/>
                          4. Agrega marcadores con las coordenadas lat/lng
                        </p>
                      </div>
                    </div>

                    {/* Grid de fondo decorativo */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="grid grid-cols-8 grid-rows-8 h-full">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className="border border-primary/20"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </>
  );
}
