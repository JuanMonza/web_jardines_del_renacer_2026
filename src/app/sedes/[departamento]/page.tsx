import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import DepartamentoSedesClient from '@/components/sedes/DepartamentoSedesClient';
import {
  getAllDepartamentos,
  getSedesByDepartamento,
} from '@/data/sedes';

// ── Static generation ────────────────────────────────────────

export function generateStaticParams() {
  return getAllDepartamentos().map((dep) => ({
    departamento: dep.slug,
  }));
}

// ── Metadata ─────────────────────────────────────────────────

interface Props {
  params: Promise<{ departamento: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { departamento } = await params;
  const sedes = getSedesByDepartamento(departamento);
  if (!sedes.length) return {};

  const nombreDep = sedes[0].departamento;
  return {
    title: `Sedes en ${nombreDep} | Jardines del Renacer`,
    description: `Conoce nuestras ${sedes.length} sede${sedes.length !== 1 ? 's' : ''} en ${nombreDep}. Atención funeraria profesional y cercana a ti.`,
    openGraph: {
      title: `Sedes en ${nombreDep} | Jardines del Renacer`,
      description: `${sedes.length} puntos de atención en ${nombreDep}.`,
    },
  };
}

// ── Page ──────────────────────────────────────────────────────

export default async function DepartamentoPage({ params }: Props) {
  const { departamento } = await params;
  const sedes = getSedesByDepartamento(departamento);

  if (!sedes.length) notFound();

  const nombreDep = sedes[0].departamento;

  return (
    <>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#f6f4f2] via-white/70 to-[#f6f4f2]">
        {/* Dot grid background */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #3C60A2 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <Container>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm text-textLight mb-10 justify-center"
          >
            <Link
              href="/"
              className="hover:text-primary transition-colors duration-200"
            >
              Inicio
            </Link>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link
              href="/sedes"
              className="hover:text-primary transition-colors duration-200"
            >
              Sedes
            </Link>
            <svg
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-text font-medium">{nombreDep}</span>
          </nav>

          {/* Title */}
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-5">
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z"
                />
                <circle cx="12" cy="8" r="2" />
              </svg>
              Colombia
            </span>

            <h1 className="text-4xl md:text-5xl font-light text-text font-display mb-4">
              {nombreDep}
            </h1>

            <p className="text-lg text-textLight max-w-xl mx-auto">
              {sedes.length} sede{sedes.length !== 1 ? 's' : ''} disponible
              {sedes.length !== 1 ? 's' : ''} en este departamento
            </p>
          </div>
        </Container>
      </section>

      {/* Sede grid – usa datos en vivo desde localStorage via hook */}
      <section className="py-14 pb-28">
        <Container>
          <DepartamentoSedesClient
            departamentoSlug={departamento}
            fallbackSedes={sedes}
          />
        </Container>
      </section>
    </>
  );
}
