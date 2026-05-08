import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

const VISIT_MESSAGE =
  'Hola, quiero agendar una visita presencial para conocer las salas y servicios de Jardines del Renacer.';

const steps = [
  {
    title: '1. Reserva',
    description: 'Coordina fecha y ciudad por WhatsApp o linea telefonica.',
  },
  {
    title: '2. Confirmacion',
    description: 'Nuestro equipo valida disponibilidad y te confirma la visita.',
  },
  {
    title: '3. Acompanamiento',
    description: 'Un asesor te recibe y responde todas tus preguntas en sitio.',
  },
];

export default function AgendarVisitaPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Agendar Visita"
              subtitle="Conoce nuestras instalaciones y recibe asesoria personalizada."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
            <FadeIn>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <h3 className="text-2xl font-display text-text mb-4">Proceso de visita</h3>
                <div className="space-y-4 mb-8">
                  {steps.map((step) => (
                    <div key={step.title} className="rounded-2xl border border-primary/15 bg-white/40 p-5">
                      <p className="font-semibold text-text mb-1">{step.title}</p>
                      <p className="text-textLight">{step.description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-primary/15 bg-white/40 p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2">Canales de agenda</p>
                  <p className="text-text mb-1">
                    WhatsApp: <span className="font-semibold">{CONTACT_INFO.whatsappDisplay}</span>
                  </p>
                  <p className="text-text">
                    Linea principal: <span className="font-semibold">{CONTACT_INFO.primaryLine.number}</span>
                  </p>
                </div>
              </article>
            </FadeIn>

            <FadeIn delay={0.1}>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15 h-full">
                <h3 className="text-2xl font-display text-text mb-4">Agenda ahora</h3>
                <p className="text-textLight mb-6">
                  Comparte ciudad, fecha tentativa y cantidad de asistentes. Te responderemos con la mejor opcion disponible.
                </p>

                <div className="space-y-3">
                  <a href={buildWhatsAppUrl(VISIT_MESSAGE)} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full">
                      Agendar por WhatsApp
                    </Button>
                  </a>

                  <a href={CONTACT_INFO.primaryLine.href}>
                    <Button variant="secondary" className="w-full bg-rose-400 hover:bg-rose-500 border-none text-white">
                      Llamar para agendar
                    </Button>
                  </a>

                  <Link href="/ubicaciones">
                    <Button variant="ghost" className="w-full">
                      Ver sedes disponibles
                    </Button>
                  </Link>
                </div>
              </article>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
