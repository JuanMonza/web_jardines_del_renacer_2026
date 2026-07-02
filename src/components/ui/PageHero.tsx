import Image from 'next/image';
import React from 'react';
import Container from '@/components/ui/Container';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHero({
  title,
  subtitle,
  image,
  imageAlt,
  children,
  className,
}: PageHeroProps) {
  return (
    <section className={cn('relative min-h-[500px] overflow-hidden bg-primary pt-24 pb-10 text-white sm:pt-28 md:min-h-[520px] md:pb-0', className)}>
      <Image
        src={image}
        alt=""
        fill
        aria-hidden="true"
        className="scale-110 object-cover blur-2xl md:hidden"
        sizes="100vw"
      />
      <Image
        src={image}
        alt={imageAlt}
        fill
        className="object-contain object-center md:object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-primary/25 to-black/65" />
      <Container className="relative z-10 flex min-h-[380px] items-center md:min-h-[420px]">
        <div className="max-w-4xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-white/85">
            Jardines del Renacer
          </p>
          <h1 className="text-4xl font-display font-extrabold leading-tight text-balance drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-semibold leading-relaxed text-white/95 drop-shadow-[0_3px_6px_rgba(0,0,0,0.75)] md:text-2xl">
            {subtitle}
          </p>
          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
