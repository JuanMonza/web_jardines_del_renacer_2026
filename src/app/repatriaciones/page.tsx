import Link from 'next/link';
import Image from 'next/image';
import { Clock, Globe, HeartHandshake } from 'lucide-react';
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

      <section className="py-16 md:py-20">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                icon: <Clock className="h-8 w-8 text-primary" />,
                title: 'Atención Inmediata 24/7',
                text: 'Respuesta para situaciones urgentes sin importar la hora o el día.',
              },
              {
                icon: <Globe className="h-8 w-8 text-primary" />,
                title: 'Gestión Global',
                text: 'Coordinación experta con embajadas, consulados y aerolíneas.',
              },
              {
                icon: <HeartHandshake className="h-8 w-8 text-primary" />,
                title: 'Acompañamiento Humano',
                text: 'Comunicación clara y apoyo cercano durante todo el traslado.',
              },
            ].map(({ icon, title, text }, index) => (
              <FadeIn key={title}>
                <div className="group relative h-full rounded-3xl border border-primary/10 bg-white/50 p-8 shadow-sm transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.01] hover:border-primary/20 hover:shadow-xl hover:bg-white/80">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white p-4 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 group-hover:shadow-primary/20">
                    {icon}
                  </div>
                  <div className="mt-8 text-center">
                    <div className="absolute inset-x-0 top-1/2 -z-10 h-32 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                    <div className="relative mx-auto inline-flex items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-gradient-to-r from-primary to-[#5a7ec0] px-4 py-2 shadow-sm">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_70%)]" />
                      <h3 className="relative z-10 text-xl font-display font-semibold text-white drop-shadow-sm transition-colors duration-300">
                        {title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-textLight">{text}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <FadeIn>
              <article className="glass rounded-3xl overflow-hidden border border-primary/15">
                <div className="relative h-72 md:h-80">
                  <Image
                    src="/images/repatriaciones.webp"
                    alt="Servicio de repatriaciones Jardines del Renacer"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="relative p-8">
                  <div className="absolute inset-x-0 -top-4 -z-10 h-32 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-2xl"></div>
                  <h3 className="text-2xl font-display text-text mb-4">
                    Cobertura internacional sin fronteras
                  </h3>
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

                <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm md:gap-4 md:p-4">
                  <a href={buildWhatsAppUrl(REPATRIATION_MESSAGE)} target="_blank" rel="noopener noreferrer" className="block transition-transform duration-300 hover:-translate-y-1">
                    <Button variant="secondary" className="w-full bg-white/95 transition-all duration-300 hover:shadow-lg">
                      Solicitar orientacion por WhatsApp
                    </Button>
                  </a>

                  <a href={CONTACT_INFO.primaryLine.href} className="block transition-transform duration-300 hover:-translate-y-1">
                    <Button variant="outline" className="w-full border-white text-white transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-lg">
                      Llamar {CONTACT_INFO.primaryLine.number}
                    </Button>
                  </a>

                  <Link href="/contacto" className="block transition-transform duration-300 hover:-translate-y-1">
                    <Button variant="outline" className="w-full border-white/50 text-white transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-lg">
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
            <div className="relative mb-10 text-center">
              <div className="absolute inset-x-0 top-1/2 -z-10 h-32 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/85 to-transparent "></div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/70"></p>
              <h2 className="mt-3 text-4xl font-display text-white">
                ¿Cómo te acompañamos durante este proceso?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-white">
                Un flujo claro para que la familia conozca qué sucede en cada etapa.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {processSteps.map(([number, title, text], index) => (
              <FadeIn key={number} delay={index * 0.06}>
                <div className="relative h-full rounded-2xl border border-primary/15 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden">
                  <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-primary/85 to-transparent -z-10 opacity-50 blur-2xl"></div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#5a7ec0] text-sm font-bold text-white">
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
