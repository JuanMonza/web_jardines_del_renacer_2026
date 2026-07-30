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
    <div className="p-5 md:p-8">
      <section className="relative mb-8 overflow-hidden rounded-[30px] border border-[#315d98] bg-gradient-to-br from-[#143860] via-[#24558f] to-[#7398c3] p-7 text-white shadow-[0_22px_55px_rgba(20,57,106,.24)] md:p-9"><div className="absolute -right-12 -top-16 h-56 w-56 rounded-full border-[18px] border-white/10" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-100">Talento humano</p><h1 className="mt-2 text-3xl font-bold md:text-4xl">Centro de control de Vacantes</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-50 md:text-base">Gestiona oportunidades, candidatos, decisiones y comunicaciones desde una operación unificada.</p></div></section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-3xl border border-white/80 bg-white/65 p-6 shadow-[0_12px_30px_rgba(35,79,132,.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
