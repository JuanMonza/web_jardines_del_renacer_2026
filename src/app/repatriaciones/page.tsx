import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
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

const processSteps = [
  ['1', 'Activacion inmediata', 'Recibimos el caso y reunimos la informacion inicial.'],
  ['2', 'Gestion documental', 'Coordinamos permisos, consulados, aerolineas y requisitos sanitarios.'],
  ['3', 'Traslado internacional', 'Acompanamos el proceso logistico hasta el destino definido.'],
  ['4', 'Entrega y cierre', 'Mantenemos comunicacion con la familia hasta finalizar el servicio.'],
];

export default function RepatriacionesPage() {
  return (
    <>
      <PageHero
        title="Repatriaciones & Expatriaciones"
        subtitle="Coordinación segura, ágil y respetuosa para traslados internacionales de tus seres queridos."
        image="/images/images-baners/repatriacion.webp"
        imageAlt="Servicio de repatriaciones Jardines del Renacer"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={buildWhatsAppUrl(REPATRIATION_MESSAGE)} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Solicitar orientación
            </Button>
          </a>
          <a href={CONTACT_INFO.primaryLine.href}>
            <Button variant="secondary" size="lg" className="w-full bg-white/90 sm:w-auto">
              Llamar ahora
            </Button>
          </a>
        </div>
      </PageHero>

      <section className="py-16">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ['24/7', 'Atención inmediata', 'Respuesta para situaciones urgentes sin importar la hora.'],
              ['Global', 'Gestión internacional', 'Coordinación con entidades, consulados y aerolíneas.'],
              ['Humano', 'Acompañamiento familiar', 'Comunicación clara y apoyo durante todo el traslado.'],
            ].map(([label, title, text]) => (
              <FadeIn key={title}>
                <div className="glass h-full rounded-2xl border border-primary/15 p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{label}</p>
                  <h3 className="mt-3 text-xl font-display text-text">{title}</h3>
                  <p className="mt-2 text-sm text-textLight">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="2xl">
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
              <article className="rounded-3xl bg-primary p-8 text-white shadow-xl md:p-10 h-full">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-white/70">
                  Canal prioritario
                </p>
                <h3 className="text-2xl font-display mb-4">Atencion Especializada 24/7</h3>
                <p className="text-white/90 mb-6">
                  Actuamos con inmediatez y precision en situaciones de urgencia. Nuestro equipo esta disponible para brindar asesoria y soluciones oportunas.
                </p>

                <div className="space-y-3">
                  <a href={buildWhatsAppUrl(REPATRIATION_MESSAGE)} target="_blank" rel="noopener noreferrer">
                    <Button variant="secondary" className="w-full bg-white/95">
                      Solicitar orientacion por WhatsApp
                    </Button>
                  </a>

                  <a href={CONTACT_INFO.primaryLine.href}>
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary">
                      Llamar {CONTACT_INFO.primaryLine.number}
                    </Button>
                  </a>

                  <Link href="/contacto">
                    <Button variant="outline" className="w-full border-white/50 text-white hover:bg-white hover:text-primary">
                      Formulario de contacto
                    </Button>
                  </Link>
                </div>
              </article>
            </FadeIn>
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="2xl">
          <FadeIn>
            <div className="mb-10 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">Proceso</p>
              <h2 className="mt-3 text-4xl font-display text-text">Cómo te acompañamos</h2>
              <p className="mx-auto mt-4 max-w-2xl text-textLight">
                Un flujo claro para que la familia sepa qué ocurre en cada etapa.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {processSteps.map(([number, title, text], index) => (
              <FadeIn key={number} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-primary/15 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {number}
                  </span>
                  <h3 className="mt-4 text-lg font-display text-text">{title}</h3>
                  <p className="mt-2 text-sm text-textLight">{text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
