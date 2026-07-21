import Link from "next/link";
import {
  Briefcase,
  Users,
  BarChart3,
  Bell,
  Settings,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    title: "Vacantes",
    description: "Crear, editar y administrar las vacantes publicadas.",
    href: "/dashboard-vacantes/vacantes",
    icon: Briefcase,
  },
  {
    title: "Postulantes",
    description: "Consultar candidatos y gestionar procesos de selección.",
    href: "/dashboard-vacantes/postulantes",
    icon: Users,
  },
  {
    title: "Analítica",
    description: "Indicadores y estadísticas del proceso de contratación.",
    href: "/dashboard-vacantes/analitica",
    icon: BarChart3,
  },
  {
    title: "Notificaciones",
    description: "Correos, alertas y comunicaciones con candidatos.",
    href: "/dashboard-vacantes/notificaciones",
    icon: Bell,
  },
  {
    title: "Configuración",
    description: "Opciones generales del módulo de vacantes.",
    href: "/dashboard-vacantes/configuracion",
    icon: Settings,
  },
];

export default function DashboardVacantesHome() {
  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-text">
          Panel Administrativo de Vacantes
        </h1>

        <p className="text-textLight mt-3 text-lg">
          Bienvenido al centro de administración del proceso de selección de
          Jardines del Renacer.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-3xl border border-primary/15 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-7 h-7 text-primary" />
              </div>

              <h2 className="text-xl font-semibold mb-2">
                {module.title}
              </h2>

              <p className="text-textLight mb-6">
                {module.description}
              </p>

              <div className="flex items-center text-primary font-semibold">
                Abrir módulo
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}