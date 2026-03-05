import type { Metadata } from 'next';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import { getAllDepartamentos, SEDES } from '@/data/sedes';

export const metadata: Metadata = {
  title: 'Nuestras Sedes | Jardines del Renacer',
  description: `Encuentra nuestras ${SEDES.length} sedes de Jardines del Renacer distribuidas en toda Colombia. Atención presencial cerca de ti.`,
  openGraph: {
    title: 'Nuestras Sedes | Jardines del Renacer',
    description: `${SEDES.length} puntos de atención en todo el país.`,
  },
};

// Departamento color accent cycle for visual variety
const ACCENT_COLORS = [
  'from-blue-50 to-blue-100/60 border-blue-200/60 text-blue-700',
  'from-emerald-50 to-emerald-100/60 border-emerald-200/60 text-emerald-700',
  'from-violet-50 to-violet-100/60 border-violet-200/60 text-violet-700',
  'from-amber-50 to-amber-100/60 border-amber-200/60 text-amber-700',
  'from-rose-50 to-rose-100/60 border-rose-200/60 text-rose-700',
  'from-cyan-50 to-cyan-100/60 border-cyan-200/60 text-cyan-700',
  'from-indigo-50 to-indigo-100/60 border-indigo-200/60 text-indigo-700',
  'from-teal-50 to-teal-100/60 border-teal-200/60 text-teal-700',
  'from-orange-50 to-orange-100/60 border-orange-200/60 text-orange-700',
  'from-pink-50 to-pink-100/60 border-pink-200/60 text-pink-700',
  'from-lime-50 to-lime-100/60 border-lime-200/60 text-lime-700',
  'from-sky-50 to-sky-100/60 border-sky-200/60 text-sky-700',
];

export default function SedesPage() {
  const departamentos = getAllDepartamentos();
  const totalSedes = SEDES.length;

  return (
    <>
      {/* Hero section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#f6f4f2] via-white/70 to-[#f6f4f2]">
        {/* Subtle background pattern */}
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
          <SectionTitle
            title="Nuestras Sedes"
            subtitle={`Presentes en ${departamentos.length} departamentos con ${totalSedes} puntos de atención en todo el país`}
          />

          {/* Stats strip */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {[
              { label: 'Departamentos', value: departamentos.length },
              { label: 'Sedes', value: totalSedes },
              { label: 'Años de experiencia', value: '25+' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded-2xl px-8 py-4 text-center min-w-[140px]"
              >
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-textLight mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Department grid */}
      <section className="py-16 pb-28">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {departamentos.map((dep, index) => {
              const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
              return (
                <Link
                  key={dep.slug}
                  href={`/sedes/${dep.slug}`}
                  className="group relative glass rounded-2xl p-6 flex flex-col justify-between gap-5 hover:shadow-glass-lg hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
                >
                  {/* Subtle gradient overlay on hover */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  />

                  {/* Top row: icon + count badge */}
                  <div className="relative flex items-center justify-between">
                    <span className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-all duration-300 shrink-0">
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </span>

                    <span
                      className={`relative text-xs font-semibold px-3 py-1 rounded-full border bg-gradient-to-br ${accent}`}
                    >
                      {dep.count} sede{dep.count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Department name */}
                  <div className="relative">
                    <h2 className="text-xl font-semibold text-text group-hover:text-primary transition-colors duration-200 leading-tight">
                      {dep.nombre}
                    </h2>
                    <p className="text-sm text-textLight mt-1">Colombia</p>
                  </div>

                  {/* CTA arrow */}
                  <div className="relative flex items-center gap-1.5 text-primary text-sm font-medium">
                    Ver sedes
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
