'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Button from './Button';

interface PaymentDropdownProps {
  wompiUrl: string;
  pseUrl: string;
  className?: string;
  buttonVariant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  buttonSize?: 'sm' | 'md' | 'lg';
}

export default function PaymentDropdown({ wompiUrl, pseUrl, className, buttonVariant = 'primary', buttonSize = 'lg' }: PaymentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el menú si se hace clic afuera del componente
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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full sm:w-auto"
      >
        Pagar Plan
        <svg
          className={cn('w-5 h-5 transition-transform duration-300', isOpen ? 'rotate-180' : '')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-64 rounded-2xl glass border border-primary/20 shadow-xl overflow-hidden z-50 origin-top-left sm:origin-top-right animate-in fade-in zoom-in-95 duration-200 bg-white/95 backdrop-blur-xl">
          <div className="py-2 flex flex-col">
            <a href={wompiUrl} className="px-5 py-4 text-text hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 font-medium border-b border-gray-100">
              <div className="relative w-8 h-8 flex-shrink-0 bg-white rounded-md overflow-hidden">
                <Image src="/images/logo-wompi.png" alt="Wompi" fill className="object-contain" />
              </div>
              Pagar con Wompi
            </a>
            <a href={pseUrl} className="px-5 py-4 text-text hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-3 font-medium">
              <div className="relative w-8 h-8 flex-shrink-0 bg-white rounded-md overflow-hidden">
                <Image src="/images/logo-pse.png" alt="PSE" fill className="object-contain" />
              </div>
              Pagar con PSE
            </a>
          </div>
        </div>
      )}
    </div>
  );
}