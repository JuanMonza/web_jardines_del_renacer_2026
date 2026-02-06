'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import type { Obituary } from '@/types/obituary';
import Image from 'next/image';

// Mock data - reemplazar con fetch real
const mockObituario: Obituary = {
  id: '1',
  nombre: 'THANIA ROCIO REYES NERI',
  fechaNacimiento: '1989-12-30',
  fechaFallecimiento: '2025-06-11',
  foto: '/images/placeholder-obituary.jpg',
  cedula: '1234567890',
  sala: 'Sala Magna 4',
  ubicacionSala: 'San Pedro Garza García - Agencia Capilla Martínez',
  inicioVelacion: '2025-06-12T14:00',
  cierreVelacion: '2025-06-13T13:00',
  sede: 'principal',
  estado: 'active',
  direccionServicio: 'Del servicio ceremonial: [dirección completa]',
  direccionCementerio: 'Cementerio Jardines del Descanso: [dirección completa]',
  horaDestinoFinal: '14:00',
  ubicacionMapa: 'San Pedro Garza García',
  servicios: ['Cafetería', 'Florería', 'Crematorio', 'Estacionamiento', 'Wifi', 'Accesibilidad', 'Nichos', 'Capilla Ecuménica'],
  permitirCondolencias: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const serviciosIconos: Record<string, string> = {
  'Cafetería': '',
  'Florería': '',
  'Crematorio': '',
  'Estacionamiento': '',
  'Wifi': '',
  'Accesibilidad': '',
  'Nichos': '',
  'Capilla Ecuménica': '',
};

export default function ObituarioDetallePage() {
  const params = useParams();
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // En producción, hacer fetch del obituario por ID
  const obituario = mockObituario;

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatearFechaCompleta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const compartir = (plataforma: 'facebook' | 'twitter' | 'whatsapp' | 'copiar') => {
    const url = window.location.href;
    const texto = `En memoria de ${obituario.nombre}`;

    switch (plataforma) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(texto + ' ' + url)}`, '_blank');
        break;
      case 'copiar':
        navigator.clipboard.writeText(url);
        alert('Enlace copiado al portapapeles');
        break;
    }
    setShowShareMenu(false);
  };

  const enviarFlores = () => {
    // Redirigir a la página de florería
    window.location.href = '/floreria';
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-background via-primary/5 to-background">
      <Container>
        <FadeIn>
          {/* Encabezado con foto */}
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <Image
              src={obituario.foto}
              alt={obituario.nombre}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Contenido principal */}
          <div className="max-w-4xl mx-auto">
            {/* Título "En memoria de" */}
            <div className="text-center mb-6">
              <p className="text-textLight text-lg mb-2">En memoria de</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-text mb-4">
                {obituario.nombre}
              </h1>
              <p className="text-xl text-textLight">
                {formatearFecha(obituario.fechaNacimiento)} - {formatearFecha(obituario.fechaFallecimiento)}
              </p>
              <p className="text-primary mt-2 font-medium">
                {obituario.ubicacionSala}
              </p>
            </div>

            {/* Información de sala y horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Sala */}
              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-textLight">Sala</p>
                    <p className="font-semibold text-text text-lg">{obituario.sala}</p>
                  </div>
                </div>
              </div>

              {/* Horarios */}
              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-textLight">Horario</p>
                    <p className="font-semibold text-text">
                      Inicio: {formatearFechaCompleta(obituario.inicioVelacion)} | {formatearHora(obituario.inicioVelacion)}
                    </p>
                    <p className="font-semibold text-text">
                      Fin: {formatearFechaCompleta(obituario.cierreVelacion)} | {formatearHora(obituario.cierreVelacion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Botón Compartir */}
              <div className="relative">
                <Button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  variant="outline"
                  className="w-full h-14 text-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Compartir
                </Button>

                {/* Menú de compartir */}
                {showShareMenu && (
                  <div className="absolute top-full mt-2 left-0 right-0 glass rounded-xl border border-primary/20 shadow-xl overflow-hidden z-10">
                    <button
                      onClick={() => compartir('facebook')}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                    >
                      <span className="text-2xl"></span>
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => compartir('twitter')}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                    >
                      <span className="text-2xl"></span>
                      <span>Twitter</span>
                    </button>
                    <button
                      onClick={() => compartir('whatsapp')}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                    >
                      <span className="text-2xl"></span>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => compartir('copiar')}
                      className="w-full px-4 py-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3"
                    >
                      <span className="text-2xl"></span>
                      <span>Copiar enlace</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Botón Mandar Flores */}
              <Button
                onClick={enviarFlores}
                variant="primary"
                className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
                </svg>
                Mandar Flores
              </Button>
            </div>

            {/* Direcciones */}
            <div className="glass rounded-2xl p-6 border border-primary/20 mb-8">
              <div className="space-y-4">
                {/* Dirección del servicio */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text mb-1">Del servicio ceremonial</p>
                    <p className="text-textLight text-sm">{obituario.direccionServicio || 'Sede Principal - Jardines del Renacer'}</p>
                  </div>
                </div>

                {/* Dirección del cementerio */}
                {obituario.direccionCementerio && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text mb-1">Cementerio Jardines del Descanso</p>
                      <p className="text-textLight text-sm">{obituario.direccionCementerio}</p>
                    </div>
                  </div>
                )}

                {/* Hora destino final */}
                {obituario.horaDestinoFinal && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-text">HORA DESTINO FINAL {obituario.horaDestinoFinal}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Servicios de la agencia */}
            {obituario.servicios && obituario.servicios.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-primary/20 mb-8">
                <h3 className="text-xl font-semibold text-text mb-6 text-center">
                  Servicios de la agencia
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {obituario.servicios.map((servicio) => (
                    <div
                      key={servicio}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl glass border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <span className="text-3xl">{serviciosIconos[servicio] || ''}</span>
                      <span className="text-sm text-text text-center font-medium">{servicio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa */}
            <div className="glass rounded-2xl p-6 border border-primary/20">
              <h3 className="text-xl font-semibold text-text mb-4">Ubicación</h3>
              <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(obituario.ubicacionMapa || obituario.ubicacionSala)}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="grayscale"
                />
              </div>
              <p className="text-sm text-textLight mt-3 text-center">
                {obituario.ubicacionSala}
              </p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
