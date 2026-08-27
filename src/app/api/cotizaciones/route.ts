import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  hasPermission,
  requireAdminPermission,
} from "@/lib/iam/admin-session";
import { PLANS_CONFIG } from "@/config/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const MAX_TRACKED_IPS = 10_000;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const bucket = requestBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    if (!bucket && requestBuckets.size >= MAX_TRACKED_IPS) {
      for (const [key, value] of requestBuckets) {
        if (value.resetAt <= now) requestBuckets.delete(key);
      }
      // Evita que una lluvia de IPs agote memoria en una sola instancia.
      if (requestBuckets.size >= MAX_TRACKED_IPS)
        return RATE_LIMIT_WINDOW_MS / 1000;
    }
    requestBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return null;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX_REQUESTS
    ? Math.ceil((bucket.resetAt - now) / 1000)
    : null;
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

interface CotizacionPayload {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  ciudad?: string;
  email?: string;
  planId?: string;
  planNombre?: string;
  cobertura?: string;
  numBeneficiarios?: number;
  contactoPreferido?: "WhatsApp" | "Llamada";
  horaContacto?: string;
  website?: string;
}

const COVERAGE_TYPES = new Set([
  "individual",
  "familiar",
  "segmentado",
  "especial",
  "corporativo",
  "independiente",
]);

// POST /api/cotizaciones — guardar lead
export async function POST(request: NextRequest) {
  try {
    if (
      request.headers
        .get("content-type")
        ?.toLowerCase()
        .includes("application/json") !== true
    ) {
      return NextResponse.json(
        { ok: false, message: "Tipo de solicitud no válido." },
        { status: 415 },
      );
    }
    if (!isAllowedOrigin(request))
      return NextResponse.json(
        { ok: false, message: "Origen no autorizado." },
        { status: 403 },
      );
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 12_000)
      return NextResponse.json(
        { ok: false, message: "Solicitud demasiado grande." },
        { status: 413 },
      );
    const retryAfter = isRateLimited(getClientIp(request));
    if (retryAfter)
      return NextResponse.json(
        {
          ok: false,
          message: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    console.log(
      "[POST /api/cotizaciones] Iniciando proceso para guardar cotización.",
    );
    let body: CotizacionPayload;
    try {
      body = (await request.json()) as CotizacionPayload;
    } catch {
      return NextResponse.json(
        { ok: false, message: "El formato de la solicitud no es válido." },
        { status: 400 },
      );
    }

    const nombre = body.nombre?.trim() ?? "";
    const apellido = body.apellido?.trim() ?? "";
    const telefono = body.telefono?.trim() ?? "";
    const ciudad = body.ciudad?.trim() ?? "";
    const planId = body.planId?.trim() ?? "";

    const validName =
      /^[\p{L}\s]{2,150}$/u.test(nombre) &&
      /^[\p{L}\s]{2,150}$/u.test(apellido);
    const validPhone = /^\d{7,15}$/.test(telefono);
    const validCity = /^[\p{L}\s]{2,80}$/u.test(ciudad);
    const validPlan = /^[a-z0-9-]{2,60}$/i.test(planId);
    const knownPlan = Object.prototype.hasOwnProperty.call(
      PLANS_CONFIG,
      planId,
    );
    const validCoverage =
      typeof body.cobertura === "string" && COVERAGE_TYPES.has(body.cobertura);
    const beneficiaries = Number(body.numBeneficiarios ?? 1);
    const validBeneficiaries =
      Number.isInteger(beneficiaries) &&
      beneficiaries >= 1 &&
      beneficiaries <= 10_000;
    const validContact =
      body.contactoPreferido === "WhatsApp" ||
      body.contactoPreferido === "Llamada";
    const validContactTime =
      typeof body.horaContacto === "string" &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(body.horaContacto);
    if (
      body.website ||
      !nombre ||
      !apellido ||
      !telefono ||
      !ciudad ||
      !planId ||
      !validName ||
      !validPhone ||
      !validCity ||
      !validPlan ||
      !knownPlan ||
      !validCoverage ||
      !validBeneficiaries ||
      !validContact ||
      !validContactTime
    ) {
      console.warn(
        "[POST /api/cotizaciones] Solicitud rechazada por campos faltantes.",
        { nombre, telefono, ciudad, planId },
      );
      return NextResponse.json(
        { ok: false, message: "Los datos de la solicitud no son válidos." },
        { status: 400 },
      );
    }

    const selectedPlan = PLANS_CONFIG[planId as keyof typeof PLANS_CONFIG];
    console.log(
      "[POST /api/cotizaciones] Ejecutando inserción en la base de datos...",
    );
    const quoteId = randomUUID();
    const result = await execute(
      `INSERT INTO cotizaciones
         (id, nombre, apellido, telefono, ciudad, email, plan_id, plan_nombre,
          cobertura, num_beneficiarios, contacto_preferido, hora_contacto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quoteId,
        nombre,
        apellido,
        telefono,
        ciudad,
        body.email?.trim() ?? null,
        planId,
        selectedPlan.name,
        body.cobertura,
        beneficiaries,
        body.contactoPreferido,
        body.horaContacto,
      ],
    );
    await execute(
      "INSERT INTO cotizacion_historial (cotizacion_id, tipo, detalle) VALUES (?, ?, ?)",
      [quoteId, "creada", "Solicitud recibida desde el formulario público."],
    );

    // Solo coordinadores reciben la alerta inicial: ellos asignan el prospecto al gestor.
    const coordinators = await query<{ id: number }>(
      `SELECT DISTINCT aur.admin_user_id AS id
       FROM admin_user_roles aur
       INNER JOIN role_permissions rp ON rp.role_id = aur.role_id
       INNER JOIN permissions p ON p.id = rp.permission_id
       INNER JOIN admin_users u ON u.id = aur.admin_user_id
       WHERE aur.activo = TRUE AND u.activo = TRUE AND u.deleted_at IS NULL AND p.codigo = 'quotes.view.all'`,
    );
    await Promise.all(
      coordinators.map(({ id }) =>
        execute(
          "INSERT INTO cotizacion_notificaciones (admin_user_id, cotizacion_id, tipo, mensaje) VALUES (?, ?, ?, ?)",
          [
            id,
            quoteId,
            "nueva_cotizacion",
            `Nueva cotización de ${nombre} (${ciudad}). Pendiente de asignación.`,
          ],
        ),
      ),
    );

    console.log(
      `[POST /api/cotizaciones] Cotización guardada con éxito. ID: ${result.insertId}`,
    );
    return NextResponse.json(
      { ok: true, id: quoteId || result.insertId },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[POST /api/cotizaciones]", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 },
    );
  }
}

// GET /api/cotizaciones — listar (admin)
export async function GET(request: NextRequest) {
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
    console.log(
      "[GET /api/cotizaciones] Iniciando proceso para listar cotizaciones.",
    );
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const search = searchParams.get("q")?.trim();
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");
    const quickFilter = searchParams.get("filtro");
    const asesor = searchParams.get("asesor");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? "20")),
    );
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const filters: Array<string | number> = [];
    const canViewAll = hasPermission(session, "quotes.view.all");
    if (!canViewAll) {
      conditions.push("c.asesor_id = ?");
      filters.push(session.userId);
    } else if (asesor && /^\d+$/.test(asesor)) {
      conditions.push("c.asesor_id = ?");
      filters.push(Number(asesor));
    }
    if (estado) {
      conditions.push("c.estado = ?");
      filters.push(estado);
    }
    if (search) {
      conditions.push(
        "(c.nombre LIKE ? OR c.telefono LIKE ? OR c.ciudad LIKE ? OR c.plan_nombre LIKE ?)",
      );
      const value = `%${search}%`;
      filters.push(value, value, value, value);
    }
    if (desde) {
      conditions.push("DATE(c.creado_en) >= ?");
      filters.push(desde);
    }
    if (hasta) {
      conditions.push("DATE(c.creado_en) <= ?");
      filters.push(hasta);
    }
    if (quickFilter === "sin_gestionar") conditions.push("c.estado = 'nuevo'");
    if (quickFilter === "seguimiento_hoy")
      conditions.push("DATE(c.proximo_contacto) = CURRENT_DATE");
    if (quickFilter === "seguimiento_vencido")
      conditions.push(
        "c.proximo_contacto < NOW() AND c.estado NOT IN ('convertido', 'descartado')",
      );
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query(
      `SELECT c.*, TRIM(CONCAT(COALESCE(u.nombres, ''), ' ', COALESCE(u.apellidos, ''))) AS asesor_nombre
       FROM cotizaciones c LEFT JOIN admin_users u ON u.id = c.asesor_id ${where}
       ORDER BY c.creado_en DESC LIMIT ? OFFSET ?`,
      [...filters, limit, offset],
    );

    const [{ total }] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM cotizaciones c ${where}`,
      filters,
    );

    return NextResponse.json(
      { ok: true, data: rows, total, page, limit },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    console.error("[GET /api/cotizaciones]", err);
    return NextResponse.json(
      { ok: false, message: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
