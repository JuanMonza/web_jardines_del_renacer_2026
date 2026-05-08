import Link from 'next/link';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';

export default function ProximamentePage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-background via-white/80 to-primary/10 py-20">
      <Container>
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Jardines del Renacer
            </p>
            <h1 className="font-display text-4xl font-semibold text-text sm:text-5xl">Próximamente</h1>
            <p className="mx-auto mt-5 text-base leading-relaxed text-textLight sm:text-lg">
              Estamos preparando este espacio para ofrecerte una mejor experiencia.
            </p>

            <div className="mt-8 flex justify-center">
              <Link href="/">
                <Button variant="primary" size="lg">
                  Volver al inicio
                </Button>
              </Link>
            </div>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
