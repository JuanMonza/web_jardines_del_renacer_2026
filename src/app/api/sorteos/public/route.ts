import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const rows = await query<{id:number;titulo:string;descripcion:string|null;fecha_sorteo:string;imagen:string|null;nombre:string|null;numero_contrato:string|null}>(`SELECT s.id,s.titulo,s.descripcion,s.fecha_sorteo,s.imagen,p.nombre,p.numero_contrato FROM sorteos s LEFT JOIN sorteo_ganadores g ON g.sorteo_id=s.id AND g.validado=TRUE LEFT JOIN sorteo_participantes p ON p.id=g.participante_id WHERE s.estado IN ('PROGRAMADO','PUBLICADO') AND s.deleted_at IS NULL ORDER BY s.fecha_sorteo ASC`);
    return NextResponse.json({ data: rows.map(row=>({ id:`sorteo-${row.id}`,date:row.fecha_sorteo,title:row.titulo,description:row.descripcion ?? '',image:row.imagen ?? '/images/sorteos_img/images.jpg',winner:row.nombre?{name:row.nombre,ticket:row.numero_contrato ?? undefined}:undefined })) });
  } catch { return NextResponse.json({ data: null, message: 'Sin sorteos publicados en base de datos.' }, { status: 503 }); }
}
