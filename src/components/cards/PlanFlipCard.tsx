'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Sparkles, } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

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

const transition = {
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1],
};

export default function PlanFlipCard(props: PlanFlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-full"
      style={{
        perspective: '1800px',
      }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      {/* Contenedor que define la altura automáticamente */}
      <div className="relative min-h-[600px]">
        <motion.div
          className="absolute inset-0"
          animate={{
            rotateY: flipped ? 180 : 0,
          }}
          transition={transition}
          style={{
            transformStyle: 'preserve-3d',
            width: '100%',
            height: '100%',
          }}
        >
          <FrontSide
            {...props}
            flipped={flipped}
            onFlip={() => setFlipped(true)}
          />

          <BackSide
            {...props}
            onFlip={() => setFlipped(false)}
          />
        </motion.div>
      </div>
    </div>
  );
}
function FrontSide({
  name,
  tagline,
  price,
  image,
  planType,
  featured,
  flipped,
  onFlip,
}: PlanFlipCardProps & {
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col overflow-hidden rounded-[32px] bg-white border border-blue-200/60",
        featured && "ring-2 ring-primary/70"
      )}
      style={{
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        boxShadow:
          "0 15px 45px rgba(37,99,235,.12),0 30px 70px rgba(37,99,235,.08)",
      }}
    >
      {/* Halo azul */}
      <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-500/15 blur-3xl"></div>

      {/* Imagen — altura fija para igualar todas las cards */}
      <div className="relative h-56 shrink-0 overflow-hidden">

        <Image
          src={image}
          alt={name}
          fill
          className={cn(
            "object-cover transition-all duration-700",
            flipped ? "scale-110" : "scale-100"
          )}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0B214D]/85 via-[#0B214D]/20 to-transparent"></div>

        <div className="absolute bottom-5 left-6">
          <span className="rounded-full bg-white/90 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary backdrop-blur-md">
            {planType}
          </span>
        </div>

      </div>

      {/* Contenido */}
      <div className="relative flex flex-1 flex-col p-7">

        {featured && (
          <div className="absolute right-7 top-0 -translate-y-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white shadow-lg">
            Destacado
          </div>
        )}

        <div>
          <h3 className="font-display text-2xl font-bold text-text">
            {name}
          </h3>

          <p className="mt-3 text-sm leading-7 text-textLight">
            {tagline}
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 border border-blue-100">
            <Sparkles className="h-5 w-5 text-primary" />

            <span className="text-xs font-medium text-textLight">
              Cobertura nacional · Atención inmediata · Beneficios exclusivos
            </span>
          </div>
        </div>

        {/* Precio */}
        <div className="mt-auto">

          <div className="my-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-textLight">
                Valor
              </p>

              <p className="mt-1 text-3xl font-extrabold text-primary">
                {price}
              </p>
            </div>

          </div>

          <p className="mt-4 hidden text-xs text-textLight md:block">
            Pasa el cursor para conocer todos los beneficios del plan.
          </p>

          <Button
            type="button"
            variant="secondary"
            className="mt-5 w-full md:hidden"
            onClick={onFlip}
          >
            Ver beneficios
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </div>

      </div>

    </div>
  );
}
function BackSide({
  id,
  name,
  description,
  includes,
  benefits,
  geographicCoverage,
  conditions,
  featured,
  onQuote,
  onFlip,
}: PlanFlipCardProps & {
  onFlip: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col overflow-hidden rounded-[32px] bg-white border border-blue-200/60",
        featured && "ring-2 ring-primary/70"
      )}
      style={{
        transform: "rotateY(180deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        boxShadow:
          "0 15px 45px rgba(37,99,235,.12),0 30px 70px rgba(37,99,235,.08)",
      }}
    >
      {/* Halo Azul */}
      <div className="absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[90px]" />

      {/* HEADER */}
      <div className="relative z-10 flex items-center justify-between border-b border-primary/10 px-7 py-6 bg-white/90 backdrop-blur-md">

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
            Información del plan
          </p>

          <h3 className="mt-2 font-display text-2xl font-bold text-text">
            {name}
          </h3>
        </div>

        <button
          type="button"
          onClick={onFlip}
          className="
            flex
            items-center
            gap-2
            rounded-full
            border
            border-primary/20
            px-4
            py-2
            text-sm
            font-semibold
            text-primary
            transition-all
            duration-300
            hover:bg-primary
            hover:text-white
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

      </div>

      {/* CONTENIDO */}
      <div className="relative z-10 flex-1 overflow-y-auto px-7 py-6">

        <div className="space-y-6">

          {description && (
            <p className="text-sm leading-7 text-textLight">
              {description}
            </p>
          )}

          {includes && (
            <InfoBlock
              title="Incluye"
              content={includes}
            />
          )}

          <div>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              Beneficios
            </p>

            <div className="space-y-3">

              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="
                    flex
                    items-start
                    gap-3
                    rounded-2xl
                    border
                    border-blue-100
                    bg-gradient-to-r
                    from-blue-50
                    to-white
                    p-4
                    transition-all
                    duration-300
                    hover:border-blue-300
                    hover:shadow-lg
                  "
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md">
                    <Check className="h-4 w-4" />
                  </div>

                  <span className="text-sm text-text leading-6">
                    {benefit}
                  </span>
                </div>
              ))}

            </div>

          </div>

          {geographicCoverage && (
            <InfoBlock
              title="Cobertura"
              content={geographicCoverage}
            />
          )}

          {conditions && (
            <InfoBlock
              title="Condiciones"
              content={conditions}
            />
          )}

        </div>

      </div>

      {/* FOOTER */}
      <div className="relative z-10 border-t border-primary/10 bg-white/95 backdrop-blur-md p-6">

        <Button
          variant="primary"
          className="
            w-full
            shadow-[0_10px_35px_rgba(37,99,235,.35)]
            hover:shadow-[0_20px_45px_rgba(37,99,235,.45)]
            transition-all
            duration-300
          "
          onClick={() => onQuote(id)}
        >
          Cotizar este plan

          <ArrowRight className="ml-2 h-5 w-5" />

        </Button>

      </div>

    </div>
  );
}

function InfoBlock({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-2xl
        border
        border-blue-200/60
        bg-gradient-to-br
        from-white
        via-blue-50/60
        to-blue-100/40
        p-5
        transition-all
        duration-300
        hover:border-blue-400/70
        hover:-translate-y-1
        hover:shadow-[0_12px_35px_rgba(37,99,235,.15)]
      "
    >
      {/* Halo */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-400/10 blur-3xl" />

      {/* Línea superior */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-primary via-blue-400 to-primary" />

      <div className="relative">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-primary">
          {title}
        </p>

        <p className="text-sm leading-7 text-textLight">
          {content}
        </p>
      </div>
    </div>
  );
}
