'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// --- 1. TIPOS Y CONSTANTES ---

type PlanFlipCardProps = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  image: string;
  benefits: readonly string[];
  planType: string;
  description?: string;
  includes?: string;
  geographicCoverage?: string;
  conditions?: string;
  featured?: boolean;
  onQuote: (planId: string) => void;
};

const FLIP_TRANSITION = {
  duration: 0.5,
  ease: [0.34, 1.56, 0.64, 1], // Curva de easing con rebote
};

// --- 2. COMPONENTE PRINCIPAL ---

export default function PlanFlipCard(props: PlanFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Manejador para el botón en móvil
  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: '1200px' }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      aria-label={`Plan ${props.name}`}
    >
      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={FLIP_TRANSITION}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <FrontSide {...props} isFlipped={isFlipped} onFlip={handleFlip} />
        <BackSide {...props} onFlip={handleFlip} />
      </motion.div>
    </div>
  );
}

// --- 3. SUB-COMPONENTES (Front y Back) ---

function FrontSide({
  name,
  tagline,
  price,
  image,
  planType,
  featured,
  isFlipped,
  onFlip,
}: PlanFlipCardProps & { isFlipped: boolean; onFlip: () => void }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-2xl glass',
        'border border-primary/10 transition-shadow duration-300',
        featured && 'ring-2 ring-primary/80',
      )}
      style={{ backfaceVisibility: 'hidden' }}
    >
      {featured && (
        <div className="absolute right-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-lg">
          Destacado
        </div>
      )}

      <div className="relative h-56 w-full flex-shrink-0 overflow-hidden">
        <Image
          src={image}
          alt={`Imagen del plan ${name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={cn(
            'object-cover transition-all duration-500 ease-in-out',
            isFlipped ? 'scale-105' : 'scale-100',
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex-grow">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            {planType}
          </p>
          <h3 className="mb-2 font-display text-2xl font-bold text-text">
            {name}
          </h3>
          <p className="text-sm leading-relaxed text-textLight">{tagline}</p>
        </div>

        <div className="mt-6 pt-6 border-t border-primary/10">
          <p className="text-3xl font-semibold text-primary">{price}</p>
          <p className="mt-1 text-xs text-textLight md:hidden">
            Toca para ver beneficios
          </p>
          <p className="mt-1 text-xs text-textLight hidden md:block">
            Pasa el cursor para ver beneficios
          </p>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full md:hidden"
            onClick={onFlip}
          >
            Ver beneficios
          </Button>
        </div>
      </div>
    </div>
  );
}

function BackSide({
  id,
  name,
  benefits,
  description,
  includes,
  geographicCoverage,
  conditions,
  featured,
  onQuote,
  onFlip,
}: PlanFlipCardProps & { onFlip: () => void }) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-2xl glass p-6',
        'border border-primary/10',
        featured && 'ring-2 ring-primary/80',
      )}
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
    >
      {/* Header Fijo */}
      <div className="mb-4 flex flex-shrink-0 items-start justify-between gap-4">
        <h4 className="font-display text-xl font-bold text-text">{name}</h4>
        <button
          type="button"
          onClick={onFlip}
          className="flex-shrink-0 rounded-full border border-primary/20 px-3 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Volver a la vista frontal de la tarjeta"
        >
          Volver
        </button>
      </div>

      {/* Contenido con Scroll */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 -mr-2">
        {description && (
          <p className="text-sm leading-relaxed text-textLight">{description}</p>
        )}

        {includes && <InfoBlock title="Incluye" content={includes} />}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
            Beneficios Principales
          </p>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                <span className="text-sm text-text">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {(geographicCoverage || conditions) && (
          <div className="space-y-2 text-xs text-textLight">
            {geographicCoverage && (
              <p>
                <span className="font-semibold text-text">Cobertura:</span>{' '}
                {geographicCoverage}
              </p>
            )}
            {conditions && (
              <p>
                <span className="font-semibold text-text">Condiciones:</span>{' '}
                {conditions}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Fijo */}
      <div className="mt-6 flex-shrink-0 border-t border-primary/10 pt-6">
        <div className="flex flex-col gap-2">
          <Button as="a" href="/planes" variant="secondary" className="w-full">
            Ver todos los planes
          </Button>
          <Button
            type="button"
            variant="primary"
            className="w-full group"
            onClick={() => onQuote(id)}
          >
            Cotizar este plan
            <svg
              className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-xl border border-primary/15 bg-white/50 p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
        {title}
      </p>
      <p className="text-sm leading-relaxed text-textLight">{content}</p>
    </div>
  );
}
