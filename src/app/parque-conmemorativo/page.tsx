import Image from 'next/image';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';

const PARQUE_CONMEMORATIVO_URL = 'https://www.parqueconmemorativo.com/';

const highlights = [
  'Espacios naturales para homenaje y recuerdo',
  'Acompanamiento en ceremonias de despedida',
  'Atencion con enfoque humano y respetuoso',
];

export default function ParqueConmemorativoPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Parque Conmemorativo"
              subtitle="Un entorno natural de paz para honrar la memoria de quienes amamos."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8">
            <FadeIn>
              <article className="glass rounded-3xl overflow-hidden border border-primary/15">
                <div className="relative h-72 md:h-80">
                  <Image
                    src="/images/parque-conmemorativo-2026.webp"
                    alt="Parque Conmemorativo Jardines del Renacer"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-display text-text mb-3">Un lugar para recordar</h3>
                  <p className="text-textLight leading-relaxed mb-5">
                    Nuestro parque conmemorativo ofrece un ambiente de tranquilidad, naturaleza y respeto
                    para conservar la memoria de tus seres queridos.
                  </p>

                  <ul className="space-y-2">
                    {highlights.map((item) => (
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
                <h3 className="text-2xl font-display text-text mb-4">Mas informacion</h3>
                <p className="text-textLight mb-6">
                  Puedes conocer el detalle del parque, servicios asociados y ubicacion oficial en nuestro sitio aliado.
                </p>

                <div className="space-y-3">
                  <a href={PARQUE_CONMEMORATIVO_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="primary" className="w-full">
                      Ir al sitio del Parque Conmemorativo
                    </Button>
                  </a>

                  <Link href="/contacto">
                    <Button variant="secondary" className="w-full">
                      Solicitar asesoria
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
