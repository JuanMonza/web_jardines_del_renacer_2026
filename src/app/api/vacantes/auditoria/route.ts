import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export const dynamic = "force-dynamic";

function cleanRepeatedWords(value: string) {
  return value
    .replace(/\b([\p{L}]+)(?:\s+\1)\b/giu, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

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
    const data = await query<{
      createdAt: Date | string;
      action: string;
      description: string;
    }>(
      `SELECT l.created_at AS createdAt, l.accion AS action,
        COALESCE(NULLIF(NULLIF(l.descripcion, ''), 'Sin detalle disponible.'), CASE
          WHEN l.accion = 'POSTULANTE_NOTIFICADO' AND c.id IS NOT NULL
            THEN CONCAT('Postulante ', CONCAT(c.nombres, ' ', c.apellidos), ' notificado sobre “', COALESCE(v.titulo, 'su proceso de selección'), '”.')
          WHEN l.accion = 'POSTULANTE_NOTIFICADO' THEN 'Postulante notificado por correo. El registro histórico no contiene más detalle.'
          ELSE 'Movimiento histórico sin detalle disponible.'
        END) AS description
       FROM activity_logs l
       LEFT JOIN postulaciones p ON l.tabla_afectada = 'postulaciones' AND CAST(p.id AS CHAR) = CAST(l.registro_id AS CHAR)
       LEFT JOIN candidatos c ON c.id = p.candidato_id
       LEFT JOIN vacantes v ON v.id = p.vacante_id
       WHERE l.modulo = 'Vacantes' ORDER BY l.created_at DESC, l.id DESC`,
    );
    return NextResponse.json({
      success: true,
      data: data.map((item) => ({
        ...item,
        description: cleanRepeatedWords(item.description || ""),
      })),
    });
  } catch (error) {
    console.error("No fue posible consultar la auditoría de vacantes:", error);
    return NextResponse.json(
      { success: false, message: "No fue posible consultar los movimientos." },
      { status: 500 },
    );
  }
}
