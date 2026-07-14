'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Preloader() {
  const [flipped, setFlipped] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFlipped(true), 1300);
    const t2 = setTimeout(() => setHidden(true), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f6f4f2] transition-opacity duration-500">
      {/* Tarjeta con flip 3D: bandera Colombia → logo */}
      <div style={{ perspective: 700 }}>
        <div
          className="relative w-36 h-36 transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Cara frontal — Bandera de Colombia */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden border-[5px] border-white shadow-2xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <svg viewBox="0 0 3 2" className="w-full h-full" aria-hidden="true">
              <rect width="3" height="1"   fill="#FCD116" />
              <rect y="1" width="3" height="0.5" fill="#003893" />
              <rect y="1.5" width="3" height="0.5" fill="#CE1126" />
            </svg>
          </div>

          {/* Cara posterior — Logo JDR */}
          <div
            className="absolute inset-0 rounded-full bg-primary flex items-center justify-center border-[5px] border-white shadow-2xl"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <Image
              src="/logo-oficial.webp"
              alt="Jardines del Renacer"
              width={88}
              height={88}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold tracking-[0.25em] uppercase text-primary/60 animate-pulse">
        Jardines del Renacer
      </p>
    </div>
  );
}
