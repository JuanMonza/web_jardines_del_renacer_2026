import React from 'react';
import { cn } from '@/lib/utils';

interface TitleBandProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function TitleBand({ title, subtitle, className }: TitleBandProps) {
  return (
    <div className={cn('relative w-full mb-12 py-10 md:py-12 overflow-hidden', className)}>
      <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-primary/85 to-transparent" />
      <div className="absolute inset-y-0 left-1/2 w-[72%] -translate-x-1/2 bg-primary/35 blur-2xl" />
      <div className="relative z-10 px-4 text-center">
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
