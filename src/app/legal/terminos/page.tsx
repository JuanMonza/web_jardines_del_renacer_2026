import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Link from 'next/link';

const sections = [
  {
    title: '1. Alcance y aceptacion',
    content:
      'Estos terminos regulan el uso del sitio web de Jardines del Renacer y sus canales de contacto digitales. Al navegar el sitio, el usuario declara conocer y aceptar estas condiciones.',
  },
  {
    title: '2. Uso del portal y de sus contenidos',
    content:
      'La informacion publicada es de caracter informativo y puede actualizarse sin aviso previo por necesidades operativas, legales o de mejora del servicio.',
  },
  {
    title: '3. Formularios y solicitudes',
    content:
      'Las solicitudes enviadas por formulario, WhatsApp o telefono seran gestionadas por nuestro equipo. El usuario debe suministrar datos veraces y actualizados.',
  },
  {
    title: '4. Comunicaciones comerciales',
    content:
      'El envio de comunicaciones comerciales se realizara solo cuando exista autorizacion del titular o una base legal que lo permita.',
  },
  {
    title: '5. Propiedad intelectual',
    content:
      'Los contenidos, logos, imagenes, textos, disenos y demas elementos del sitio son propiedad de Jardines del Renacer o de terceros autorizados y no pueden ser usados sin autorizacion previa.',
  },
  {
    title: '6. Disponibilidad y responsabilidad',
    content:
      'Jardines del Renacer realiza esfuerzos razonables para mantener el sitio disponible, pero no garantiza operacion ininterrumpida. Podran existir pausas por mantenimiento, fuerza mayor o incidentes tecnicos.',
  },
  {
    title: '7. Enlaces a terceros',
    content:
      'Cuando el portal incluya enlaces a servicios o plataformas de terceros, su uso se regira por las politicas y terminos propios de dichos terceros.',
  },
  {
    title: '8. Proteccion de datos y cookies',
    content:
      'El tratamiento de datos personales se rige por la Politica de Privacidad y el uso de cookies por la Politica de Cookies publicadas en este sitio.',
  },
  {
    title: '9. Ley aplicable',
    content:
      'Estos terminos se interpretan conforme a la legislacion colombiana vigente.',
  },
  {
    title: '10. Contacto',
    content:
      'Para aclaraciones puedes comunicarte a servicioalcliente@jardinesdelrenacer.com o a la direccion oficial publicada en la Politica de Privacidad.',
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
          <FadeIn>
            <article className="glass rounded-2xl p-6 border border-primary/15 mb-5">
              <p className="text-sm text-textLight leading-relaxed">
                Documentos relacionados:{' '}
                <Link href="/legal/privacidad" className="text-primary font-semibold hover:underline">
                  Politica de Privacidad
                </Link>{' '}
                y{' '}
                <Link href="/legal/cookies" className="text-primary font-semibold hover:underline">
                  Politica de Cookies
                </Link>
                .
              </p>
            </article>
          </FadeIn>

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
