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
    console.log('[POST /api/cotizaciones] Iniciando proceso para guardar cotización.');
    const body = (await request.json()) as CotizacionPayload;

    const nombre   = body.nombre?.trim()   ?? '';
    const telefono = body.telefono?.trim() ?? '';
    const ciudad   = body.ciudad?.trim()   ?? '';
    const planId   = body.planId?.trim()   ?? '';

    if (!nombre || !telefono || !ciudad || !planId) {
      console.warn('[POST /api/cotizaciones] Solicitud rechazada por campos faltantes.', { nombre, telefono, ciudad, planId });
      return NextResponse.json(
        { ok: false, message: 'Faltan campos: nombre, telefono, ciudad, planId.' },
        { status: 400 },
      );
    }

    console.log('[POST /api/cotizaciones] Ejecutando inserción en la base de datos...');
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

    console.log(`[POST /api/cotizaciones] Cotización guardada con éxito. ID: ${result.insertId}`);
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/cotizaciones]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}

// GET /api/cotizaciones — listar (admin)
export async function GET(request: NextRequest) {
  try {
    console.log('[GET /api/cotizaciones] Iniciando proceso para listar cotizaciones.');
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const page   = Math.max(1, Number(searchParams.get('page')  ?? '1'));
    const limit  = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')));
    const offset = (page - 1) * limit;

    const where  = estado ? 'WHERE estado = ?' : '';
    const params = estado ? [estado, limit, offset] : [limit, offset];

    console.log(`[GET /api/cotizaciones] Consultando cotizaciones con:`, { where, params });
    const rows = await query(
      `SELECT * FROM cotizaciones ${where} ORDER BY creado_en DESC LIMIT ? OFFSET ?`,
      params,
    );

    console.log(`[GET /api/cotizaciones] Consultando conteo total...`);
    const [{ total }] = await query<{ total: number }>(
      `SELECT COUNT(*) as total FROM cotizaciones ${where}`,
      estado ? [estado] : [],
    );

    console.log(`[GET /api/cotizaciones] Consulta exitosa. Total: ${total}, Filas devueltas: ${rows.length}`);
    return NextResponse.json({ ok: true, data: rows, total, page, limit });
  } catch (err) {
    console.error('[GET /api/cotizaciones]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
