import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import Image from 'next/image';
import { Building2, HeartHandshake, MapPinned, Quote } from 'lucide-react';
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
  'Responsabilidad Social': (
    <Image width="32" height="32" src="https://img.icons8.com/3d-fluency/94/user-group-man-woman--v4.png" alt="Icono de responsabilidad social"/>
  ),
};

export default function QuienesSomosPage() {
  const impactMetrics = [
    { value: '26', label: 'años de experiencia', icon: Building2 },
    { value: 'Cobertura', label: 'nacional', icon: MapPinned },
    { value: '15', label: 'departamentos', icon: HeartHandshake },
  ];

  return (
    <>
      <PageHero
        title="Quiénes Somos"
        subtitle="Más de 26 años acompañando a las familias colombianas con respeto, dignidad y sentido humano."
        image="/images/images-baners/QuienesSomos.webp"
        imageAlt="Quiénes somos Jardines del Renacer"
      />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_35%,rgba(65,105,180,0.12),transparent_28%),radial-gradient(circle_at_85%_55%,rgba(103,155,215,0.12),transparent_32%)]" />
        <Container maxWidth="2xl">
          <FadeIn delay={0.1}>
            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-12">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/65 p-7 shadow-[0_24px_70px_rgba(20,55,97,0.12)] backdrop-blur-xl sm:p-10">
                <div className="pointer-events-none absolute -left-16 -top-20 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Nuestra gran familia</p>
                  <div className="mt-5 border-l-4 border-primary pl-5"><p className="font-display text-2xl font-bold leading-tight text-text sm:text-3xl">Acompañamos con dignidad cada historia.</p></div>
                  <div className="mt-6 space-y-5 text-base leading-8 text-textLight sm:text-lg">
                    {whoWeAreParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                  <div className="mt-7 flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.06] p-4 text-sm leading-6 text-primary">
                    <Quote className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                    <p>Somos una gran familia que acompaña con respeto, cercanía y cuidado cada momento compartido.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {principles.map((item, index) => (
                  <FadeIn key={item.title} delay={0.15 + index * 0.1}>
                    <article className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#153d70] via-[#1c4b83] to-[#0b2e59] p-7 text-white shadow-[0_22px_45px_rgba(20,55,97,0.2)] sm:p-8">
                      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                      <div className="relative">
                        <div className="flex items-center gap-4">
                          <span className="rounded-2xl bg-white/20 p-3">{principleIcons[item.title as keyof typeof principleIcons]}</span>
                          <h2 className="text-xl font-bold uppercase tracking-wider">{item.title}</h2>
                        </div>
                        <p className="mt-5 leading-relaxed text-white/90">{item.content}</p>
                      </div>
                    </article>
                  </FadeIn>
                ))}
              </div>
            </div>
            <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/65 p-2 shadow-[0_18px_45px_rgba(20,55,97,0.1)] backdrop-blur-xl">
              <div className="pointer-events-none absolute -left-10 top-0 h-24 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative grid grid-cols-1 divide-y divide-primary/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {impactMetrics.map(({ value, label, icon: Icon }) => (
                <div key={label} className="group flex items-center gap-4 px-5 py-5 transition-colors duration-300 hover:bg-white/55 sm:px-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/10 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105"><Icon className="h-5 w-5" aria-hidden /></span>
                  <div><p className="font-display text-3xl font-bold leading-none text-text">{value}</p><p className="mt-1 text-sm font-medium text-textLight">{label}</p></div>
                </div>
              ))}
              </div>
            </div>
          </FadeIn>
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
                Nuestros valores
              </h2>
              <div className="mx-auto mt-5 h-1.5 w-28 rounded-full bg-primary" />
              <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-textLight">
                Los valores que representan a nuestra gran familia y guían cada una de nuestras acciones y decisiones.
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
