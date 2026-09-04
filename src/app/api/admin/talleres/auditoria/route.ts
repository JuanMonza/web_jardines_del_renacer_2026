import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from "@/lib/iam/admin-session";
import { ensureWorkshopManagementTables, getWorkshopSettings } from "@/lib/workshop-management";
import { repairMojibake } from "@/lib/text-encoding";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "workshops.view");
  if (!session) return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  try {
    await ensureWorkshopManagementTables();
    const workshops = await query<{ id: number; titulo: string; fecha_label: string; fecha: string | null; lugar: string; activo: number; deleted_at: string | null; created_at: string; updated_at: string }>(
      "SELECT id,titulo,fecha_label,fecha,lugar,activo,deleted_at,created_at,updated_at FROM talleres_duelo ORDER BY deleted_at IS NULL DESC, fecha IS NULL, fecha DESC, id DESC",
    );
    const settings = await getWorkshopSettings(workshops.map((workshop) => workshop.id));
    const counts = await query<{ taller_id: number; confirmadas: number; espera: number; canceladas: number; asistieron: number; no_asistieron: number }>(
      "SELECT taller_id,SUM(estado='CONFIRMADA') confirmadas,SUM(estado='LISTA_ESPERA') espera,SUM(estado='CANCELADA') canceladas,SUM(asistencia='ASISTIÓ') asistieron,SUM(asistencia='NO_ASISTIÓ') no_asistieron FROM talleres_duelo_inscripciones GROUP BY taller_id",
    );
    const registrations = await query<{ taller_id: number; taller: string; nombre: string; email: string; telefono: string; estado: string; asistencia: string; observaciones: string | null; correo_estado: string; created_at: string; updated_at: string }>(
      "SELECT r.taller_id,t.titulo taller,r.nombre,r.email,r.telefono,r.estado,r.asistencia,r.observaciones,r.correo_estado,r.created_at,r.updated_at FROM talleres_duelo_inscripciones r INNER JOIN talleres_duelo t ON t.id=r.taller_id ORDER BY r.created_at DESC",
    );
    const movements = await query<{ id: number; taller_id: number; taller: string; accion: string; detalle: string | null; administrador: string | null; created_at: string }>(
      "SELECT l.id,l.taller_id,t.titulo taller,l.accion,l.detalle,TRIM(CONCAT(COALESCE(a.nombres,''),' ',COALESCE(a.apellidos,''))) administrador,l.created_at FROM talleres_duelo_activity_logs l INNER JOIN talleres_duelo t ON t.id=l.taller_id LEFT JOIN admin_users a ON a.id=l.admin_user_id ORDER BY l.created_at DESC,l.id DESC",
    );
    return NextResponse.json({ data: {
      workshops: workshops.map((workshop) => {
        const count = counts.find((item) => Number(item.taller_id) === workshop.id);
        const setting = settings.get(workshop.id);
        return { id: workshop.id, title: repairMojibake(workshop.titulo), date: repairMojibake(workshop.fecha_label), dateISO: workshop.fecha, place: repairMojibake(workshop.lugar), active: Boolean(workshop.activo) && !workshop.deleted_at, deletedAt: workshop.deleted_at, createdAt: workshop.created_at, updatedAt: workshop.updated_at, capacity: setting?.capacity || 20, confirmed: Number(count?.confirmadas || 0), waiting: Number(count?.espera || 0), cancelled: Number(count?.canceladas || 0), attended: Number(count?.asistieron || 0), absent: Number(count?.no_asistieron || 0) };
      }),
      registrations: registrations.map((registration) => ({ ...registration, taller: repairMojibake(registration.taller), nombre: repairMojibake(registration.nombre), observaciones: repairMojibake(registration.observaciones) })),
      movements: movements.map((movement) => ({ ...movement, taller: repairMojibake(movement.taller), detalle: repairMojibake(movement.detalle), administrador: repairMojibake(movement.administrador) })),
    } });
  } catch (error) {
    console.error("Auditoría talleres:", error);
    return NextResponse.json({ message: "No fue posible cargar la trazabilidad de talleres." }, { status: 500 });
  }
}
