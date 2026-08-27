import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
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
  if (!session || !hasPermission(session, "quotes.view.all"))
    return NextResponse.json(
      { message: "Solo el coordinador puede descargar el reporte completo." },
      { status: 403 },
    );
  try {
    const { searchParams } = new URL(request.url);
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const asesor = searchParams.get("asesor");
    const conditions: string[] = [];
    const values: Array<string | number> = [];
    if (desde) {
      conditions.push("DATE(c.creado_en) >= ?");
      values.push(desde);
    }
    if (hasta) {
      conditions.push("DATE(c.creado_en) <= ?");
      values.push(hasta);
    }
    if (asesor && /^\d+$/.test(asesor)) {
      conditions.push("c.asesor_id = ?");
      values.push(Number(asesor));
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const cotizaciones = await query(
      `SELECT c.*, TRIM(CONCAT(COALESCE(a.nombres, ''), ' ', COALESCE(a.apellidos, ''))) AS asesor_nombre
       FROM cotizaciones c LEFT JOIN admin_users a ON a.id = c.asesor_id ${where} ORDER BY c.creado_en DESC`,
      values,
    );
    const ids = (cotizaciones as Array<{ id: string }>).map(({ id }) => id);
    const historial = ids.length
      ? await query(
          `SELECT h.cotizacion_id, h.tipo, h.detalle, h.creado_en, TRIM(CONCAT(COALESCE(a.nombres, ''), ' ', COALESCE(a.apellidos, ''))) AS responsable
       FROM cotizacion_historial h LEFT JOIN admin_users a ON a.id = h.admin_user_id WHERE h.cotizacion_id IN (${ids.map(() => "?").join(",")}) ORDER BY h.creado_en DESC`,
          ids,
        )
      : [];
    return NextResponse.json(
      { ok: true, cotizaciones, historial },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET /api/cotizaciones/reporte]", error);
    return NextResponse.json(
      { message: "No fue posible generar el reporte." },
      { status: 500 },
    );
  }
}
