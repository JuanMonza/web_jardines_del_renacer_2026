'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import TitleBand from '@/components/ui/TitleBand';
import PlanFlipCard from '@/components/cards/PlanFlipCard';
import AlliesMarquee from '@/components/animations/AlliesMarquee';
import FadeIn from '@/components/animations/FadeIn';
import { PLANS_CONFIG } from '@/config/plans';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

// NOTA: Preparado para utilizar una única imagen corporativa y limpia (Suministrada por Hugo).
const heroImages = [
  '/images/commemorativo.jpeg',
  '/images/carrusel_1.jpg',
  '/images/carrusel_2.jpg',
  '/images/parque-conmemorativo-2026.webp',
];

// Agrega más imágenes según sea necesario
// Variable preparada para actualizar el texto de años de experiencia fácilmente, sin buscar en el HTML

const YEARS_OF_EXPERIENCE = "Más de +25 años"; // Cambiar a "26 años" según confirmación definitiva

export default function HomePage() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Cambia la imagen cada 5 segundos
    return () => clearInterval(timer);
  }, []);

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
      <section className="relative h-[80vh] lg:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          {heroImages.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`Jardines del Renacer ${index + 1}`}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === 0}
            />
          ))}
          {/* Overlay oscuro mejorado para garantizar legibilidad y alto contraste */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <Container className="relative z-10 text-center text-white pt-16 lg:pt-0">
          <FadeIn>
            <p className="text-sm md:text-base font-bold uppercase tracking-widest text-white/90 mb-4 drop-shadow-md">
              {YEARS_OF_EXPERIENCE} de servicio institucional
            </p>
          </FadeIn>
          <FadeIn>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold mb-6 text-balance drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-2">
              Un lugar para recordar, un espacio para renacer
            </h1>
          </FadeIn>
          <FadeIn delay={0.3}>
            <p className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto text-balance drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              Cuidando de cada detalle para una despedida con amor
            </p>
          </FadeIn>
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <a href={buildWhatsAppUrl('Hola jardines, quisiera mas informacion sobre planes')} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg">
                  ¡ Cotiza Ya !
                </Button>
              </a>
              <Link href="/proximamente">
                <Button variant="secondary" size="lg">
                  Recorre Nuestras Salas
                </Button>
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Servicios Principales */}
      <section className="pb-20" id="conoce-mas">
        <FadeIn>
          <TitleBand
            title="Servicios Funerarios y Planes"
            subtitle="Acompañamiento integral en los momentos más importantes"
          />
        </FadeIn>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              {
                title: 'Servicios Funerarios',
                description: 'Ceremonias dignas y personalizadas para despedir a tus seres queridos',
                imagePath: '/images/servicios_funerarios.jpg',
                link: '/servicios#funerarios',
              },
              {
                title: 'Planes de Previsión',
                description: 'Protege a tu familia y planifica con tranquilidad',
                imagePath: '/images/planes_funerarios.jpg',
                link: '/planes',
              },
              {
                title: 'Siempre Contigo',
                description: 'Transmisión en vivo 360 para acompanar la velacion desde cualquier lugar',
                imagePath: '/images/siempre_contigo.jpg',
                link: '/siempre-contigo',
              },
            ].map((service, index) => (
              <FadeIn key={service.title} delay={index * 0.1}>
                <Link href={service.link} className="group block h-full">
                  <div className="glass rounded-3xl hover:scale-105 hover:shadow-xl transition-all duration-300 h-full border border-primary/10 overflow-hidden flex flex-col">
                    {/* Imagen superior a todo lo ancho */}
                    <div className="relative w-full h-48 sm:h-56">
                      <Image 
                        src={service.imagePath} 
                        alt={service.title} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    {/* Contenedor del texto inferior */}
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-2xl font-display mb-4 text-text">
                        {service.title}
                      </h3>
                      <p className="text-textLight mb-6">
                        {service.description}
                      </p>
                      <div className="mt-auto inline-flex items-center text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                        Ver más
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Planes Destacados */}
      <section className="py-20 bg-white/50">
        <FadeIn>
          <TitleBand
            title="Nuestros Planes"
            subtitle="Elige el plan que mejor se adapte a tus necesidades"
          />
        </FadeIn>
        <Container>
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
            <Link href="/proximamente">
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
                    src="/images/commemorativo.jpeg"
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
        <TitleBand
          title="Nuestros Aliados"
          subtitle="Red de confianza al servicio de tu familia"
        />

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
