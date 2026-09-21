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
import { CONTACT_INFO, buildPlansWhatsAppUrl } from '@/config/contact';
import { ChevronRight, MapPinned, Phone, Send } from 'lucide-react';

// NOTA: Preparado para utilizar una única imagen corporativa y limpia (Suministrada por Hugo).
const heroImages = [
  '/images/carrusel_1.webp',
  '/images/commemorativo.jpeg',
  '/images/parque-conmemorativo-2026.webp',
];

// Agrega más imágenes según sea necesario
// Variable preparada para actualizar el texto de años de experiencia fácilmente, sin buscar en el HTML

const YEARS_OF_EXPERIENCE = "26 años";

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
              <a href={buildPlansWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
                <Button variant="primary" size="lg">
                  ¡Conoce nuestros planes!
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
            title="Servicios funerarios y planes"
            subtitle="Acompañamiento integral en los momentos más importantes"
          />
        </FadeIn>
        <Container>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                title: 'Servicios funerarios',
                description: 'Ceremonias dignas y personalizadas para despedir a tus seres queridos',
                imagePath: '/images/servicios_funerarios.jpg',
                link: '/servicios#funerarios',
                badge: '24 horas',
                tags: ['Velación', 'Cremación', 'Inhumación'],
              },
              {
                title: 'Planes de previsión',
                description: 'Protege a tu familia y planifica con tranquilidad desde hoy',
                imagePath: '/images/planes_funerarios.webp',
                link: '/planes',
                badge: 'Desde $0',
                tags: ['Familiar', 'Individual', 'Senior'],
              },
              {
                title: 'Siempre contigo',
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
            title="Nuestros planes"
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
                    window.location.href = `${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ''}/cotizar?plan=${planId}`;
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
            src={`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/img_1 (21).webp`}
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
                Iniciar recorrido virtual
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
                    src={`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/images/commemorativo.jpeg`}
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
                  <h3 className="text-2xl font-display font-extrabold mb-1 drop-shadow">Parque conmemorativo</h3>
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
                    src={`${process.env.NEXT_PUBLIC_TRAINING_BASE_PATH || ""}/images/Repatriaciones.webp`}
                    alt="Servicio de repatriaciones"
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
          title="Nuestros aliados"
          subtitle="Red de confianza al servicio de tu familia"
        />

        <AlliesMarquee />
      </section>

      {/* Contacto Final */}
      <section className="relative overflow-hidden py-20 glass">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-2/3 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <Container>
          <div className="relative mx-auto max-w-5xl text-center">
            <FadeIn>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-xs font-bold tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                DISPONIBLES 24/7
              </div>
              <h2 className="mb-4 text-3xl font-display font-extrabold text-text md:text-4xl">
                ¿Necesitas más información?
              </h2>
              <p className="mb-9 text-lg text-textLight">
                Nuestro equipo está disponible 24/7 para atenderte con profesionalismo y calidez
              </p>

              <div className="overflow-hidden rounded-[32px] border border-primary/15 bg-white/80 text-left shadow-[0_28px_70px_-42px_rgba(28,70,130,0.7)] backdrop-blur-xl">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.15fr]">
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#244f91] via-primary to-[#6289c3] p-7 text-white sm:p-9">
                    <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-white/20 bg-white/10" />
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                        <Phone className="h-6 w-6" />
                      </div>
                      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-white/75">Contacto inmediato</p>
                      <a href={CONTACT_INFO.primaryLine.href} className="mt-2 inline-flex text-3xl font-display font-extrabold transition hover:text-white/80 sm:text-4xl">
                        {CONTACT_INFO.primaryLine.number}
                      </a>
                      <p className="mt-3 max-w-sm leading-relaxed text-white/85">
                        {CONTACT_INFO.primaryLine.detail}. Llámanos ahora y recibe orientación de nuestro equipo.
                      </p>
                      <a href={CONTACT_INFO.primaryLine.href} className="mt-6 inline-flex items-center rounded-xl border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white hover:text-primary">
                        Llamar ahora <ChevronRight className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7 lg:flex lg:flex-col lg:justify-center">
                    <p className="mb-5 text-center text-lg font-semibold text-text">Elige la forma más cómoda de contactarnos</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <a
                      href={buildPlansWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex min-h-16 items-center gap-3 rounded-[20px] bg-gradient-to-r from-[#0fbb58] to-[#00a94c] px-5 py-3 text-white shadow-[0_10px_26px_rgba(4,157,77,0.18)] transition-all hover:-translate-y-0.5 hover:from-[#0da84f] hover:to-[#009b45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#009b45]"
                    >
                      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 shrink-0">
                        <path d="M20.52 3.48A11.88 11.88 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.3-1.65a11.9 11.9 0 0 0 5.75 1.46h.01c6.55 0 11.9-5.34 11.9-11.9a11.8 11.8 0 0 0-3.44-8.43ZM12.06 21.8c-1.76 0-3.49-.47-5-1.36l-.36-.21-3.73.98.99-3.64-.23-.37a9.83 9.83 0 0 1-1.5-5.29c0-5.44 4.43-9.87 9.88-9.87a9.8 9.8 0 0 1 6.98 2.9 9.8 9.8 0 0 1 2.89 6.99c0 5.44-4.43 9.87-9.87 9.87Zm5.42-7.4c-.3-.15-1.77-.88-2.04-.98-.27-.1-.47-.15-.66.15-.2.29-.76.98-.93 1.18-.17.2-.34.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.6.14-.14.3-.34.44-.51.15-.17.2-.29.3-.49.1-.2.05-.37-.03-.52-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.91 1.22 3.11c.15.2 2.1 3.21 5.08 4.5.71.3 1.27.49 1.7.63.71.23 1.35.2 1.86.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
                      </svg>
                      <span className="min-w-0 flex-1 text-[15px] font-bold leading-[1.2]"><span className="block">Consulta por</span><span className="block">nuestros planes</span></span>
                      <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
                    </a>
                    <Link
                      href={CONTACT_INFO.locationsHref}
                      className="group flex items-center justify-between rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4 font-bold text-primary transition-all hover:-translate-y-1 hover:bg-primary/10"
                    >
                      <span className="flex items-center gap-2"><MapPinned className="h-5 w-5" /> Ver sedes</span><ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/cotizar" className="group flex items-center justify-between rounded-2xl border border-primary/15 bg-white px-5 py-4 font-bold text-text transition-all hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/5">
                      <span className="flex items-center gap-2"><Send className="h-5 w-5 text-primary" /> Cotiza aquí</span><ChevronRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
                    </Link>
                    </div>
                    <p className="mt-5 flex items-center gap-2 text-xs text-textLight"><span className="h-2 w-2 rounded-full bg-green-500" /> Atención humana, inmediata y confidencial.</p>
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
