'use client';

import { useState, type FormEvent } from 'react';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import TitleBand from '@/components/ui/TitleBand';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/config/contact';

const serviciosDuelo = [
  {
    title: 'Grupos de apoyo',
    description: 'Canal vía Whatsapp, es un espacio seguro para aprender, compartir y sanar. Aquí encontrarás contenido de valor, herramientas prácticas y apoyo emocional para transitar el duelo con comprensión, esperanza y compañía. Porque cada historia importa y nadie tiene que recorrer este camino en soledad.',
    icon: (
      <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Acompañamiento psicológico',
    description: 'Acompañamos tu proceso de duelo con orientación psicológica, herramientas prácticas y apoyo emocional para ayudarte a transitar la pérdida de manera saludable, fortalecer tus recursos personales y encontrar bienestar en esta nueva etapa.',
    icon: (
      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
  },
  {
    title: 'Talleres de luz',
    description: 'Espacios de acompañamiento donde se utiliza este ejercicio de manera simbólica orientados a la expresión emocional. A través de esta herramienta, las personas pueden reconocer, expresar y resignificar las emociones, pensamientos y sentimientos asociados al proceso de pérdida.',
    icon: (
      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Talleres de duelo',
    description: 'Participa en talleres diseñados para brindarte orientación, recursos prácticos y apoyo emocional que te ayuden a avanzar con mayor serenidad y esperanza.',
    icon: (
      <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  }
];

const proximosTalleres = [
  { fecha: '25 DE JUNIO', titulo: 'Taller de duelo "Día del Padre"', lugar: 'Parque Conmemorativo Espiritual' },
  { fecha: 'XX DE JULIO', titulo: 'Taller de duelo "Aún estás en mi corazón"', lugar: 'Sede Calarcá' },
  { fecha: 'XX DE AGOSTO', titulo: 'Taller de duelo "Cometa - Globo"', lugar: 'Parque Conmemorativo Espiritual' },
  { fecha: 'XX DE SEPTIEMBRE', titulo: 'Taller de duelo "Origami"', lugar: 'Día de Amor y Amistad' },
  { fecha: 'XX DE OCTUBRE', titulo: 'Taller de duelo por pérdida perinatal o gestacional', lugar: 'Parque Conmemorativo' },
  { fecha: 'XX DE NOVIEMBRE', titulo: 'Taller de duelo por pérdida de mascota', lugar: 'Medellín' },
  { fecha: 'XX DE DICIEMBRE', titulo: 'Taller de duelo en fechas especiales (Navidad)', lugar: 'Parque Conmemorativo Espiritual' },
];

export default function AcompanamientoDueloPage() {
  const [selectedTallerIndex, setSelectedTallerIndex] = useState(0);
  const selectedTaller = proximosTalleres[selectedTallerIndex];

  const handleWorkshopSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nombre = String(formData.get('nombre') || '').trim();
    const telefono = String(formData.get('telefono') || '').trim();
    const correo = String(formData.get('correo') || '').trim();
    const message = [
      'Hola, deseo inscribirme o recibir informacion sobre acompanamiento en duelo.',
      `Taller: ${selectedTaller.titulo}`,
      `Fecha: ${selectedTaller.fecha}`,
      `Lugar: ${selectedTaller.lugar}`,
      nombre && `Nombre: ${nombre}`,
      telefono && `Telefono: ${telefono}`,
      correo && `Correo: ${correo}`,
    ].filter(Boolean).join('\n');

    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    event.currentTarget.reset();
  };

  return (
    <main className="min-h-screen">
      <PageHero
        title="Acompañamiento en Duelo"
        subtitle="Un espacio de apoyo, comprensión y guía integral para transitar la pérdida con dignidad, calma y compañía."
        image="/images/images-baners/acompañamientoenduelo.webp"
        imageAlt="Acompañamiento en duelo Jardines del Renacer"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={buildWhatsAppUrl("Hola, deseo recibir atención directa de la línea de psicología y duelo.")} target="_blank" rel="noopener noreferrer">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Línea directa
            </Button>
          </a>
          <a href="#talleres">
            <Button variant="secondary" size="lg" className="w-full bg-white/90 sm:w-auto">
              Ver talleres
            </Button>
          </a>
        </div>
      </PageHero>

      {/* INTRODUCCIÓN E INFORMACIÓN DEL SERVICIO */}
      <section className="py-20">
        <Container maxWidth="lg">
          <FadeIn>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.15fr_0.85fr]">
              <div className="glass rounded-3xl border border-primary/15 p-8 shadow-xl md:p-12">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-primary">
                  Apoyo emocional
                </p>
                <h2 className="mb-6 text-3xl font-display font-extrabold text-primary">No estás solo en este proceso</h2>
                <p className="text-lg leading-relaxed text-textLight">
                  Nuestro programa brinda apoyo emocional y psicológico a las familias. A través de profesionales capacitados, ofrecemos herramientas para transitar la pérdida de un ser querido con respeto, sensibilidad y dignidad.
                </p>
              </div>
              <div className="rounded-3xl bg-primary p-8 text-white shadow-xl">
                <h3 className="text-2xl font-display font-extrabold">Atención cercana</h3>
                <p className="mt-4 text-white/90">
                  Puedes solicitar orientación directa, unirte a grupos de apoyo o reservar cupo en los talleres programados.
                </p>
                <a href={buildWhatsAppUrl("Hola, deseo orientación sobre acompañamiento en duelo.")} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full">
                  <Button variant="secondary" className="w-full bg-white/95">
                    Hablar por WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* SERVICIOS DE ACOMPAÑAMIENTO */}
      <section className="pb-20">
        <TitleBand
          title="Formas de acompañarte"
          subtitle="Opciones de apoyo pensadas para escuchar, orientar y sanar paso a paso."
        />
        <Container maxWidth="xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {serviciosDuelo.map((servicio, index) => (
              <FadeIn key={servicio.title} delay={index * 0.1}>
                <div className="group glass rounded-3xl p-8 md:p-10 border border-primary/15 h-full transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:bg-white/60 cursor-default">
                  <div className="w-16 h-16 flex items-center justify-center bg-primary/5 rounded-2xl mb-6 transition-all duration-500 group-hover:bg-primary/10 group-hover:scale-110 group-hover:shadow-lg">
                    {servicio.icon}
                  </div>
                  <h3 className="text-2xl font-display text-text mb-4">{servicio.title}</h3>
                  <p className="text-textLight leading-relaxed">
                    {servicio.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* CALENDARIO DE TALLERES (Administrable) */}
      <section id="talleres" className="pb-20">
        <Container maxWidth="lg">
          <FadeIn>
            <TitleBand
              title="Próximos Talleres"
              subtitle="Conoce nuestra programación y reserva tu espacio de acompañamiento."
            />
            
            <div className="max-w-3xl mx-auto glass rounded-3xl p-6 md:p-8 border border-primary/15 shadow-xl bg-white/40">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="w-full md:w-2/3">
                  <label className="block text-sm font-bold text-primary uppercase tracking-wider mb-2">
                    Selecciona un taller
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTallerIndex}
                      onChange={(e) => setSelectedTallerIndex(Number(e.target.value))}
                      className="w-full appearance-none px-5 py-4 rounded-2xl glass border-2 border-primary/20 text-text font-semibold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all bg-white cursor-pointer"
                    >
                      {proximosTalleres.map((taller, index) => (
                        <option key={index} value={index}>
                          {taller.fecha} - {taller.titulo}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/3 flex justify-end md:mt-6">
                  <a href={buildWhatsAppUrl("Hola, deseo recibir atención directa de la línea de psicología y duelo.")} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full py-4 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2 group">
                      <svg className="w-6 h-6 animate-pulse group-hover:animate-none" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Línea Directa
                    </Button>
                  </a>
                </div>
              </div>

              <div className="bg-white/70 rounded-2xl p-6 border border-primary/10 transition-all shadow-sm overflow-hidden">
                <div key={selectedTaller.titulo} className="animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start md:items-center gap-5">
                      <div className="bg-primary/10 text-primary font-bold px-5 py-4 rounded-2xl text-center min-w-[130px] flex flex-col items-center justify-center">
                        <span className="text-xs uppercase tracking-widest opacity-80 mb-1">Fecha</span>
                        <span className="text-lg">{selectedTaller.fecha}</span>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-text mb-2">{selectedTaller.titulo}</h4>
                        <p className="text-textLight flex items-center gap-2 text-lg">
                          <svg className="w-5 h-5 text-primary/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {selectedTaller.lugar}
                        </p>
                      </div>
                    </div>
                    <a href="#inscripcion" className="w-full md:w-auto">
                      <Button variant="primary" size="lg" className="w-full justify-center whitespace-nowrap shadow-lg hover:shadow-primary/30 md:w-auto">
                        Inscribirme
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* INSCRIPCIÓN / FORMULARIO */}
      <section id="inscripcion" className="py-20 bg-primary/5">
        <Container maxWidth="lg">
          <FadeIn>
            <TitleBand
              title="Inscripción a Talleres"
              subtitle="Diligencia tus datos y te llevamos directo a WhatsApp para confirmar la solicitud."
            />
            
            <form onSubmit={handleWorkshopSubmit} className="glass rounded-3xl p-8 md:p-12 border border-primary/15 shadow-xl max-w-2xl mx-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">Nombre Completo</label>
                  <input name="nombre" type="text" className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all" placeholder="Ej. María Gómez" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Teléfono</label>
                    <input name="telefono" type="tel" className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all" placeholder="Número de contacto" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">Correo Electrónico</label>
                    <input name="correo" type="email" className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:bg-white/80 transition-all" placeholder="tu@correo.com" required />
                  </div>
                </div>
                <Button type="submit" variant="primary" className="w-full justify-center mt-4 group/btn" size="lg">
                  Enviar Solicitud
                  <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Button>
              </div>
            </form>
          </FadeIn>
        </Container>
      </section>
    </main>
  );
}
