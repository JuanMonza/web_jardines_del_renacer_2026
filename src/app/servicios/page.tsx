import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';

const serviceHighlights = [
  {
    title: 'Atencion Exequial Integral',
    description:
      'Acompanamiento humano y logistico 24/7 para cada etapa del servicio funerario.',
    bullets: ['Traslado y preparacion', 'Salas de velacion', 'Ceremonia y destino final'],
  },
  {
    title: 'Planes de Prevision',
    description:
      'Proteccion anticipada para tu familia con opciones flexibles de cobertura.',
    bullets: ['Cobertura familiar', 'Facilidad de pago', 'Asesoria permanente'],
  },
  {
    title: 'Servicios Complementarios',
    description:
      'Soluciones adicionales para un homenaje completo y respetuoso.',
    bullets: ['Floreria', 'Repatriaciones', 'Acompaniamiento legal'],
  },
];

export default function ServiciosPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Servicios"
              subtitle="Acompanamos a las familias con respeto, calidez y respaldo profesional."
            />
          </FadeIn>
        </Container>
      </section>

      <section id="funerarios" className="pb-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceHighlights.map((item, index) => (
              <FadeIn key={item.title} delay={index * 0.1}>
                <article className="glass rounded-3xl p-8 h-full border border-primary/15">
                  <h3 className="text-2xl font-display text-text mb-3">{item.title}</h3>
                  <p className="text-textLight mb-5 leading-relaxed">{item.description}</p>
                  <ul className="space-y-2">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-text">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-12 glass rounded-3xl p-8 border border-primary/15">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-primary mb-2">
                    Atencion inmediata
                  </p>
                  <h3 className="text-2xl font-display text-text mb-2">
                    ¿Necesitas orientacion para un servicio?
                  </h3>
                  <p className="text-textLight">
                    Nuestro equipo te acompania paso a paso para definir la opcion ideal segun tu necesidad.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/cotizar">
                    <Button variant="primary">Cotizar plan</Button>
                  </Link>
                  <Link href="/agendar-visita">
                    <Button variant="secondary">Agendar visita</Button>
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
