import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import SecurePdfViewer from '@/components/clausulas/SecurePdfViewer';

export default function ClausulasPage() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-background via-white/70 to-background py-12 sm:py-16">
      <Container maxWidth="xl">
        <div className="relative py-20 mb-12 rounded-3xl overflow-hidden bg-[url('/images/images-baners/terminos&condiciones.webp')] bg-cover bg-center bg-no-repeat shadow-sm border border-primary/10">
          <div className="relative z-10">
            <FadeIn>
              <div className="mx-auto max-w-3xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                  Jardines del Renacer
                </p>
                <h1 className="font-display text-4xl font-semibold text-text sm:text-5xl">Cláusulas</h1>
                <p className="mt-4 text-base text-textLight sm:text-lg">
                  Consulta el documento oficial actualizado para la vigencia 2026.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={0.15}>
          <SecurePdfViewer />
        </FadeIn>
      </Container>
    </section>
  );
}
