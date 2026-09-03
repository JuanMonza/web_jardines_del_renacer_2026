import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { repairMojibake } from "@/lib/text-encoding";
import {
  ensureWorkshopManagementTables,
  getWorkshopSettings,
} from "@/lib/workshop-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureWorkshopManagementTables();
    const talleres = await query<{
      id: number;
      titulo: string;
      fecha_label: string;
      fecha: string | null;
      lugar: string;
      imagen: string | null;
      activo: number;
    }>(
      "SELECT id,titulo,fecha_label,fecha,lugar,imagen,activo FROM talleres_duelo WHERE activo=TRUE AND deleted_at IS NULL ORDER BY fecha IS NULL,fecha ASC",
    );
    const albums = await query<{
      id: number;
      taller_id: number;
      titulo: string;
      fecha_label: string;
      fecha: string | null;
      descripcion: string | null;
      activo: number;
    }>(
      "SELECT id,taller_id,titulo,fecha_label,fecha,descripcion,activo FROM talleres_duelo_albumes WHERE activo=TRUE AND deleted_at IS NULL ORDER BY fecha DESC",
    );
    const images = await query<{
      id: number;
      album_id: number;
      imagen: string;
      alt: string;
      descripcion: string | null;
    }>(
      "SELECT id,album_id,imagen,alt,descripcion FROM talleres_duelo_imagenes ORDER BY orden,id",
    );
    const settings = await getWorkshopSettings(talleres.map((item) => item.id));
    const registrations = await query<{ taller_id: number; confirmed: number }>(
      "SELECT taller_id,COUNT(*) AS confirmed FROM talleres_duelo_inscripciones WHERE estado='CONFIRMADA' GROUP BY taller_id",
    );
    return NextResponse.json({
      data: {
        talleres: talleres.map((taller) => {
          const detail = settings.get(taller.id)!;
          const registered = registrations.find(
            (item) => Number(item.taller_id) === taller.id,
          );
          return {
            id: String(taller.id),
            titulo: repairMojibake(taller.titulo),
            fecha: repairMojibake(taller.fecha_label),
            fechaISO: taller.fecha ?? undefined,
            lugar: repairMojibake(taller.lugar),
            imagen: taller.imagen,
            activo: Boolean(taller.activo),
            ciudad: detail.city,
            modalidad: detail.modality,
            cupos: detail.capacity,
            facilitador: detail.facilitator,
            duracion: detail.duration,
            categoria: detail.category,
            instrucciones: detail.instructions,
            urlConexion: detail.connectionUrl,
            inscritos: Number(registered?.confirmed || 0),
          };
        }),
        albums: albums.map((album) => ({
          id: String(album.id),
          tallerId: String(album.taller_id),
          titulo: repairMojibake(album.titulo),
          fecha: repairMojibake(album.fecha_label),
          fechaISO: album.fecha ?? "",
          descripcion: repairMojibake(album.descripcion),
          activo: Boolean(album.activo),
          createdAt: "",
          updatedAt: "",
          images: images
            .filter((image) => image.album_id === album.id)
            .map((image) => ({
              id: String(image.id),
              src: image.imagen,
              alt: repairMojibake(image.alt),
              caption: repairMojibake(image.descripcion),
            })),
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { data: null, message: "Sin contenido publicado en base de datos." },
      { status: 503 },
    );
  }
}
