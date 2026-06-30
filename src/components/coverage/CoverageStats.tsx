'use client';

import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Building2, Landmark, Truck, MapPinned } from 'lucide-react';

const stats = [
    {
        value: 110,
        suffix: '+',
        label: 'Sedes',
        icon: Building2,
    },
    {
        value: 200,
        suffix: '+',
        label: 'Salas de velación',
        icon: Landmark,
    },
    {
        value: 70,
        suffix: '+',
        label: 'Vehículos',
        icon: Truck,
    },
    {
        value: 14,
        suffix: '',
        label: 'Departamentos',
        icon: MapPinned,
    },
];

export default function CoverageStats() {
    return (
        <section className="mt-16">

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

                {stats.map((item, index) => {

                    const Icon = item.icon;

                    return (

                        <motion.div
                            key={item.label}
                            initial={{
                                opacity: 0,
                                y: 30,
                            }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                            }}
                            viewport={{
                                once: true,
                            }}
                            transition={{
                                duration: .45,
                                delay: index * .12,
                            }}
                            className="
                glass
                rounded-3xl
                border
                border-primary/10
                p-8
                text-center
                hover:-translate-y-2
                transition-all
                duration-500
              "
                        >

                            <Icon
                                className="
                  mx-auto
                  mb-5
                  h-10
                  w-10
                  text-primary
                "
                            />

                            <div className="text-5xl font-display text-primary">

                                <CountUp
                                    end={item.value}
                                    duration={2}
                                    suffix={item.suffix}
                                />

                            </div>

                            <p className="text-textLight mt-3">

                                {item.label}

                            </p>

                        </motion.div>

                    );

                })}

            </div>

        </section>
    );
}