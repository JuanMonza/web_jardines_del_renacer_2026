'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2000,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === 'string' ? value : 0
  );
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Si es string, no animar, solo mostrar
    if (typeof value === 'string') {
      setDisplayValue(value);
      return;
    }

    const currentNode = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let currentValue = 0;
          const increment = value / (duration / 16); // 60fps

          const interval = setInterval(() => {
            currentValue += increment;
            if (currentValue >= value) {
              setDisplayValue(value);
              clearInterval(interval);
            } else {
              setDisplayValue(Math.floor(currentValue));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (currentNode) {
      observer.observe(currentNode);
    }

    return () => {
      if (currentNode) {
        observer.unobserve(currentNode);
      }
    };
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
