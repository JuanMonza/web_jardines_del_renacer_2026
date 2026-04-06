import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';

const sections = [
  {
    title: '1. Alcance',
    content:
      'Estos terminos regulan el uso del sitio web de Jardines del Renacer y sus canales de contacto digitales.',
  },
  {
    title: '2. Uso de la informacion',
    content:
      'La informacion publicada tiene fines informativos y puede actualizarse sin previo aviso segun ajustes operativos.',
  },
  {
    title: '3. Canales de solicitud',
    content:
      'Las solicitudes enviadas por formulario, WhatsApp o telefono seran gestionadas por nuestro equipo de atencion.',
  },
  {
    title: '4. Propiedad intelectual',
    content:
      'Los contenidos, imagenes y elementos de marca son propiedad de Jardines del Renacer y no pueden ser usados sin autorizacion.',
  },
  {
    title: '5. Contacto',
    content:
      'Para aclaraciones sobre estos terminos puedes comunicarte por los canales oficiales disponibles en la seccion de contacto.',
  },
];

export default function TerminosPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Terminos y Condiciones"
              subtitle="Condiciones de uso del sitio y de los servicios de atencion digital."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <div className="space-y-4">
            {sections.map((section, index) => (
              <FadeIn key={section.title} delay={index * 0.05}>
                <article className="glass rounded-2xl p-6 border border-primary/15">
                  <h3 className="text-lg font-semibold text-text mb-2">{section.title}</h3>
                  <p className="text-textLight leading-relaxed">{section.content}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
