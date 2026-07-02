'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ColombiaMap from '@/assets/maps/colombia.svg';
import { coverageData, Department } from './coverageData';
import MapMarker from './MapMarker';

interface Props {
  selected: Department | null;
  hover: Department | null;
  selectedSedeId?: string | null;
  onHover: (department: Department | null) => void;
  onSelect: (department: Department | null) => void;
  onSelectSede?: (departmentId: string, sedeId: string) => void;
}

export default function ColombiaSVG({
  selected,
  hover,
  selectedSedeId,
  onHover,
  onSelect,
  onSelectSede,
}: Props) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const clamp = (v: number) => Math.max(2, Math.min(98, v));

  const copyCoords = useCallback(() => {
    if (!coords) return;
    const value = `{
  id: 'nuevo-id',
  name: 'Nueva sede',
  slug: 'nueva-sede',
  x: ${coords.x.toFixed(2)},
  y: ${coords.y.toFixed(2)},
  href: '/sedes/nueva-sede',
}`;
    navigator.clipboard?.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [coords]);

  // Hover + Click
  useEffect(() => {
    const svg = svgRef.current?.querySelector('svg');

    if (!svg) return;

    const departments = Array.from(
      svg.querySelectorAll('[id^="CO-"]')
    ) as SVGElement[];

    const cleanups: (() => void)[] = [];

    departments.forEach((element) => {
      const department = coverageData.find(
        (item) => item.id === element.id
      );

      if (!department) return;

      element.style.cursor = 'pointer';
      element.style.transition = 'all .3s ease';

      const enter = () => {
        onHover(department);

        if (selected?.id !== department.id) {
          element.style.fill = '#5AA9FF';

          element.style.filter =
            'drop-shadow(0 0 15px rgba(90,169,255,.45))';
        }
      };

      const leave = () => {
        onHover(null);

        if (selected?.id !== department.id) {
          element.style.fill = '#EAF4FF';
          element.style.filter = 'none';
        }
      };

      const click = () => {
        onSelect(department);
      };

      element.addEventListener('mouseenter', enter);
      element.addEventListener('mouseleave', leave);
      element.addEventListener('click', click);

      cleanups.push(() => {
        element.removeEventListener('mouseenter', enter);
        element.removeEventListener('mouseleave', leave);
        element.removeEventListener('click', click);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [selected, onHover, onSelect]);

  // Departamento activo
  useEffect(() => {
    const svg = svgRef.current?.querySelector('svg');

    if (!svg) return;

    const departments = svg.querySelectorAll('[id^="CO-"]');

    departments.forEach((item) => {
      (item as SVGElement).style.fill = '#EAF4FF';
      (item as SVGElement).style.filter = 'none';
    });

    if (!selected) return;

    const active = svg.querySelector(
      `#${selected.id}`
    ) as SVGElement | null;

    if (!active) return;

    active.style.fill = '#977660';

    active.style.filter =
      'drop-shadow(0 0 20px rgba(151,118,96,.65))';
  }, [selected]);

  // Mouse move inspector para obtener coordenadas relativas (porcentaje)
  useEffect(() => {
    const container = svgRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const svg = container.querySelector('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCoords({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    const onClick = (e: MouseEvent) => {
      // Si presionas Shift al click, copia la entrada para coverageData.ts
      if (e.shiftKey) {
        copyCoords();
      }
    };

    container.addEventListener('mousemove', onMove);
    container.addEventListener('click', onClick);

    return () => {
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('click', onClick);
    };
  }, [copyCoords]);

  return (
    <motion.div
      ref={svgRef}
      className="relative w-full overflow-hidden"
      initial={{
        opacity: 0,
        scale: 0.92,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.8,
      }}
    >
      {/* Halo */}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">

        <div
          className="
            h-[70%]
            w-[70%]
            rounded-full
            bg-sky-400/10
            blur-[120px]
          "
        />

      </div>

      {/* MAPA */}

      <motion.div
        animate={{
          scale: selected?.scale ?? 1,
          x: selected?.translateX ?? 0,
          y: selected?.translateY ?? 0,
        }}
        transition={{
          duration: 0.8,
        }}
        className="origin-center"
      >
        <ColombiaMap
          className="
            w-full
            h-auto
            select-none
            drop-shadow-2xl
            text-[#2b6cb0] /* establece color base azul para el mapa (usa currentColor en el SVG) */
          "
        />
      </motion.div>

      {/* Marcadores */}

      <motion.div
        className="absolute inset-0"
        animate={{
          scale: selected?.scale ?? 1,
          x: selected?.translateX ?? 0,
          y: selected?.translateY ?? 0,
        }}
        transition={{
          duration: 0.8,
        }}
      >
        {(() => {
          const clamp = (v: number) => Math.max(2, Math.min(98, v));

          return coverageData.map((item) => (
            <MapMarker
              key={item.id}
              x={clamp(item.x)}
              y={clamp(item.y)}
              active={selected?.id === item.id}
              label={item.name}
              onClick={() => onSelect(item)}
            />
          ));
        })()}

        {/* Badges numerados por departamento (estilo infográfico) */}
        {coverageData.map((item) => {
          const n = item.sedes ?? 0;
          const x = clamp(item.x);
          const y = clamp(item.y - 4); // desplazar ligeramente hacia arriba para no solapar con marker

          return (
            <button
              key={`badge-${item.id}`}
              onClick={() => onSelect(item)}
              onMouseEnter={() => onHover(item)}
              onMouseLeave={() => onHover(null)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 z-40 flex items-center justify-center rounded-full bg-primary text-white ${n > 9 ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-sm'} font-semibold shadow-sm`}
            >
              {n}
            </button>
          );
        })}

        {/* Sedes por ciudad del departamento seleccionado */}
        {selected?.sedeList.map((sede) => (
            <MapMarker
              key={sede.id}
              x={clamp(sede.x)}
              y={clamp(sede.y)}
              active={sede.id === selectedSedeId}
              label={sede.name}
              onClick={() => {
                // seleccionar departamento y sede, pero NO navegar automáticamente
                onSelect(selected);
                const event = new CustomEvent('coverage:sedeSelected', {
                  detail: { departmentId: selected.id, sedeId: sede.id },
                });

                document.dispatchEvent(event);
                // Llamar callback opcional
                onSelectSede && onSelectSede(selected.id, sede.id);
              }}
            />
          ))}
      </motion.div>

      {/* Inspector de coordenadas (útil para calibrar x,y de sedes) */}
      {coords && (
        <div className="absolute left-4 bottom-4 z-50 pointer-events-auto">
          <div className="glass px-3 py-3 rounded-2xl text-sm shadow-lg border border-primary/10">
            <div className="text-xs text-textLight">Coordenadas (%, %)</div>
            <div className="font-mono text-sm">{coords.x.toFixed(1)}%, {coords.y.toFixed(1)}%</div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={copyCoords}
                className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white transition hover:bg-primary-hover"
              >
                Copiar entrada
              </button>
              <span className="text-[10px] text-textLight">Shift+click también copia la entrada</span>
            </div>
            {copied && <div className="text-[10px] text-green-400 mt-2">Copiado</div>}
          </div>
        </div>
      )}
    </motion.div>
  );
}
