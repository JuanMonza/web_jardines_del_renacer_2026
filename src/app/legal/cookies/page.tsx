import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Link from 'next/link';

type CookieCategory = {
  title: string;
  purpose: string;
  examples: string[];
};

const cookieCategories: CookieCategory[] = [
  {
    title: 'Cookies esenciales',
    purpose:
      'Permiten el funcionamiento basico del sitio, seguridad de sesion y continuidad de navegacion.',
    examples: [
      'Persistencia temporal de estado de navegacion',
      'Preferencias tecnicas minimas',
    ],
  },
  {
    title: 'Cookies funcionales',
    purpose:
      'Recuerdan opciones del usuario para ofrecer una experiencia mas comoda en visitas posteriores.',
    examples: ['Idioma o configuraciones de interfaz', 'Preferencias de formularios'],
  },
  {
    title: 'Cookies de analitica',
    purpose:
      'Ayudan a entender el uso del portal para mejorar rendimiento, contenidos y recorridos de atencion.',
    examples: ['Paginas mas visitadas', 'Tiempo de navegacion y eventos agregados'],
  },
  {
    title: 'Cookies publicitarias o de medicion',
    purpose:
      'Permiten evaluar campanas y personalizar comunicaciones, siempre de acuerdo con autorizaciones aplicables.',
    examples: ['Medicion de conversion', 'Frecuencia de visualizacion de anuncios'],
  },
];

const webBeaconsInfo = [
  'Podemos usar web beacons o tecnologias similares para medir interacciones anonimizadas en el sitio.',
  'Tambien podemos recolectar direccion IP para seguridad, prevencion de fraude y analitica agregada.',
];

export default function CookiesPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Politica de Cookies"
              subtitle="Informacion sobre cookies, direccion IP y herramientas de navegacion."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <FadeIn>
            <article className="glass rounded-2xl p-6 border border-primary/15 mb-5">
              <h3 className="text-lg font-semibold text-text mb-3">Consentimiento y control</h3>
              <p className="text-textLight leading-relaxed">
                Al ingresar al sitio puedes aceptar todas las cookies o mantener solo las
                esenciales. Tambien puedes cambiar la configuracion del navegador para bloquear o
                eliminar cookies.
              </p>
            </article>
          </FadeIn>

          <div className="space-y-4">
            {cookieCategories.map((category, index) => (
              <FadeIn key={category.title} delay={index * 0.05}>
                <article className="glass rounded-2xl p-6 border border-primary/15">
                  <h3 className="text-lg font-semibold text-text mb-2">{category.title}</h3>
                  <p className="text-textLight leading-relaxed">{category.purpose}</p>
                  <ul className="mt-4 space-y-2 text-sm text-textLight list-disc pl-5">
                    {category.examples.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.25}>
            <article className="glass rounded-2xl p-6 border border-primary/15 mt-5">
              <h3 className="text-lg font-semibold text-text mb-3">
                Direccion IP, web beacons y tecnologias similares
              </h3>
              <div className="space-y-3">
                {webBeaconsInfo.map((item) => (
                  <p key={item} className="text-textLight leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </article>
          </FadeIn>

          <FadeIn delay={0.3}>
            <article className="glass rounded-2xl p-6 border border-primary/15 mt-5">
              <h3 className="text-lg font-semibold text-text mb-3">Como desactivar cookies</h3>
              <p className="text-textLight leading-relaxed">
                Puedes gestionar cookies desde las preferencias de tu navegador. El bloqueo de
                cookies no esenciales normalmente no impide navegar el sitio, pero algunas
                funcionalidades podrian verse limitadas.
              </p>
            </article>
          </FadeIn>

          <FadeIn delay={0.35}>
            <article className="glass rounded-2xl p-6 border border-primary/15 mt-5">
              <p className="text-sm text-textLight leading-relaxed">
                Para mayor informacion revisa la{' '}
                <Link href="/legal/privacidad" className="text-primary font-semibold hover:underline">
                  Politica de Privacidad
                </Link>{' '}
                y los{' '}
                <Link href="/legal/terminos" className="text-primary font-semibold hover:underline">
                  Terminos y Condiciones
                </Link>
                .
              </p>
            </article>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
