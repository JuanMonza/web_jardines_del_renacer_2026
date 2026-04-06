import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';

const privacyPoints = [
  {
    title: 'Datos que recopilamos',
    content:
      'Podemos recopilar datos de contacto que el usuario suministra de forma voluntaria en formularios o canales de atencion.',
  },
  {
    title: 'Finalidad del tratamiento',
    content:
      'Usamos la informacion para responder solicitudes, coordinar servicios y mejorar la experiencia de atencion.',
  },
  {
    title: 'Proteccion de la informacion',
    content:
      'Aplicamos medidas tecnicas y administrativas razonables para proteger los datos contra acceso no autorizado.',
  },
  {
    title: 'Comparticion de datos',
    content:
      'No comercializamos informacion personal. Solo se comparte cuando es necesario para la prestacion del servicio o por requerimiento legal.',
  },
  {
    title: 'Derechos del titular',
    content:
      'El titular puede solicitar consulta, actualizacion o supresion de sus datos por los canales oficiales de contacto.',
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Politica de Privacidad"
              subtitle="Compromiso con el tratamiento responsable y seguro de la informacion."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <div className="space-y-4">
            {privacyPoints.map((point, index) => (
              <FadeIn key={point.title} delay={index * 0.05}>
                <article className="glass rounded-2xl p-6 border border-primary/15">
                  <h3 className="text-lg font-semibold text-text mb-2">{point.title}</h3>
                  <p className="text-textLight leading-relaxed">{point.content}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
