import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import Link from 'next/link';
import PageHero from '@/components/ui/PageHero';

const sections = [
  {
    title: '1. Objeto de los incentivos',
    content:
      'Jardines del Renacer realiza actividades promocionales ocasionales para reconocer a los afiliados que se encuentran al día en sus pagos. Los incentivos se entregan con fines de bienestar y fidelización; no constituyen una actividad habitual de rifas ni de juegos de azar.',
  },
  {
    title: '2. Participantes habilitados',
    content:
      'Participan únicamente los afiliados habilitados por el área de Cartera de acuerdo con las condiciones vigentes de cada sorteo. Antes de cada selección se revisa el cumplimiento de los requisitos y se excluyen registros duplicados, incompletos o que no cumplan las condiciones comunicadas.',
  },
  {
    title: '3. Identificación y trazabilidad',
    content:
      'Cada afiliado participa con su número de contrato. Este dato permite identificar la participación y conservar trazabilidad durante las etapas de depuración, selección, validación y entrega del incentivo.',
  },
  {
    title: '4. Selección aleatoria',
    content:
      'El listado de participantes habilitados es cargado en una herramienta digital interna desarrollada para apoyar el proceso de sorteos. El sistema asigna un identificador único a cada registro y realiza una selección aleatoria, sin intervención manual en la elección del ganador.',
  },
  {
    title: '5. Validación del ganador',
    content:
      'Una vez seleccionado el número de contrato, Jardines del Renacer verifica nuevamente que el afiliado continúe cumpliendo las condiciones aplicables. Si no las cumple, se aplicará el procedimiento definido para el sorteo, que puede incluir la selección de un suplente.',
  },
  {
    title: '6. Comunicación y publicación',
    content:
      'El ganador será contactado con los datos registrados en la empresa, por llamada telefónica, WhatsApp o correo electrónico. Los resultados podrán comunicarse mediante los canales oficiales de Jardines del Renacer: página web, redes sociales oficiales y comunicaciones internas.',
  },
  {
    title: '7. Entrega del incentivo',
    content:
      'La entrega se coordina directamente con el ganador. Para dejar constancia, podrá requerirse un acta de entrega a satisfacción y un registro fotográfico, respetando la autorización y el tratamiento de datos personales aplicable.',
  },
  {
    title: '8. Información de cada sorteo',
    content:
      'La fecha, incentivo, requisitos particulares, vigencia y demás condiciones de cada actividad se informarán en la publicación correspondiente. Jardines del Renacer podrá actualizar estas condiciones cuando sea necesario, informándolo por sus canales oficiales.',
  },
];

export default function IncentivosAfiliadosPage() {
  return (
    <>
      <PageHero
        title="T&C Incentivos Afiliados"
        subtitle="Procedimiento de selección, validación y comunicación de ganadores."
        description="Conoce cómo cuidamos la transparencia y trazabilidad de nuestros sorteos promocionales mensuales."
        image="/images/images-baners/sorteos.webp"
        imageAlt="Incentivos para afiliados de Jardines del Renacer"
      />

      <section className="py-16 md:py-20">
        <Container maxWidth="lg">
          <FadeIn>
            <article className="glass mb-6 rounded-3xl border border-primary/15 p-6 md:p-8">
              <p className="text-sm leading-relaxed text-textLight md:text-base">
                Este documento aplica a los incentivos promocionales comunicados por Jardines del Renacer. Para conocer los sorteos vigentes visita{' '}
                <Link href="/sorteos" className="font-semibold text-primary hover:underline">
                  Nuestros sorteos mensuales
                </Link>
                .
              </p>
            </article>
          </FadeIn>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <FadeIn key={section.title} delay={index * 0.05}>
                <article className="glass rounded-3xl border border-primary/15 p-6 md:p-7">
                  <h2 className="mb-2 text-lg font-semibold text-text md:text-xl">{section.title}</h2>
                  <p className="leading-relaxed text-textLight">{section.content}</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
