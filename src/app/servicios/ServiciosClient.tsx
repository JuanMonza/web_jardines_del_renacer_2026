'use client';

import { useState } from 'react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import CoverageMap from '@/components/coverage/CoverageMap';
import {
  Building2,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Truck,
  Users,
  ArrowRight,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';

const services = [
  {
    title: 'Atención Exequial Integral',
    description:
      "Brindamos acompañamiento completo durante cada etapa del servicio funerario, ofreciendo respaldo humano, logístico y operativo las 24 horas del día.",
    bullets: [
      "Atención inmediata 24/7",
      "Traslado del ser querido",
      "Preparación y conservación",
      "Coordinación de ceremonias",
      "Inhumación o cremación",
    ],
    image: "/images/services/atencion.jpg",
  },
  {
    title: 'Salas de Velación',
    description:
      "Más de 200 salas de velación distribuidas a nivel nacional, diseñadas para ofrecer un ambiente tranquilo, digno y acogedor para familiares y amigos.",
    bullets: [
      "Espacios cómodos",
      "Ambientes climatizados",
      "Atención permanente",
      "Cobertura nacional",
    ],
    image: "/images/services/salas.jpg",
  },
  {
    title: 'Salas VIP',
    description:
      "Disponemos de salas VIP ubicadas estratégicamente en Cali, Palmira, Zarzal y Cartago, ofreciendo privacidad, comodidad y exclusividad.",
    bullets: [
      "Espacios privados",
      "Mayor comodidad",
      "Ambientes exclusivos",
      "Atención personalizada",
    ],
    image: "/images/services/vip.jpg",
  },
  {
    title: 'Parque Conmemorativo Espiritual',
    description:
      "Un entorno diseñado para rendir homenaje a la vida, rodeado de naturaleza y espacios que invitan al recuerdo y la tranquilidad.",
    bullets: [
      "Cartago - Valle",
      "Espacios naturales",
      "Crematorio",
      "Ambiente espiritual",
    ],
    image: "/images/parque-conmemorativo-2026.webp",
  },
  {
    title: 'Cremación',
    description:
      "Contamos con horno crematorio de tecnología avanzada, amigable con el medio ambiente y diseñado para garantizar procesos seguros y ágiles.",
    bullets: [
      "Tecnología moderna",
      "Sin emisiones contaminantes",
      "Entrega oportuna de cenizas",
      "Procesos certificados",
    ],
    image: "/images/services/cremacion.jpg",
  },
  {
    title: 'Parque Automotor',
    description:
      "Más de 70 vehículos especializados distribuidos estratégicamente para brindar atención rápida y segura en diferentes regiones del país.",
    bullets: [
      "Carrozas",
      "HH Alargadas",
      "Peugeot",
      "Vans comerciales",
    ],
    image: "/images/services/flota.jpg",
  },
  {
    title: 'Repatriación y Expatriación',
    description:
      "Coordinamos todos los trámites y la logística necesaria para el traslado nacional e internacional del ser querido.",
    bullets: [
      "Gestión documental",
      "Coordinación internacional",
      "Traslado seguro",
      "Acompañamiento permanente",
    ],
    image: "/images/images-baners/repatriacion.webp",
  },
  {
    title: "Planes de Previsión",
    description:
      "Protege hoy el bienestar de tu familia con planes diseñados para brindar tranquilidad, respaldo económico y acompañamiento permanente.",
    bullets: [
      "Cobertura familiar",
      "Facilidad de pago",
      "Asesoría personalizada",
      "Protección inmediata",
    ],
    image: "/images/images-baners/planes_jr.webp",
  },
];

const stats = [
  {
    icon: Building2,
    number: 110,
    suffix: '+',
    label: "Sedes Propias",
    description: "Presencia nacional con atención cercana y oportuna.",
  },
  {
    icon: Users,
    number: 200,
    suffix: '+',
    label: "Salas de Velación",
    description: "Espacios cómodos y dignos para acompañar a las familias.",
  },
  {
    icon: Truck,
    number: 70,
    suffix: '+',
    label: "Vehículos Especializados",
    description: "Parque automotor distribuido estratégicamente en Colombia.",
  },
  {
    icon: MapPinned,
    number: 14,
    suffix: '',
    label: "Departamentos",
    description: "Cobertura nacional para brindar atención inmediata.",
  },
];

const reasons = [
  {
    icon: HeartHandshake,
    title: "Calidad Humana",
    description:
      "Acompañamos cada familia con respeto, empatía y un profundo sentido humano, honrando la historia de vida de cada persona.",
  },
  {
    icon: ShieldCheck,
    title: "Respaldo y Experiencia",
    description:
      "Más de 25 años ofreciendo servicios exequiales con altos estándares de calidad y atención permanente.",
  },
  {
    icon: Building2,
    title: "Infraestructura Propia",
    description:
      "Contamos con sedes, salas de velación, parque automotor y parque conmemorativo propios para brindar una atención integral.",
  },
];

const timeline = [
  {
    step: "01",
    title: "Primer contacto",
    description: "Un asesor especializado atiende inmediatamente la solicitud."
  },
  {
    step: "02",
    title: "Coordinación",
    description: "Organizamos todos los aspectos logísticos del servicio."
  },
  {
    step: "03",
    title: "Traslado",
    description: "Nuestro parque automotor realiza el traslado con respeto y seguridad."
  },
  {
    step: "04",
    title: "Ceremonia",
    description: "Acompañamos la velación y homenaje según la voluntad de la familia."
  },
  {
    step: "05",
    title: "Destino final",
    description: "Inhumación o cremación con procesos seguros y dignos."
  },
  {
    step: "06",
    title: "Acompañamiento",
    description: "Seguimos brindando orientación y apoyo a la familia."
  },
];

const faqs = [
  {
    question: "¿La atención está disponible las 24 horas?",
    answer:
      "Sí. Nuestro equipo brinda atención inmediata las 24 horas del día, los 365 días del año.",
  },
  {
    question: "¿Tienen cobertura nacional?",
    answer:
      "Sí. Contamos con más de 110 sedes propias y presencia en 14 departamentos del país.",
  },
  {
    question: "¿Puedo adquirir un plan de previsión?",
    answer:
      "Sí. Disponemos de diferentes planes de previsión diseñados para proteger a las familias y brindar tranquilidad a futuro.",
  },
  {
    question: "¿Realizan servicios de cremación?",
    answer:
      "Sí. Contamos con un horno crematorio de tecnología avanzada y procesos respetuosos con el medio ambiente.",
  },
];

interface FaqItemProps {
  faq: {
    question: string;
    answer: string;
  };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const FaqItem = ({ faq, index, isOpen, onToggle }: FaqItemProps) => {
  return (
    <FadeIn key={faq.question} delay={index * 0.05}>
      <article
        className="glass rounded-2xl p-6 border border-primary/15 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-text mb-2">{faq.question}</h3>
          <ChevronDown
            className={`w-5 h-5 text-primary transition-transform duration-300 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
        {isOpen && <p className="text-textLight leading-relaxed mt-4">{faq.answer}</p>}
      </article>
    </FadeIn>
  );
};

interface AnimatedStatProps {
  number: number;
  suffix: string;
  duration?: number;
}

const AnimatedStat = ({ number, suffix, duration = 2 }: AnimatedStatProps) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <span ref={ref}>
      {inView ? <CountUp end={number} duration={duration} /> : '0'}
      {suffix}
    </span>
  );
};

export default function ServiciosClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleFaqToggle = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      <PageHero
        title="Servicios"
        subtitle="Acompañamos a las familias con respeto, calidez y respaldo profesional."
        image="/images/images-baners/servicios_funerarios.webp"
        imageAlt="Servicios funerarios Jardines del Renacer"
      />

      <section className="py-28">
        <Container>
          <FadeIn>
            <div className="text-center max-w-4xl mx-auto mb-16">
              <span className="inline-flex rounded-full bg-primary/10 text-primary px-4 py-2 text-sm font-medium mb-5">
                Jardines del Renacer
              </span>
              <h2 className="text-5xl font-display text-text mb-6 leading-tight">
                Más de 25 años acompañando a las familias colombianas
              </h2>
              <p className="text-xl text-textLight leading-relaxed">
                Brindamos servicios exequiales con cobertura nacional,
                infraestructura propia y atención humana permanente,
                ofreciendo tranquilidad, confianza y respaldo cuando más se necesita.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {stats.map((item, index) => {
              const Icon = item.icon;

              return (
                <FadeIn key={item.label} delay={index * 0.08}>
                  <div className="glass rounded-3xl border border-primary/10 p-8 h-full hover:-translate-y-2 hover:scale-105 hover:shadow-lg hover:border-primary/20 transition-all duration-500">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-5xl font-display text-primary mb-2">
                      <AnimatedStat number={item.number} suffix={item.suffix} />
                    </div>
                    <h4 className="text-xl font-semibold text-text mb-3">
                      {item.label}
                    </h4>
                    <p className="text-textLight leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-28 bg-primary/5">
        <Container>
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <FadeIn key={service.title} delay={index * 0.07}>
                <article className="group overflow-hidden rounded-[34px] glass border border-primary/10 hover:border-primary/30 hover:shadow-xl transition-all duration-500">
                  <div className="relative h-72 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-8 left-8 z-10">
                      <h3 className="text-3xl text-white font-display">
                        {service.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-textLight leading-relaxed mb-8">
                      {service.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {service.bullets.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm text-text"
                        >
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8">
                      <Link href="/contacto">
                        <Button variant="secondary">
                          Solicitar información
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-28">
        <Container>
          <FadeIn delay={0.3}>
            <div className="mt-24 grid lg:grid-cols-2 gap-14 items-center">
              <div>
                <span className="uppercase tracking-[0.25em] text-primary text-sm">
                  ¿POR QUÉ ELEGIRNOS?
                </span>
                <h2 className="text-4xl font-display text-text mt-4 mb-6">
                  Mucho más que un servicio funerario
                </h2>
                <p className="text-lg text-textLight leading-relaxed mb-10">
                  Nuestro propósito es acompañar a las familias con respeto,
                  empatía y compromiso, ofreciendo una atención integral
                  respaldada por infraestructura propia, cobertura nacional
                  y un equipo humano preparado para brindar apoyo en cada etapa.
                </p>
                <Link href="/nosotros">
                  <Button>
                    Conocer nuestra historia
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-6">
                {reasons.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="glass rounded-3xl border border-primary/10 p-8 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-display text-text mb-3">
                            {item.title}
                          </h3>
                          <p className="text-textLight leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-28 bg-gradient-to-b from-background to-primary/5">
        <Container maxWidth="2xl">
          <FadeIn>
            <div className="text-center max-w-4xl mx-auto mb-20">
              <span className="uppercase tracking-[0.25em] text-primary text-sm">
                NUESTRA INFRAESTRUCTURA
              </span>
              <h2 className="text-5xl font-display mt-5 mb-6">
                Infraestructura diseñada para brindar tranquilidad
              </h2>
              <p className="text-xl text-textLight leading-relaxed">
                Jardines del Renacer cuenta con una infraestructura propia
                que permite ofrecer una atención integral, cercana y oportuna,
                respaldando cada servicio con calidad, tecnología y experiencia.
              </p>
            </div>
          </FadeIn>

          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <FadeIn>
                <div className="relative rounded-[40px] overflow-hidden h-[620px] group">
                  <Image
                    src="/images/commemorativo.jpeg"
                    alt="Parque Conmemorativo Espiritual"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-12 left-12 max-w-lg">
                    <span className="inline-flex px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white mb-6">
                      Parque Conmemorativo Espiritual
                    </span>
                    <h3 className="text-5xl font-display text-white mb-5">
                      Un homenaje rodeado de naturaleza
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                      Ubicado en Cartago, Valle del Cauca,
                      es un espacio creado para honrar la memoria
                      de quienes partieron con serenidad,
                      respeto y un entorno natural.
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-8">
              <FadeIn>
                <div className="glass rounded-[34px] p-8">
                  <h3 className="text-3xl font-display mb-4">Salas VIP</h3>
                  <p className="text-textLight leading-relaxed">
                    Disponemos de salas VIP en Cali, Palmira,
                    Cartago y Zarzal, diseñadas para brindar
                    privacidad, comodidad y tranquilidad.
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="glass rounded-[34px] p-8">
                  <h3 className="text-3xl font-display mb-4">Parque Automotor</h3>
                  <p className="text-textLight leading-relaxed">
                    Más de 70 vehículos especializados entre
                    carrozas, HH alargadas, unidades Peugeot
                    y vans comerciales distribuidas estratégicamente
                    en el país.
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="glass rounded-[34px] p-8">
                  <h3 className="text-3xl font-display mb-4">Tecnología Ambiental</h3>
                  <p className="text-textLight leading-relaxed">
                    Nuestro horno crematorio utiliza tecnología
                    avanzada que garantiza procesos eficientes,
                    seguros y amigables con el medio ambiente.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      {/* Cobertura Nacional Interactiva */}

        <CoverageMap />

      <section className="py-28 bg-primary/5">
        <Container>
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="uppercase tracking-[0.25em] text-primary text-sm">
                NUESTRO PROCESO
              </span>
              <h2 className="text-5xl font-display mt-4 mb-6">
                Te acompañamos paso a paso
              </h2>
              <p className="text-xl text-textLight">
                Cada servicio es coordinado por un equipo humano especializado,
                garantizando tranquilidad y acompañamiento durante todo el proceso.
              </p>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {timeline.map((item) => (
              <FadeIn key={item.step} className="h-full">
                <div className="glass rounded-[30px] p-8 h-full hover:-translate-y-2 transition">
                  <div className="text-6xl font-display text-primary/20 mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-display mb-4">{item.title}</h3>
                  <p className="text-textLight leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-28">
        <Container>
          <FadeIn>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="uppercase tracking-[0.25em] text-primary text-sm">
                PREGUNTAS FRECUENTES
              </span>
              <h2 className="text-5xl font-display mt-5 mb-6">
                Estamos para resolver tus dudas
              </h2>
              <p className="text-xl text-textLight">
                Nuestro compromiso es brindar información clara,
                acompañamiento y tranquilidad en todo momento.
              </p>
            </div>
          </FadeIn>
          <div className="grid gap-6">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                faq={faq}
                index={index}
                isOpen={openFaqIndex === index}
                onToggle={() => handleFaqToggle(index)}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-28">
        <Container>
          <FadeIn>
            <div className="relative overflow-hidden rounded-[40px] bg-primary">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white" />
                <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white" />
              </div>
              <div className="relative z-10 px-14 py-20">
                <div className="max-w-3xl">
                  <span className="uppercase tracking-[0.25em] text-white/80">
                    ATENCIÓN INMEDIATA
                  </span>
                  <h2 className="text-6xl font-display text-white mt-5 mb-8">
                    Estamos disponibles para acompañarte cuando más lo necesites
                  </h2>
                  <p className="text-white/90 text-xl leading-relaxed">
                    Nuestro equipo humano está preparado para brindarte orientación,
                    acompañamiento y atención inmediata durante las 24 horas del día.
                  </p>
                  <div className="mt-12 flex flex-wrap gap-5">
                    <Link href="/contacto">
                      <Button>Hablar con un asesor ahora</Button>
                    </Link>
                    <Link href="https://wa.me/573115423312" target="_blank">
                      <Button variant="secondary" className="transition-transform hover:scale-105"><MessageSquare className="w-5 h-5 mr-2" /> WhatsApp</Button>
                    </Link>
                    <Link href="tel:+573115423312">
                      <Button variant="secondary">Llamar 24/7</Button>
                    </Link>
                    <Link href="/cotizar">
                      <Button variant="secondary" className="bg-white/20 hover:bg-white/30">
                        Cotizar un plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}