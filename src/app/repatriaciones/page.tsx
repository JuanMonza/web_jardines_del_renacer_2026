import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

const REPATRIATION_MESSAGE =
  'Hola, necesito informacion sobre los servicios de repatriacion y expatriacion de Jardines del Renacer.';

const services = [
  'Repatriacion (traslado hacia Colombia) y Expatriacion (traslado desde Colombia al exterior)',
  'Gestion documental y permisos',
  'Coordinacion directa con embajadas, consulados y aerolineas',
  'Tramites aduaneros y sanitarios internacionales',
  'Acompanamiento integral bilingue a la familia en todo el proceso',
];

export default function RepatriacionesPage() {
  return (
    <>
      <section className="pt-10 pb-10">
        <Container>
          <div className="relative py-20 rounded-3xl overflow-hidden bg-[url('/images/repatriaciones_banner.jpg')] bg-cover bg-center bg-no-repeat">
            <div className="relative z-10">
              <FadeIn>
                <SectionTitle
                  title="Repatriaciones & Expatriaciones"
                  subtitle="Coordinacion segura, agil y respetuosa para traslados internacionales de tus seres queridos."
                />
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
            <FadeIn>
              <article className="glass rounded-3xl overflow-hidden border border-primary/15">
                <div className="relative h-72 md:h-80">
                  <Image
                    src="/images/repatriaciones.jpg"
                    alt="Servicio de repatriaciones Jardines del Renacer"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-display text-text mb-4">Cobertura internacional sin fronteras</h3>
                  <p className="text-textLight leading-relaxed mb-5">
                    Entendemos la complejidad y la urgencia de trasladar a un ser querido entre diferentes paises. 
                    Nuestro equipo experto se encarga de coordinar cada detalle legal, logistico, sanitario y consular, 
                    garantizando un proceso transparente y eficiente para que la familia pueda enfocarse en su proceso de duelo.
                  </p>

                  <ul className="space-y-2">
                    {services.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-text">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </FadeIn>

            <FadeIn delay={0.1}>
              <article className="glass rounded-3xl p-8 md:p-10 border border-primary/15 h-full">
                <h3 className="text-2xl font-display text-text mb-4">Atencion Especializada 24/7</h3>
                <p className="text-textLight mb-6">
                  Actuamos con inmediatez y precision en situaciones de urgencia. Debido a las diferencias horarias globales, 
                  nuestro equipo de gestion internacional esta disponible en todo momento para brindar asesoria y soluciones oportunas.
                </p>

                <div className="space-y-3">
                  <a href={buildWhatsAppUrl(REPATRIATION_MESSAGE)} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full">
                      Solicitar orientacion por WhatsApp
                    </Button>
                  </a>

                  <a href={CONTACT_INFO.primaryLine.href}>
                    <Button variant="secondary" className="w-full">
                      Llamar ahora
                    </Button>
                  </a>

                  <Link href="/contacto">
                    <Button variant="ghost" className="w-full">
                      Formulario de contacto
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
