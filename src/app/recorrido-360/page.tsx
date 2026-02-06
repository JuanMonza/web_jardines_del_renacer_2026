import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import Link from 'next/link';

export default function Recorrido360Page() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-background to-white/50">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Recorrido Virtual 360°"
              subtitle="Conoce nuestras instalaciones desde la comodidad de tu hogar"
            />
          </FadeIn>
        </Container>
      </section>

      {/* Matterport Embed */}
      <section className="py-12">
        <Container maxWidth="2xl">
          <FadeIn delay={0.2}>
            <div className="glass rounded-2xl overflow-hidden">
              <div className="aspect-video w-full bg-gray-100 flex items-center justify-center">
                <iframe
                  src="AQUI_INSERTA_TU_LINK_MATTERPORT"
                  className="w-full h-full min-h-[600px]"
                  allow="xr-spatial-tracking"
                  allowFullScreen
                  title="Recorrido Virtual Jardines del Renacer"
                />
                {/* Placeholder mientras configuras Matterport */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display text-text mb-3">
                    Recorrido Virtual Interactivo
                  </h3>
                  <p className="text-textLight max-w-md">
                    Aquí se cargará el tour virtual 360° de Matterport.
                    Inserta tu enlace en el src del iframe.
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Beneficios */}
      <section className="py-20">
        <Container>
          <FadeIn delay={0.3}>
            <SectionTitle
              title="¿Por qué visitar virtualmente?"
              subtitle="Ventajas de conocernos primero online"
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {[
              {
                icon: '🏡',
                title: 'Desde tu hogar',
                description: 'Explora sin necesidad de desplazarte',
              },
              {
                icon: '⏰',
                title: 'Disponible 24/7',
                description: 'Visita cuando lo necesites, a cualquier hora',
              },
              {
                icon: '👨‍👩‍👧',
                title: 'Con tu familia',
                description: 'Comparte la experiencia con tus seres queridos',
              },
              {
                icon: '📐',
                title: 'Vista completa',
                description: 'Recorre cada sala y espacio con detalle',
              },
              {
                icon: '💡',
                title: 'Toma decisiones informadas',
                description: 'Conoce antes de visitar físicamente',
              },
              {
                icon: '🎯',
                title: 'Interactivo',
                description: 'Navega libremente por todas las áreas',
              },
            ].map((benefit, index) => (
              <FadeIn key={benefit.title} delay={0.4 + index * 0.1}>
                <div className="glass rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-display mb-2 text-text">
                    {benefit.title}
                  </h3>
                  <p className="text-textLight">
                    {benefit.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 glass">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl font-display mb-4 text-text">
                ¿Te gustaría visitarnos en persona?
              </h2>
              <p className="text-lg text-textLight mb-8">
                Agenda una visita presencial y conoce personalmente nuestras instalaciones
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg">
                  Agendar Visita Presencial
                </Button>
                <Button variant="outline" size="lg">
                  Contactar Asesor
                </Button>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
