import { NextRequest, NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CotizacionPayload {
  nombre?: string;
  telefono?: string;
  ciudad?: string;
  email?: string;
  planId?: string;
  planNombre?: string;
  cobertura?: string;
  numBeneficiarios?: number;
  contactoPreferido?: 'WhatsApp' | 'Llamada';
}

// POST /api/cotizaciones — guardar lead
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CotizacionPayload;

    const nombre   = body.nombre?.trim()   ?? '';
    const telefono = body.telefono?.trim() ?? '';
    const ciudad   = body.ciudad?.trim()   ?? '';
    const planId   = body.planId?.trim()   ?? '';

    if (!nombre || !telefono || !ciudad || !planId) {
      return NextResponse.json(
        { ok: false, message: 'Faltan campos: nombre, telefono, ciudad, planId.' },
        { status: 400 },
      );
    }

    const result = await execute(
      `INSERT INTO cotizaciones
         (nombre, telefono, ciudad, email, plan_id, plan_nombre,
          cobertura, num_beneficiarios, contacto_preferido)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        telefono,
        ciudad,
        body.email?.trim() ?? null,
        planId,
        body.planNombre?.trim() ?? null,
        body.cobertura?.trim() ?? 'individual',
        body.numBeneficiarios ?? 1,
        body.contactoPreferido ?? 'WhatsApp',
      ],
    );

    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/cotizaciones]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}

// GET /api/cotizaciones — listar (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const page   = Math.max(1, Number(searchParams.get('page')  ?? '1'));
    const limit  = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    const where  = estado ? 'WHERE estado = ?' : '';
    const params = estado ? [estado, limit, offset] : [limit, offset];

    const rows = await query(
      `SELECT * FROM cotizaciones ${where} ORDER BY creado_en DESC LIMIT ? OFFSET ?`,
      params,
    );

    const [{ total }] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM cotizaciones ${where}`,
      estado ? [estado] : [],
    );

    return NextResponse.json({ ok: true, data: rows, total, page, limit });
  } catch (err) {
    console.error('[GET /api/cotizaciones]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}

// ─── POST /api/cotizaciones — Guardar lead ─────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CotizacionPayload;

    const nombre = body.nombre?.trim() ?? '';
    const telefono = body.telefono?.trim() ?? '';
    const ciudad = body.ciudad?.trim() ?? '';
    const planId = body.planId?.trim() ?? '';

    if (!nombre || !telefono || !ciudad || !planId) {
      return NextResponse.json(
        { ok: false, message: 'Faltan campos obligatorios: nombre, telefono, ciudad, planId.' },
        { status: 400 },
      );
    }

    /*
     * ── CONEXIÓN A BASE DE DATOS (reemplazar con tu ORM/driver) ────────────
     *
     * Ejemplo con mysql2/promise:
     *
     *   import { getConnection } from '@/lib/db';
     *   const db = await getConnection();
     *   const [result] = await db.execute(
     *     `INSERT INTO cotizaciones
     *        (nombre, telefono, ciudad, email, plan_id, plan_nombre,
     *         cobertura, num_beneficiarios, contacto_preferido)
     *      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
     *     [
     *       nombre,
     *       telefono,
     *       ciudad,
     *       body.email?.trim() ?? null,
     *       planId,
     *       body.planNombre?.trim() ?? null,
     *       body.cobertura?.trim() ?? 'individual',
     *       body.numBeneficiarios ?? 1,
     *       body.contactoPreferido ?? 'WhatsApp',
     *     ],
     *   );
     *   const id = (result as any).insertId;
     *
     * ────────────────────────────────────────────────────────────────────────
     */

    // Placeholder hasta conectar BD
    const id = `cot-${Date.now()}`;

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}

// ─── GET /api/cotizaciones — Listar leads (admin) ─────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado') ?? null;
    const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    /*
     * Ejemplo con mysql2/promise:
     *
     *   const db = await getConnection();
     *   const where = estado ? 'WHERE estado = ?' : '';
     *   const params: unknown[] = estado ? [estado, limit, offset] : [limit, offset];
     *   const [rows] = await db.execute(
     *     `SELECT * FROM cotizaciones ${where} ORDER BY creado_en DESC LIMIT ? OFFSET ?`,
     *     params,
     *   );
     *   const [[{ total }]] = await db.execute(
     *     `SELECT COUNT(*) as total FROM cotizaciones ${where}`,
     *     estado ? [estado] : [],
     *   ) as any;
     *
     *   return NextResponse.json({ ok: true, data: rows, total, page, limit });
     */

    void estado; void offset;
    return NextResponse.json({ ok: true, data: [], total: 0, page, limit });
  } catch {
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
