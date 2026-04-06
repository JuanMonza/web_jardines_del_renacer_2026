import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import { corporateValues, historyParagraphs } from '@/content/company';

const timeline = [
  {
    year: '2000',
    milestone: 'Inicio de operaciones en Pereira con enfoque social y cobertura accesible.',
  },
  {
    year: '2010',
    milestone: 'Consolidacion en el Eje Cafetero y fortalecimiento de convenios funerarios.',
  },
  {
    year: '2020',
    milestone: 'Expansion nacional con sedes en ciudades principales y mayor capacidad operativa.',
  },
  {
    year: 'Hoy',
    milestone: 'Servicio integral con acompanamiento humano, cobertura nacional y mejora continua.',
  },
];

export default function ResenaHistoricaPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Resena Historica"
              subtitle="Un camino construido con compromiso, respeto y vocacion de servicio."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="space-y-8">
            <FadeIn>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <div className="space-y-5 text-textLight leading-relaxed">
                  {historyParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </FadeIn>

            <FadeIn delay={0.1}>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <h3 className="text-2xl font-display text-text mb-6">Linea de tiempo</h3>
                <div className="space-y-5">
                  {timeline.map((item) => (
                    <div key={item.year} className="grid grid-cols-[90px_1fr] gap-4 items-start">
                      <span className="inline-flex justify-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                        {item.year}
                      </span>
                      <p className="text-textLight">{item.milestone}</p>
                    </div>
                  ))}
                </div>
              </article>
            </FadeIn>

            <FadeIn delay={0.2}>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <h3 className="text-2xl font-display text-text mb-4">Valores corporativos</h3>
                <div className="flex flex-wrap gap-3">
                  {corporateValues.map((value) => (
                    <span
                      key={value}
                      className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </article>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
