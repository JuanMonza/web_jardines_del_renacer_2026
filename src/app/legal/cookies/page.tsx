import Container from '@/components/ui/Container';
import Link from 'next/link';
import FadeIn from '@/components/animations/FadeIn';
import PageHero from '@/components/ui/PageHero';

const cookieSections = [
  {
    title: '1. ¿Qué son las cookies?',
    content:
      'Las cookies son pequeños archivos de texto que los sitios web guardan en tu dispositivo para recordar información sobre tu visita, como tus preferencias de idioma o datos de inicio de sesión. Esto permite ofrecer una experiencia más personalizada y eficiente.',
  },
  {
    title: '2. ¿Qué tipos de cookies utilizamos?',
    content:
      'Utilizamos cookies técnicas, esenciales para el funcionamiento del sitio, y cookies de análisis (como las de Google Analytics) para entender cómo interactúas con nuestra web y así mejorar nuestros servicios. No usamos cookies publicitarias de terceros.',
  },
  {
    title: '3. ¿Cómo puedes gestionar las cookies?',
    content:
      'Puedes configurar tu navegador para aceptar, rechazar o eliminar cookies. Ten en cuenta que si desactivas las cookies técnicas, algunas funcionalidades de nuestro sitio podrían no operar correctamente.',
  },
  {
    title: '4. Consentimiento',
    content:
      'Al continuar navegando en nuestro sitio, aceptas el uso de las cookies mencionadas, a menos que hayas modificado la configuración de tu navegador para rechazarlas.',
  },
];

export default function CookiesPage() {
  return (
    <>
      <PageHero
        title="Política de Cookies"
        subtitle="Información sobre el uso de cookies en nuestro sitio web."
        image="/images/images-baners/cookies.webp"
        imageAlt="Política de Cookies - Jardines del Renacer"
      />

      <section className="py-16">
        <Container maxWidth="lg">
          <div className="space-y-4">
            {cookieSections.map((section, index) => (
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