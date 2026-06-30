'use client';

import { useState } from 'react';

import ColombiaSVG from './ColombiaSVG';
import DepartmentCard from './DepartmentCard';
import CoverageStats from './CoverageStats';
import CoverageFeatures from './CoverageFeatures';
import DepartmentTooltip from './DepartmentTooltip';
import { Department } from './coverageData';

export default function CoverageMap() {

    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);

    const [hoverDepartment, setHoverDepartment] =
        useState<Department | null>(null);

    return (

        <section className="py-28">

            <div className="max-w-7xl mx-auto px-6">

                {/* Encabezado */}

                <div className="text-center max-w-4xl mx-auto mb-16">

                    <span className="uppercase tracking-[0.25em] text-primary text-sm">

                        COBERTURA NACIONAL

                    </span>

                    <h2 className="text-5xl font-display mt-5 mb-6">

                        Estamos presentes donde más nos necesitan

                    </h2>

                    <p className="text-xl text-textLight leading-relaxed">

                        Contamos con presencia en diferentes departamentos de Colombia,
                        brindando atención inmediata, infraestructura propia y un
                        acompañamiento humano permanente.

                    </p>

                </div>

                {/* Mapa + Panel */}

                <div className="grid lg:grid-cols-12 gap-10 items-start">

                    {/* MAPA */}

                    <div className="lg:col-span-7 relative">

                        <ColombiaSVG
                            selected={selectedDepartment}
                            hover={hoverDepartment}
                            onHover={setHoverDepartment}
                            onSelect={setSelectedDepartment}
                        />

                        <DepartmentTooltip
                            department={hoverDepartment}
                        />

                    </div>

                    {/* PANEL DERECHO */}

                    <div className="lg:col-span-5">

                        <DepartmentCard
                            department={selectedDepartment}
                        />

                    </div>

                </div>

                {/* Estadísticas */}

                <CoverageStats />

                {/* Beneficios */}

                <CoverageFeatures />

            </div>

        </section>

    );

}