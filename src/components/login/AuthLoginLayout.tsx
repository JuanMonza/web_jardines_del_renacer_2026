'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';

interface AuthLoginLayoutProps {
  title: string;
  subtitle: string;
  sectionLabel?: string;
  children: ReactNode;
}

export default function AuthLoginLayout({
  title,
  subtitle,
  sectionLabel = 'Login',
  children,
}: AuthLoginLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-[#07182e] py-8">
      <Image
        src="/fondos_login.jpg"
        alt="Fondo login"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,19,39,0.88),rgba(21,57,101,0.58),rgba(5,19,39,0.82))]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#07182e]/65 to-transparent" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#a4c6ec]/15 blur-3xl" />

      <Container maxWidth="2xl" className="relative z-10 w-full py-8 md:py-12">
        <FadeIn>
          <div className="mx-auto w-full max-w-[500px]">
            <section className="relative rounded-[2rem] border border-white/25 bg-[#102b50]/72 p-7 text-white shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl md:p-10">
              <Link
                href="/"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-xl leading-none text-white transition-colors hover:bg-white/20"
                aria-label="Cerrar login"
              >
                ×
              </Link>

              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/25 bg-white/10 p-2">
                  <Image src="/logos_jr_favico.png" alt="Jardines del Renacer" width={30} height={30} className="object-contain brightness-0 invert" />
                </div>
                <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c5dbf3]">Jardines del Renacer</p><p className="text-xs text-white/60">Acceso seguro</p></div>
              </div>
              <p className="mb-2 text-xs uppercase tracking-[0.25em] text-[#bdd5ee]">
                {sectionLabel}
              </p>
              <h1 className="mb-3 text-4xl font-semibold text-white md:text-5xl font-display">
                {title}
              </h1>
              <p className="max-w-xl text-base text-white/75 md:text-lg">{subtitle}</p>

              <div className="mt-7 md:mt-8">{children}</div>
            </section>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
