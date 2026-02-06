'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Obituary } from '@/types/obituary';

interface ObituaryCardProps {
  obituary: Obituary;
  index?: number;
}

export default function ObituaryCard({ obituary, index = 0 }: ObituaryCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getLifeYears = () => {
    const birth = new Date(obituary.fechaNacimiento).getFullYear();
    const death = new Date(obituary.fechaFallecimiento).getFullYear();
    return `${birth} - ${death}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass rounded-2xl overflow-hidden hover:shadow-glass-lg transition-all duration-300"
    >
      <Link href={`/obituarios/${obituary.id}`}>
        <div className="relative h-80 w-full">
          <Image
            src={obituary.foto || obituary.fotoPrincipal || '/images/obituarios/placeholder.jpg'}
            alt={obituary.nombre}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-2xl font-display mb-2">{obituary.nombre}</h3>
            <p className="text-lg mb-2">{getLifeYears()}</p>
            
            <div className="flex items-center space-x-4 text-sm opacity-90">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{obituary.sala}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{obituary.horarios}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-textLight text-sm line-clamp-3 mb-4">
            {obituary.mensajeFamilia}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-textLight">
              {formatDate(new Date(obituary.fechaFallecimiento))}
            </span>
            
            <span className={cn(
              'px-3 py-1 rounded-full text-xs font-medium',
              obituary.estado === 'active' && 'bg-green-100 text-green-700',
              obituary.estado === 'scheduled' && 'bg-blue-100 text-blue-700',
              obituary.estado === 'finished' && 'bg-gray-100 text-gray-700'
            )}>
              {obituary.estado === 'active' && 'Activo'}
              {obituary.estado === 'scheduled' && 'Programado'}
              {obituary.estado === 'finished' && 'Finalizado'}
            </span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-primary text-sm font-medium hover:underline">
              Ver homenaje completo →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
