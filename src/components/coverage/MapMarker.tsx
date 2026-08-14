'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Props {
    x: number;
    y: number;
    active?: boolean;
    onClick?: () => void;
    label?: string;
    compact?: boolean;
    showLabel?: boolean;
}

export default function MapMarker({
    x,
    y,
    active = false,
    onClick,
    label,
    compact = false,
    showLabel = true,
}: Props) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.button
            type="button"
            aria-label={label ? `Ver ${label}` : 'Ver ubicación'}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
            style={{ left: `${x}%`, top: `${y}%` }}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
        >
            {/* pulso sutil detrás del marcador (azul suave) */}
            <motion.div
                aria-hidden
                animate={{
                    scale: active ? [1, 1.6, 1] : [1, 1.15, 1],
                    opacity: [0.8, 0.3, 0.8],
                }}
                transition={{ repeat: Infinity, duration: active ? 1.4 : 2.2, ease: 'easeInOut' }}
                className={`${active ? 'h-8 w-8' : compact ? 'h-4 w-4' : 'h-6 w-6'} absolute rounded-full ${active ? 'bg-[#2b6cb0]/30' : 'bg-[#2b6cb0]/20'}`}
            />

            {/* marcador: círculo blanco con punto azul interior */}
            <motion.div
                animate={{ scale: active ? 1.05 : 1 }}
                transition={{ duration: 0.15 }}
                className={`${active ? 'h-6 w-6' : compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} relative rounded-full overflow-hidden flex items-center justify-center shadow-sm`}
            >
                <div className="h-full w-full rounded-full bg-white flex items-center justify-center">
                    <div className={`${active ? 'h-3 w-3' : compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'} rounded-full bg-[#2b6cb0]`} />
                </div>
            </motion.div>

            {/* Etiqueta cuando está activo */}
            {showLabel && (active || hovered) && label && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none">
                    <div className="whitespace-nowrap rounded-md bg-[#173861] px-2 py-1 text-xs text-white shadow-md">
                        {label}
                    </div>
                </div>
            )}
        </motion.button>
    );
}
