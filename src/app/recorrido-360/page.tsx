import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import Link from 'next/link';

export default function Recorrido360Page() {
  return (
    <>
      <PageHero
        title="Recorrido Virtual 360°"
        subtitle="Conoce nuestras instalaciones desde la comodidad de tu hogar y agenda una visita cuando quieras vivir la experiencia presencial."
        image="/images/images-baners/recorrido360.webp"
        imageAlt="Recorrido virtual 360 Jardines del Renacer"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href="#recorrido-virtual">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Iniciar recorrido
            </Button>
          </a>
          <Link href="/agendar-visita">
            <Button variant="secondary" size="lg" className="w-full bg-white/90 sm:w-auto">
              Agendar visita
            </Button>
          </Link>
        </div>
      </PageHero>

      <section className="py-16">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ['Explora', 'Recorre espacios clave antes de visitarnos.'],
              ['Comparte', 'Muestra las instalaciones a tu familia desde cualquier lugar.'],
              ['Agenda', 'Solicita acompañamiento presencial si necesitas orientación.'],
            ].map(([title, description]) => (
              <FadeIn key={title}>
                <div className="glass h-full rounded-2xl border border-primary/15 p-6">
                  <h3 className="text-xl font-display text-primary">{title}</h3>
                  <p className="mt-2 text-sm text-textLight">{description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section id="recorrido-virtual" className="pb-20">
        <Container maxWidth="2xl">
          <FadeIn>
            <div className="glass rounded-3xl border border-primary/15 p-4 shadow-xl md:p-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                    Vista inmersiva
                  </p>
                  <h2 className="mt-2 text-2xl font-display text-text">Recorrido de instalaciones</h2>
                </div>
                <Link href="/contacto">
                  <Button variant="ghost" className="w-full md:w-auto">
                    Solicitar información
                  </Button>
                </Link>
              </div>
              <iframe
                title="Recorrido virtual 360 Jardines del Renacer"
                className="aspect-video w-full rounded-2xl border border-primary/15 bg-black shadow-lg"
                src="https://my.matterport.com/show/?m=YOUR_MATTERPORT_ID"
                allowFullScreen
              ></iframe>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
