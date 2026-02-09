'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export default function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Mostrar botón cuando el usuario haya bajado 300px
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const openWhatsApp = () => {
    // Reemplaza con tu número de WhatsApp (incluye código de país sin el +)
    const phoneNumber = '573001234567'; // Ejemplo: 57 (Colombia) + número
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const reportarFallecimiento = () => {
    setShowModal(true);
  };

  return (
    <>
      {/* Botones lado izquierdo - Esquina inferior izquierda */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        {/* Botón Scroll to Top */}
        <button
          onClick={scrollToTop}
          className={cn(
            'group relative w-14 h-14 glass border border-primary/30 text-primary hover:bg-primary hover:text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95',
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          )}
          aria-label="Volver arriba"
        >
          {/* Icono de flecha arriba */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>

          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Volver arriba
          </span>
        </button>

        {/* Botón Reportar Fallecimiento 24/7 */}
        <button
          onClick={reportarFallecimiento}
          className="group relative w-14 h-14 bg-gradient-to-br from-[#3C60A2] to-[#2B4A7C] hover:from-[#2B4A7C] hover:to-[#1a3558] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 border-2 border-[#3C60A2]/50"
          aria-label="Reportar Fallecimiento 24/7"
        >
          {/* Ícono de teléfono con pulso */}
          <div className="relative">
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            {/* Badge 24/7 */}
            <span className="absolute -top-1 -right-1 bg-white text-[#3C60A2] text-[8px] font-bold px-1 py-0.5 rounded-full shadow-md">
              24/7
            </span>
          </div>

          {/* Tooltip */}
          <span className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl">
            Reportar Fallecimiento 24/7
          </span>

          {/* Pulso animado permanente */}
          <span className="absolute inset-0 rounded-full bg-[#3C60A2] animate-ping opacity-30"></span>
        </button>
      </div>

      {/* Botón WhatsApp - Esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openWhatsApp}
          className="group relative w-14 h-14 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          aria-label="Contactar por WhatsApp"
        >
          {/* Icono de WhatsApp */}
          <svg
            className="w-7 h-7"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Chatea con nosotros
          </span>

          {/* Pulso animado */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        </button>
      </div>

      {/* Modal de Reportar Fallecimiento */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="glass rounded-3xl border-2 border-primary/30 p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#3C60A2] hover:bg-[#2B4A7C] text-white flex items-center justify-center transition-colors z-10"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenido del modal */}
            <div className="space-y-6">
              {/* Opción 1: Desde tu teléfono */}
              <div className="glass rounded-2xl p-6 border border-border">
                <p className="text-textLight text-sm mb-2">Desde tu teléfono</p>
                <a 
                  href="tel:8004296776"
                  className="text-3xl font-bold text-text hover:text-primary transition-colors block"
                >
                  800 4296776
                </a>
              </div>

              {/* Opción 2: Desde tu móvil */}
              <div className="glass rounded-2xl p-6 border border-border">
                <p className="text-textLight text-sm mb-2">Desde tu móvil</p>
                <a 
                  href="tel:*247"
                  className="text-4xl font-bold text-text hover:text-primary transition-colors block"
                >
                  *247
                </a>
              </div>

              {/* Botón principal */}
              <a
                href="tel:8004296776"
                className="flex items-center justify-between w-full rounded-2xl bg-gradient-to-r from-[#3C60A2] to-[#2B4A7C] hover:from-[#2B4A7C] hover:to-[#1a3558] text-white p-4 shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[#3C60A2]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg leading-tight">Reportar fallecimiento</p>
                    <p className="text-sm font-semibold">ATENCIÓN 24/7</p>
                  </div>
                </div>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
