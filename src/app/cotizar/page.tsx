import Link from 'next/link';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import CotizarQuoteForm from '@/components/cotizar/CotizarQuoteForm';
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
      <PageHero
        title="Afíliate Ya"
        subtitle="Te ayudamos a elegir la opción ideal para proteger a tu familia con asesoría clara y acompañamiento humano."
        image="/images/images-baners/afiliateya.webp"
        imageAlt="Afiliación a planes Jardines del Renacer"
      >
        <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            ['Respuesta', 'Asesoría prioritaria'],
            ['Cobertura', 'Opciones para tu familia'],
            ['Canales', 'WhatsApp o llamada'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/25 bg-white/90 px-4 py-3 text-center shadow-xl">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-primary">{label}</p>
              <p className="text-sm font-semibold text-text">{value}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="py-20 md:py-24">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)] gap-8 xl:gap-10">
            <FadeIn>
              <article className="glass rounded-[2rem] p-6 md:p-10 xl:p-12 border border-primary/15">
                <div className="space-y-8">
                  <header>
                    <h3 className="text-2xl md:text-3xl font-display text-text mb-3">
                  {selectedPlan ? `Plan seleccionado: ${selectedPlan.name}` : 'Solicita tu cotizacion personalizada'}
                    </h3>

                    <p className="text-textLight leading-relaxed max-w-3xl">
                      Comparte tus datos por WhatsApp y uno de nuestros asesores te contactara
                      para presentarte la mejor alternativa de cobertura.
                    </p>
                  </header>

                  {selectedPlan ? (
                    <div className="rounded-3xl border border-primary/15 bg-white/50 p-6 md:p-7">
                      <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-primary mb-2">
                        {selectedPlan.planType} / {selectedPlan.geographicCoverage}
                      </p>
                      <p className="text-3xl font-semibold text-text mb-5">{selectedPlan.price}</p>
                      <p className="text-sm text-textLight leading-relaxed mb-5">
                        {selectedPlan.description}
                      </p>
                      <div className="rounded-2xl border border-primary/15 bg-white/60 p-4 mb-5">
                        <p className="text-xs uppercase tracking-[0.14em] text-primary mb-1">Incluye</p>
                        <p className="text-sm text-textLight leading-relaxed">{selectedPlan.includes}</p>
                      </div>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {selectedPlan.benefits.slice(0, 6).map((benefit) => (
                          <li key={benefit} className="flex items-start gap-2 text-sm text-textLight">
                            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-textLight mt-5">
                        Condiciones: {selectedPlan.conditions}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-primary/15 bg-white/50 p-6 md:p-7">
                      <p className="text-textLight leading-relaxed">
                        Puedes escoger un plan especifico desde la pagina de planes o hablar con un asesor
                        para recomendarte la opcion mas conveniente.
                      </p>
                    </div>
                  )}

                  <CotizarQuoteForm
                    selectedPlan={
                      selectedPlan
                        ? {
                            id: selectedPlan.id,
                            name: selectedPlan.name,
                            tagline: selectedPlan.tagline,
                            price: selectedPlan.price,
                          }
                        : null
                    }
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <a
                      href={buildWhatsAppUrl(whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="primary" className="w-full justify-center" size="lg">
                        Cotizar por WhatsApp
                      </Button>
                    </a>
                    <Link href="/planes" className="w-full">
                      <Button variant="ghost" className="w-full justify-center" size="lg">
                        Ver todos los planes
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            </FadeIn>

            <FadeIn delay={0.1}>
              <article className="glass rounded-[2rem] p-6 md:p-8 border border-primary/15 h-fit xl:sticky xl:top-24">
                <h3 className="text-2xl font-display text-text mb-2">Atencion inmediata</h3>
                <p className="text-sm text-textLight leading-relaxed mb-6">
                  Si prefieres una gestion directa, usa estos canales y te orientamos en minutos.
                </p>

                <div className="space-y-4 mb-7">
                  <a
                    href={CONTACT_INFO.primaryLine.href}
                    className="flex items-center justify-between rounded-2xl border border-primary/20 bg-white/50 px-5 py-4 hover:border-primary/40 transition-colors"
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

                <p className="text-sm text-textLight leading-relaxed">
                  Horario de atencion: {CONTACT_INFO.supportHours}. También puedes agendar una visita presencial para
                  resolver dudas y conocer nuestras instalaciones.
                </p>

                <Link href="/agendar-visita" className="block mt-6">
                  <Button variant="secondary" className="w-full justify-center" size="lg">
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
