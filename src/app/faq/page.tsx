'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import PageHero from '@/components/ui/PageHero';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: '¿Atienden casos de urgencia las 24 horas?',
    answer:
      'Si. Nuestro equipo de atencion opera 24/7 para reportes de fallecimiento y orientacion inmediata.',
  },
  {
    question: '¿Puedo cotizar un plan sin compromiso?',
    answer:
      'Si. Puedes solicitar una cotizacion por WhatsApp, telefono o formulario para comparar opciones segun tu necesidad.',
  },
  {
    question: '¿Tienen cobertura nacional?',
    answer:
      'Contamos con presencia en diferentes ciudades del pais y red de aliados para brindar atencion oportuna.',
  },
  {
    question: '¿Cómo funciona el servicio de repatriaciones?',
    answer:
      'Incluye coordinacion logistico-documental y acompanamiento para traslados nacionales e internacionales.',
  },
  {
    question: '¿Puedo agendar una visita antes de contratar?',
    answer:
      'Claro. Puedes solicitar visita presencial para conocer instalaciones, servicios y resolver dudas con un asesor.',
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <PageHero
        title="Preguntas Frecuentes"
        subtitle="Respuestas rápidas para ayudarte a tomar decisiones con tranquilidad."
        image="/images/images-baners/contacto.webp"
        imageAlt="Preguntas Frecuentes - Jardines del Renacer"
      />

      <section className="py-20">
        <Container maxWidth="lg">
          <div className="space-y-4">
            {faqs.map((item, index) => (
              <FadeIn key={item.question} delay={index * 0.05}>
                <article
                  className="glass rounded-2xl p-6 border border-primary/15 cursor-pointer transition-all hover:border-primary/30"
                  onClick={() => handleToggle(index)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-text">{item.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-primary transition-transform duration-300 ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                  {openIndex === index && (
                    <p className="text-textLight leading-relaxed mt-4 animate-in fade-in duration-500">
                      {item.answer}
                    </p>
                  )}
                </article>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
