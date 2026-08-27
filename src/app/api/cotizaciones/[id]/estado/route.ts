import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  hasPermission,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const ESTADOS_VALIDOS = [
  "nuevo",
  "contactado",
  "en_negociacion",
  "convertido",
  "descartado",
] as const;
type QuoteStatus = (typeof ESTADOS_VALIDOS)[number];
type QuoteRow = { estado: QuoteStatus; asesor_id: number | null };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminPermission(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
      "quotes.view",
    );
    if (!session)
      return NextResponse.json(
        { ok: false, message: "No autorizado." },
        { status: 403 },
      );
    const { id } = await params;
    const canViewAll = hasPermission(session, "quotes.view.all");
    const quote = (
      await query<{ asesor_id: number | null }>(
        "SELECT asesor_id FROM cotizaciones WHERE id = ? LIMIT 1",
        [id],
      )
    )[0];
    if (!quote)
      return NextResponse.json(
        { ok: false, message: "Cotización no encontrada." },
        { status: 404 },
      );
    if (!canViewAll && quote.asesor_id !== session.userId)
      return NextResponse.json(
        { ok: false, message: "No autorizado." },
        { status: 403 },
      );
    const history = await query<{
      id: number;
      tipo: string;
      detalle: string;
      creado_en: string;
      asesor: string;
    }>(
      `SELECT h.id, h.tipo, h.detalle, h.creado_en, TRIM(CONCAT(COALESCE(u.nombres, ''), ' ', COALESCE(u.apellidos, ''))) AS asesor
     FROM cotizacion_historial h INNER JOIN cotizaciones c ON c.id = h.cotizacion_id LEFT JOIN admin_users u ON u.id = h.admin_user_id
     WHERE h.cotizacion_id = ? ${canViewAll ? "" : "AND c.asesor_id = ?"} ORDER BY h.creado_en DESC`,
      canViewAll ? [id] : [id, session.userId],
    );
    return NextResponse.json(
      { ok: true, data: history },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/cotizaciones/:id/estado]", err);
    return NextResponse.json(
      { ok: false, message: "No fue posible cargar el historial." },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminPermission(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
      "quotes.update",
    );
    if (!session)
      return NextResponse.json(
        { ok: false, message: "No autorizado." },
        { status: 403 },
      );
    const { id } = await params;
    const body = (await request.json()) as {
      estado?: string;
      notasAsesor?: string;
      asesorId?: number;
      proximoContacto?: string | null;
      motivoPerdida?: string;
    };
    if (!body.estado || !ESTADOS_VALIDOS.includes(body.estado as QuoteStatus))
      return NextResponse.json(
        { ok: false, message: "Estado inválido." },
        { status: 400 },
      );
    const current = (
      await query<QuoteRow>(
        "SELECT estado, asesor_id FROM cotizaciones WHERE id = ? LIMIT 1",
        [id],
      )
    )[0];
    if (!current)
      return NextResponse.json(
        { ok: false, message: "Cotización no encontrada." },
        { status: 404 },
      );
    const canViewAll = hasPermission(session, "quotes.view.all");
    if (!canViewAll && current.asesor_id !== session.userId)
      return NextResponse.json(
        {
          ok: false,
          message: "Solo puedes gestionar tus cotizaciones asignadas.",
        },
        { status: 403 },
      );
    const assignedTo =
      canViewAll && Number.isInteger(body.asesorId) && Number(body.asesorId) > 0
        ? Number(body.asesorId)
        : (current.asesor_id ?? session.userId);
    const reason =
      typeof body.motivoPerdida === "string"
        ? body.motivoPerdida.trim().slice(0, 200)
        : "";
    if (body.estado === "descartado" && !reason)
      return NextResponse.json(
        {
          ok: false,
          message: "Indica el motivo de pérdida para marcarla como perdida.",
        },
        { status: 400 },
      );
    const note =
      typeof body.notasAsesor === "string"
        ? body.notasAsesor.trim().slice(0, 2000)
        : null;
    const nextContact = body.proximoContacto
      ? new Date(body.proximoContacto)
      : null;
    if (nextContact && Number.isNaN(nextContact.getTime()))
      return NextResponse.json(
        { ok: false, message: "La fecha de seguimiento no es válida." },
        { status: 400 },
      );
    await execute(
      "UPDATE cotizaciones SET estado = ?, notas_asesor = COALESCE(?, notas_asesor), asesor_id = ?, proximo_contacto = ?, motivo_perdida = ?, primer_contacto_en = CASE WHEN ? IN ('contactado', 'en_negociacion', 'convertido') THEN COALESCE(primer_contacto_en, CURRENT_TIMESTAMP) ELSE primer_contacto_en END, actualizado_en = CURRENT_TIMESTAMP WHERE id = ?",
      [
        body.estado,
        note,
        assignedTo,
        nextContact
          ? nextContact.toISOString().slice(0, 19).replace("T", " ")
          : null,
        body.estado === "descartado" ? reason : null,
        body.estado,
        id,
      ],
    );
    const changes =
      [
        current.estado !== body.estado
          ? `Estado: ${current.estado} → ${body.estado}`
          : "",
        current.asesor_id !== assignedTo ? "Asesor asignado o actualizado" : "",
        note ? "Nota de seguimiento actualizada" : "",
        nextContact
          ? `Próximo contacto: ${nextContact.toLocaleString("es-CO")}`
          : "",
        body.estado === "descartado" ? `Motivo de pérdida: ${reason}` : "",
      ]
        .filter(Boolean)
        .join(" · ") || "Seguimiento actualizado";
    await execute(
      "INSERT INTO cotizacion_historial (cotizacion_id, admin_user_id, tipo, detalle) VALUES (?, ?, ?, ?)",
      [
        id,
        session.userId,
        current.estado !== body.estado ? "estado" : "seguimiento",
        changes,
      ],
    );
    return NextResponse.json(
      { ok: true, message: "Seguimiento actualizado." },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[PATCH /api/cotizaciones/:id/estado]", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
