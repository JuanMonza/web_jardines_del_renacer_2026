import React from 'react';
import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export default function SectionTitle({ 
  title, 
  subtitle, 
  align = 'center',
  className 
}: SectionTitleProps) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('mb-12', alignClasses[align], className)}>
      <h2 className="text-4xl md:text-5xl font-display font-extrabold text-text mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg font-medium text-textLight max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
