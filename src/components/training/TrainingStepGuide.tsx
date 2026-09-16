"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Step = { title: string; description: string; href?: string; action?: string };
type Guide = { id: string; name: string; steps: Step[] };
type SectionNotice = { title: string; actions: string[] };

const guides: Record<string, Guide> = {
  "Administración general": {
    id: "general", name: "Administración general", steps: [
      { title: "Revisa el centro de control", description: "Aquí encuentras los módulos, las cuentas responsables y cuáles accesos están disponibles.", href: "/dashboard", action: "Abrir resumen" },
      { title: "Consulta usuarios y roles", description: "En el directorio puedes comprobar quién administra cada área. Usa únicamente cuentas ficticias durante la capacitación.", href: "/dashboard/usuarios", action: "Ver usuarios" },
      { title: "Entra al módulo que vas a practicar", description: "Cada panel tiene permisos propios. Elige un módulo desde el centro de control para continuar su guía específica.", href: "/dashboard", action: "Ver módulos" },
    ],
  },
  "Cotizaciones": {
    id: "cotizaciones", name: "Cotizaciones", steps: [
      { title: "Explora los prospectos", description: "Prueba los filtros y revisa cotizaciones nuevas, contactadas, en negociación y cerradas.", href: "/dashboard/cotizaciones", action: "Ver cotizaciones" },
      { title: "Asigna un gestor", description: "Selecciona un prospecto nuevo y asígnalo a la cuenta ficticia del gestor para practicar el reparto de trabajo.", href: "/dashboard/cotizaciones", action: "Ir a asignación" },
      { title: "Registra el seguimiento", description: "Abre una cotización para dejar una nota, programar el próximo contacto y cambiar su estado. Consulta luego el historial.", href: "/dashboard/cotizaciones", action: "Gestionar prospectos" },
      { title: "Revisa equipo y reporte", description: "Comprueba los asesores disponibles y descarga el Excel de práctica desde el panel.", href: "/dashboard/cotizaciones/equipo", action: "Ver equipo" },
    ],
  },
  "Talento humano": {
    id: "vacantes-v2", name: "Talento humano", steps: [
      { title: "Revisa el resumen", description: "Consulta el estado del proceso y los movimientos registrados en el ambiente de prueba.", href: "/dashboard-vacantes", action: "Abrir resumen" },
      { title: "Gestiona una vacante", description: "Publica o pausa una vacante ficticia y comprueba cómo queda en el historial.", href: "/dashboard-vacantes/vacantes", action: "Ver vacantes" },
      { title: "Mueve un postulante", description: "Abre un perfil de prueba, registra una observación y cambia de etapa. Comprueba la trazabilidad y el aviso por correo redirigido.", href: "/dashboard-vacantes/postulantes", action: "Ver postulantes" },
      { title: "Consulta la auditoría", description: "Filtra fechas y descarga los reportes de selección desde Analítica.", href: "/dashboard-vacantes/analitica", action: "Abrir analítica" },
      { title: "Revisa el historial laboral", description: "Busca fichas históricas, consulta sus observaciones y practica la edición o traslado con datos ficticios.", href: "/dashboard-vacantes/historial-laboral", action: "Ver historial" },
      { title: "Comprueba los correos", description: "Filtra los avisos enviados por fecha y verifica el estado que se comunicó en cada movimiento.", href: "/dashboard-vacantes/notificaciones", action: "Ver notificaciones" },
      { title: "Revisa la configuración", description: "Comprueba el correo, las etapas notificables y la retención. Guarda los cambios solo después de revisarlos.", href: "/dashboard-vacantes/configuracion", action: "Abrir configuración" },
    ],
  },
  "Aliados comerciales": {
    id: "aliados", name: "Aliados comerciales", steps: [
      { title: "Revisa el panel", description: "Identifica los aliados y convenios disponibles para los ejercicios.", href: "/dashboard-aliados", action: "Abrir panel" },
      { title: "Practica un cambio", description: "Usa solamente registros ficticios y comprueba cómo se refleja cada actualización.", href: "/dashboard-aliados", action: "Gestionar aliados" },
      { title: "Verifica el resultado público", description: "Al finalizar, revisa el portal público para confirmar la presentación de la información.", href: "/aliados-comerciales", action: "Ver portal" },
    ],
  },
  "Sedes y cobertura": {
    id: "sedes", name: "Sedes y cobertura", steps: [
      { title: "Consulta las sedes", description: "Ubica los puntos de atención y revisa la información que se administra en este panel.", href: "/dashboard-sedes", action: "Abrir sedes" },
      { title: "Actualiza una sede de prueba", description: "Practica cambios de datos o estado usando únicamente contenido ficticio.", href: "/dashboard-sedes", action: "Gestionar sedes" },
      { title: "Comprueba el directorio", description: "Valida el resultado en la vista pública de sedes.", href: "/sedes", action: "Ver directorio" },
    ],
  },
  "Talleres de duelo": {
    id: "talleres", name: "Talleres de duelo", steps: [
      { title: "Programa un taller", description: "Crea un encuentro ficticio con fecha, cupos y facilitadores.", href: "/dashboard-talleres#programacion", action: "Ir a programación" },
      { title: "Gestiona participantes", description: "Abre los inscritos, cambia el estado de una reserva y confirma el aviso. Los correos de prueba se redirigen.", href: "/dashboard-talleres#programacion", action: "Ver programación" },
      { title: "Revisa galería y trazabilidad", description: "Consulta fotografías de práctica, movimientos, asistencia y el Excel de auditoría.", href: "/dashboard-talleres#galeria", action: "Ver galería" },
    ],
  },
  "Mercadeo": {
    id: "mercadeo", name: "Mercadeo", steps: [
      { title: "Crea una actividad", description: "Programa un incentivo o sorteo ficticio y revisa su estado antes de publicarlo.", href: "/dashboard-sorteos", action: "Abrir Mercadeo" },
      { title: "Consulta participantes", description: "Abre una actividad y comprueba los registros asociados y las condiciones de participación.", href: "/dashboard-sorteos#sorteos", action: "Ver actividades" },
      { title: "Valida el resultado", description: "Practica la selección y confirmación del ganador solo con datos de capacitación.", href: "/dashboard-sorteos#sorteos", action: "Ver actividades" },
    ],
  },
};

export function sectionNotice(workspace: string, pathname: string, hash: string): SectionNotice | null {
  if (workspace === "Talento humano") {
    const sections: Record<string, SectionNotice> = {
      "/dashboard-vacantes": { title: "Resumen", actions: ["Consultar el estado de las vacantes.", "Revisar los movimientos recientes."] },
      "/dashboard-vacantes/vacantes": { title: "Vacantes", actions: ["Crear, publicar o pausar una vacante de prueba.", "Abrir una vacante y revisar sus postulaciones."] },
      "/dashboard-vacantes/historial-vacantes": { title: "Historial de vacantes", actions: ["Consultar procesos cerrados o pausados.", "Revisar postulantes y decisiones anteriores."] },
      "/dashboard-vacantes/historial-laboral": { title: "Historial laboral", actions: ["Buscar, filtrar y abrir fichas históricas.", "Revisar observaciones, editar datos o registrar traslados con auditoría.", "Importar y descargar solo archivos de prueba."] },
      "/dashboard-vacantes/postulantes": { title: "Postulantes", actions: ["Abrir el perfil de una persona ficticia.", "Cambiar de etapa y registrar la observación del movimiento."] },
      "/dashboard-vacantes/analitica": { title: "Analítica", actions: ["Filtrar resultados por fechas.", "Descargar reportes y comprobar la trazabilidad."] },
      "/dashboard-vacantes/notificaciones": { title: "Notificaciones", actions: ["Revisar correos y avisos de movimientos.", "Comprobar el responsable y la observación asociada."] },
      "/dashboard-vacantes/configuracion": { title: "Configuración", actions: ["Revisar los ajustes disponibles para Talento Humano.", "No modifiques permisos generales desde este panel."] },
    };
    return sections[pathname] || null;
  }
  if (workspace === "Cotizaciones") {
    return pathname === "/dashboard/cotizaciones/equipo"
      ? { title: "Equipo de cotizaciones", actions: ["Consultar coordinadores y gestores.", "Preparar a quién asignarás los prospectos ficticios."] }
      : { title: "Cotizaciones", actions: ["Filtrar prospectos y asignar un gestor.", "Registrar notas, estados y próximos contactos.", "Consultar el historial y descargar el reporte."] };
  }
  if (workspace === "Administración general") {
    const sections: Record<string, SectionNotice> = {
      "/dashboard": { title: "Centro de control", actions: ["Revisar los módulos disponibles y sus responsables.", "Abrir el panel que practicarás hoy."] },
      "/dashboard/usuarios": { title: "Usuarios", actions: ["Consultar cuentas, roles y accesos.", "Trabajar únicamente con identidades ficticias."] },
      "/dashboard/obituarios": { title: "Homenajes", actions: ["Revisar y administrar publicaciones de prueba.", "Comprobar la información antes de publicarla."] },
      "/dashboard/sedes": { title: "Sedes", actions: ["Consultar los puntos de atención.", "Verificar cambios en el directorio público."] },
      "/dashboard/talleres": { title: "Talleres", actions: ["Consultar la programación y galerías.", "Abrir el panel especializado para practicar la gestión."] },
    };
    return sections[pathname] || null;
  }
  if (workspace === "Talleres de duelo") {
    if (hash === "#galeria") return { title: "Galería", actions: ["Abrir un álbum y revisar sus fotografías.", "Crear o editar solo contenido ficticio."] };
    if (hash === "#programacion") return { title: "Programación", actions: ["Crear o editar talleres de prueba.", "Abrir inscritos para gestionar reservas y asistencia."] };
    return { title: "Panel de talleres", actions: ["Revisar el próximo encuentro y los cupos.", "Usar Programación, Galería y Trazabilidad para practicar."] };
  }
  if (workspace === "Mercadeo") {
    return hash === "#sorteos"
      ? { title: "Incentivos y participantes", actions: ["Abrir una actividad y revisar sus participantes.", "Practicar selección y validación con registros ficticios."] }
      : { title: "Panel de Mercadeo", actions: ["Crear un incentivo o sorteo de prueba.", "Revisar fechas, participantes y ganadores."] };
  }
  if (workspace === "Aliados comerciales") return { title: "Aliados comerciales", actions: ["Consultar convenios y aliados de prueba.", "Actualizar un registro y verificar su presentación pública."] };
  if (workspace === "Sedes y cobertura") return { title: "Sedes y cobertura", actions: ["Consultar y actualizar una sede de prueba.", "Verificar cómo aparece en el directorio público."] };
  return null;
}

export default function TrainingStepGuide({ workspace, open, onClose }: { workspace: string; open: boolean; onClose: () => void }) {
  const guide = guides[workspace];
  const [stepIndex, setStepIndex] = useState(0);

  if (!guide || !open || process.env.NEXT_PUBLIC_APP_ENV !== "training") return null;

  const close = () => {
    onClose();
  };
  const step = guide.steps[stepIndex];

  return createPortal(
      <div className="fixed inset-0 z-[2147483002] flex items-center justify-center bg-[#07182e]/65 p-4 backdrop-blur-[3px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="training-guide-title" className="w-full max-w-lg overflow-hidden rounded-[26px] border border-white/80 bg-[#f8fbff] shadow-[0_28px_80px_rgba(6,27,59,.35)]">
          <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-[#087b3a] to-[#30d96c] px-6 py-5 text-white">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-green-100">Modo prueba activo · {guide.name}</p><h2 id="training-guide-title" className="mt-1 text-xl font-black">Guía paso a paso</h2></div>
            <button type="button" onClick={close} aria-label="Cerrar guía" className="rounded-lg p-2 hover:bg-white/15"><X className="h-5 w-5" /></button>
          </div>
          <div className="px-6 py-6">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#5177a7]">Paso {stepIndex + 1} de {guide.steps.length}</p>
            <h3 className="mt-2 text-2xl font-black text-[#18385f]">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#506781]">{step.description}</p>
            {step.href && <Link href={step.href} onClick={() => { setStepIndex((index) => Math.min(guide.steps.length - 1, index + 1)); onClose(); }} className="mt-5 inline-flex rounded-xl border border-[#61ee91] bg-[#e7ffed] px-4 py-2.5 text-sm font-bold text-[#087b3a] hover:bg-[#d0ffde]">{step.action || "Abrir sección"}</Link>}
            <div className="mt-7 flex items-center gap-2" aria-hidden="true">{guide.steps.map((_, index) => <span key={index} className={`h-1.5 flex-1 rounded-full ${index <= stepIndex ? "bg-[#32e876]" : "bg-[#d8e3f1]"}`} />)}</div>
            <div className="mt-5 flex justify-between gap-3">
              <button type="button" onClick={() => setStepIndex((index) => Math.max(0, index - 1))} disabled={stepIndex === 0} className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-bold text-[#335a89] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Anterior</button>
              {stepIndex === guide.steps.length - 1 ? <button type="button" onClick={close} className="rounded-xl bg-[#0d8e43] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#087235]">Finalizar</button> : <button type="button" onClick={() => setStepIndex((index) => index + 1)} className="inline-flex items-center gap-1 rounded-xl bg-[#0d8e43] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#087235]">Siguiente <ChevronRight className="h-4 w-4" /></button>}
            </div>
          </div>
        </section>
      </div>,
    document.body,
  );
}
