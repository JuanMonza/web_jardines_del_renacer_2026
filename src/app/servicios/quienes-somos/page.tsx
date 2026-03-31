import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import {
  corporateValues,
  historyParagraphs,
  principles,
  whoWeAreParagraphs,
} from '@/content/company';

export default function QuienesSomosPage() {
  return (
    <>
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-[#f6f4f2] via-white/80 to-[#f6f4f2]">
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
          <FadeIn>
            <SectionTitle
              title="Quiénes Somos"
              subtitle="Más de 25 años acompañando a las familias colombianas con respeto, dignidad y sentido humano."
            />
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="glass rounded-3xl p-8 md:p-10 max-w-5xl mx-auto">
              <div className="space-y-5 text-textLight leading-relaxed text-lg">
                {whoWeAreParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {principles.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.1}>
                <div className="glass rounded-3xl p-8 h-full border border-primary/15">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary mb-4">
                    {item.title}
                  </p>
                  <p className="text-textLight leading-relaxed">{item.content}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="space-y-8">
            <FadeIn>
              <div className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <h3 className="text-3xl font-display text-text mb-6">
                  Reseña Histórica
                </h3>
                <div className="space-y-5 text-textLight leading-relaxed">
                  {historyParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <h3 className="text-3xl font-display text-text mb-6">
                  Valores Corporativos
                </h3>
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
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
