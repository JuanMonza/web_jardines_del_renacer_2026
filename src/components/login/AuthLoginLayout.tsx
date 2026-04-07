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
    <div className="relative min-h-screen overflow-hidden">
      <Image
        src="/fondos_login.jpg"
        alt="Fondo login"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-white/55 backdrop-blur-[1px]" />

      <div className="pointer-events-none absolute -top-10 left-6 h-24 w-24 rotate-12 rounded-[28px] bg-[#1f4ad1] shadow-2xl" />
      <div className="pointer-events-none absolute top-8 left-28 h-40 w-40 -rotate-[18deg] rounded-[44px] bg-[#2e56cc] shadow-2xl" />
      <div className="pointer-events-none absolute top-10 right-10 h-28 w-28 rotate-12 rounded-[30px] bg-[#0f2f8c] shadow-2xl" />
      <div className="pointer-events-none absolute bottom-12 left-16 h-32 w-32 -rotate-12 rounded-[36px] bg-[#2a51c4] shadow-2xl" />
      <div className="pointer-events-none absolute bottom-8 right-20 h-24 w-24 rotate-45 rounded-[24px] border-8 border-[#173fa3]/70" />

      <Container maxWidth="2xl" className="relative z-10 py-16 md:py-20">
        <FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,560px)_1fr] gap-8 lg:gap-10 items-center">
            <section className="w-full max-w-[560px] mx-auto lg:mx-0 rounded-[2.2rem] bg-[#f5efe3]/95 border border-black/10 shadow-[0_28px_70px_rgba(0,0,0,0.35)] p-7 md:p-10 relative">
              <Link
                href="/"
                className="absolute top-3 right-3 h-10 w-10 rounded-full bg-black/75 text-white text-2xl leading-none flex items-center justify-center hover:bg-black transition-colors"
                aria-label="Cerrar login"
              >
                ×
              </Link>

              <p className="text-xs uppercase tracking-[0.25em] text-black/55 mb-2">
                {sectionLabel}
              </p>
              <h1 className="text-4xl md:text-5xl font-semibold text-black mb-3 font-display">
                {title}
              </h1>
              <p className="text-black/70 text-base md:text-lg max-w-xl">{subtitle}</p>

              <div className="mt-7 md:mt-8">{children}</div>
            </section>

            <aside className="hidden lg:block">
              <div className="relative max-w-[420px] ml-auto">
                <div className="absolute -top-8 -right-4 h-20 w-20 rounded-[24px] bg-black shadow-xl rotate-12" />
                <div className="absolute -bottom-8 left-6 h-24 w-24 rounded-[26px] bg-[#1f4ad1] shadow-xl -rotate-12" />

                <div className="rounded-[2.8rem] bg-gradient-to-br from-[#2f5bd6] to-[#173f9f] p-8 shadow-[0_22px_60px_rgba(16,41,112,0.45)] rotate-[8deg]">
                  <div className="rounded-[2rem] bg-white/95 p-8 text-center -rotate-[8deg]">
                    <div className="mx-auto mb-5 h-32 w-32 rounded-full bg-[#2f5bd6] flex items-center justify-center border-4 border-[#1e47af] shadow-lg">
                      <Image
                        src="/logos_jr_favico.png"
                        alt="Logo Jardines del Renacer"
                        width={82}
                        height={82}
                        className="object-contain brightness-0 invert"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[#2f5bd6] mb-2">
                      Acceso Seguro
                    </p>
                    <h2 className="text-2xl font-display text-[#1d2a46] mb-2">
                      Jardines del Renacer
                    </h2>
                    <p className="text-sm text-[#34435f]">
                      Plataforma de ingreso para clientes y equipos administrativos.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
