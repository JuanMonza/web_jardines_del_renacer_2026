import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

const ALWAYS_WITH_YOU_MESSAGE =
  'Hola, deseo activar Siempre Contigo para una transmision en vivo 360 del servicio de velacion.';

const steps = [
  {
    title: '1. Activacion del servicio',
    description:
      'La familia solicita Siempre Contigo y nuestro equipo agenda la transmision para el servicio de velacion.',
  },
  {
    title: '2. Enlace privado para invitados',
    description:
      'Compartimos un enlace seguro para familiares y amigos autorizados, incluso si estan en otra ciudad o pais.',
  },
  {
    title: '3. Acompanamiento en vivo 360',
    description:
      'Durante la ceremonia, los asistentes remotos pueden conectarse y seguir el homenaje en tiempo real.',
  },
];

export default function SiempreContigoPage() {
  return (
    <>
      <PageHero
        title="Siempre Contigo"
        subtitle="Transmisión en vivo 360 del servicio de velación para que la familia pueda acompañar el homenaje desde cualquier lugar."
        image="/images/siempre_contigo.jpg"
        imageAlt="Servicio Siempre Contigo Jardines del Renacer"
      />

      <section className="py-20">
        <Container maxWidth="2xl">
          <FadeIn>
            <SectionTitle
              title="Como lo hacemos"
              subtitle="Flujo recomendado para operar la transmision en vivo 360."
              align="left"
            />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {steps.map((step, index) => (
              <FadeIn key={step.title} delay={index * 0.08}>
                <article className="glass rounded-2xl border border-primary/15 p-6 h-full">
                  <h3 className="text-xl font-display text-text mb-2">{step.title}</h3>
                  <p className="text-textLight">{step.description}</p>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.2}>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <article className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
                <h3 className="text-2xl font-display text-text mb-3">Vista previa del modulo 360</h3>
                <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/70 h-64 md:h-80">
                  <Image
                    src="/img_1 (21).webp"
                    alt="Vista previa Siempre Contigo"
                    fill
                    className="object-cover opacity-45"
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                    <p className="text-white text-lg max-w-md">
                      Aqui se mostrara la transmision en vivo 360 cuando el servicio este activo.
                    </p>
                  </div>
                </div>
              </article>

              <article className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
                <h3 className="text-2xl font-display text-text mb-3">Solicitar activacion</h3>
                <p className="text-textLight mb-5">
                  Si necesitas activar Siempre Contigo para un homenaje, nuestro equipo te ayuda a
                  configurar camara, acceso privado y acompanamiento tecnico.
                </p>

                <div className="space-y-3">
                  <a
                    href={buildWhatsAppUrl(ALWAYS_WITH_YOU_MESSAGE)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" className="w-full">
                      Solicitar por WhatsApp
                    </Button>
                  </a>

                  <a href={CONTACT_INFO.primaryLine.href}>
                    <Button variant="secondary" className="w-full">
                      Llamar ahora
                    </Button>
                  </a>

                  <Link href="/obituarios">
                    <Button variant="ghost" className="w-full">
                      Ver obituarios publicados
                    </Button>
                  </Link>
                </div>
              </article>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
