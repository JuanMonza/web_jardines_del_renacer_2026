'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí conectarás con tu API
    console.log('Datos del formulario:', formData);
    
    // Simulación de envío
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Mensaje enviado exitosamente. Te contactaremos pronto.');
    setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
    setIsSubmitting(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/50">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Contáctanos"
              subtitle="Estamos aquí para ayudarte 24/7"
            />
          </FadeIn>
        </Container>
      </section>

      <section className="py-12 pb-20">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Formulario */}
            <FadeIn>
              <div className="glass rounded-2xl p-8">
                <h3 className="text-2xl font-display mb-6 text-text">
                  Envíanos un mensaje
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Nombre completo"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Juan Pérez"
                  />
                  
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="juan@ejemplo.com"
                  />
                  
                  <Input
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    placeholder="300 123 4567"
                  />
                  
                  <Input
                    label="Asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    placeholder="Información sobre planes"
                  />
                  
                  <Textarea
                    label="Mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    rows={6}
                  />
                  
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </form>
              </div>
            </FadeIn>

            {/* Información de contacto */}
            <FadeIn delay={0.2}>
              <div className="space-y-8">
                <div className="glass rounded-2xl p-8">
                  <h3 className="text-2xl font-display mb-6 text-text">
                    Información de Contacto
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text mb-1">Teléfono</h4>
                        <a
                          href={CONTACT_INFO.primaryLine.href}
                          className="text-textLight hover:text-primary transition-colors"
                        >
                          {CONTACT_INFO.primaryLine.number}
                        </a>
                        <p className="text-textLight">{CONTACT_INFO.primaryLine.detail}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text mb-1">WhatsApp</h4>
                        <a
                          href={buildWhatsAppUrl()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-textLight hover:text-primary transition-colors"
                        >
                          {CONTACT_INFO.whatsappDisplay}
                        </a>
                        <p className="text-textLight">Respuesta rápida y orientación inicial</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text mb-1">Sedes</h4>
                        <p className="text-textLight">Cobertura nacional con atención presencial</p>
                        <Link
                          href={CONTACT_INFO.locationsHref}
                          className="text-primary hover:underline"
                        >
                          Ver ubicaciones y líneas por ciudad
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text mb-1">Horario</h4>
                        <p className="text-textLight">{CONTACT_INFO.supportHours}</p>
                        <p className="text-textLight">Todos los días del año</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-8">
                  <h3 className="text-xl font-display mb-4 text-text">
                    Líneas Regionales
                  </h3>
                  <div className="space-y-3">
                    {CONTACT_INFO.regionalLines.map((line) => (
                      <a
                        key={line.label}
                        href={line.href}
                        className="flex items-center justify-between rounded-xl glass border border-border px-4 py-3 hover:border-primary/40 transition-colors"
                      >
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-primary mb-1">
                            {line.label}
                          </p>
                          <p className="text-text font-semibold">{line.number}</p>
                        </div>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-2xl p-8">
                  <h3 className="text-xl font-display mb-4 text-text">
                    Atención Inmediata
                  </h3>
                  <p className="text-textLight mb-4">
                    Para casos de urgencia, contáctanos por WhatsApp:
                  </p>
                  <a 
                    href={buildWhatsAppUrl('Hola, necesito orientacion inmediata sobre los servicios de Jardines del Renacer.')}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" className="w-full">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Chatear por WhatsApp
                    </Button>
                  </a>
                  <Link href={CONTACT_INFO.locationsHref} className="block mt-3">
                    <Button variant="secondary" className="w-full">
                      Ver sedes en todo Colombia
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </>
  );
}
