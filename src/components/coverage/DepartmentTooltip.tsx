"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MapPin, Building2, Landmark, CheckCircle2 } from "lucide-react";

import { Department } from "./coverageData";

interface Props {
  department: Department | null;
}

export default function DepartmentTooltip({ department }: Props) {
  return (
    <AnimatePresence>
      {department && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
            y: 15,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.92,
            y: 15,
          }}
          transition={{
            duration: 0.25,
          }}
          className="
                        absolute
                        top-6
                        left-6
                        w-80
                        glass
                        rounded-3xl
                        border
                        border-primary/20
                        p-6
                        shadow-2xl
                        backdrop-blur-xl
                        pointer-events-none
                    "
        >
          {/* Encabezado */}

          <div className="flex items-center gap-4 mb-6">
            <div
              className="
                            h-14
                            w-14
                            rounded-2xl
                            bg-primary/10
                            flex
                            items-center
                            justify-center
                        "
            >
              <MapPin className="text-primary w-6 h-6" />
            </div>

            <div>
              <h3 className="text-2xl font-display">{department.name}</h3>

              <p className="text-sm text-textLight">
                Cobertura Jardines del Renacer
              </p>
            </div>
          </div>

          {/* Estadísticas */}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div
              className="
                            rounded-2xl
                            bg-primary/5
                            border
                            border-primary/10
                            p-4
                            text-center
                        "
            >
              <Building2 className="mx-auto mb-2 text-primary" />

              <h4 className="text-3xl font-display">{department.sedes}</h4>

              <p className="text-sm text-textLight">Sedes</p>
            </div>

            <div
              className="
                            rounded-2xl
                            bg-primary/5
                            border
                            border-primary/10
                            p-4
                            text-center
                        "
            >
              <Landmark className="mx-auto mb-2 text-primary" />

              <h4 className="text-3xl font-display">{department.salas}</h4>

              <p className="text-sm text-textLight">Salas</p>
            </div>
          </div>

          {/* Ciudades */}

          <h4 className="font-semibold mb-4">Principales ciudades</h4>

          <div className="space-y-3">
            {department.ciudades.map((city) => (
              <div
                key={city}
                className="
                                    flex
                                    items-center
                                    gap-3
                                "
              >
                <CheckCircle2
                  className="
                                        text-primary
                                        w-4
                                        h-4
                                    "
                />

                <span>{city}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
