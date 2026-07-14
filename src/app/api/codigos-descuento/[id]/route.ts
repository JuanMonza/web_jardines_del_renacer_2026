import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CodigoRow {
  id: string; codigo: string; cliente_nombre: string; cliente_cedula: string;
  aliado_nombre: string; descuento_etiqueta: string; descuento_porcentaje: number;
  estado: string; expira_en: string; canjeado_en: string | null;
}

// GET /api/codigos-descuento/:id — verificar validez por código
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: codigo } = await params;

    if (!codigo || codigo.length < 4) {
      return NextResponse.json({ ok: false, message: 'Código inválido.' }, { status: 400 });
    }

    const rows = await query<CodigoRow>(
      `SELECT id, codigo, cliente_nombre, cliente_cedula,
              aliado_nombre, descuento_etiqueta, descuento_porcentaje,
              estado, expira_en, canjeado_en
         FROM codigos_descuento
        WHERE codigo = ? LIMIT 1`,
      [codigo.toUpperCase()],
    );

    if (rows.length === 0) {
      return NextResponse.json({ ok: false, valido: false, message: 'Código no encontrado.' }, { status: 404 });
    }

    const row     = rows[0];
    const expirado = new Date(row.expira_en) < new Date();
    const valido   = row.estado === 'active' && !expirado;

    return NextResponse.json({ ok: true, valido, data: row });
  } catch (err) {
    console.error('[GET /api/codigos-descuento/:id]', err);
    return NextResponse.json({ ok: false, message: 'Error interno del servidor.' }, { status: 500 });
  }
}
