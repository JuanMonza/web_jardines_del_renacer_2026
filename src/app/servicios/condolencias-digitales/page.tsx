'use client';

import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function ProximamentePage() {
  return (
    <section className="min-h-[75vh] flex items-center justify-center pt-20 pb-20">
      <Container>
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center bg-white/80 backdrop-blur-md p-10 md:p-16 rounded-3xl border border-primary/15 shadow-xl">
            
            {/* Contenedor de la animación Lottie */}
            <div className="w-full max-w-[300px] h-[300px] mx-auto mb-2 flex items-center justify-center">
              <DotLottieReact
                src="https://lottie.host/f8603269-361a-4b4e-9f68-0af7f59b7799/mlDpvkWgCZ.lottie"
                loop
                autoplay
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display text-text mb-4">
              ¡Próximamente!
            </h1>
            
            <p className="text-lg text-textLight mb-8">
              Estamos trabajando en esta sección para ofrecerte una mejor experiencia. ¡Vuelve pronto para descubrir todas las novedades!
            </p>
            
            <Link href="/">
              <Button variant="primary" size="lg">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </FadeIn>
      </Container>
    </section>
  );
}
