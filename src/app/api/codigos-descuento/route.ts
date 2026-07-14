import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generarCodigoUnico(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) code += '-';
  }
  return code;
}

// POST /api/codigos-descuento — generar código
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      clienteCedula?: string; clienteNombre?: string; aliadoId?: string;
      aliadoNombre?: string; aliadoLoginId?: string; aliadoDepartamento?: string;
      aliadoMunicipio?: string; aliadoCategoria?: string; aliadoSubcategoria?: string;
      descuentoEtiqueta?: string; descuentoPorcentaje?: number;
    };

    const clienteCedula = body.clienteCedula?.trim() ?? '';
    const clienteNombre = body.clienteNombre?.trim() ?? '';
    const aliadoId      = body.aliadoId?.trim() ?? '';

    if (!clienteCedula || !clienteNombre || !aliadoId) {
      return NextResponse.json(
        { ok: false, message: 'Faltan campos: clienteCedula, clienteNombre, aliadoId.' },
        { status: 400 },
      );
    }

    // Si ya existe un código activo para este cliente+aliado, devolvemos el mismo
    const existing = await query<{ id: string; codigo: string }>(
      `SELECT id, codigo FROM codigos_descuento
        WHERE cliente_cedula = ? AND aliado_id = ? AND estado = 'active'
        ORDER BY creado_en DESC LIMIT 1`,
      [clienteCedula, aliadoId],
    );

    if (existing.length > 0) {
      return NextResponse.json({ ok: true, codigo: existing[0].codigo, nuevo: false });
    }

    const codigo    = generarCodigoUnico();
    const expiraEn  = new Date(Date.now() + 24 * 60 * 60 * 1000)
                        .toISOString().slice(0, 19).replace('T', ' ');

    await execute(
      `INSERT INTO codigos_descuento
         (codigo, cliente_cedula, cliente_nombre, aliado_id, aliado_nombre,
          aliado_login_id, aliado_departamento, aliado_municipio,
          aliado_categoria, aliado_subcategoria,
          descuento_etiqueta, descuento_porcentaje, expira_en)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo, clienteCedula, clienteNombre, aliadoId,
        body.aliadoNombre ?? '', body.aliadoLoginId ?? '',
        body.aliadoDepartamento ?? '', body.aliadoMunicipio ?? '',
        body.aliadoCategoria ?? '', body.aliadoSubcategoria ?? '',
        body.descuentoEtiqueta ?? '', body.descuentoPorcentaje ?? 0,
        expiraEn,
      ],
    );

    return NextResponse.json({ ok: true, codigo, expiraEn, nuevo: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/codigos-descuento]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
