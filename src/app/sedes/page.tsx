import type { Metadata } from 'next';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import SedesExplorer from '@/components/sedes/SedesExplorer';
import { getAllDepartamentos, SEDES } from '@/data/sedes';

export const metadata: Metadata = {
  title: 'Nuestras Sedes | Jardines del Renacer',
  description: `Encuentra nuestras ${SEDES.length} sedes de Jardines del Renacer distribuidas en toda Colombia. Atención presencial cerca de ti.`,
  openGraph: {
    title: 'Nuestras Sedes | Jardines del Renacer',
    description: `${SEDES.length} puntos de atención en todo el país.`,
  },
};

export default function SedesPage() {
  const departamentos = getAllDepartamentos();
  const totalSedes = SEDES.length;

  return (
    <>
      <PageHero
        title="Nuestras Sedes"
        subtitle={`Presentes en ${departamentos.length} departamentos con ${totalSedes} puntos de atención en todo el país`}
        image="/images/images-baners/nuetrasedes.webp"
        imageAlt="Sedes Jardines del Renacer"
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

      {/* Buscador + grid de departamentos / sedes */}
      <div className="py-20 pb-28">
        <SedesExplorer departamentos={departamentos} sedes={SEDES} />
      </div>
    </>
  );
}
