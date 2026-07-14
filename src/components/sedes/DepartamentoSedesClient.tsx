'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useSedesData } from '@/hooks/useSedesData';
import { getDepartamentoSlug, type Sede } from '@/data/sedes';
import SedeCard from '@/components/cards/SedeCard';

interface Props {
  departamentoSlug: string;
  fallbackSedes: Sede[];
}

export default function DepartamentoSedesClient({ departamentoSlug, fallbackSedes }: Props) {
  const { sedes: liveSedes } = useSedesData();

  const sedes = useMemo(() => {
    const source = liveSedes.length > 0 ? liveSedes : fallbackSedes;
    return source.filter((s) => getDepartamentoSlug(s.departamento) === departamentoSlug);
  }, [liveSedes, fallbackSedes, departamentoSlug]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sedes.map((sede) => (
          <SedeCard key={sede.id} sede={sede} />
        ))}
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/sedes"
          className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all duration-200"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Ver todos los departamentos
        </Link>
      </div>
    </>
  );
}
