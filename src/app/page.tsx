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
  '/images/carrusel_1.webp',
  '/images/commemorativo.jpeg',
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
      <section className="relative min-h-[620px] lg:h-screen flex items-center justify-center overflow-hidden py-24 lg:py-0">
        <div className="absolute inset-0 z-0 bg-black">
          <Image
            key={`hero-blur-${currentImage}`}
            src={heroImages[currentImage]}
            alt=""
            fill
            aria-hidden="true"
            className="scale-110 object-cover blur-2xl md:hidden"
            sizes="100vw"
          />
          {heroImages.map((src, index) => (
            <Image
              key={src}
              src={src}
              alt={`Jardines del Renacer ${index + 1}`}
              fill
              className={`object-contain object-center transition-opacity duration-1000 md:object-cover ${
                index === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
              sizes="100vw"
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
              Un lugar para trascender, un espacio para renacer.
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
                  ¡ Afíliate Ya !
                </Button>
              </a>
              <Link href="/proximamente">
                <Button variant="secondary" size="lg">
                  Recorre nuestras salas
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
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: 'Servicios Funerarios',
                description: 'Ceremonias dignas y personalizadas para despedir a tus seres queridos',
                imagePath: '/images/servicios_funerarios.jpg',
                link: '/servicios#funerarios',
                badge: '24 horas',
                tags: ['Velación', 'Cremación', 'Inhumación'],
              },
              {
                title: 'Planes de Previsión',
                description: 'Protege a tu familia y planifica con tranquilidad desde hoy',
                imagePath: '/images/planes_funerarios.webp',
                link: '/planes',
                badge: 'Desde $0',
                tags: ['Familiar', 'Individual', 'Senior'],
              },
              {
                title: 'Siempre Contigo',
                description: 'Transmisión en vivo 360° para acompañar la velación desde cualquier lugar',
                imagePath: '/images/siempre_contigo.jpg',
                link: '/siempre-contigo',
                badge: 'Live 360°',
                tags: ['En vivo', 'Multidispositivo', 'HD'],
              },
            ].map((service, index) => (
              <FadeIn key={service.title} delay={index * 0.1}>
                <Link href={service.link} className="group block">
                  <div className="relative h-80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                    <Image
                      src={service.imagePath}
                      alt={service.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-black/25 to-transparent" />
                    <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-blue-800 bg-opacity-80 backdrop-blur-sm border border-white/30 px-3 py-1.5 text-xs font-bold text-white">
                      {service.badge}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-display font-extrabold mb-1 drop-shadow">{service.title}</h3>
                      <p className="text-sm text-white font-bold mb-3 leading-relaxed">{service.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.tags.map((tag) => (
                          <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">{tag}</span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        Ver más
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </span>
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
              <Button
                variant="primary"
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary to-[#5a7ec0] text-white shadow-lg shadow-primary/30 transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
              >
                <span className="absolute -inset-full top-0 block animate-[pulse_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></span>
                <span className="relative">Ver todos los planes</span>
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
              <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src="/images/commemorativo.jpeg"
                    alt="Parque Conmemorativo"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {/* Badge */}
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm border border-white/30">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    Espacio sagrado
                  </span>
                </div>
                {/* Content panel */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-display font-extrabold mb-1 drop-shadow">Parque Conmemorativo</h3>
                  <p className="text-sm text-white/85 mb-4 leading-relaxed">
                    Un espacio natural de paz, tranquilidad y dignidad para honrar la memoria de quienes amamos.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Senderos de paz', 'Jardines eternos', 'Capilla'].map((tag) => (
                      <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">{tag}</span>
                    ))}
                  </div>
                  <a href="https://conmemorativo-jr-2025.vercel.app/" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all duration-300">
                    Conocer el parque
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Repatriaciones */}
            <FadeIn delay={0.15}>
              <div className="group relative rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src="/images/Repatriaciones.webp"
                    alt="Servicio de Repatriaciones"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  {/* Badge */}
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm border border-white/30">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>
                    Nacional e Internacional
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-display font-extrabold mb-1 drop-shadow">Repatriaciones</h3>
                  <p className="text-sm text-white/85 mb-4 leading-relaxed">
                    Gestión integral del traslado de restos mortales con acompañamiento 24/7, cumpliendo todos los requisitos legales.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Atención 24/7', 'Trámites incluidos', 'Internacional'].map((tag) => (
                      <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">{tag}</span>
                    ))}
                  </div>
                  <Link href="/repatriaciones"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all duration-300">
                    Ver servicio
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
