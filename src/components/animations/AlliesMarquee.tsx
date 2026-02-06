'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { allies } from '@/config/allies';

export default function AlliesMarquee() {
  // Duplicamos los aliados para crear efecto infinito
  const duplicatedAllies = [...allies, ...allies];

  return (
    <div className="relative overflow-hidden py-12">
      {/* Gradientes de fade */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

      {/* Contenedor del marquee */}
      <motion.div
        className="flex gap-12"
        animate={{
          x: [0, -50 + '%'],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        }}
      >
        {duplicatedAllies.map((ally, index) => (
          <div
            key={`${ally.id}-${index}`}
            className="flex-shrink-0 w-48 h-24 relative"
          >
            <a
              href={ally.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full glass rounded-xl p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className="relative w-full h-full">
                <Image
                  src={ally.logo}
                  alt={ally.name}
                  fill
                  className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            </a>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
