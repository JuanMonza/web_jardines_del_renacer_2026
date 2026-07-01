'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import FadeIn from '@/components/animations/FadeIn';
import { SEDES, getAllDepartamentos, type Sede } from '@/data/sedes';
import { getCiudadImagePath } from '@/config/ciudades';

function getSedeMapsQuery(sede: Sede): string {
  const location = sede.direccion?.trim()
    ? `${sede.direccion}, ${sede.ciudad}, ${sede.departamento}, Colombia`
    : `${sede.ciudad}, ${sede.departamento}, Colombia`;
  return encodeURIComponent(location);
}

export default function UbicacionesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('todos');
  const [selectedId, setSelectedId]   = useState<string | null>(null);

  const departamentos = getAllDepartamentos();
  const totalSedes = SEDES.length;

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return SEDES.filter((s) => {
      const matchesSearch =
        !q ||
        s.nombre.toLowerCase().includes(q) ||
        s.ciudad.toLowerCase().includes(q) ||
        s.direccion.toLowerCase().includes(q) ||
        s.departamento.toLowerCase().includes(q);
      const matchesDept =
        deptFilter === 'todos' || s.departamento === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [searchQuery, deptFilter]);

  const selected = SEDES.find((s) => s.id === selectedId) ?? null;
  const mapsQuery = selected ? getSedeMapsQuery(selected) : null;
  const selectedCityImage = selected
    ? getCiudadImagePath(selected.departamento, selected.ciudad)
    : null;
  const mapsSearchUrl = mapsQuery
    ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
    : null;
  const mapsDirectionsUrl = mapsQuery
    ? `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`
    : null;
  const mapsEmbedUrl = mapsQuery
    ? `https://www.google.com/maps?q=${mapsQuery}&output=embed`
    : null;
  const wazeUrl = mapsQuery
    ? `https://waze.com/ul?q=${mapsQuery}`
    : null;

  return (
    <>
      <PageHero
        title="Nuestras Ubicaciones"
        subtitle={`Presentes en ${departamentos.length} departamentos con ${totalSedes} puntos de atención en todo el país`}
        image="/images/images-baners/nuetrassedes.webp"
        imageAlt="Ubicaciones Jardines del Renacer"
      >
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Departamentos', value: departamentos.length },
            { label: 'Sedes', value: totalSedes },
            { label: 'Años de experiencia', value: '25+' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-[140px] rounded-2xl border border-white/25 bg-white/90 px-6 py-4 text-center shadow-xl"
            >
              <p className="text-3xl font-bold text-primary">
                <AnimatedCounter value={stat.value} />
              </p>
              <p className="mt-1 text-sm font-semibold text-textLight">{stat.label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      {/* ── FILTROS ─────────────────────────────────────────────── */}
      <section className="py-10 bg-gradient-to-b from-background to-white/50">
        <Container>
          <FadeIn delay={0.2}>
            <div className="max-w-5xl mx-auto space-y-4">
              {/* Buscador */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por sede, ciudad o dirección…"
                  className="w-full glass rounded-2xl pl-11 pr-4 py-3 text-text placeholder:text-textLight text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>

              {/* Filtro por departamento */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setDeptFilter('todos')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all glass border ${
                    deptFilter === 'todos'
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-border text-textLight hover:border-primary/40'
                  }`}
                >
                  Todos
                </button>
                {departamentos.map((d) => (
                  <button
                    key={d.slug}
                    onClick={() => setDeptFilter(d.nombre)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all glass border ${
                      deptFilter === d.nombre
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-border text-textLight hover:border-primary/40'
                    }`}
                  >
                    {d.nombre}
                    <span className="ml-1.5 text-xs opacity-60">({d.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* ── LISTA + MAPA ─────────────────────────────────────────── */}
      <section className="py-12 pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Lista de sedes */}
            <div className="space-y-4 lg:max-h-[800px] lg:overflow-y-auto lg:pr-4 custom-scrollbar">
              {filtered.length === 0 && (
                <div className="glass p-12 rounded-2xl text-center border border-border">
                  <p className="text-textLight text-lg">No se encontraron sedes</p>
                </div>
              )}

              {filtered.map((sede, index) => {
                const cityImage = getCiudadImagePath(sede.departamento, sede.ciudad);
                const sedeMapsQuery = getSedeMapsQuery(sede);
                const sedeDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${sedeMapsQuery}`;
                const sedeMapsUrl = `https://www.google.com/maps/search/?api=1&query=${sedeMapsQuery}`;
                const sedeWazeUrl = `https://waze.com/ul?q=${sedeMapsQuery}`;

                return (
                <FadeIn key={sede.id} delay={Math.min(index * 0.05, 0.4)}>
                  <div
                    onClick={() => setSelectedId(sede.id === selectedId ? null : sede.id)}
                    className={`glass p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-glass-lg ${
                      selectedId === sede.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Imagen de la ciudad */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-primary/10 border border-primary/20 flex items-center justify-center">
                        {cityImage ? (
                          <Image
                            src={cityImage}
                            alt={`${sede.ciudad}, ${sede.departamento}`}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <svg width="24" height="24" fill="none" stroke="#3C60A2" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-base font-bold text-text leading-tight">Sede {sede.nombre}</h3>
                          <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            24 Horas
                          </span>
                        </div>

                        <a
                          href={sedeDirectionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-primary hover:underline mb-2 line-clamp-1 block"
                        >
                          {sede.direccion || 'Dirección por confirmar'}
                        </a>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textLight mb-2">
                          <span className="flex items-center gap-1">
                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                              <circle cx="12" cy="11" r="3" />
                            </svg>
                            {sede.ciudad}, {sede.departamento}
                          </span>
                          {sede.telefono && (
                            <a
                              href={`tel:+57${sede.telefono.replace(/\s/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 text-primary hover:underline"
                            >
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                              </svg>
                              {sede.telefono}
                            </a>
                          )}
                        </div>

                        {/* Botones de acción */}
                        {selectedId === sede.id && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-primary/10">
                            <a
                              href={sedeMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-200 border border-primary/20"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                                <circle cx="12" cy="9" r="2.5" fill="white" />
                              </svg>
                              Google Maps
                            </a>
                            <a
                              href={sedeWazeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors duration-200 border border-primary/20"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <ellipse cx="12" cy="13" rx="9" ry="8" fill="#33CCFF" />
                                <circle cx="9" cy="12" r="1.5" fill="#1a1a1a" />
                                <circle cx="15" cy="12" r="1.5" fill="#1a1a1a" />
                                <path d="M9 15.5c1 1 5 1 6 0" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
                              </svg>
                              Waze
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
                );
              })}
            </div>

            {/* Panel Mapa */}
            <div className="lg:sticky lg:top-24 h-[560px] lg:h-[880px]">
              <FadeIn delay={0.3}>
                <div className="glass p-4 rounded-2xl border border-border h-full">
                  {!selected || !mapsEmbedUrl || !mapsSearchUrl || !mapsDirectionsUrl || !wazeUrl ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/5">
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-text mb-2">Mapa Interactivo</h3>
                        <p className="text-textLight text-sm mb-4 max-w-xs">
                          Selecciona una sede de la lista para ver foto, dirección y ubicación exacta.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-rows-[220px_minmax(0,1fr)] gap-4 h-full">
                      <div className="glass rounded-xl border border-primary/20 overflow-hidden">
                        <div className="h-full grid grid-cols-[220px_1fr]">
                          <div className="relative h-full bg-primary/10">
                            {selectedCityImage ? (
                              <Image
                                src={selectedCityImage}
                                alt={`${selected.ciudad}, ${selected.departamento}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg width="34" height="34" fill="none" stroke="#3C60A2" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-4 flex flex-col">
                            <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                              Sede seleccionada
                            </p>
                            <p className="text-text font-bold text-base">Sede {selected.nombre}</p>
                            <a
                              href={mapsDirectionsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline mt-1"
                            >
                              {selected.direccion || 'Dirección por confirmar'}
                            </a>
                            <p className="text-xs text-textLight">{selected.ciudad}, {selected.departamento}</p>
                            {selected.telefono && (
                              <a
                                href={`tel:+57${selected.telefono.replace(/\s/g, '')}`}
                                className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                                </svg>
                                {selected.telefono}
                              </a>
                            )}

                            <div className="flex gap-2 mt-auto pt-3">
                              <a
                                href={mapsSearchUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-primary text-white hover:bg-[#2f4d82] transition-colors"
                              >
                                Abrir Maps
                              </a>
                              <a
                                href={wazeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-center text-xs font-semibold py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
                              >
                                Abrir Waze
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl overflow-hidden border border-primary/20 bg-white">
                        <iframe
                          title={`Mapa de sede ${selected.nombre}`}
                          src={mapsEmbedUrl}
                          className="w-full h-full"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
              </FadeIn>
            </div>

          </div>
        </Container>
      </section>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(60, 96, 162, 0.25);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(60, 96, 162, 0.5);
        }
      `}</style>
    </>
  );
}
