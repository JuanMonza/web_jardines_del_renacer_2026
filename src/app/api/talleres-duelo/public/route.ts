import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const talleres = await query<{id:number;titulo:string;fecha_label:string;fecha:string|null;lugar:string;activo:number}>('SELECT id,titulo,fecha_label,fecha,lugar,activo FROM talleres_duelo WHERE activo=TRUE AND deleted_at IS NULL ORDER BY fecha IS NULL,fecha ASC');
    const albums = await query<{id:number;taller_id:number;titulo:string;fecha_label:string;fecha:string|null;descripcion:string|null;activo:number}>('SELECT id,taller_id,titulo,fecha_label,fecha,descripcion,activo FROM talleres_duelo_albumes WHERE activo=TRUE AND deleted_at IS NULL ORDER BY fecha DESC');
    const images = await query<{id:number;album_id:number;imagen:string;alt:string;descripcion:string|null}>('SELECT id,album_id,imagen,alt,descripcion FROM talleres_duelo_imagenes ORDER BY orden,id');
    return NextResponse.json({ data: { talleres: talleres.map((t) => ({ id:String(t.id),titulo:t.titulo,fecha:t.fecha_label,fechaISO:t.fecha ?? undefined,lugar:t.lugar,activo:Boolean(t.activo) })), albums: albums.map((a) => ({ id:String(a.id),tallerId:String(a.taller_id),titulo:a.titulo,fecha:a.fecha_label,fechaISO:a.fecha ?? '',descripcion:a.descripcion ?? '',activo:Boolean(a.activo),createdAt:'',updatedAt:'',images:images.filter(i=>i.album_id===a.id).map(i=>({id:String(i.id),src:i.imagen,alt:i.alt,caption:i.descripcion ?? ''})) })) } });
  } catch { return NextResponse.json({ data: null, message: 'Sin contenido publicado en base de datos.' }, { status: 503 }); }
}
