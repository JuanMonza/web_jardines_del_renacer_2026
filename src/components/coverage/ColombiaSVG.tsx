'use client';

import { useEffect, useRef } from 'react';
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
  const clamp = (v: number) => Math.max(2, Math.min(98, v));
  const focusScale = selected ? 1.28 : 1;
  // Centra el departamento seleccionado después de aplicar el zoom.
  const focusX = selected ? `${50 - selected.x * focusScale}%` : '0%';
  const focusY = selected ? `${50 - selected.y * focusScale}%` : '0%';

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
      // El mapa tiene departamentos contiguos: este borde claro conserva la lectura
      // territorial sobre el azul corporativo, incluso cuando hay zoom.
      element.style.stroke = '#FFFFFF';
      element.style.strokeWidth = '2.2';
      element.style.strokeOpacity = '0.92';
      element.style.strokeLinejoin = 'round';
      element.style.vectorEffect = 'non-scaling-stroke';

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
      (item as SVGElement).style.stroke = '#FFFFFF';
      (item as SVGElement).style.strokeWidth = '2.2';
      (item as SVGElement).style.strokeOpacity = '0.92';
      (item as SVGElement).style.strokeLinejoin = 'round';
      (item as SVGElement).style.vectorEffect = 'non-scaling-stroke';
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
        className="origin-center"
        animate={{ scale: focusScale, x: focusX, y: focusY }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
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
        animate={{ scale: focusScale, x: focusX, y: focusY }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        {(() => {
          const clamp = (v: number) => Math.max(2, Math.min(98, v));

          return coverageData.filter((item) => !selected || item.id === selected.id).map((item) => (
            <MapMarker
              key={item.id}
              x={clamp(item.x)}
              y={clamp(item.y)}
              active={selected?.id === item.id}
              label={item.name}
              showLabel={false}
              onClick={() => onSelect(item)}
            />
          ));
        })()}

        {selected && (
          <div
            className="pointer-events-none absolute z-50"
            style={{ left: `${clamp(selected.x)}%`, top: `${clamp(selected.y)}%` }}
          >
            <span className="absolute bottom-2 left-1/2 h-10 w-0.5 -translate-x-1/2 rounded-full bg-[#2b6cb0] shadow-[0_0_12px_rgba(43,108,176,0.65)]" />
            <div className="absolute bottom-11 left-1/2 flex -translate-x-1/2 items-center whitespace-nowrap rounded-full border border-[#2b6cb0]/30 bg-white/95 px-3 py-1.5 text-xs font-bold text-[#173861] shadow-[0_8px_22px_rgba(20,55,95,0.2)] backdrop-blur">
              {selected.name}
            </div>
          </div>
        )}

        {/* Una sola ciudad a la vez: evita puntos solapados y mantiene el mapa legible. */}
        {selected?.sedeList.filter((sede) => sede.id === selectedSedeId).map((sede) => (
            <MapMarker
              key={sede.id}
              x={clamp(sede.x)}
              y={clamp(sede.y)}
              active={sede.id === selectedSedeId}
              label={sede.name}
              compact
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

    </motion.div>
  );
}
