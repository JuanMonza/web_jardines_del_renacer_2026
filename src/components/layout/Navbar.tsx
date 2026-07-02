'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { ALLY_CATEGORIES } from '@/config/allies';
import PaymentDropdown from '@/components/ui/PaymentDropdown';

const PARQUE_CONMEMORATIVO_URL = 'https://conmemorativo-jr-2025.vercel.app/';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conocenosOpen, setConocenosOpen] = useState(false);
  const [aliadosOpen, setAliadosOpen] = useState(false);
  const [contactoOpen, setContactoOpen] = useState(false);
  const [mobileConocenosOpen, setMobileConocenosOpen] = useState(false);
  const [mobileAliadosOpen, setMobileAliadosOpen] = useState(false);
  const [mobileContactoOpen, setMobileContactoOpen] = useState(false);

  const conocenosSubmenu = [
    { href: '/servicios/quienes-somos', label: 'Quiénes Somos' },
    { href: '/servicios/resena-historica', label: 'Reseña Histórica' },
    { href: '/servicios/condolencias-digitales', label: 'Condolencias Digitales' },
    { href: PARQUE_CONMEMORATIVO_URL, label: 'Parque Conmemorativo', external: true },
    { href: '/repatriaciones', label: 'Repatriaciones' },
    { href: '/acompanamiento-en-duelo', label: 'Acompañamiento en Duelo' },
    { href: '/sorteos', label: 'Sorteos' },
  ];

  const aliadosSubmenu = ALLY_CATEGORIES.map((category) => ({
    href: `/aliados-comerciales?categoria=${category.slug}`,
    label: category.label,
  }));

  const contactoSubmenu = [
    { href: '/contacto', label: 'Formulario de Contacto' },
    { href: '/servicios/trabaja-con-nosotros', label: 'Emplearte' },
  ];

  const isActive = (href: string) => href.startsWith('/') && pathname === href;
  const dropdownItemClass = (href: string, featured = false) =>
    cn(
      'relative block px-4 py-3 transition-colors after:absolute after:bottom-1 after:left-4 after:right-4 after:h-[3px] after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-300 hover:after:scale-x-100',
      featured
        ? 'text-primary font-semibold border-b border-primary/10 hover:bg-primary/10'
        : 'text-text hover:bg-primary/10 hover:text-primary',
      isActive(href) && 'bg-primary/10 text-primary after:scale-x-100'
    );

  return (
    <nav className="fixed w-full z-50 top-0 left-0">
      <div className="relative">
        {/* Barra continua con recorte circular para el logo */}
        <div className="bg-[#3C60A2]/95 backdrop-blur-md shadow-lg h-16 relative">
          {/* Recorte circular en el centro */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 lg:w-40 lg:h-40 rounded-full bg-transparent border-8 border-background z-20"></div>
          
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
            <div className="relative flex items-center justify-between h-full">
              {/* Desktop Navigation - Izquierda */}
              <div className="hidden lg:flex items-center space-x-8 flex-1 justify-end pr-32">
                {/* Conócenos Dropdown */}
                <div
                  className="relative group"
                  onMouseEnter={() => setConocenosOpen(true)}
                  onMouseLeave={() => setConocenosOpen(false)}
                >
                  <button
                    className="text-white hover:text-white/80 transition-colors duration-300 flex items-center gap-1 text-sm uppercase tracking-wide font-medium"
                  >
                    Conócenos
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div
                    className={cn(
                      'absolute top-full left-0 mt-2 w-64 bg-white rounded-xl overflow-hidden shadow-xl transition-all duration-300',
                      conocenosOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    )}
                  >
                    {conocenosSubmenu.map((item) => (
                      item.external ? (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={dropdownItemClass(item.href)}
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={dropdownItemClass(item.href)}
                        >
                          {item.label}
                        </Link>
                      )
                    ))}
                  </div>
                </div>

                <Link href="/recorrido-360" className="text-white hover:text-white/80 transition-colors duration-300 text-sm uppercase tracking-wide font-medium">
                  Recorrido 360
                </Link>
                
                <Link href="/ubicaciones" className="text-white hover:text-white/80 transition-colors duration-300 text-sm uppercase tracking-wide font-medium">
                  Nuestras Sedes
                </Link>

                <Link href="/obituarios" className="text-white hover:text-white/80 transition-colors duration-300 text-sm uppercase tracking-wide font-medium">
                  Obituarios
                </Link>
              </div>

              {/* Logo CIRCULAR - MÁS GRANDE y CENTRADO */}
              <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                <div className="w-32 h-32 lg:w-36 lg:h-36 relative bg-[#3C60A2] rounded-full shadow-2xl border-4 border-white flex items-center justify-center hover:scale-105 transition-transform duration-300">
                  <Image
                    src="/logo-oficial.webp"
                    alt="Jardines del Renacer"
                    width={75}
                    height={75}
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Navigation - Derecha */}
              <div className="hidden lg:flex items-center space-x-6 flex-1 pl-32">
                <Link href="/cotizar" className="text-white hover:text-white/80 transition-colors duration-300 text-sm uppercase tracking-wide font-medium">
                  Afíliate Ya
                </Link>
                
                {/* Aliados Dropdown */}
                <div
                  className="relative group"
                  onMouseEnter={() => setAliadosOpen(true)}
                  onMouseLeave={() => setAliadosOpen(false)}
                >
                  <button
                    className="text-white hover:text-white/80 transition-colors duration-300 flex items-center gap-1 text-sm uppercase tracking-wide font-medium"
                  >
                    Club de Aliados
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={cn(
                      'absolute top-full left-0 mt-2 w-64 max-h-[420px] overflow-y-auto bg-white rounded-xl shadow-xl transition-all duration-300',
                      aliadosOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    )}
                  >
                    <Link
                      href="/aliados-comerciales"
                      className={dropdownItemClass('/aliados-comerciales', true)}
                    >
                      Ver todo el club
                    </Link>
                    {aliadosSubmenu.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(dropdownItemClass(item.href), 'py-2.5')}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Contacto Dropdown */}
                <div
                  className="relative group"
                  onMouseEnter={() => setContactoOpen(true)}
                  onMouseLeave={() => setContactoOpen(false)}
                >
                  <button
                    className="text-white hover:text-white/80 transition-colors duration-300 flex items-center gap-1 text-sm uppercase tracking-wide font-medium"
                  >
                    Contacto
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={cn(
                      'absolute top-full right-0 mt-2 w-64 bg-white rounded-xl overflow-hidden shadow-xl transition-all duration-300',
                      contactoOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
                    )}
                  >
                    {contactoSubmenu.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={dropdownItemClass(item.href)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* Botones CTA */}
                <PaymentDropdown 
                  wompiUrl="https://checkout.wompi.co/method" 
                  pseUrl="https://checkout.wompi.co/l/TU_LINK_DE_PSE_AQUI"
                  buttonVariant="secondary"
                  buttonSize="sm"
                />
                {/* <Link href="/proximamente">
                  <Button variant="outline" size="sm">
                    Ingresar
                  </Button>
                </Link> */}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors ml-auto"
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
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'lg:hidden overflow-y-auto transition-all duration-300 bg-[#3C60A2]',
            isOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="py-4 space-y-3 pb-20">
              {/* Conócenos Mobile */}
              <div className="space-y-1">
                <button
                  onClick={() => setMobileConocenosOpen(!mobileConocenosOpen)}
                  className="flex items-center justify-between w-full px-2 py-2 text-white font-semibold hover:bg-white/10 rounded-lg transition-colors"
                >
                  Conócenos
                  <svg
                    className={cn("w-4 h-4 transition-transform duration-300", mobileConocenosOpen ? "rotate-180" : "")}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={cn("overflow-hidden transition-all duration-300 space-y-1", mobileConocenosOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                  {conocenosSubmenu.map((item) => (
                    item.external ? (
                      <a
                        key={item.href}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border-l-2 border-transparent pl-6 pr-2 py-2 text-white/80 hover:border-white hover:text-white transition-colors text-sm"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'block border-l-2 pl-6 pr-2 py-2 text-white/80 hover:border-white hover:text-white transition-colors text-sm',
                          isActive(item.href) ? 'border-white text-white' : 'border-transparent'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>
              </div>

            <Link
              href="/recorrido-360"
              className="block px-2 py-2 text-white/90 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Recorrido 360
            </Link>

            <Link
              href="/ubicaciones"
              className="block px-2 py-2 text-white/90 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Nuestras Sedes
            </Link>

            <Link
              href="/obituarios"
              className="block px-2 py-2 text-white/90 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Obituarios
            </Link>
            
            <Link
              href="/cotizar"
              className="block px-2 py-2 text-white/90 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Afíliate Ya
            </Link>

            <div className="space-y-1">
              <button
                onClick={() => setMobileAliadosOpen(!mobileAliadosOpen)}
                className="flex items-center justify-between w-full px-2 py-2 text-white font-semibold hover:bg-white/10 rounded-lg transition-colors"
              >
                Club de Aliados
                <svg
                  className={cn("w-4 h-4 transition-transform duration-300", mobileAliadosOpen ? "rotate-180" : "")}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={cn("overflow-hidden transition-all duration-300 space-y-1", mobileAliadosOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
                <Link
                  href="/aliados-comerciales"
                  className="block pl-6 pr-2 py-2 text-white hover:text-white transition-colors text-sm font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Ver todos
                </Link>
                {aliadosSubmenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block pl-6 pr-2 py-2 text-white/80 hover:text-white transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Contacto Mobile */}
            <div className="space-y-1">
              <button
                onClick={() => setMobileContactoOpen(!mobileContactoOpen)}
                className="flex items-center justify-between w-full px-2 py-2 text-white font-semibold hover:bg-white/10 rounded-lg transition-colors"
              >
                Contacto
                <svg
                  className={cn("w-4 h-4 transition-transform duration-300", mobileContactoOpen ? "rotate-180" : "")}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={cn("overflow-hidden transition-all duration-300 space-y-1", mobileContactoOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                {contactoSubmenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block pl-6 pr-2 py-2 text-white/80 hover:text-white transition-colors text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="pt-5 px-2 flex flex-col items-start gap-3 border-t border-white/10">
              <Link href="/proximamente">
                <Button variant="primary" size="sm">
                  Conoce Nuestras Salas
                </Button>
              </Link>
              <PaymentDropdown 
                wompiUrl="https://checkout.wompi.co/method" 
                pseUrl="https://checkout.wompi.co/l/TU_LINK_DE_PSE_AQUI"
                buttonVariant="secondary"
                buttonSize="sm"
              />
              {/* <Link href="/proximamente">
                <Button variant="outline" size="sm">
                  Ingresar
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
