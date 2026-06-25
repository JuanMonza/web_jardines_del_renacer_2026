'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Barcode from 'react-barcode';
import { QRCodeSVG } from 'qrcode.react';
import FadeIn from '@/components/animations/FadeIn';
import { SITE_URL } from './site';
import { cn } from '@/lib/utils';

interface MembershipCardProps {
  nombre: string;
  cedula: string;
  membresiaId: string;
  codigoUnico?: string;
  discountLabel?: string;
}

/**
 * Componente que renderiza una tarjeta de membresía digital con efecto de vidrio.
 * Muestra el nombre del titular, su cédula y el número de membresía.
 * Incluye una animación de volteo para mostrar el reverso con un código QR y beneficios.
 * @param nombre - Nombre completo del titular de la tarjeta.
 * @param cedula - Número de cédula del titular.
 * @param membresiaId - Identificador único de la membresía.
 * @param codigoUnico - (Opcional) Código dinámico para validación o canje.
 */
export default function MembershipCard({
  nombre,
  cedula,
  membresiaId,
  codigoUnico,
  discountLabel,
}: MembershipCardProps) { // No changes needed here, just verifying
  const [isFlipped, setIsFlipped] = useState(false);
  const savedCode = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (codigoUnico) {
      savedCode.current = codigoUnico;
    }
  }, [codigoUnico]);

  const currentCode = savedCode.current ?? codigoUnico;

  const qrUrl = `${SITE_URL}/aliados-comerciales?cedula=${cedula}`;

  const benefits = [
    'Descuentos exclusivos en comercios.',
    'Acceso a eventos especiales.',
    'Notificaciones prioritarias.',
  ];

  return (
    <FadeIn>
      <div className="w-full max-w-md mx-auto [perspective:1000px]">
        {/* Contenedor para el efecto de hover en grupo */}
        <div
          className={cn(
            'group relative w-full h-[250px] transition-transform duration-700 [transform-style:preserve-3d]',
            isFlipped && '[transform:rotateY(180deg)]',
          )}
        >
          {/* ANVERSO DE LA TARJETA */}
          <div className="absolute w-full h-full [backface-visibility:hidden]">
            <div className="w-full h-full font-mono text-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative bg-gradient-to-br from-[#3C60A2] to-[#2c4879] p-6 h-full flex flex-col justify-between border border-white/20">
                {/* Efecto de brillo en hover */}
                <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ease-in-out group-hover:left-[100%]" />
                <div className="absolute -bottom-12 -right-10 w-40 h-40 rounded-full bg-white/10 filter blur-3xl opacity-50"></div>

                {/* Logo centrado y desvanecido como marca de agua */}
                <Image
                  src="/logo-oficial.webp"
                  alt="Logo Jardines del Renacer"
                  width={140}
                  height={140}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-15 filter blur-[1px]"
                />

                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold tracking-widest uppercase opacity-70">
                      Club de Aliados
                    </span>
                    {/* El chip se muestra aquí para mantener el balance visual */}
                  </div>
                  <div className="w-12 h-9 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-md flex items-center justify-center shadow-md absolute top-6 right-6">
                    <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-sm border border-yellow-600/50">
                      <div className="w-5 h-5 border-l border-b border-yellow-700/50 ml-1 mt-1"></div>
                    </div>
                  </div>

                  {currentCode ? (
                    <div className="my-4 text-center">
                      <p className="text-xs opacity-70 mb-1 tracking-wider">Código de Uso</p>
                      <p className="text-3xl font-bold tracking-widest text-yellow-200 bg-black/20 rounded-lg py-2 px-4 inline-block">
                        {currentCode}
                      </p>
                      {discountLabel && (
                        <p className="text-xs opacity-80 mt-2 tracking-wider">
                          Descuento Aplicado: <span className="font-bold">{discountLabel}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="my-4">
                      <p className="text-xs opacity-70 mb-1 tracking-wider">Número de Membresía</p>
                      <p className="text-2xl font-semibold tracking-widest">
                        {membresiaId ? membresiaId.replace(/(.{4})/g, '$1 ').trim() : 'Cargando...'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex justify-between items-end">
                  <div>
                    <p className="text-xs opacity-70 mb-1 tracking-wider">Nombre</p>
                    <p className="text-base font-medium uppercase tracking-wide" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                      {nombre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-70 mb-1 tracking-wider">Cédula</p>
                    <p className="text-sm font-medium tracking-wider">{cedula}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="absolute bottom-2 right-3 text-white/50 hover:text-white transition-colors"
                  aria-label="Voltear tarjeta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* REVERSO DE LA TARJETA */}
          <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div className="w-full h-full font-mono text-white rounded-2xl overflow-hidden shadow-lg">
              <div className="relative bg-[#3C60A2] p-6 h-full flex flex-col justify-between border border-white/20">
                {/* Panel de firma y CVV */}
                <div className="w-full h-12 bg-white flex items-center justify-between px-4 rounded">
                  <div className="w-3/4 h-full flex items-center">
                    <Barcode
                      value={currentCode || membresiaId || '000000000'}
                      height={30}
                      width={1.5}
                      displayValue={true} // Mostrar el número debajo del código
                      background="#FFFFFF" // Fondo blanco para máxima legibilidad
                      lineColor="#000000" // Líneas negras
                      margin={0}
                      fontSize={10}
                    />
                  </div>
                  <p className="text-black text-sm font-sans italic font-bold">123</p>
                </div>

                <div className="flex items-start justify-between gap-4 pt-4">
                  <div className="text-left">
                    <h4 className="text-sm font-semibold tracking-wider mb-2">Beneficios Principales</h4>
                    <ul className="space-y-1 text-xs list-disc pl-4 opacity-80">
                      {benefits.map((benefit) => (
                        <li key={benefit}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col items-center gap-2 ml-auto">
                    <div className="bg-white p-1.5 rounded-md border border-yellow-400">
                      <QRCodeSVG value={qrUrl} size={60} bgColor="#ffffff" fgColor="#000000" />
                    </div>
                    {/* Holograma */}
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-300 via-purple-400 to-pink-500 opacity-60 rounded-sm"></div>
                  </div>
                </div>

                <div className="text-center text-[10px] opacity-60 relative z-10">
                  <p>Tarjeta digital intransferible. Válida para el Club de Aliados.</p>
                  <p>Jardines del Renacer S.A.S.</p>
                </div>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="absolute bottom-2 right-3 text-white/50 hover:text-white transition-colors"
                  aria-label="Voltear tarjeta"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}