'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import { historyTimeline } from '@/content/company';

type TimelineItem = (typeof historyTimeline)[number];

function relativePosition(index: number, activeIndex: number, total: number) {
  let position = index - activeIndex;
  if (position > total / 2) position -= total;
  if (position < -total / 2) position += total;
  return position;
}

function timelineImage(item: TimelineItem) {
  return item.id === 5 ? '/images/images-baners/equipo.webp' : item.image;
}

export default function ResenaHistoricaPage() {
  const timeline = historyTimeline.filter((item) => item.active).sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const reduceMotion = useReducedMotion();
  const activeItem = timeline[activeIndex];

  const goTo = (nextIndex: number) => {
    setActiveIndex((nextIndex + timeline.length) % timeline.length);
    setIsFlipped(false);
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-[#132b4b] py-14 sm:py-20 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(115,151,205,0.35),transparent_38%),linear-gradient(180deg,#173457_0%,#102540_100%)]" />
        <Container maxWidth="2xl" className="relative">
          <div className="mx-auto mb-9 max-w-2xl text-center text-white sm:mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">Nuestro recorrido</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-5xl">Una historia para descubrir.</h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">Explora cada momento y acompáñanos en el recorrido que ha dado forma a Jardines del Renacer.</p>
          </div>

          <div className="relative mx-auto h-[470px] max-w-[1200px] sm:h-[530px] lg:h-[580px]" aria-roledescription="carrusel" aria-label="Hitos de la historia de Jardines del Renacer">
            {timeline.map((item, index) => {
              const position = relativePosition(index, activeIndex, timeline.length);
              const visible = Math.abs(position) <= 2;
              const isActive = position === 0;
              const translateX = position * 175;
              const scale = isActive ? 1 : Math.abs(position) === 1 ? 0.82 : 0.68;
              const opacity = isActive ? 1 : Math.abs(position) === 1 ? 0.72 : 0.34;

              return (
                <div
                  key={item.id}
                  className={`absolute left-1/2 top-0 h-[410px] w-[78vw] max-w-[430px] -translate-x-1/2 sm:h-[470px] sm:w-[380px] ${visible ? 'pointer-events-auto' : 'pointer-events-none'}`}
                  style={{ zIndex: 20 - Math.abs(position) }}
                >
                  <motion.button
                    type="button"
                    aria-label={`Ver hito ${item.year}: ${item.title}`}
                    aria-current={isActive ? 'true' : undefined}
                    aria-pressed={isActive && isFlipped}
                    onClick={() => {
                      if (isActive) {
                        setIsFlipped((flipped) => !flipped);
                      } else {
                        setActiveIndex(index);
                        setIsFlipped(false);
                      }
                    }}
                    initial={false}
                    animate={{ x: translateX, scale, opacity, rotateY: reduceMotion ? 0 : position * -7 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                    className={`relative h-full w-full rounded-[2rem] border text-left shadow-2xl transition-colors ${isActive ? 'border-white/60' : 'border-white/20'}`}
                    style={{ transformPerspective: 1200 }}
                  >
                    <motion.span
                      animate={{ rotateY: isActive && isFlipped ? 180 : 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 block"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <span className="absolute inset-0 block overflow-hidden rounded-[2rem]" style={{ backfaceVisibility: 'hidden' }}>
                        <Image src={timelineImage(item)} alt={item.title} fill className="object-cover" sizes="(min-width: 640px) 380px, 78vw" priority={isActive} />
                        <span className="absolute inset-0 bg-gradient-to-t from-[#071628]/60 via-transparent to-black/5" />
                        <span className="absolute bottom-8 left-0 right-0 px-7 text-center text-white drop-shadow-lg">
                          <span className="block text-xl font-bold leading-tight sm:text-2xl">{item.title}</span>
                          {isActive && <span className="mt-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/80">Toca para conocer este capítulo</span>}
                        </span>
                      </span>
                      <span className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1c416b] via-[#102b4d] to-[#081c33] p-7 text-white sm:p-9" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                        <span className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                        <span className="relative block text-xs font-semibold uppercase tracking-[0.28em] text-white/60">{item.year}</span>
                        <span className="relative mt-5 block text-2xl font-bold leading-tight sm:text-3xl">{item.title}</span>
                        <span tabIndex={isActive && isFlipped ? 0 : -1} className="relative mt-5 min-h-0 flex-1 overflow-y-auto pr-3 text-sm leading-7 text-white/90 [scrollbar-color:rgba(255,255,255,0.55)_transparent] [scrollbar-width:thin] sm:text-base">
                          {item.description}
                        </span>
                        <span className="relative mt-4 block border-t border-white/15 pt-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/65">Desliza el texto para leer · toca para volver</span>
                      </span>
                    </motion.span>
                    <span className="absolute -bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/40 bg-[#0b2340] px-5 py-2 text-sm font-bold tracking-[0.14em] text-white shadow-xl">{item.year}</span>
                  </motion.button>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-1 flex max-w-[430px] items-center justify-between gap-3 rounded-full border border-white/20 bg-white/10 p-2 pl-4 text-white backdrop-blur-xl sm:mt-4">
            <button type="button" onClick={() => goTo(activeIndex - 1)} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl transition-colors hover:bg-white/25" aria-label="Hito anterior">‹</button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-sm font-semibold">{activeItem?.year} · {activeItem?.title}</p>
              <div className="mt-2 flex justify-center gap-1.5">
                {timeline.map((item, index) => <button key={item.id} type="button" onClick={() => goTo(index)} aria-label={`Ir al hito ${item.year}`} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`} />)}
              </div>
            </div>
            <button type="button" onClick={() => goTo(activeIndex + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl transition-colors hover:bg-white/25" aria-label="Siguiente hito">›</button>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-20">
        <Container maxWidth="xl">
          <div className="rounded-[2rem] bg-primary px-7 py-10 text-center text-white sm:px-12 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">El próximo capítulo</p>
            <h2 className="mt-4 font-display text-3xl sm:text-5xl">La historia continúa.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">Seguimos evolucionando para acompañar con dignidad, sensibilidad y confianza a las familias colombianas.</p>
            <Link href="/planes" className="mt-8 inline-block"><Button variant="secondary" size="lg">Conoce nuestros planes</Button></Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
