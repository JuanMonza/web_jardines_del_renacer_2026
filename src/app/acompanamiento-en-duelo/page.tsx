'use client';

import { FormEvent, useState } from 'react';
import Image from 'next/image';

import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import PageHero from '@/components/ui/PageHero';
import TitleBand from '@/components/ui/TitleBand';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { getTalleresActivos, type TallerDuelo } from '@/data/talleres-duelo';
import { buildWhatsAppUrl } from '@/config/contact';

const serviciosDuelo = [
  {
    title: 'Acompañamiento Individual',
    description: 'Sesiones personalizadas con nuestros psicólogos para abordar el duelo de manera íntima y adaptada a tus necesidades.',
    icon: (
      <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/person-female.png" alt="person-female" />
    ),
  },
  {
    title: 'Grupos de Apoyo',
    description: 'Espacios seguros y confidenciales donde puedes compartir tu experiencia con otras personas que atraviesan situaciones similares.',
    icon: (
    <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/group--v3.png" alt="group--v3" />
    ),
  },
  {
    title: 'Talleres y Charlas',
    description: 'Actividades formativas y reflexivas sobre el manejo del duelo, la resiliencia y el crecimiento personal tras una pérdida.',
    icon: (
      <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/collaboration-female-male--v4.png" alt="collaboration-female-male--v4" />
    ),
  },
  {
    title: 'Línea de Apoyo Telefónico',
    description: 'Un canal directo para momentos de crisis o necesidad de escucha, disponible para todos nuestros afiliados.',
    icon: (
     <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/technical-support--v2.png" alt="technical-support--v2"/>
    ),
  }
];

export default function AcompanamientoDueloPage() {
  const proximosTalleres = getTalleresActivos();
  const [selectedTallerIndex, setSelectedTallerIndex] = useState(0);

  const handleWorkshopSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nombre = String(formData.get('nombre') || '').trim();
    const telefono = String(formData.get('telefono') || '').trim();
    const correo = String(formData.get('correo') || '').trim();
    const selectedTaller = proximosTalleres[selectedTallerIndex];
    const message = [
      'Hola, deseo inscribirme o recibir informacion sobre acompanamiento en duelo.',
      `Taller: ${selectedTaller.titulo}`,
      `Nombre: ${nombre}`,
      `Teléfono: ${telefono}`,
      `Correo: ${correo}`,
    ].join('\n');

    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    event.currentTarget.reset();
  };

  const selectedTaller = proximosTalleres[selectedTallerIndex];

  if (!proximosTalleres || proximosTalleres.length === 0) {
    // Manejar el caso donde no hay talleres. Se puede mostrar un mensaje.
  }

  return (
    <main className="min-h-screen">
      <PageHero
        title="Acompañamiento en Duelo"
        subtitle="Un espacio de apoyo y sanación para quienes han perdido a un ser querido."
        image="/images/images-baners/acompañamientoenduelo.webp"
        imageAlt="Acompañamiento en Duelo - Jardines del Renacer"
      />

      <TitleBand title="Nuestro Compromiso es Acompañarte" />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviciosDuelo.map((servicio, index) => (
              <FadeIn key={servicio.title} delay={index * 0.08}>
                <div className="group relative flex h-full flex-col rounded-3xl border border-primary/10 bg-white/60 p-6 text-center shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2">
                  <div className="flex-grow">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      {servicio.icon}
                    </div>
                    <h3 className="text-xl font-bold text-text">{servicio.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-textLight">
                      {servicio.description}
                    </p>
                  </div>
                  <div className="mt-6">
                    <a
                      href={buildWhatsAppUrl(`Hola, quisiera más información sobre el servicio de ${servicio.title}.`, '3228400549')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white"
                    >
                      Solicitar Información
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <TitleBand title="Próximos Talleres de Duelo" />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <div className="space-y-4">
                {proximosTalleres.map((taller, index) => (
                  <button
                    key={taller.id}
                    onClick={() => setSelectedTallerIndex(index)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${selectedTallerIndex === index
                        ? 'bg-primary/10 border-primary/30 shadow-lg'
                        : 'glass border-border hover:bg-base-100/50'
                      }`}
                  >
                    <p className="font-bold text-primary text-sm uppercase tracking-wider">{taller.fecha}</p>
                    <h3 className="text-lg font-semibold text-text mt-1">{taller.titulo}</h3>
                    <p className="text-sm text-textLight">{taller.lugar}</p>
                  </button>
                ))}
              </div>
            </FadeIn>

            <FadeIn className="lg:sticky lg:top-28">
              <div className="glass rounded-2xl p-8 border border-primary/20">
                <h3 className="text-2xl font-bold text-text mb-2">Inscríbete a nuestro próximo taller</h3>
                <p className="text-textLight mb-6">Completa el formulario para reservar tu cupo o solicitar más información.</p>

                <div className="bg-white/70 rounded-2xl p-6 border border-primary/10 transition-all shadow-sm overflow-hidden">
                  <div key={selectedTaller?.id} className="animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start md:items-center gap-5">
                        <div className="bg-primary/10 text-primary font-bold px-5 py-4 rounded-2xl text-center min-w-[130px] flex flex-col items-center justify-center">
                          <span className="text-3xl leading-none">{selectedTaller?.fecha.split(' ')[0]}</span>
                          <span className="text-xs uppercase tracking-wider">{selectedTaller?.fecha.split(' ').slice(1).join(' ')}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-text text-lg">{selectedTaller?.titulo}</h4>
                          <p className="text-sm text-textLight">{selectedTaller?.lugar}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleWorkshopSubmit} className="mt-6 space-y-4">
                  <input type="text" name="nombre" placeholder="Nombre Completo" required className="input w-full bg-white/80" />
                  <input type="tel" name="telefono" placeholder="Teléfono de Contacto" required className="input w-full bg-white/80" />
                  <input type="email" name="correo" placeholder="Correo Electrónico" required className="input w-full bg-white/80" />
                  <Button type="submit" variant="primary" className="w-full">
                    Quiero Inscribirme
                  </Button>
                </form>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </main>
  );
}
