'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ColombiaMap from '@/assets/maps/colombia.svg';
import { coverageData, Department } from './coverageData';
import MapMarker from './MapMarker';

interface Props {
  selected: Department | null;
  hover: Department | null;
  onHover: (department: Department | null) => void;
  onSelect: (department: Department) => void;
}

export default function ColombiaSVG({
  selected,
  hover,
  onHover,
  onSelect,
}: Props) {
  const svgRef = useRef<HTMLDivElement>(null);

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
          "
        />
      </motion.div>

      {/* Marcadores */}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          scale: selected?.scale ?? 1,
          x: selected?.translateX ?? 0,
          y: selected?.translateY ?? 0,
        }}
        transition={{
          duration: 0.8,
        }}
      >
        {coverageData.map((item) => (
          <MapMarker
            key={item.id}
            x={item.x}
            y={item.y}
            active={selected?.id === item.id}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}