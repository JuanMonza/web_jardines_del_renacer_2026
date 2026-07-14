import React from 'react';
import { cn } from '@/lib/utils';

interface TitleBandProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function TitleBand({ title, subtitle, className }: TitleBandProps) {
  return (
    <div className={cn('relative w-full mb-12 overflow-hidden', className)}>
      {/* Fondo sólido azul de lado a lado */}
      <div className="absolute inset-0 bg-primary" />
      {/* Shimmer cristal sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-white/5 blur-2xl" />
      <div className="relative z-10 px-4 py-10 md:py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white drop-shadow-lg">
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold text-white/90">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
