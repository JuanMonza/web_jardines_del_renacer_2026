'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Calendar, CarFront, CheckCircle2, ChevronRight, Clock3, FileText, Loader2, MapPin, Users, WalletCards, X } from 'lucide-react';
import type { JobVacancy } from '@/config/vacancies';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import ScreenDialog from '@/components/ui/ScreenDialog';

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

function formatPublishedDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function VacancyCard({ vacancy, onView }: { vacancy: PublicVacancy; onView: () => void }) {
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
            Publicada: {formatPublishedDate(vacancy.postedAt)}
          </span>
          <span className="flex items-center gap-2">
            <Users size={15} />
            {vacancy.applicationCount ?? 0} postulantes
          </span>
          {vacancy.requiresDriversLicense && (
            <span className="flex items-center gap-2 font-semibold text-amber-800">
              <CarFront size={15} />
              Requiere licencia de conducción vigente
            </span>
          )}
        </div>

        <p className="line-clamp-4 flex-1 text-sm leading-6 text-textLight">{vacancy.summary}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={onView} aria-label={`Ver información completa de ${vacancy.title}`}>
            Ver detalles <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Link
            href={`/login/usuario-vacantes?next=${encodeURIComponent(`/servicios/trabaja-con-nosotros/postulante/dashboard?vacante=${vacancy.id}`)}`}
          >
            <Button variant="primary">Postularme</Button>
          </Link>
        </div>
      </article>
    </FadeIn>
  );
}

function VacancyDetails({ vacancy, onClose }: { vacancy: PublicVacancy; onClose: () => void }) {
  const applicationUrl = `/login/usuario-vacantes?next=${encodeURIComponent(`/servicios/trabaja-con-nosotros/postulante/dashboard?vacante=${vacancy.id}`)}`;
  const facts = [
    { icon: MapPin, label: 'Ubicación', value: `${vacancy.city}, ${vacancy.department}` },
    { icon: Briefcase, label: 'Modalidad y contrato', value: `${vacancy.modality} · ${vacancy.contractType}` },
    { icon: Clock3, label: 'Jornada', value: vacancy.schedule },
    { icon: WalletCards, label: 'Salario', value: vacancy.salary },
    { icon: FileText, label: 'Experiencia', value: vacancy.experience },
    { icon: Calendar, label: 'Fecha de publicación', value: formatPublishedDate(vacancy.postedAt) },
  ].filter((item) => item.value);

  return (
    <ScreenDialog ariaLabel={`Detalles de la vacante ${vacancy.title}`} onClose={onClose}>
      <article onClick={(event) => event.stopPropagation()} className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] bg-[#f7faff] shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#173f73] via-[#24599a] to-[#6f9bd0] px-5 py-6 text-white sm:px-8 sm:py-8">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
          <button type="button" onClick={onClose} aria-label="Cerrar detalles" className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-white/10 p-2.5 text-white transition hover:bg-white/20 sm:right-6 sm:top-6">
            <X className="h-5 w-5" />
          </button>
          <div className="relative pr-12">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">{vacancy.area}</p>
            <h2 className="max-w-3xl text-2xl font-display leading-tight sm:text-3xl">{vacancy.title}</h2>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold sm:text-sm">
              <span className="rounded-full bg-white/15 px-3 py-1.5">Vacante activa</span>
              {vacancy.featured && <span className="rounded-full bg-emerald-300 px-3 py-1.5 text-emerald-950">Destacada</span>}
              {vacancy.requiresDriversLicense && <span className="rounded-full bg-amber-200 px-3 py-1.5 text-amber-950">Requiere licencia</span>}
            </div>
          </div>
        </header>

        <div className="overflow-y-auto overscroll-contain px-5 py-6 sm:px-8">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-[#dbe6f4] bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="rounded-xl bg-[#eaf2fd] p-2 text-primary"><Icon className="h-4 w-4" /></span>
                  <div><p className="text-[11px] font-bold uppercase tracking-wider text-textLight">{label}</p><p className="mt-1 text-sm font-semibold leading-5 text-text">{value}</p></div>
                </div>
              </div>
            ))}
          </section>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
            <section className="rounded-2xl border border-[#dbe6f4] bg-white p-5 sm:p-6">
              <h3 className="text-lg font-display text-text">Descripción del cargo</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-textLight">{vacancy.summary || 'Información por confirmar.'}</p>
            </section>
            <div className="space-y-5">
              <DetailList title="Requisitos" items={vacancy.requirements} />
              <DetailList title="Beneficios" items={vacancy.benefits} />
            </div>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-[#dbe6f4] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs leading-5 text-textLight">Revisa la información y completa tu perfil para iniciar la postulación.</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1 sm:flex-none">Volver</Button>
            <Link href={applicationUrl} className="flex-1 sm:flex-none"><Button variant="primary" className="w-full">Postularme</Button></Link>
          </div>
        </footer>
      </article>
    </ScreenDialog>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl border border-[#dbe6f4] bg-white p-5 sm:p-6">
      <h3 className="text-lg font-display text-text">{title}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2.5 text-sm leading-6 text-textLight"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><span>{item}</span></li>)}
      </ul>
    </section>
  );
}

export default function TrabajaConNosotrosPage() {
  const [vacancies, setVacancies] = useState<PublicVacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVacancy, setSelectedVacancy] = useState<PublicVacancy | null>(null);

  useEffect(() => {
    async function fetchVacancies() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/api/vacantes`, { cache: 'no-store' });
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
        title="Trabaja con nosotros"
        subtitle="Únete a un equipo comprometido con la dignidad, el servicio y el crecimiento humano."
        image="/images/images-baners/Trabaja_con_nosotros.webp"
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
                <VacancyCard key={vacancy.id} vacancy={vacancy} onView={() => setSelectedVacancy(vacancy)} />
              ))}
            </div>
          )}
        </Container>
      </section>
      {selectedVacancy && <VacancyDetails vacancy={selectedVacancy} onClose={() => setSelectedVacancy(null)} />}
    </>
  );
}
