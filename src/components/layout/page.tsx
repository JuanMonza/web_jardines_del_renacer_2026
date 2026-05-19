'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function PQRPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    email: '',
    telefono: '',
    tipoSolicitud: 'Petición',
    mensaje: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construir el asunto y el cuerpo del correo
    const subject = encodeURIComponent(`Nueva ${formData.tipoSolicitud} - ${formData.nombre}`);
    const body = encodeURIComponent(
      `Tipo de Solicitud: ${formData.tipoSolicitud}\n` +
      `Nombre Completo: ${formData.nombre}\n` +
      `Documento: ${formData.cedula}\n` +
      `Email: ${formData.email}\n` +
      `Teléfono: ${formData.telefono}\n\n` +
      `Detalle de la Solicitud:\n${formData.mensaje}\n\n` +
      `------------------------------------------\n` +
      `Enviado desde el formulario PQR de la web.`
    );
    
    // Abrir el cliente de correo predeterminado para enviar al correo de atención al cliente
    window.location.href = `mailto:servicioalcliente@jardinesdelrenacer.com?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <section className="pt-10 pb-10">
        <Container>
          <div className="relative py-20 mb-8 rounded-3xl overflow-hidden bg-[url('/images/pqr.jpg')] bg-cover bg-center bg-no-repeat shadow-sm border border-primary/10">
            {/* Filtro claro para que el texto siga siendo legible */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]"></div>
            
            <div className="relative z-10">
              <FadeIn>
                <SectionTitle
                  title="Peticiones, Quejas y Reclamos (PQR)"
                  subtitle="Tu opinión es fundamental. Déjanos tus inquietudes y te daremos respuesta a la mayor brevedad posible."
                />
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-24">
        <Container maxWidth="md">
          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 md:p-12 border border-primary/15 shadow-xl">
              <h2 className="text-2xl font-display text-text mb-6">Formulario de Radicación</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <Input
                  label="Nombres y Apellidos"
                  placeholder="Ej. Juan Pérez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
                <Input
                  label="Número de Documento"
                  placeholder="Ej. 1088123456"
                  value={formData.cedula}
                  onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                  required
                />
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Teléfono de Contacto"
                  type="tel"
                  placeholder="Ej. 300 123 4567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-text mb-2">Tipo de Solicitud</label>
                <select
                  value={formData.tipoSolicitud}
                  onChange={(e) => setFormData({ ...formData, tipoSolicitud: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white/50"
                  required
                >
                  <option value="Petición">Petición</option>
                  <option value="Queja">Queja</option>
                  <option value="Reclamo">Reclamo</option>
                  <option value="Sugerencia">Sugerencia</option>
                  <option value="Felicitación">Felicitación</option>
                </select>
              </div>

              <div className="mb-8">
                <Textarea
                  label="Mensaje o Detalle"
                  placeholder="Describe tu solicitud con el mayor detalle posible para brindarte una mejor respuesta..."
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  required
                  rows={5}
                />
              </div>

              <div className="flex items-center justify-between gap-4 flex-wrap pt-6 border-t border-primary/10">
                <p className="text-xs text-textLight max-w-xs">
                  Al enviar este formulario, aceptas nuestra Política de Privacidad y el tratamiento de tus datos personales.
                </p>
                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
                  Enviar Solicitud PQR
                </Button>
              </div>
            </form>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}