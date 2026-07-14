import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CodigoRow { estado: string; descuento_porcentaje: number; expira_en: string; }

// PATCH /api/codigos-descuento/:id/canjear
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id }         = await params;
    const body           = await request.json() as { valorConsumido?: number; canjeadoPor?: string };
    const valorConsumido = Number(body.valorConsumido ?? 0);

    if (!valorConsumido || valorConsumido <= 0) {
      return NextResponse.json(
        { ok: false, message: 'valorConsumido debe ser mayor que 0.' },
        { status: 400 },
      );
    }

    const rows = await query<CodigoRow>(
      'SELECT estado, descuento_porcentaje, expira_en FROM codigos_descuento WHERE id = ?',
      [id],
    );

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, message: 'Código no encontrado.' }, { status: 404 });
    }

    const row = rows[0];

    if (row.estado !== 'active') {
      return NextResponse.json({ ok: false, message: `El código ya fue ${row.estado}.` }, { status: 409 });
    }

    if (new Date(row.expira_en) < new Date()) {
      await execute('UPDATE codigos_descuento SET estado = ? WHERE id = ?', ['expired', id]);
      return NextResponse.json({ ok: false, message: 'El código está expirado.' }, { status: 409 });
    }

    const valorDescuento  = +(valorConsumido * (row.descuento_porcentaje / 100)).toFixed(2);
    const totalDespuesDto = +(valorConsumido - valorDescuento).toFixed(2);

    await execute(
      `UPDATE codigos_descuento
          SET estado            = 'redeemed',
              valor_consumido   = ?,
              valor_descuento   = ?,
              total_despues_dto = ?,
              canjeado_por      = ?,
              canjeado_en       = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [valorConsumido, valorDescuento, totalDespuesDto, body.canjeadoPor ?? null, id],
    );

    return NextResponse.json({ ok: true, valorConsumido, valorDescuento, totalDespuesDto });
  } catch (err) {
    console.error('[PATCH /api/codigos-descuento/:id/canjear]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
