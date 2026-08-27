import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  hasPermission,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "quotes.view",
  );
  if (!session)
    return NextResponse.json(
      { ok: false, message: "No autorizado." },
      { status: 403 },
    );
  const canViewAll = hasPermission(session, "quotes.view.all");
  try {
    const dueQuotes = await query<{
      id: string;
      nombre: string;
      proximo_contacto: string;
    }>(
      `SELECT id, nombre, proximo_contacto FROM cotizaciones WHERE proximo_contacto IS NOT NULL AND estado NOT IN ('convertido', 'descartado') AND ${canViewAll ? "TRUE" : "asesor_id = ?"} AND DATE(proximo_contacto) <= CURRENT_DATE`,
      canViewAll ? [] : [session.userId],
    );
    await Promise.all(
      dueQuotes.map((quote) => {
        const overdue =
          new Date(quote.proximo_contacto) <
          new Date(new Date().toDateString());
        const type = overdue ? "seguimiento_vencido" : "seguimiento_hoy";
        const message = overdue
          ? `Seguimiento vencido: ${quote.nombre}.`
          : `Seguimiento programado para hoy: ${quote.nombre}.`;
        return execute(
          `INSERT INTO cotizacion_notificaciones (admin_user_id, cotizacion_id, tipo, mensaje) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM cotizacion_notificaciones WHERE admin_user_id = ? AND cotizacion_id = ? AND tipo = ? AND DATE(creado_en) = CURRENT_DATE)`,
          [
            session.userId,
            quote.id,
            type,
            message,
            session.userId,
            quote.id,
            type,
          ],
        );
      }),
    );
  } catch (error) {
    // Un fallo puntual al crear recordatorios no debe impedir ver las notificaciones existentes.
    console.error(
      "[GET /api/cotizaciones/notificaciones] recordatorios",
      error,
    );
  }
  const data = await query<{
    id: number;
    mensaje: string;
    tipo: string;
    creado_en: string;
  }>(
    `SELECT n.id, n.mensaje, n.tipo, n.creado_en FROM cotizacion_notificaciones n
     WHERE n.admin_user_id = ? AND n.leida_en IS NULL
       AND (${canViewAll ? "TRUE" : "EXISTS (SELECT 1 FROM cotizaciones c WHERE c.id = n.cotizacion_id AND c.asesor_id = ?)"} )
     ORDER BY n.creado_en DESC LIMIT 10`,
    canViewAll ? [session.userId] : [session.userId, session.userId],
  );
  return NextResponse.json(
    { ok: true, data },
    { headers: { "Cache-Control": "no-store" } },
  );
}
