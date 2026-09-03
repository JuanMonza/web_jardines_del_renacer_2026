import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.applications.view",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  try {
    const vacancies = await query<{
      id: string;
      title: string;
      city: string;
      department: string;
      closedAt: string;
    }>(
      "SELECT id,titulo AS title,ciudad AS city,departamento AS department,updated_at AS closedAt FROM vacantes WHERE estado='Cerrada' AND deleted_at IS NULL ORDER BY updated_at DESC",
    );
    const applications = await query<{
      vacancyId: string;
      id: string;
      name: string;
      document: string;
      email: string;
      phone: string;
      status: string;
      observation: string | null;
      appliedAt: string;
    }>(
      "SELECT CAST(p.vacante_id AS CHAR) AS vacancyId,CAST(p.id AS CHAR) AS id,CONCAT(c.nombres,' ',c.apellidos) AS name,c.documento AS document,c.email,c.telefono AS phone,p.estado AS status,p.observaciones_rh AS observation,p.created_at AS appliedAt FROM postulaciones p INNER JOIN candidatos c ON c.id=p.candidato_id INNER JOIN vacantes v ON v.id=p.vacante_id WHERE v.estado='Cerrada' AND p.deleted_at IS NULL ORDER BY p.created_at DESC",
    );
    return NextResponse.json({
      success: true,
      data: vacancies.map((vacancy) => ({
        ...vacancy,
        applications: applications.filter(
          (application) => application.vacancyId === String(vacancy.id),
        ),
      })),
    });
  } catch (error) {
    console.error("No fue posible consultar el historial de vacantes:", error);
    return NextResponse.json(
      { success: false, message: "No fue posible cargar el historial." },
      { status: 500 },
    );
  }
}
