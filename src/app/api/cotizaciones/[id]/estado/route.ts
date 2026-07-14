import { NextRequest, NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ESTADOS_VALIDOS = ['nuevo','contactado','en_negociacion','convertido','descartado'];

// PATCH /api/cotizaciones/:id/estado
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json() as { estado?: string; notasAsesor?: string; asesorId?: number };

    if (!body.estado || !ESTADOS_VALIDOS.includes(body.estado)) {
      return NextResponse.json(
        { ok: false, message: `Estado inválido. Permitidos: ${ESTADOS_VALIDOS.join(', ')}.` },
        { status: 400 },
      );
    }

    const result = await execute(
      `UPDATE cotizaciones
          SET estado        = ?,
              notas_asesor  = COALESCE(?, notas_asesor),
              asesor_id     = COALESCE(?, asesor_id),
              actualizado_en = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [body.estado, body.notasAsesor ?? null, body.asesorId ?? null, id],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ ok: false, message: 'Cotización no encontrada.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Estado actualizado.' });
  } catch (err) {
    console.error('[PATCH /api/cotizaciones/:id/estado]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
