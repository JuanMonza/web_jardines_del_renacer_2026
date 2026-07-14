'use client';

import { useState, useEffect } from 'react';
import type { JobVacancy } from '@/config/vacancies';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import FadeIn from '@/components/animations/FadeIn';

// Componente para mostrar un esqueleto de carga (loading skeleton)
function VacancyCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 border border-primary/10 animate-pulse">
      <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-5"></div>
      <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
      <div className="mt-6 h-10 bg-gray-200 rounded-lg w-32"></div>
    </div>
  );
}

// Componente para mostrar una tarjeta de vacante individual
function VacancyCard({ vacancy }: { vacancy: JobVacancy }) {
  return (
    <FadeIn>
      <div className="glass rounded-2xl p-6 border border-primary/10 hover:shadow-glass-lg transition-all duration-300 h-full flex flex-col">
        <h3 className="text-xl font-display text-text mb-1">{vacancy.title}</h3>
        <p className="text-sm text-primary font-semibold mb-4">
          {vacancy.city}, {vacancy.department}
        </p>
        <p className="text-textLight text-sm flex-grow">{vacancy.summary}</p>
        <div className="mt-6">
          {/* Este enlace debería llevar a la página de detalle de la vacante */}
          <a href={`/servicios/trabaja-con-nosotros/${vacancy.id}`} className="font-bold text-primary hover:underline">
            Ver detalles y postular
          </a>
        </div>
      </div>
    </FadeIn>
  );
}

export default function TrabajaConNosotrosPage() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVacancies() {
      try {
        // Hacemos la petición a nuestra nueva API Route
        const response = await fetch('/api/vacantes');
        if (!response.ok) {
          throw new Error('No se pudieron cargar las vacantes.');
        }
        const data: JobVacancy[] = await response.json();
        setVacancies(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVacancies();
  }, []); // El array vacío asegura que esto se ejecute solo una vez al montar el componente

  return (
    <>
      <PageHero
        title="Trabaja con Nosotros"
        subtitle="Únete a un equipo comprometido con la dignidad y el servicio."
        image="/images/images-baners/trabaja-con-nosotros.webp"
      />
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading && Array.from({ length: 6 }).map((_, i) => <VacancyCardSkeleton key={i} />)}
            {error && <p className="text-red-500 col-span-full text-center">{error}</p>}
            {!isLoading && !error && vacancies.map((vacancy) => <VacancyCard key={vacancy.id} vacancy={vacancy} />)}
          </div>
        </Container>
      </section>
    </>
  );
}