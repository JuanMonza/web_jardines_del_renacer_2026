import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  hasPermission,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export async function PATCH(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "quotes.update",
  );
  if (!session || !hasPermission(session, "quotes.view.all"))
    return NextResponse.json(
      { message: "Solo el coordinador puede asignar cotizaciones." },
      { status: 403 },
    );
  try {
    const body = (await request.json()) as {
      ids?: string[];
      asesorId?: number;
    };
    const ids = Array.isArray(body.ids)
      ? [
          ...new Set(
            body.ids.filter(
              (id) => typeof id === "string" && /^[a-f0-9-]{36}$/i.test(id),
            ),
          ),
        ].slice(0, 100)
      : [];
    const asesorId = Number(body.asesorId);
    if (!ids.length || !Number.isInteger(asesorId) || asesorId < 1)
      return NextResponse.json(
        { message: "Selecciona cotizaciones y un gestor válido." },
        { status: 400 },
      );
    const adviser = await query<{ id: number }>(
      `SELECT u.id FROM admin_users u INNER JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE INNER JOIN roles r ON r.id = aur.role_id WHERE u.id = ? AND u.activo = TRUE AND u.deleted_at IS NULL AND r.nombre IN ('Gestor de Cotizaciones', 'Coordinador de Cotizaciones') LIMIT 1`,
      [asesorId],
    );
    if (!adviser[0])
      return NextResponse.json(
        { message: "El asesor seleccionado no está disponible." },
        { status: 400 },
      );
    const marks = ids.map(() => "?").join(",");
    await execute(
      `UPDATE cotizaciones SET asesor_id = ?, actualizado_en = CURRENT_TIMESTAMP WHERE id IN (${marks})`,
      [asesorId, ...ids],
    );
    await Promise.all(
      ids.map((id) =>
        execute(
          "INSERT INTO cotizacion_historial (cotizacion_id, admin_user_id, tipo, detalle) VALUES (?, ?, ?, ?)",
          [
            id,
            session.userId,
            "asignacion",
            "Cotización asignada de forma masiva.",
          ],
        ),
      ),
    );
    return NextResponse.json({
      ok: true,
      message: `${ids.length} cotización(es) asignada(s).`,
    });
  } catch (error) {
    console.error("[PATCH /api/cotizaciones/asignar]", error);
    return NextResponse.json(
      { message: "No fue posible realizar la asignación." },
      { status: 500 },
    );
  }
}
