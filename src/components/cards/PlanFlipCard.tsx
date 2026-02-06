'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PlanFlipCardProps {
  id: string;
  name: string;
  tagline: string;
  price: string;
  image: string;
  benefits: readonly string[];
  featured?: boolean;
  onQuote?: (planId: string) => void;
}

export default function PlanFlipCard({ 
  id, 
  name, 
  tagline, 
  price, 
  image, 
  benefits,
  featured = false,
  onQuote 
}: PlanFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleQuote = () => {
    if (onQuote) {
      onQuote(id);
    }
  };

  return (
    <div 
      className="relative w-full h-[500px] perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Side */}
        <div 
          className={cn(
            'absolute inset-0 backface-hidden',
            'glass rounded-2xl overflow-hidden',
            'flex flex-col',
            featured && 'ring-2 ring-primary'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {featured && (
            <div className="absolute top-4 right-4 z-10">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Destacado
              </span>
            </div>
          )}
          
          <div className="relative h-64 w-full">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-display text-text mb-2">{name}</h3>
              <p className="text-textLight mb-4">{tagline}</p>
            </div>
            
            <div>
              <p className="text-3xl font-semibold text-primary mb-4">{price}</p>
              <p className="text-sm text-textLight">
                Pasa el cursor para ver beneficios
              </p>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className={cn(
            'absolute inset-0 backface-hidden',
            'glass rounded-2xl overflow-hidden',
            'p-6 flex flex-col',
            featured && 'ring-2 ring-primary'
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <h4 className="text-xl font-display text-text mb-4">
            Beneficios de {name}
          </h4>
          
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <svg 
                    className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                  <span className="text-sm text-text">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 space-y-3">
            <p className="text-xl font-semibold text-primary text-center">
              {price}
            </p>
            <Button 
              variant="primary" 
              className="w-full"
              onClick={handleQuote}
            >
              Cotizar Ahora
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
