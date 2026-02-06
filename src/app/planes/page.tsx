'use client';

import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import PlanFlipCard from '@/components/cards/PlanFlipCard';
import FadeIn from '@/components/animations/FadeIn';
import { PLANS_CONFIG } from '@/config/plans';

export default function PlanesPage() {
  const allPlans = Object.values(PLANS_CONFIG);

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/50">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Nuestros Planes"
              subtitle="Soluciones personalizadas para cada familia"
            />
          </FadeIn>
        </Container>
      </section>

      <section className="py-12 pb-20">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPlans.map((plan, index) => (
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
        </Container>
      </section>
    </>
  );
}
