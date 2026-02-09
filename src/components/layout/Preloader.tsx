'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga mínima de 2 segundos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      {/* Logo principal */}
      <div className="animate-in fade-in zoom-in duration-700">
        <Image
          src="/logos_jr_favico.png"
          alt="Jardines del Renacer"
          width={200}
          height={200}
          className="drop-shadow-2xl animate-pulse"
          priority
        />
      </div>
    </div>
  );
}
