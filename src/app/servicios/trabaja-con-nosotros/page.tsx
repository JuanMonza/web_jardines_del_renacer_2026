'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { JobVacancy } from '@/config/vacancies';
import { readJobVacancies } from '@/lib/vacanciesStorage';

const ALL_AREAS = 'Todas las areas';
const ALL_DEPARTMENTS = 'Todos los departamentos';
const ALL_MODALITIES = 'Todas las modalidades';

function formatPublishedDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export default function TrabajaConNosotrosPage() {
  const router = useRouter();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [query, setQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState(ALL_AREAS);
  const [selectedDepartment, setSelectedDepartment] = useState(ALL_DEPARTMENTS);
  const [selectedModality, setSelectedModality] = useState(ALL_MODALITIES);
  const [trackingCedula, setTrackingCedula] = useState('');
  const [trackingEmail, setTrackingEmail] = useState('');
  const [trackingFeedback, setTrackingFeedback] = useState('');

  useEffect(() => {
    setVacancies(readJobVacancies());

    const syncFromStorage = () => setVacancies(readJobVacancies());
    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  const areaOptions = useMemo(
    () =>
      Array.from(new Set(vacancies.map((vacancy) => vacancy.area))).sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [vacancies],
  );

  const departmentOptions = useMemo(
    () =>
      Array.from(new Set(vacancies.map((vacancy) => vacancy.department))).sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [vacancies],
  );

  const filteredVacancies = useMemo(() => {
    const search = query.trim().toLowerCase();

    return vacancies.filter((vacancy) => {
      const matchesArea = selectedArea === ALL_AREAS || vacancy.area === selectedArea;
      const matchesDepartment =
        selectedDepartment === ALL_DEPARTMENTS || vacancy.department === selectedDepartment;
      const matchesModality =
        selectedModality === ALL_MODALITIES || vacancy.modality === selectedModality;
      const matchesSearch =
        !search ||
        vacancy.title.toLowerCase().includes(search) ||
        vacancy.area.toLowerCase().includes(search) ||
        vacancy.city.toLowerCase().includes(search) ||
        vacancy.department.toLowerCase().includes(search) ||
        vacancy.summary.toLowerCase().includes(search);

      return matchesArea && matchesDepartment && matchesModality && matchesSearch;
    });
  }, [vacancies, query, selectedArea, selectedDepartment, selectedModality]);

  const featuredCount = vacancies.filter((vacancy) => vacancy.featured).length;
  const departmentsCount = departmentOptions.length;

  const handleTrackingRedirect = () => {
    const cleanCedula = trackingCedula.replace(/\D/g, '');
    if (cleanCedula.length < 6 || cleanCedula.length > 10) {
      setTrackingFeedback('Ingresa una cedula valida (6 a 10 digitos).');
      return;
    }

    const params = new URLSearchParams({
      cedula: cleanCedula,
    });
    const normalizedEmail = trackingEmail.trim().toLowerCase();
    if (normalizedEmail) {
      params.set('correo', normalizedEmail);
    }

    setTrackingFeedback('');
    router.push(`/servicios/trabaja-con-nosotros/postulante?${params.toString()}#consulta-proceso`);
  };

  return (
    <>
      <section className="relative overflow-hidden py-24 bg-gradient-to-b from-background via-white/60 to-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-[#8bb3f8]/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#3C60A2]/10 blur-3xl" />
        </div>

        <Container maxWidth="2xl" className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
            <FadeIn>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-primary mb-4">
                  Talento Jardines del Renacer
                </p>
                <h1 className="text-4xl md:text-6xl font-display text-text leading-tight text-balance">
                  Bolsa de empleo
                  <span className="block text-primary mt-2">Trabaja con nosotros</span>
                </h1>
                <p className="text-lg text-textLight mt-6 max-w-2xl">
                  Encuentra oportunidades en diferentes areas y departamentos. Queremos sumar
                  personas con vocacion de servicio, humanidad y compromiso con la excelencia.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a href="#vacantes-disponibles">
                    <Button variant="primary">Ver vacantes disponibles</Button>
                  </a>
                  <Link href="/servicios/trabaja-con-nosotros/postulante">
                    <Button variant="secondary">Enviar hoja de vida</Button>
                  </Link>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="glass rounded-3xl border border-primary/20 p-6 md:p-8">
                <h2 className="text-2xl font-display text-text mb-6">Hoy en la bolsa</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-primary/15 bg-white/55 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-textLight mb-1">Vacantes</p>
                    <p className="text-3xl font-display text-primary">{vacancies.length}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/15 bg-white/55 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-textLight mb-1">
                      Destacadas
                    </p>
                    <p className="text-3xl font-display text-primary">{featuredCount}</p>
                  </div>
                  <div className="rounded-2xl border border-primary/15 bg-white/55 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-textLight mb-1">
                      Departamentos
                    </p>
                    <p className="text-3xl font-display text-primary">{departmentsCount}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 p-4">
                  <p className="text-sm text-text">
                    Publicamos vacantes por temporada. Si no encuentras una posicion exacta, puedes
                    enviarnos tu perfil para futuras convocatorias.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      <section id="vacantes-disponibles" className="pb-20">
        <Container maxWidth="2xl">
          <FadeIn>
            <div className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Input
                  label="Buscar vacante"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cargo, ciudad o area..."
                />

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Area</label>
                  <select
                    value={selectedArea}
                    onChange={(event) => setSelectedArea(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  >
                    <option value={ALL_AREAS}>{ALL_AREAS}</option>
                    {areaOptions.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Departamento</label>
                  <select
                    value={selectedDepartment}
                    onChange={(event) => setSelectedDepartment(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  >
                    <option value={ALL_DEPARTMENTS}>{ALL_DEPARTMENTS}</option>
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">Modalidad</label>
                  <select
                    value={selectedModality}
                    onChange={(event) => setSelectedModality(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  >
                    <option value={ALL_MODALITIES}>{ALL_MODALITIES}</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Hibrido">Hibrido</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-primary/10">
                <p className="text-xs uppercase tracking-[0.18em] text-primary mb-3">
                  Consulta de postulacion
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <Input
                    label="Cedula para consultar"
                    value={trackingCedula}
                    onChange={(event) => {
                      setTrackingCedula(event.target.value);
                      if (trackingFeedback) {
                        setTrackingFeedback('');
                      }
                    }}
                    placeholder="Ingresa tu cedula"
                  />

                  <Input
                    label="Correo (opcional)"
                    type="email"
                    value={trackingEmail}
                    onChange={(event) => setTrackingEmail(event.target.value)}
                    placeholder="Tu correo registrado"
                  />

                  <div className="flex items-end">
                    <Button variant="secondary" className="w-full justify-center" onClick={handleTrackingRedirect}>
                      Consultar proceso
                    </Button>
                  </div>
                </div>

                {trackingFeedback && (
                  <p className="text-sm text-primary mt-3">{trackingFeedback}</p>
                )}
              </div>
            </div>
          </FadeIn>

          <div className="mt-8 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-textLight">
              Mostrando <span className="font-semibold text-text">{filteredVacancies.length}</span>{' '}
              vacantes disponibles
            </p>
            <Link href="/servicios/trabaja-con-nosotros/postulante">
              <Button variant="ghost">Enviar hoja de vida</Button>
            </Link>
          </div>

          {filteredVacancies.length === 0 ? (
            <div className="mt-8 glass rounded-3xl border border-primary/15 p-12 text-center">
              <h3 className="text-2xl font-display text-text mb-2">No encontramos resultados</h3>
              <p className="text-textLight mb-6">
                Ajusta los filtros o envia tu hoja de vida para futuras convocatorias.
              </p>
              <Link href="/servicios/trabaja-con-nosotros/postulante">
                <Button variant="primary">Enviar hoja de vida</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredVacancies.map((vacancy, index) => (
                <FadeIn key={vacancy.id} delay={Math.min(index * 0.06, 0.35)}>
                  <article className="h-full glass rounded-3xl border border-primary/15 p-6 md:p-7 hover:shadow-glass-lg transition-all">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-display text-text leading-snug">{vacancy.title}</h3>
                        <p className="text-sm text-textLight mt-2">
                          {vacancy.city}, {vacancy.department}
                        </p>
                      </div>
                      {vacancy.featured && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-green-500/25 bg-green-500/10 text-green-700 whitespace-nowrap">
                          Destacada
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                        {vacancy.area}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-700">
                        {vacancy.modality}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700">
                        {vacancy.contractType}
                      </span>
                    </div>

                    <p className="text-textLight mb-4">{vacancy.summary}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl border border-primary/10 bg-white/50 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-textLight mb-1">Horario</p>
                        <p className="text-sm text-text">{vacancy.schedule}</p>
                      </div>
                      <div className="rounded-xl border border-primary/10 bg-white/50 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-textLight mb-1">Experiencia</p>
                        <p className="text-sm text-text">{vacancy.experience}</p>
                      </div>
                      <div className="rounded-xl border border-primary/10 bg-white/50 p-3 sm:col-span-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-textLight mb-1">Salario</p>
                        <p className="text-sm text-text">{vacancy.salary}</p>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className="text-sm font-semibold text-text mb-2">Requisitos clave</p>
                      <ul className="space-y-2">
                        {vacancy.requirements.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-textLight">
                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-semibold text-text mb-2">Beneficios</p>
                      <div className="flex flex-wrap gap-2">
                        {vacancy.benefits.map((item) => (
                          <span
                            key={item}
                            className="text-xs px-2.5 py-1 rounded-full border border-primary/15 bg-white/60 text-textLight"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs text-textLight">
                        Publicada: {formatPublishedDate(vacancy.postedAt)}
                      </p>

                      <div className="flex gap-2 flex-wrap">
                        <Link
                          href={`/servicios/trabaja-con-nosotros/postulante?vacante=${vacancy.id}`}
                        >
                          <Button variant="primary" size="sm">
                            Aplicar aqui
                          </Button>
                        </Link>
                        <Link href="/servicios/trabaja-con-nosotros/postulante">
                          <Button variant="secondary" size="sm">
                            Mi perfil
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          )}

          <FadeIn delay={0.2}>
            <div className="mt-12 glass rounded-3xl border border-primary/15 p-6 md:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-primary mb-2">Proceso de aplicacion</p>
                  <h3 className="text-2xl font-display text-text mb-2">
                    Queremos conocerte mas alla de la hoja de vida
                  </h3>
                  <p className="text-textLight">
                    Nuestro proceso incluye validacion de perfil, entrevista por competencias y
                    etapa de induccion para que inicies con acompanamiento.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/servicios/trabaja-con-nosotros/postulante">
                    <Button variant="primary">Crear/editar perfil</Button>
                  </Link>
                  <Link href="/login/admin-vacantes">
                    <Button variant="secondary">Admin vacantes</Button>
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
