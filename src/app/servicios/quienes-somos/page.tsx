import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import Image from 'next/image';
import FadeIn from '@/components/animations/FadeIn';
import {
  corporateValues,
  principles,
  whoWeAreParagraphs,
} from '@/content/company';

const principleIcons = {
  Misión: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Visión: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  ),
};

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const valueIcons: { [key: string]: JSX.Element } = {
  Honestidad: (
    <Image width="32" height="32" src="https://img.icons8.com/arcade/128/add-bookmark.png" alt="Icono de honestidad"/>
  ),
  Respeto: (
    <Image width="32" height="32" src="https://img.icons8.com/3d-fluency/94/trust.png" alt="Icono de respeto"/>
  ),
  'Calidad Humana': (
    <Image width="32" height="32" src="https://img.icons8.com/3d-fluency/94/best-seller.png" alt="Icono de calidad humana"/>
  ),
  Cumplimiento: (
    <Image width="32" height="32" src="https://img.icons8.com/3d-fluency/94/police-station.png" alt="Icono de cumplimiento"/>
  ),
  'Responsabilidad social': (
    <Image width="32" height="32" src="https://img.icons8.com/3d-fluency/94/user-group-man-woman--v4.png" alt="Icono de responsabilidad social"/>
  ),
};

export default function QuienesSomosPage() {
  return (
    <>
      <PageHero
        title="Quiénes Somos"
        subtitle="Más de 26 años acompañando a las familias colombianas con respeto, dignidad y sentido humano."
        image="/images/images-baners/QuienesSomos.webp"
        imageAlt="Quiénes somos Jardines del Renacer"
      />

      <section className="py-20">
        <Container maxWidth="2xl">
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="space-y-5 text-textLight leading-relaxed text-lg lg:pr-8">
                {whoWeAreParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
              <div className="flex flex-col gap-4 h-[500px]">
                <div className="group/item1 relative w-full h-1/2 rounded-3xl overflow-hidden shadow-lg transition-all duration-500 ease-out hover:h-2/3">
                  <Image
                    src="/images/images-baners/"
                    alt="Equipo de Jardines del Renacer"
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item1:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="group/item2 relative w-full h-1/2 rounded-3xl overflow-hidden shadow-lg transition-all duration-500 ease-out hover:h-2/3">
                  <Image
                    src="/images/carrusel_1.jpg"
                    alt="Instalaciones de Jardines del Renacer"
                    fill
                    className="object-cover transition-transform duration-500 group-hover/item2:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {principles.map((item, index) =>  (
              <FadeIn key={item.title} delay={index * 0.15}>
                <div className="relative rounded-3xl p-8 h-full text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-primary to-blue-700 group/wave">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        {principleIcons[item.title as keyof typeof principleIcons]}
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wider">
                        {item.title}
                      </h3>
                    </div>
                    <p className="leading-relaxed text-white/90">{item.content}</p>
                  </div>
                  {/* Wave Effect */}
                  <div className="absolute bottom-0 left-0 w-[200%] h-24 animate-wave">
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-repeat-x" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0 64 C240 128 480 64 720 64 C960 64 1200 128 1440 64 L1440 120 L0 120 Z' fill='rgba(255,255,255,0.1)'%3e%3c/path%3e%3c/svg%3e\")" }}></div>
                  </div>
                  <div className="absolute bottom-0 left-0 w-[200%] h-24 animate-wave-reverse">
                    <div className="absolute bottom-0 left-0 right-0 h-full bg-repeat-x" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0 80 C288 32 576 128 864 80 C1152 32 1440 80 1440 80 L1440 120 L0 120 Z' fill='rgba(255,255,255,0.05)'%3e%3c/path%3e%3c/svg%3e\")" }}></div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="2xl">
          <FadeIn>
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-primary">
                Cultura institucional
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text">
                Nuestros Valores
              </h2>
              <div className="mx-auto mt-5 h-1.5 w-28 rounded-full bg-primary" />
              <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-textLight">
                Los pilares que guían cada una de nuestras acciones y decisiones.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {corporateValues.map((value, index) => (
              <FadeIn key={value.name} delay={index * 0.05}>
                <article className="group flex h-full min-h-[270px] flex-col rounded-2xl border border-primary/15 bg-white/75 p-6 text-center shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-white hover:shadow-xl">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <div className="flex h-10 w-10 items-center justify-center">
                      {valueIcons[value.name]}
                    </div>
                  </div>
                  <h4 className="text-lg font-bold leading-snug text-text">{value.name}</h4>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-textLight">
                    {value.description}
                  </p>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
