'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Calendar, Loader2, MapPin, Users } from 'lucide-react';
import type { JobVacancy } from '@/config/vacancies';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';

type PublicVacancy = JobVacancy & {
  applicationCount?: number;
};

function VacancyCardSkeleton() {
  return (
    <div className="h-full rounded-2xl border border-primary/10 bg-white/70 p-6">
      <div className="mb-3 h-5 w-3/4 animate-pulse rounded-md bg-gray-200" />
      <div className="mb-5 h-4 w-1/2 animate-pulse rounded-md bg-gray-200" />
      <div className="mb-2 h-4 w-full animate-pulse rounded-md bg-gray-200" />
      <div className="h-4 w-5/6 animate-pulse rounded-md bg-gray-200" />
      <div className="mt-6 h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
    </div>
  );
}

function VacancyCard({ vacancy }: { vacancy: PublicVacancy }) {
  return (
    <FadeIn>
      <article className="flex h-full flex-col rounded-2xl border border-primary/10 bg-white/80 p-6 shadow-sm transition-all hover:border-primary/25 hover:shadow-md">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              <Briefcase size={14} />
              {vacancy.area}
            </p>
            <h3 className="text-xl font-display text-text">{vacancy.title}</h3>
          </div>
          {vacancy.featured && (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Destacada
            </span>
          )}
        </div>

        <div className="mb-4 grid gap-2 text-sm text-textLight">
          <span className="flex items-center gap-2">
            <MapPin size={15} />
            {vacancy.city}, {vacancy.department}
          </span>
          <span className="flex items-center gap-2">
            <Calendar size={15} />
            Publicada: {vacancy.postedAt}
          </span>
          <span className="flex items-center gap-2">
            <Users size={15} />
            {vacancy.applicationCount ?? 0} postulantes
          </span>
        </div>

        <p className="flex-1 text-sm leading-6 text-textLight">{vacancy.summary}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/servicios/trabaja-con-nosotros/postulante?vacante=${vacancy.id}`}>
            <Button variant="primary">Postularme</Button>
          </Link>
          <Link href="/login/usuario-vacantes">
            <Button variant="secondary">Mi portal</Button>
          </Link>
        </div>
      </article>
    </FadeIn>
  );
}

export default function TrabajaConNosotrosPage() {
  const [vacancies, setVacancies] = useState<PublicVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVacancies() {
      try {
        const response = await fetch('/api/vacantes', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('No se pudieron cargar las vacantes.');
        }
        const data = (await response.json()) as PublicVacancy[];
        setVacancies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las vacantes.');
      } finally {
        setIsLoading(false);
      }
    }

    void fetchVacancies();
  }, []);

  return (
    <>
      <PageHero
        title="Trabaja con Nosotros"
        subtitle="Únete a un equipo comprometido con la dignidad, el servicio y el crecimiento humano."
        image="/images/images-baners/trabaja-con-nosotros.webp"
      />

      <section className="py-16">
        <Container maxWidth="2xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display text-text">Vacantes disponibles</h2>
              <p className="mt-1 text-sm text-textLight">
                Consulta las oportunidades activas y accede a tu portal si ya te postulaste.
              </p>
            </div>
            <Link href="/login/usuario-vacantes">
              <Button variant="secondary">Ingresar al portal</Button>
            </Link>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <VacancyCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <Loader2 className="h-5 w-5" />
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {vacancies.map((vacancy) => (
                <VacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
