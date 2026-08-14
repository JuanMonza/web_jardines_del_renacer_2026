"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
    MapPin,
    Building2,
    MapPinned,
    Clock3,
    ShieldCheck,
    ArrowRight,
    ChevronsDown,
    ChevronsUp,
    RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { getDepartamentoSlug, getSedesByDepartamento } from '@/data/sedes';
import Button from "@/components/ui/Button";
import { Department } from "./coverageData";

interface DepartmentCardProps {
    department: Department | null;
    selectedSedeId?: string | null;
    onReset?: () => void;
    onSelectCity?: (sedeId: string) => void;
}

export default function DepartmentCard({ department, selectedSedeId, onReset, onSelectCity }: DepartmentCardProps) {
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (department) {
            setExpanded(true);
        }
    }, [department]);

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
                    className="relative min-w-0 overflow-hidden glass rounded-[28px] border border-primary/10 p-6 shadow-[0_25px_70px_rgba(0,0,0,.12)] sm:p-7"
                >
                    {/* Glow */}

                    <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

                    <div className="absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-white/40 blur-[90px]" />

                    {/* Header */}

                    <div className="relative mb-7 flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                            className="
                h-12
                w-12
                shrink-0
                rounded-2xl
                bg-primary/10
                border
                border-primary/20
                flex
                items-center
                justify-center
              "
                        >
                            <MapPin className="h-6 w-6 text-primary" />
                        </div>

                        <div className="min-w-0">
                            <h3 className="break-words text-2xl font-display leading-tight sm:text-3xl">{department.name}</h3>

                            <p className="mt-1 text-sm leading-6 text-textLight">
                                Cobertura Jardines del Renacer
                            </p>
                        </div>
                      </div>
                      {onReset && <button type="button" onClick={onReset} aria-label="Restablecer mapa" className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-white/70 px-2.5 py-2 text-xs font-bold text-primary transition hover:bg-primary/10"><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Mapa</span></button>}
                    </div>

                    {/* Estadísticas */}

                    <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4">
                        <div
                            className="
                glass
                rounded-3xl
                border
                border-primary/10
                p-4 sm:p-5
                text-center
              "
                        >
                            <Building2 className="mx-auto mb-2 h-7 w-7 text-primary" />

                            <div className="text-3xl font-display">{department.sedes}</div>

                            <p className="text-textLight mt-1">Sedes</p>
                        </div>

                        <div
                            className="
                glass
                rounded-3xl
                border
                border-primary/10
                p-4 sm:p-5
                text-center
              "
                        >
                            <MapPinned className="mx-auto mb-2 h-7 w-7 text-primary" />

                            <div className="text-3xl font-display">{department.ciudades.length}</div>

                            <p className="text-textLight mt-1">Ciudades</p>
                        </div>
                    </div>

                    {/* Ciudades */}

                    <div className="mb-10">
                        <h4 className="font-semibold mb-4">Cobertura destacada</h4>
                        <p className="mb-4 text-sm leading-6 text-textLight">Selecciona una ciudad para verla señalada en el mapa.</p>

                        <div className="flex flex-wrap gap-3">
                            {department.sedeList.map((city) => (
                                <button
                                    type="button"
                                    key={city.id}
                                    onClick={() => onSelectCity?.(city.id)}
                                    className="
                    rounded-full
                    bg-primary/10
                    border
                    border-primary/10
                    px-4
                    py-2
                    text-sm
                    transition hover:bg-primary hover:text-white focus:outline-none focus:ring-4 focus:ring-primary/15
                  "
                                >
                                    {city.name}
                                </button>
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
                        className="flex items-center gap-3 text-sm text-textLight mb-8"
                    >
                        <ShieldCheck className="text-primary h-5 w-5" />
                        Infraestructura propia • Personal especializado
                    </div>

                    <div className="mb-6">
                        <h4 className="font-semibold mb-3">Sedes</h4>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-4xl font-display">{department.sedes}</div>
                            <div className="text-sm text-textLight">Sedes en {department.name}</div>
                        </div>

                        <div className="rounded-3xl border border-primary/10 bg-white/5 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setExpanded((value) => !value)}
                                className="w-full flex items-center justify-between px-4 py-4 text-left text-sm font-medium text-primary"
                            >
                                <span>{expanded ? 'Ocultar sedes' : 'Mostrar sedes del departamento'}</span>
                                {expanded ? <ChevronsUp className="h-5 w-5" /> : <ChevronsDown className="h-5 w-5" />}
                            </button>

                            {expanded && (
                                <div className="divide-y divide-primary/10 bg-slate-950/5">
                                    {getSedesByDepartamento(getDepartamentoSlug(department.name)).map((sede) => {
                                        const departmentSlug = getDepartamentoSlug(department.name);
                                        const cityMarkerId = `${departmentSlug}-${getDepartamentoSlug(sede.ciudad)}`;
                                        const isSelected = selectedSedeId === sede.id || selectedSedeId === cityMarkerId;

                                        return (
                                            <Link
                                                key={sede.id}
                                                href={`/sedes/${departmentSlug}`}
                                                className={`flex items-center justify-between px-4 py-3 text-sm ${isSelected ? 'bg-primary/10' : 'bg-transparent'} hover:bg-primary/5`}
                                            >
                                                <span>{sede.nombre}</span>
                                                <ArrowRight className="h-4 w-4 text-primary" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botones generales */}

                    <div className="space-y-3">
                        <Link href={`/sedes/${getDepartamentoSlug(department.name)}`}>
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
