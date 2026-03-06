'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Colores de acento únicos por departamento (de su bandera oficial)
// Se usan como fallback si la imagen no existe
const DEPT_ACCENT: Record<string, { from: string; to: string }> = {
  'Antioquia':     { from: '#1a5c1a', to: '#ffd700' },
  'Arauca':        { from: '#1565c0', to: '#e65100' },
  'Atlántico':     { from: '#1b5e20', to: '#1565c0' },
  'Bogotá D.C':   { from: '#1a237e', to: '#f9a825' },
  'Cauca':         { from: '#1b5e20', to: '#fff176' },
  'Cundinamarca':  { from: '#b71c1c', to: '#1b5e20' },
  'Huila':         { from: '#c62828', to: '#f8f8f8' },
  'Meta':          { from: '#0d47a1', to: '#fdd835' },
  'Risaralda':     { from: '#0d47a1', to: '#c62828' },
  'Santander':     { from: '#4e342e', to: '#f9a825' },
  'Tolima':        { from: '#b71c1c', to: '#f5f5f5' },
  'Valle del Cauca': { from: '#1b5e20', to: '#0d47a1' },
};

// Imágenes reales por slug de departamento
// Agrega aquí el nombre de archivo cuando tengas la imagen de cada departamento
const DEPT_IMAGES: Record<string, string> = {
  'antioquia':     'ronyr3-sunset-6006537_1920.webp',
  'arauca':        'denisdoukhan-capybara-3979875_1280.webp',
  'atlantico':     'camiluisa4237-woman-8297321_1280.webp',
  'bogota-dc':     'banner-bogota-colombia.webp',
  'cauca':         'makalu-colombia-4915141_1280.webp',
  'cundinamarca':  '6585638b8a22c2f261065224_candelaria.webp',
  'huila':         'aleafar-tatacoa-6292128_1280.webp',
  'meta':          'denisdoukhan-capybara-3979875_1280.webp',
  'risaralda':     'denisdoukhan-capybara-3979875_1280.webp',
  'santander':     'denisdoukhan-capybara-3979875_1280.webp',
  'tolima':        'denisdoukhan-capybara-3979875_1280.webp',
  'valle-del-cauca': 'denisdoukhan-capybara-3979875_1280.webp',
};

interface DepartamentoFlipCardProps {
  nombre: string;
  slug: string;
  count: number;
  ciudades: string[];
}

export default function DepartamentoFlipCard({
  nombre,
  slug,
  count,
  ciudades,
}: DepartamentoFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const isTouchRef = useRef(false);
  const accent = DEPT_ACCENT[nombre] ?? { from: '#1e3a6e', to: '#3C60A2' };

  const handleTouchStart = () => {
    isTouchRef.current = true;
  };

  const handleClick = () => {
    // On touch devices, tap toggles the flip
    if (isTouchRef.current) {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div
      className="relative w-full h-[340px] cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      onMouseEnter={() => { if (!isTouchRef.current) setIsFlipped(true); }}
      onMouseLeave={() => { if (!isTouchRef.current) setIsFlipped(false); }}
      aria-label={`Departamento ${nombre} — ${count} sedes`}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.55, type: 'spring', stiffness: 90, damping: 16 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ── FRENTE ─────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden flex flex-col justify-between shadow-glass-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Imagen de fondo completa (fallback: gradiente de bandera) */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${accent.from} 0%, ${accent.to} 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(/images/departamentos/${DEPT_IMAGES[slug] ?? `${slug}.png`})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Overlay oscuro para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

          {/* Contenido sobre la imagen */}
          <div className="relative flex flex-col justify-between flex-1 p-5">
            {/* Top row */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-white/70 text-xs font-semibold uppercase tracking-widest drop-shadow">
                Colombia
              </span>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm">
                {count} sede{count !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Bottom */}
            <div>
              <h2 className="text-white text-2xl font-bold leading-tight font-display drop-shadow-lg">
                {nombre}
              </h2>
              <p className="text-white/60 text-xs mt-1.5 flex items-center gap-1">
                <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                </svg>
                <span className="hidden sm:inline">Pasa el cursor para ver ciudades</span>
                <span className="sm:hidden">Toca para ver las ciudades</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── REVERSO ────────────────────────────────────── */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden glass flex flex-col shadow-glass-lg"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="h-1.5 w-full bg-primary rounded-t-2xl" />
          <div className="flex flex-col gap-4 p-6 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-primary font-bold text-xl font-display leading-tight">
              {nombre}
            </h3>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
              {count} sedes
            </span>
          </div>

          {/* Cities chips — cada chip es un link a la sede del departamento */}
          <div className="flex-1 overflow-y-auto">
            <p className="text-xs text-textLight uppercase tracking-wider font-semibold mb-2.5">
              Ciudades con sede
            </p>
            <div className="flex flex-wrap gap-2">
              {ciudades.map((ciudad) => (
                <Link
                  key={ciudad}
                  href={`/sedes/${slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs bg-primary/8 hover:bg-primary hover:text-white text-primary px-2.5 py-1 rounded-full font-medium border border-primary/15 transition-colors duration-200"
                >
                  {ciudad}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href={`/sedes/${slug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white rounded-xl px-5 py-3 text-sm font-semibold hover:bg-primary-hover active:scale-95 transition-all duration-200 shrink-0"
          >
            Ver sedes
            <svg
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
