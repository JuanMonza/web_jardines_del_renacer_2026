 'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { coverageData, Department } from './coverageData';

import ColombiaSVG from './ColombiaSVG';
import DepartmentCard from './DepartmentCard';
import { getDepartamentoSlug } from '@/data/sedes';
import CoverageFeatures from './CoverageFeatures';
import DepartmentTooltip from './DepartmentTooltip';

export default function CoverageMap() {

    const sectionRef = useRef<HTMLElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLElement>(null);

    const [selectedDepartment, setSelectedDepartment] =
        useState<Department | null>(null);

    const [hoverDepartment, setHoverDepartment] =
        useState<Department | null>(null);
    const [selectedSedeId, setSelectedSedeId] = useState<string | null>(null);
    const [departmentsOpen, setDepartmentsOpen] = useState(false);

    const resetMap = useCallback(() => {
        setSelectedDepartment(null);
        setHoverDepartment(null);
        setSelectedSedeId(null);
    }, []);

    const handleSelectDepartment = (department: Department | null) => {
        setSelectedDepartment(department);
        setSelectedSedeId(null);
    };

    // Escuchar selección de sede desde el mapa
    useEffect(() => {
        const handler = (e: any) => {
            const detail = e.detail as { departmentId: string; sedeId: string };
            const dept = coverageData.find((d) => d.id === detail.departmentId) ?? null;

            if (dept) setSelectedDepartment(dept);
            setSelectedSedeId(detail.sedeId ?? null);
            // NO navegar automáticamente: el usuario pidió evitar navegación al seleccionar departamento.
        };

        document.addEventListener('coverage:sedeSelected', handler as EventListener);

        return () => document.removeEventListener('coverage:sedeSelected', handler as EventListener);
    }, []);

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;

            if (mapRef.current?.contains(target) || panelRef.current?.contains(target)) {
                return;
            }

            if (!sectionRef.current?.contains(target) || selectedDepartment) {
                resetMap();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [resetMap, selectedDepartment]);

    return (

        <section ref={sectionRef} className="py-28 overflow-hidden">

                {/* Encabezado */}

                <div className="relative left-1/2 w-screen -translate-x-1/2 mb-16 py-10 overflow-hidden bg-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/85 to-transparent" />
                    <div className="absolute inset-y-0 left-1/2 w-[72%] -translate-x-1/2 bg-primary/35 blur-2xl" />
                    <div className="relative z-10 mx-auto max-w-4xl text-center px-6 lg:px-8">
                        <span className="uppercase tracking-[0.25em] text-primary text-sm">
                            COBERTURA NACIONAL
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mt-5 mb-6">
                            Estamos presentes donde más nos necesitan
                        </h2>
                        <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto">
                            Contamos con presencia en diferentes departamentos de Colombia,
                            brindando atención inmediata, infraestructura propia y un
                            acompañamiento humano permanente.
                        </p>
                    </div>
                </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Mapa + Panel — stack en móvil, 12 cols en desktop */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

                    {/* MAPA */}

                    <div
                        ref={mapRef}
                        onPointerLeave={(event) => {
                            if (event.pointerType === 'mouse') resetMap();
                        }}
                        className="lg:col-span-8 relative overflow-hidden rounded-[24px] border border-primary/10 bg-slate-950/5 w-full"
                        style={{ aspectRatio: '3/4', maxHeight: '620px' }}
                    >

                        <ColombiaSVG
                            selected={selectedDepartment}
                            hover={hoverDepartment}
                            selectedSedeId={selectedSedeId}
                            onHover={setHoverDepartment}
                            onSelect={handleSelectDepartment}
                        />

                        <DepartmentTooltip
                            department={hoverDepartment}
                        />

                    </div>

                    {/* PANEL DERECHO: tarjeta de departamento + lista numerada estilo infografía */}

                    <aside ref={panelRef} className="lg:col-span-4">
                        <div className="lg:sticky lg:top-28 space-y-6">
                            <DepartmentCard department={selectedDepartment} selectedSedeId={selectedSedeId} />

                            <div className="glass rounded-[24px] p-6">
                                <button
                                    type="button"
                                    onClick={() => setDepartmentsOpen((value) => !value)}
                                    className="flex w-full items-center justify-between gap-4 text-left"
                                    aria-expanded={departmentsOpen}
                                >
                                    <div>
                                        <h3 className="text-2xl font-semibold mb-2">Departamentos de Colombia</h3>
                                        <p className="text-sm text-textLight">Selecciona un departamento en el mapa o abre la lista para ver las sedes disponibles.</p>
                                    </div>
                                    <ChevronDown
                                        className={`h-6 w-6 shrink-0 text-primary transition-transform duration-300 ${departmentsOpen ? 'rotate-180' : ''}`}
                                    />
                                </button>

                                {departmentsOpen && (
                                    <div className="mt-5 max-h-[380px] space-y-3 overflow-y-auto pr-1">
                                        {coverageData.map((dept, idx) => {
                                            const number = idx + 1;
                                            const deptSlug = getDepartamentoSlug(dept.name);

                                            return (
                                                <div
                                                    key={dept.id}
                                                    onMouseEnter={() => setHoverDepartment(dept)}
                                                    onMouseLeave={() => setHoverDepartment(null)}
                                                    onClick={() => handleSelectDepartment(dept)}
                                                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer transition ${selectedDepartment?.id === dept.id ? 'bg-primary/5 border-primary/20' : 'bg-white/0 border-primary/10 hover:bg-primary/5'}`}
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold shrink-0">{number}</div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{dept.name}</div>
                                                            <a
                                                                className="text-sm text-textLight hover:text-primary"
                                                                href={`/sedes/${deptSlug}`}
                                                                onClick={(event) => event.stopPropagation()}
                                                            >
                                                                Ver sedes
                                                            </a>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-sm text-textLight">{dept.sedes} sedes</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                </div>

                {/* Beneficios */}

                <CoverageFeatures />

            </div>

        </section>

    );

}
