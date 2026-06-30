"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    MapPin,
    Building2,
    Building,
    Clock3,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Department } from "./coverageData";

interface DepartmentCardProps {
    department: Department | null;
}

export default function DepartmentCard({ department }: DepartmentCardProps) {
    return (
        <AnimatePresence mode="wait">
            {!department && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-[34px] border border-primary/10 p-10 text-center"
                >
                    <MapPin className="mx-auto h-14 w-14 text-primary mb-5" />

                    <h3 className="text-3xl font-display mb-3">
                        Explora nuestra cobertura
                    </h3>

                    <p className="text-textLight leading-relaxed">
                        Selecciona un departamento en el mapa para conocer la cobertura, las
                        ciudades con presencia y nuestras sedes.
                    </p>
                </motion.div>
            )}

            {department && (
                <motion.div
                    key={department.id}
                    initial={{
                        opacity: 0,
                        x: 50,
                        scale: 0.95,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                    }}
                    exit={{
                        opacity: 0,
                        x: 50,
                        scale: 0.95,
                    }}
                    transition={{
                        duration: 0.4,
                    }}
                    className="
            relative
            overflow-hidden
            glass
            rounded-[34px]
            border
            border-primary/10
            p-10
            shadow-[0_25px_70px_rgba(0,0,0,.12)]
          "
                >
                    {/* Glow */}

                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

                    <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/40 blur-[90px]" />

                    {/* Header */}

                    <div className="relative flex items-center gap-5 mb-10">
                        <div
                            className="
                h-16
                w-16
                rounded-3xl
                bg-primary/10
                border
                border-primary/20
                flex
                items-center
                justify-center
              "
                        >
                            <MapPin className="h-8 w-8 text-primary" />
                        </div>

                        <div>
                            <h3 className="text-4xl font-display">{department.name}</h3>

                            <p className="text-textLight mt-1">
                                Cobertura Jardines del Renacer
                            </p>
                        </div>
                    </div>

                    {/* Estadísticas */}

                    <div className="grid grid-cols-2 gap-5 mb-10">
                        <div
                            className="
                glass
                rounded-3xl
                border
                border-primary/10
                p-6
                text-center
              "
                        >
                            <Building2 className="mx-auto h-8 w-8 text-primary mb-3" />

                            <div className="text-4xl font-display">{department.sedes}</div>

                            <p className="text-textLight mt-1">Sedes</p>
                        </div>

                        <div
                            className="
                glass
                rounded-3xl
                border
                border-primary/10
                p-6
                text-center
              "
                        >
                            <Building className="mx-auto h-8 w-8 text-primary mb-3" />

                            <div className="text-4xl font-display">{department.salas}</div>

                            <p className="text-textLight mt-1">Salas</p>
                        </div>
                    </div>

                    {/* Ciudades */}

                    <div className="mb-10">
                        <h4 className="font-semibold mb-4">Cobertura destacada</h4>

                        <div className="flex flex-wrap gap-3">
                            {department.ciudades.map((city) => (
                                <span
                                    key={city}
                                    className="
                    rounded-full
                    bg-primary/10
                    border
                    border-primary/10
                    px-4
                    py-2
                    text-sm
                  "
                                >
                                    {city}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Beneficio */}

                    <div
                        className="
              rounded-3xl
              bg-primary/5
              border
              border-primary/10
              p-5
              mb-8
            "
                    >
                        <div className="flex gap-4">
                            <Clock3 className="text-primary shrink-0 mt-1" />

                            <div>
                                <h5 className="font-semibold">Atención inmediata 24/7</h5>

                                <p className="text-sm text-textLight mt-1">
                                    Nuestro equipo está disponible las 24 horas para brindar
                                    acompañamiento humano y profesional.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Garantía */}

                    <div
                        className="
              flex
              items-center
              gap-3
              text-sm
              text-textLight
              mb-8
            "
                    >
                        <ShieldCheck className="text-primary h-5 w-5" />
                        Infraestructura propia • Personal especializado
                    </div>

                    {/* Botones */}

                    <div className="space-y-3">
                        <Link href="/sedes">
                            <Button className="w-full">Ver sedes</Button>
                        </Link>
                        <Link href="/sedes">
                            <Button variant="secondary" className="w-full">
                                Ver todas las sedes
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
