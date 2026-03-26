'use client';

import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import PlanFlipCard from '@/components/cards/PlanFlipCard';
import AlliesMarquee from '@/components/animations/AlliesMarquee';
import FadeIn from '@/components/animations/FadeIn';
import { PLANS_CONFIG } from '@/config/plans';

export default function HomePage() {
  const featuredPlans = Object.values(PLANS_CONFIG).filter(plan => plan.featured);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-parque.jpg"
            alt="Jardines del Renacer"
            fill
            className="object-cover brightness-100"
            priority
          />
          {/* Overlay sutil solo en la parte del texto para legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
        </div>

        <Container className="relative z-10 text-center text-white">
          <FadeIn>
            <h1 className="text-5xl md:text-7xl font-display mb-6 text-balance drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Un lugar para recordar, un espacio para renacer
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-balance drop-shadow-lg animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              Cuidando de cada detalle para una despedida con amor
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Link href="#conoce-mas">
                <Button variant="primary" size="lg">
                  Conoce Más
                </Button>
              </Link>
              <Link href="/recorrido-360">
                <Button variant="secondary" size="lg">
                  Recorre Nuestras Salas
                </Button>
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Servicios Principales */}
      <section className="py-20" id="conoce-mas">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Servicios Funerarios y Planes"
              subtitle="Acompañamiento integral en los momentos más importantes"
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                title: 'Servicios Funerarios',
                description: 'Ceremonias dignas y personalizadas para despedir a tus seres queridos',
                icon: '',
                link: '/servicios#funerarios',
              },
              {
                title: 'Planes de Previsión',
                description: 'Protege a tu familia y planifica con tranquilidad',
                icon: '',
                link: '/planes',
              },
              {
                title: 'Siempre Contigo',
                description: '"Cerca, Incluso cuando no puedes estar"',
                icon: '',
                link: '/obituarios',
              },
            ].map((service, index) => (
              <FadeIn key={service.title} delay={index * 0.1}>
                <Link href={service.link}>
                  <div className="glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 h-full">
                    <div className="text-5xl mb-4">{service.icon}</div>
                    <h3 className="text-2xl font-display mb-4 text-text">
                      {service.title}
                    </h3>
                    <p className="text-textLight">
                      {service.description}
                    </p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Planes Destacados */}
      <section className="py-20 bg-white/50">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Planes para tu Familia"
              subtitle="Elige el plan que mejor se adapte a tus necesidades"
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {featuredPlans.map((plan, index) => (
              <FadeIn key={plan.id} delay={index * 0.1}>
                <PlanFlipCard
                  id={plan.id}
                  name={plan.name}
                  tagline={plan.tagline}
                  price={plan.price}
                  image={plan.image}
                  benefits={plan.benefits}
                  featured={plan.featured}
                  onQuote={(planId) => {
                    window.location.href = `/cotizar?plan=${planId}`;
                  }}
                />
              </FadeIn>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/planes">
              <Button variant="outline" size="lg">
                Ver Todos los Planes
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Recorrido 360 CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/sala-360.jpg"
            alt="Recorrido 360"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <Container className="relative z-10 text-center text-white">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-display mb-6">
              Conoce nuestras instalaciones desde casa
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Recorre virtualmente nuestras salas y jardines con tecnología 360°
            </p>
            <Link href="/recorrido-360">
              <Button variant="primary" size="lg">
                Iniciar Recorrido Virtual
              </Button>
            </Link>
          </FadeIn>
        </Container>
      </section>

      {/* Parque Conmemorativo y Repatriaciones */}
      <section className="py-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Parque Conmemorativo */}
            <FadeIn>
              <div className="glass rounded-2xl overflow-hidden group hover:shadow-glass-lg transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/images/parque-conmemorativo.jpg"
                    alt="Parque Conmemorativo"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-display mb-2">Parque Conmemorativo</h3>
                    <p className="text-sm mb-4 opacity-90">
                      Un espacio natural de paz y tranquilidad para honrar la memoria
                    </p>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <Link href="/parque-conmemorativo">
                    <Button variant="outline" size="md" className="w-full">
                      Ver Más
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>

            {/* Repatriaciones */}
            <FadeIn delay={0.2}>
              <div className="glass rounded-2xl overflow-hidden group hover:shadow-glass-lg transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/images/repatriaciones.jpg"
                    alt="Servicio de Repatriaciones"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-display mb-2">Repatriaciones</h3>
                    <p className="text-sm mb-4 opacity-90">
                      Servicio completo de repatriación nacional e internacional
                    </p>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <Link href="/repatriaciones">
                    <Button variant="outline" size="md" className="w-full">
                      Ver Más
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Aliados */}
      <section className="py-20">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Nuestros Aliados"
              subtitle="Red de confianza al servicio de tu familia"
            />
          </FadeIn>

          <AlliesMarquee />
        </Container>
      </section>

      {/* Contacto Final */}
      <section className="py-20 glass">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <FadeIn>
              <h2 className="text-3xl md:text-4xl font-display mb-6 text-text">
                ¿Necesitas más información?
              </h2>
              <p className="text-lg text-textLight mb-8">
                Nuestro equipo está disponible 24/7 para atenderte con profesionalismo y calidez
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contacto">
                  <Button variant="primary" size="lg">
                    Contactar Ahora
                  </Button>
                </Link>
                <Link href="/agendar-visita">
                  <Button variant="outline" size="lg">
                    Agendar Visita
                  </Button>
                </Link>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
