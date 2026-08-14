'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Button from './Button';

interface PaymentDropdownProps {
  wompiUrl: string;
  className?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Menú de pago centralizado que redirige al checkout seguro de Wompi.
 * 
 * @param props.wompiUrl - URL generada para el checkout de Wompi.
 * @param props.className - Clases CSS adicionales para el contenedor principal.
 * @param props.buttonVariant - Estilo visual del botón que abre el menú.
 * @param props.buttonSize - Tamaño del botón que abre el menú.
 */
export default function PaymentDropdown({ wompiUrl, className, buttonVariant = 'primary', buttonSize = 'lg' }: PaymentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <Button
        type="button"
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        Pagar Plan
        <svg
          className={cn('h-5 w-5 transition-transform duration-300', isOpen ? 'rotate-180' : '')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-64 origin-top-left overflow-hidden rounded-2xl border border-primary/20 bg-white/95 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 sm:left-auto sm:right-0 sm:origin-top-right">
          <a
            href={wompiUrl}
            className="flex items-center gap-4 px-5 py-4 font-medium text-text transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
              <Image src="/images/Wompi_logo.jpg" alt="Wompi" fill className="object-contain p-0.5" />
            </span>
            Pagar con Wompi
          </a>
        </div>
      )}
    </div>
  );
}
