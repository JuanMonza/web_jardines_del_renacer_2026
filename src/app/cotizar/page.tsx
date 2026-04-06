import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { PLANS_CONFIG, PlanId } from '@/config/plans';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

type CotizarPageProps = {
  searchParams?: {
    plan?: string;
  };
};

function isValidPlanId(value: string): value is PlanId {
  return value in PLANS_CONFIG;
}

export default function CotizarPage({ searchParams }: CotizarPageProps) {
  const rawPlan = searchParams?.plan;
  const selectedPlan =
    rawPlan && isValidPlanId(rawPlan) ? PLANS_CONFIG[rawPlan] : null;

  const whatsappMessage = selectedPlan
    ? `Hola, quiero cotizar el plan ${selectedPlan.name} de Jardines del Renacer.`
    : 'Hola, quiero recibir una cotizacion de planes de Jardines del Renacer.';

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Cotizar Plan"
              subtitle="Te ayudamos a elegir la opcion ideal para tu familia."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <FadeIn>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <h3 className="text-2xl font-display text-text mb-4">
                  {selectedPlan ? `Plan seleccionado: ${selectedPlan.name}` : 'Solicita tu cotizacion personalizada'}
                </h3>

                <p className="text-textLight mb-6">
                  Comparte tus datos por WhatsApp o formulario y uno de nuestros asesores te contactara
                  para presentarte la mejor alternativa de cobertura.
                </p>

                {selectedPlan ? (
                  <div className="rounded-2xl border border-primary/15 bg-white/40 p-6 mb-6">
                    <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2">
                      {selectedPlan.tagline}
                    </p>
                    <p className="text-3xl font-semibold text-text mb-4">{selectedPlan.price}</p>
                    <ul className="space-y-2">
                      {selectedPlan.benefits.slice(0, 5).map((benefit) => (
                        <li key={benefit} className="flex items-start gap-2 text-sm text-textLight">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-primary/15 bg-white/40 p-6 mb-6">
                    <p className="text-textLight">
                      Puedes escoger un plan especifico desde la pagina de planes o hablar con un asesor
                      para recomendarte la opcion mas conveniente.
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <a href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full sm:w-auto">
                      Cotizar por WhatsApp
                    </Button>
                  </a>
                  <Link href="/contacto">
                    <Button variant="secondary" className="w-full sm:w-auto">
                      Cotizar por formulario
                    </Button>
                  </Link>
                  <Link href="/planes">
                    <Button variant="ghost" className="w-full sm:w-auto">
                      Ver todos los planes
                    </Button>
                  </Link>
                </div>
              </article>
            </FadeIn>

            <FadeIn delay={0.1}>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15 h-full">
                <h3 className="text-2xl font-display text-text mb-5">Atencion inmediata</h3>

                <div className="space-y-4 mb-6">
                  <a
                    href={CONTACT_INFO.primaryLine.href}
                    className="flex items-center justify-between rounded-2xl border border-primary/20 bg-white/40 px-5 py-4 hover:border-primary/40 transition-colors"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-primary mb-1">Linea principal</p>
                      <p className="text-text font-semibold">{CONTACT_INFO.primaryLine.number}</p>
                    </div>
                    <span className="text-primary text-sm font-medium">Llamar</span>
                  </a>

                  <a
                    href={buildWhatsAppUrl(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-green-500/30 bg-green-500/10 px-5 py-4 hover:border-green-600/50 transition-colors"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-green-700 mb-1">WhatsApp</p>
                      <p className="text-text font-semibold">{CONTACT_INFO.whatsappDisplay}</p>
                    </div>
                    <span className="text-green-700 text-sm font-medium">Escribir</span>
                  </a>
                </div>

                <p className="text-sm text-textLight">
                  Horario de atencion: {CONTACT_INFO.supportHours}. También puedes agendar una visita presencial para
                  resolver dudas y conocer nuestras instalaciones.
                </p>

                <Link href="/agendar-visita" className="block mt-5">
                  <Button variant="secondary" className="w-full">
                    Agendar visita presencial
                  </Button>
                </Link>
              </article>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
