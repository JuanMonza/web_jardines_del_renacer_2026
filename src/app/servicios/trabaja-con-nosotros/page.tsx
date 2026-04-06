import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/config/contact';

const opportunities = [
  {
    area: 'Atencion y servicio al cliente',
    profile: 'Personas con empatia, escucha activa y orientacion al servicio.',
  },
  {
    area: 'Operacion y logistica',
    profile: 'Perfiles con experiencia en coordinacion, movilidad y cumplimiento de protocolos.',
  },
  {
    area: 'Comercial y bienestar',
    profile: 'Talento con habilidades de relacionamiento, acompanamiento y gestion de soluciones.',
  },
  {
    area: 'Tecnologia y gestion administrativa',
    profile: 'Profesionales enfocados en calidad de procesos, datos y mejora continua.',
  },
];

const benefits = [
  'Acompanamiento y formacion continua',
  'Ambiente de trabajo respetuoso y humano',
  'Oportunidades de crecimiento interno',
  'Impacto real en el bienestar de las familias',
];

const WHATSAPP_APPLY_MESSAGE =
  'Hola, quiero postularme para trabajar en Jardines del Renacer. ¿Me pueden compartir el proceso de aplicacion?';

export default function TrabajaConNosotrosPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Trabaja con Nosotros"
              subtitle="Buscamos personas comprometidas con el servicio humano y la excelencia."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <FadeIn>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15">
                <h3 className="text-2xl font-display text-text mb-5">Perfiles que buscamos</h3>
                <div className="space-y-4">
                  {opportunities.map((item) => (
                    <div key={item.area} className="rounded-2xl border border-primary/15 bg-white/40 p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-primary mb-2">{item.area}</p>
                      <p className="text-textLight">{item.profile}</p>
                    </div>
                  ))}
                </div>
              </article>
            </FadeIn>

            <FadeIn delay={0.1}>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15 h-full">
                <h3 className="text-2xl font-display text-text mb-5">Lo que ofrecemos</h3>
                <ul className="space-y-3 mb-8">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-text">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <a href={buildWhatsAppUrl(WHATSAPP_APPLY_MESSAGE)} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full">
                      Aplicar por WhatsApp
                    </Button>
                  </a>
                  <Link href="/contacto" className="block">
                    <Button variant="secondary" className="w-full">
                      Enviar hoja de vida por formulario
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
