import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';

const faqs = [
  {
    question: '¿Atienden casos de urgencia las 24 horas?',
    answer:
      'Si. Nuestro equipo de atencion opera 24/7 para reportes de fallecimiento y orientacion inmediata.',
  },
  {
    question: '¿Puedo cotizar un plan sin compromiso?',
    answer:
      'Si. Puedes solicitar una cotizacion por WhatsApp, telefono o formulario para comparar opciones segun tu necesidad.',
  },
  {
    question: '¿Tienen cobertura nacional?',
    answer:
      'Contamos con presencia en diferentes ciudades del pais y red de aliados para brindar atencion oportuna.',
  },
  {
    question: '¿Cómo funciona el servicio de repatriaciones?',
    answer:
      'Incluye coordinacion logistico-documental y acompanamiento para traslados nacionales e internacionales.',
  },
  {
    question: '¿Puedo agendar una visita antes de contratar?',
    answer:
      'Claro. Puedes solicitar visita presencial para conocer instalaciones, servicios y resolver dudas con un asesor.',
  },
];

export default function FaqPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Preguntas Frecuentes"
              subtitle="Respuestas rápidas para ayudarte a tomar decisiones con tranquilidad."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <FadeIn key={item.question} delay={index * 0.05}>
                <article className="glass rounded-2xl p-6 border border-primary/15">
                  <h3 className="text-lg font-semibold text-text mb-2">{item.question}</h3>
                  <p className="text-textLight leading-relaxed">{item.answer}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
