'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [serviciosOpen, setServiciosOpen] = useState(false);

  const serviciosSubmenu = [
    { href: '/servicios/quienes-somos', label: 'Quiénes Somos' },
    { href: '/servicios/resena-historica', label: 'Reseña Histórica' },
    { href: '/servicios/trabaja-con-nosotros', label: 'Trabaja con Nosotros' },
  ];

  return (
    <nav className="glass fixed w-full z-50 top-0 left-0 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          {/* Desktop Navigation - Izquierda */}
          <div className="hidden lg:flex items-center space-x-6">
            {/* Servicios Dropdown */}
            <div className="relative group">
              <button
                onMouseEnter={() => setServiciosOpen(true)}
                onMouseLeave={() => setServiciosOpen(false)}
                className="text-text hover:text-primary transition-colors duration-300 flex items-center gap-1"
              >
                Servicios
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div
                onMouseEnter={() => setServiciosOpen(true)}
                onMouseLeave={() => setServiciosOpen(false)}
                className={cn(
                  'absolute top-full left-0 mt-2 w-56 glass rounded-xl overflow-hidden shadow-glass-lg transition-all duration-300',
                  serviciosOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                )}
              >
                {serviciosSubmenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-3 text-text hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/obituarios" className="text-text hover:text-primary transition-colors duration-300">
              Obituarios
            </Link>
            
            <Link href="/ubicaciones" className="text-text hover:text-primary transition-colors duration-300">
              Ubicaciones
            </Link>
            
            <Link href="/cotizar" className="text-text hover:text-primary transition-colors duration-300">
              Cotizar Plan
            </Link>
            
            <Link href="/contacto" className="text-text hover:text-primary transition-colors duration-300">
              Contacto
            </Link>
          </div>

          {/* Logo CENTRADO - Todas las pantallas */}
          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-14 h-14 lg:w-16 lg:h-16 relative">
              <Image
                src="/logo.png"
                alt="Jardines del Renacer"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* CTA Buttons - Derecha */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/recorrido-360">
              <Button variant="primary" size="sm" className="animate-pulse hover:animate-none">
                Conoce Nuestras Salas
              </Button>
            </Link>
            <Link href="/pagar-plan">
              <Button variant="secondary" size="sm">
                Pagar Plan
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Ingresar
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-text hover:bg-primary/10 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden overflow-hidden transition-all duration-300',
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-3">
            {/* Servicios Mobile */}
            <div className="space-y-2">
              <p className="font-semibold text-text px-2">Servicios</p>
              {serviciosSubmenu.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block pl-6 pr-2 py-2 text-text hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <Link
              href="/obituarios"
              className="block px-2 py-2 text-text hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Obituarios
            </Link>
            
            <Link
              href="/ubicaciones"
              className="block px-2 py-2 text-text hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Ubicaciones
            </Link>
            
            <Link
              href="/cotizar"
              className="block px-2 py-2 text-text hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Cotizar Plan
            </Link>
            
            <Link
              href="/contacto"
              className="block px-2 py-2 text-text hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Contacto
            </Link>

            <div className="pt-4 space-y-2 border-t border-border">
              <Link href="/recorrido-360" className="block">
                <Button variant="primary" size="sm" className="w-full">
                  Conoce Nuestras Salas
                </Button>
              </Link>
              <Link href="/pagar-plan" className="block">
                <Button variant="secondary" size="sm" className="w-full">
                  Pagar Plan
                </Button>
              </Link>
              <Link href="/login" className="block">
                <Button variant="outline" size="sm" className="w-full">
                  Ingresar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
