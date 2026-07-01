'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import TitleBand from '@/components/ui/TitleBand';
import PlanFlipCard from '@/components/cards/PlanFlipCard';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { PLANS_CONFIG } from '@/config/plans';
import { buildWhatsAppUrl } from '@/config/contact';

export default function PlanesPage() {
  const allPlans = Object.values(PLANS_CONFIG);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const categories = [
    'Todos',
    'Destacados',
    ...Array.from(new Set(allPlans.map((plan) => plan.planType).filter(Boolean))),
  ];
  const visiblePlans =
    activeCategory === 'Todos'
      ? allPlans
      : activeCategory === 'Destacados'
        ? allPlans.filter((plan) => plan.featured)
        : allPlans.filter((plan) => plan.planType === activeCategory);

  return (
    <>
      <PageHero
        title="Nuestros Planes"
        subtitle="Soluciones de previsión diseñadas para cuidar a tu familia con respaldo, claridad y acompañamiento humano."
        image="/images/images-baners/planes_jr.webp"
        imageAlt="Planes funerarios Jardines del Renacer"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/cotizar">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Cotizar plan
            </Button>
          </Link>
          <a href={buildWhatsAppUrl('Hola Jardines del Renacer, quiero asesoria para elegir un plan.')} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white/90">
              Hablar con un asesor
            </Button>
          </a>
        </div>
      </PageHero>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ['Cobertura nacional', 'Respaldo para familias en diferentes ciudades del país.'],
              ['Asesoría personalizada', 'Te ayudamos a elegir según tu núcleo familiar y necesidad.'],
              ['Atención ágil', 'Cotiza por WhatsApp o formulario sin pasos innecesarios.'],
            ].map(([title, description]) => (
              <FadeIn key={title}>
                <div className="glass h-full rounded-2xl border border-primary/15 p-6">
                  <p className="text-lg font-bold text-primary">{title}</p>
                  <p className="mt-2 text-sm text-textLight">{description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <TitleBand
          title="Elige tu plan"
          subtitle="Filtra por tipo de cobertura y revisa los beneficios principales."
        />
        <Container>
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition-all ${
                  activeCategory === category
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20'
                    : 'border-primary/20 bg-white text-primary hover:border-primary hover:bg-primary/5'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePlans.map((plan, index) => (
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

          <div className="mt-12 rounded-3xl bg-primary p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl font-display font-extrabold">¿No sabes cuál elegir?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-white/90">
              Un asesor puede ayudarte a comparar cobertura, condiciones y beneficios antes de cotizar.
            </p>
            <a href={buildWhatsAppUrl('Hola Jardines del Renacer, necesito ayuda para elegir el plan ideal.')} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex">
              <Button variant="secondary" size="lg" className="bg-white/95">
                Recibir asesoría
              </Button>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
