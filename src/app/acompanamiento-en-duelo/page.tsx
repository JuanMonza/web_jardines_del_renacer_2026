'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import TitleBand from '@/components/ui/TitleBand';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import type { DueloGalleryAlbum, TallerDuelo } from '@/data/talleres-duelo';
import { buildWhatsAppUrl } from '@/config/contact';
import {
  getStoredActiveTalleres,
  getTallerTitle,
  loadDueloAlbums,
  loadTalleresDuelo,
  TALLERES_DUELO_UPDATED_EVENT,
} from '@/lib/talleresDueloStorage';

const serviciosDuelo = [
  {
    title: 'Acompañamiento Individual',
    description: 'Sesiones personalizadas con nuestros psicólogos para abordar el duelo de manera íntima y adaptada a tus necesidades.',
    icon: (
      <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/person-female.png" alt="person-female" />
    ),
  },
  {
    title: 'Grupos de Apoyo',
    description: 'Espacios seguros y confidenciales donde puedes compartir tu experiencia con otras personas que atraviesan situaciones similares.',
    icon: (
    <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/group--v3.png" alt="group--v3" />
    ),
  },
  {
    title: 'Talleres y Charlas',
    description: 'Actividades formativas y reflexivas sobre el manejo del duelo, la resiliencia y el crecimiento personal tras una pérdida.',
    icon: (
      <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/collaboration-female-male--v4.png" alt="collaboration-female-male--v4" />
    ),
  },
  {
    title: 'Línea de Apoyo Telefónico',
    description: 'Un canal directo para momentos de crisis o necesidad de escucha, disponible para todos nuestros afiliados.',
    icon: (
     <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/technical-support--v2.png" alt="technical-support--v2"/>
    ),
  }
];

function getLocalDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysUntil(fechaISO: string | undefined, todayISO: string) {
  if (!fechaISO) return null;

  const today = new Date(`${todayISO}T00:00:00`);
  const target = new Date(`${fechaISO}T00:00:00`);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / 86_400_000);
}

function sortByDateAsc(a: TallerDuelo, b: TallerDuelo) {
  return (a.fechaISO ?? '9999-12-31').localeCompare(b.fechaISO ?? '9999-12-31');
}

function sortByDateDesc(a: TallerDuelo, b: TallerDuelo) {
  return (b.fechaISO ?? '0000-01-01').localeCompare(a.fechaISO ?? '0000-01-01');
}

export default function AcompanamientoDueloPage() {
  const todayISO = useMemo(() => getLocalDateISO(), []);
  const [allTalleres, setAllTalleres] = useState<TallerDuelo[]>(() => loadTalleresDuelo());
  const [proximosTalleres, setProximosTalleres] = useState<TallerDuelo[]>(() =>
    getStoredActiveTalleres()
      .filter((taller) => !taller.fechaISO || taller.fechaISO >= todayISO)
      .sort(sortByDateAsc),
  );
  const [albumes, setAlbumes] = useState<DueloGalleryAlbum[]>(() => loadDueloAlbums().filter((album) => album.activo));
  const [selectedTallerIndex, setSelectedTallerIndex] = useState(0);
  const [selectedAlbumDate, setSelectedAlbumDate] = useState('all');

  useEffect(() => {
    const syncData = () => {
      const storedTalleres = loadTalleresDuelo();
      const activeTalleres = getStoredActiveTalleres()
        .filter((taller) => !taller.fechaISO || taller.fechaISO >= todayISO)
        .sort(sortByDateAsc);
      setAllTalleres(storedTalleres);
      setProximosTalleres(activeTalleres);
      setSelectedTallerIndex((current) => (activeTalleres[current] ? current : 0));
      setAlbumes(loadDueloAlbums().filter((album) => album.activo));
    };

    syncData();
    window.addEventListener(TALLERES_DUELO_UPDATED_EVENT, syncData);
    return () => window.removeEventListener(TALLERES_DUELO_UPDATED_EVENT, syncData);
  }, [todayISO]);

  const albumDateOptions = useMemo(() => {
    const options = new Map<string, string>();
    albumes.forEach((album) => options.set(album.fechaISO, album.fecha));
    return Array.from(options.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [albumes]);

  const visibleAlbumes = useMemo(
    () => albumes.filter((album) => selectedAlbumDate === 'all' || album.fechaISO === selectedAlbumDate),
    [albumes, selectedAlbumDate],
  );

  const pastTalleres = useMemo(
    () => allTalleres
      .filter((taller) => taller.activo && Boolean(taller.fechaISO) && taller.fechaISO! < todayISO)
      .sort(sortByDateDesc),
    [allTalleres, todayISO],
  );

  const albumsByTaller = useMemo(() => {
    const map = new Map<string, DueloGalleryAlbum>();
    albumes.forEach((album) => map.set(album.tallerId, album));
    return map;
  }, [albumes]);

  const handleWorkshopSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nombre = String(formData.get('nombre') || '').trim();
    const telefono = String(formData.get('telefono') || '').trim();
    const correo = String(formData.get('correo') || '').trim();
    const selectedTaller = proximosTalleres[selectedTallerIndex];
    const message = [
      'Hola, deseo inscribirme o recibir informacion sobre acompanamiento en duelo.',
      `Taller: ${selectedTaller?.titulo ?? 'Solicito talleres disponibles'}`,
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Correo: ${correo}`,
    ].join('\n');

    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    event.currentTarget.reset();
  };

  const selectedTaller = proximosTalleres[selectedTallerIndex];
  const daysUntilSelected = getDaysUntil(selectedTaller?.fechaISO, todayISO);

  return (
    <main className="min-h-screen">
      <PageHero
        title="Acompañamiento en Duelo"
        subtitle="Un espacio de apoyo y sanación para quienes han perdido a un ser querido."
        image="/images/images-baners/acompañamientoenduelo.webp"
        imageAlt="Acompañamiento en Duelo - Jardines del Renacer"
      />

      <TitleBand title="Nuestro Compromiso es Acompañarte" />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviciosDuelo.map((servicio, index) => (
              <FadeIn key={servicio.title} delay={index * 0.08}>
                <div className="group relative flex h-full flex-col rounded-3xl border border-primary/10 bg-white/60 p-6 text-center shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2">
                  <div className="flex-grow">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      {servicio.icon}
                    </div>
                    <h3 className="text-xl font-bold text-text">{servicio.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-textLight">
                      {servicio.description}
                    </p>
                  </div>
                  <div className="mt-6">
                    <a
                      href={buildWhatsAppUrl(`Hola, quisiera más información sobre el servicio de ${servicio.title}.`, '3228400549')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white"
                    >
                      Solicitar Información
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <TitleBand title="Próximos Talleres de Duelo" />

      <section className="py-16 md:py-24">
        <Container>
          {selectedTaller && (
            <FadeIn>
              <div className="mb-10 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-50 to-sky-50 p-6 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                      Próximo taller
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-text md:text-3xl">{selectedTaller.titulo}</h2>
                    <p className="mt-1 text-sm text-textLight">{selectedTaller.fecha} - {selectedTaller.lugar}</p>
                  </div>
                  <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-sm">
                    <p className="text-4xl font-extrabold text-primary">
                      {daysUntilSelected === 0 ? 'Hoy' : daysUntilSelected}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-textLight">
                      {daysUntilSelected === 0 ? 'Es el taller' : 'Días restantes'}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <div className="space-y-4">
                {proximosTalleres.length > 0 ? (
                  proximosTalleres.map((taller, index) => (
                    <button
                      key={taller.id}
                      onClick={() => setSelectedTallerIndex(index)}
                      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${selectedTallerIndex === index
                          ? 'bg-primary/10 border-primary/30 shadow-lg'
                          : 'glass border-border hover:bg-base-100/50'
                        }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="font-bold text-primary text-sm uppercase tracking-wider">{taller.fecha}</p>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {index === 0 ? 'Próximo' : 'Programado'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-text mt-1">{taller.titulo}</h3>
                      <p className="text-sm text-textLight">{taller.lugar}</p>
                    </button>
                  ))
                ) : (
                  <div className="glass rounded-2xl border border-border p-6">
                    <h3 className="text-xl font-bold text-text">Estamos preparando nuevos talleres</h3>
                    <p className="mt-2 text-sm text-textLight">
                      Escríbenos para recibir acompañamiento o ser avisado cuando publiquemos nuevas fechas.
                    </p>
                  </div>
                )}
              </div>
            </FadeIn>

            <FadeIn className="lg:sticky lg:top-28">
              <div className="glass rounded-2xl p-8 border border-primary/20">
                <h3 className="text-2xl font-bold text-text mb-2">Inscríbete a nuestro próximo taller</h3>
                <p className="text-textLight mb-6">Completa el formulario para reservar tu cupo o solicitar más información.</p>

                <div className="bg-white/70 rounded-2xl p-6 border border-primary/10 transition-all shadow-sm overflow-hidden">
                  <div key={selectedTaller?.id} className="animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start md:items-center gap-5">
                        <div className="bg-primary/10 text-primary font-bold px-5 py-4 rounded-2xl text-center min-w-[130px] flex flex-col items-center justify-center">
                          <span className="text-3xl leading-none">{selectedTaller?.fecha.split(' ')[0] ?? '--'}</span>
                          <span className="text-xs uppercase tracking-wider">{selectedTaller?.fecha.split(' ').slice(1).join(' ') ?? 'PROXIMAMENTE'}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-text text-lg">{selectedTaller?.titulo ?? 'Acompañamiento disponible'}</h4>
                          <p className="text-sm text-textLight">{selectedTaller?.lugar ?? 'Comunícate con nuestro equipo'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleWorkshopSubmit} className="mt-6 space-y-4">
                  <input type="text" name="nombre" placeholder="Nombre Completo" required className="input w-full bg-white/80" />
                  <input type="tel" name="telefono" placeholder="Teléfono de Contacto" required className="input w-full bg-white/80" />
                  <input type="email" name="correo" placeholder="Correo Electrónico" required className="input w-full bg-white/80" />
                  <Button type="submit" variant="primary" className="w-full">
                    Quiero Inscribirme
                  </Button>
                </form>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {pastTalleres.length > 0 && (
        <>
          <TitleBand title="Talleres Pasados" />

          <section className="py-16 md:py-24">
            <Container>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {pastTalleres.map((taller) => {
                  const album = albumsByTaller.get(taller.id);

                  return (
                    <FadeIn key={taller.id}>
                      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {album?.images.length ? (
                          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1">
                            {album.images.slice(0, 3).map((image) => (
                              <img
                                key={image.id}
                                src={image.src}
                                alt={image.alt}
                                className="h-32 w-full rounded-xl object-cover sm:h-40"
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex h-36 items-center justify-center bg-slate-100 text-sm font-semibold text-slate-500">
                            Álbum pendiente
                          </div>
                        )}
                        <div className="p-6">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                              Finalizado
                            </span>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                              {taller.fecha}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-text">{taller.titulo}</h3>
                          <p className="mt-1 text-sm text-textLight">{taller.lugar}</p>
                          {album?.descripcion && (
                            <p className="mt-3 text-sm leading-relaxed text-textLight">{album.descripcion}</p>
                          )}
                        </div>
                      </article>
                    </FadeIn>
                  );
                })}
              </div>
            </Container>
          </section>
        </>
      )}

      {albumes.length > 0 && (
        <>
          <TitleBand title="Galería de Talleres Pasados" />

          <section className="py-16 md:py-24">
            <Container>
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Memorias por fecha</p>
                  <h2 className="mt-2 text-3xl font-bold text-text">Álbumes de acompañamiento</h2>
                </div>
                <select
                  value={selectedAlbumDate}
                  onChange={(event) => setSelectedAlbumDate(event.target.value)}
                  className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todas las fechas</option>
                  {albumDateOptions.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {visibleAlbumes.map((album) => (
                  <FadeIn key={album.id}>
                    <article className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-lg">
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1">
                        {album.images.slice(0, 3).map((image) => (
                          <img
                            key={image.id}
                            src={image.src}
                            alt={image.alt}
                            className="h-36 w-full rounded-xl object-cover sm:h-44"
                          />
                        ))}
                      </div>
                      <div className="p-6">
                        <p className="text-sm font-bold uppercase tracking-wider text-primary">{album.fecha}</p>
                        <h3 className="mt-2 text-2xl font-bold text-text">{album.titulo}</h3>
                        <p className="mt-1 text-sm text-textLight">{getTallerTitle(allTalleres, album.tallerId)}</p>
                        {album.descripcion && (
                          <p className="mt-4 text-sm leading-relaxed text-textLight">{album.descripcion}</p>
                        )}
                      </div>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}
    </main>
  );
}
