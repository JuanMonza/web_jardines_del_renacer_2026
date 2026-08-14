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

    const handleSelectCity = (sedeId: string) => {
        setSelectedSedeId(sedeId);
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

            if (!sectionRef.current?.contains(target)) {
                resetMap();
            }
        };

        document.addEventListener('pointerdown', handlePointerDown);

        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [resetMap, selectedDepartment]);

    return (

        <section ref={sectionRef} className="py-28 overflow-hidden">

                {/* Encabezado */}

                <div className="relative left-1/2 mb-16 w-screen -translate-x-1/2 border-y-4 border-[#5a7ec0] bg-primary py-9 shadow-[0_14px_34px_rgba(60,96,162,0.2)]">
                    <div className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
                        <h2 className="text-4xl font-display font-extrabold text-white md:text-5xl">
                            Estamos presentes donde más nos necesitan
                        </h2>
                    </div>
                </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Mapa + Panel — stack en móvil, 12 cols en desktop */}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">

                    {/* MAPA */}

                    <div
                        ref={mapRef}
                        className="lg:col-span-8 relative w-full max-w-[620px] overflow-hidden rounded-[24px] border border-primary/10 bg-slate-950/5 lg:mx-auto"
                        style={{ aspectRatio: '612.82184 / 693.68036' }}
                    >

                        <ColombiaSVG
                            selected={selectedDepartment}
                            hover={hoverDepartment}
                            selectedSedeId={selectedSedeId}
                            onHover={setHoverDepartment}
                            onSelect={handleSelectDepartment}
                        />

                        {!selectedDepartment && (
                            <div className="pointer-events-none absolute left-4 top-4 z-40 rounded-2xl border border-primary/15 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-sm sm:left-6 sm:top-6">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Mapa interactivo</p>
                                <p className="mt-1 text-xs leading-5 text-textLight">Selecciona un departamento para ver sus ciudades y sedes.</p>
                            </div>
                        )}

                        {selectedDepartment && (
                            <div className="absolute bottom-4 left-4 right-4 z-40 max-h-36 overflow-y-auto rounded-2xl border border-primary/15 bg-white/95 p-3 shadow-xl backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[calc(100%-2.5rem)]">
                                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-primary">
                                    Ciudades de {selectedDepartment.name}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedDepartment.sedeList.map((city) => (
                                        <button
                                            type="button"
                                            key={city.id}
                                            onClick={() => handleSelectCity(city.id)}
                                            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-primary/30 ${selectedSedeId === city.id
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-primary/15 bg-primary/5 text-primary hover:bg-primary/15'
                                                }`}
                                        >
                                            {city.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <DepartmentTooltip
                            department={hoverDepartment}
                        />

                    </div>

                    {/* PANEL DERECHO: tarjeta de departamento + lista numerada estilo infografía */}

                    <aside ref={panelRef} className="-mt-2 lg:col-span-4 lg:mt-0">
                        <div className="lg:sticky lg:top-28 space-y-6">
                            <DepartmentCard department={selectedDepartment} selectedSedeId={selectedSedeId} onReset={resetMap} onSelectCity={handleSelectCity} />

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
