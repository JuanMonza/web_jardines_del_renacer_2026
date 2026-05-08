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
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

export default function HomePage() {
  const allPlans = Object.values(PLANS_CONFIG);
  const featuredPlans = allPlans.filter((plan) => plan.featured);
  const fallbackPlans = allPlans.filter((plan) => !plan.featured);
  const homePlans =
    featuredPlans.length >= 3
      ? featuredPlans.slice(0, 3)
      : [...featuredPlans, ...fallbackPlans.slice(0, 3 - featuredPlans.length)];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img_1 (21).webp"
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
                iconPath: 'M12 2C8.134 2 5 5.134 5 9c0 6.5 7 13 7 13s7-6.5 7-13c0-3.866-3.134-7-7-7zm0 9.75A2.75 2.75 0 1112 6.25a2.75 2.75 0 010 5.5z',
                link: '/servicios#funerarios',
              },
              {
                title: 'Planes de Previsión',
                description: 'Protege a tu familia y planifica con tranquilidad',
                iconPath: 'M12 2l8 4v6c0 5.25-3.438 9.969-8 11.5C7.438 21.969 4 17.25 4 12V6l8-4zm0 4.2L8 8v3.75c0 3.363 1.977 6.56 4 7.76 2.023-1.2 4-4.397 4-7.76V8l-4-1.8z',
                link: '/planes',
              },
              {
                title: 'Siempre Contigo',
                description: 'Transmisión en vivo 360 para acompanar la velacion desde cualquier lugar',
                iconPath: 'M12 21s-7-4.35-9.5-8.25C.89 10.22 1.29 6.5 4.11 4.68c2.02-1.3 4.68-.86 6.38 1.03 1.7-1.89 4.36-2.33 6.38-1.03 2.82 1.82 3.22 5.54 1.61 8.07C19 16.65 12 21 12 21z',
                link: '/siempre-contigo',
              },
            ].map((service, index) => (
              <FadeIn key={service.title} delay={index * 0.1}>
                <Link href={service.link}>
                  <div className="glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 h-full">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d={service.iconPath} />
                      </svg>
                    </div>
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
              title="Nuestros planes"
              subtitle="Elige el plan que mejor se adapte a tus necesidades"
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {homePlans.map((plan, index) => (
              <FadeIn key={plan.id} delay={index * 0.1}>
                <PlanFlipCard
                  id={plan.id}
                  name={plan.name}
                  tagline={plan.tagline}
                  price={plan.price}
                  image={plan.image}
                  benefits={plan.benefits}
                  planType={plan.planType}
                  description={plan.description}
                  includes={plan.includes}
                  geographicCoverage={plan.geographicCoverage}
                  conditions={plan.conditions}
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
                Ver nuestros planes
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* Recorrido 360 CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img_1 (21).webp"
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
                    src="/images/parque-conmemorativo-2026.webp"
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
                  <a href="https://conmemorativo-jr-2025.vercel.app/" target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full border-primary bg-white/95 text-primary hover:border-primary hover:bg-primary hover:text-white"
                    >
                      Ver Más
                    </Button>
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Repatriaciones */}
            <FadeIn delay={0.2}>
              <div className="glass rounded-2xl overflow-hidden group hover:shadow-glass-lg transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src="/images/Repatriaciones.jpg"
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
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full border-primary bg-white/95 text-primary hover:border-primary hover:bg-primary hover:text-white"
                    >
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
        </Container>

        <AlliesMarquee />
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

              <div className="glass rounded-3xl p-6 md:p-8 border border-primary/15 text-left">
                <div className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-6 items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-primary mb-2">
                      Contacto inmediato
                    </p>
                    <p className="text-2xl font-display text-text mb-2">
                      {CONTACT_INFO.primaryLine.number}
                    </p>
                    <p className="text-textLight">
                      {CONTACT_INFO.primaryLine.detail}. También puedes escribirnos por WhatsApp o encontrar la sede más cercana.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <a
                      href={buildWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-2xl bg-green-500 text-white px-5 py-4 text-center font-semibold hover:bg-green-600 transition-colors"
                    >
                      WhatsApp
                    </a>
                    <Link
                      href={CONTACT_INFO.locationsHref}
                      className="rounded-2xl glass border border-primary/20 px-5 py-4 text-center font-semibold text-primary hover:bg-primary/5 transition-colors"
                    >
                      Ver sedes
                    </Link>
                    <Link href="/contacto" className="rounded-2xl glass border border-primary/20 px-5 py-4 text-center font-semibold text-text hover:bg-primary/5 transition-colors">
                      Formulario
                    </Link>
                    <Link href="/agendar-visita" className="rounded-2xl glass border border-primary/20 px-5 py-4 text-center font-semibold text-text hover:bg-primary/5 transition-colors">
                      Agendar visita
                    </Link>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
