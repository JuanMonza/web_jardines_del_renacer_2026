'use client';

import { motion } from 'framer-motion';

interface Props {
    x: number;
    y: number;
    active?: boolean;
}

export default function MapMarker({

    x,
    y,
    active = true

}: Props) {

    return (

        <motion.div

            className="absolute"

            style={{

                left: `${x}%`,
                top: `${y}%`

            }}

            initial={{ scale: 0 }}

            animate={{

                scale: 1

            }}

        >

            <motion.div
                animate={{
                    scale: active ? [1.2, 2.2, 1.2] : [1, 1.8, 1],
                    opacity: [1, 0.25, 1],
                }}
                transition={{
                    repeat: Infinity,
                    duration: active ? 1.5 : 2.4,
                    ease: "easeInOut",
                }}
                className={`absolute h-6 w-6 rounded-full ${active ? "bg-primary/50" : "bg-primary/30"
                    }`}
            />

            <motion.div
                animate={{
                    scale: active ? 1.6 : 1,
                }}
                transition={{
                    duration: 0.3,
                }}
                className="relative h-3 w-3 rounded-full bg-primary border-2 border-white shadow-xl"
            />

        </motion.div>

    )

}