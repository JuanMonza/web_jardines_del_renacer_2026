import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";
import { repairMojibake } from "@/lib/text-encoding";
import {
  ensureWorkshopManagementTables,
  getWorkshopSettings,
  recordWorkshopActivity,
  saveWorkshopSettings,
  type WorkshopSettings,
} from "@/lib/workshop-management";
import {
  sendWorkshopCancellation,
  sendWorkshopUpdate,
} from "@/lib/workshop-mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TallerRow = {
  id: number;
  titulo: string;
  fecha_label: string;
  fecha: string | null;
  lugar: string;
  descripcion: string | null;
  imagen: string | null;
  activo: number;
  created_at: string;
  updated_at: string;
};
type AlbumRow = {
  id: number;
  taller_id: number;
  titulo: string;
  fecha_label: string;
  fecha: string | null;
  descripcion: string | null;
  activo: number;
  created_at: string;
  updated_at: string;
};
type ImageRow = {
  id: number;
  album_id: number;
  imagen: string;
  alt: string;
  descripcion: string | null;
  orden: number;
};

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
function validImage(value: unknown) {
  return (
    typeof value === "string" &&
    /^data:image\/(png|jpe?g|webp);base64,/i.test(value) &&
    value.length <= 2_800_000
  );
}
function cleanConnectionUrl(value: unknown) {
  const url = clean(value, 500);
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol)
      ? parsed.toString()
      : "";
  } catch {
    return "";
  }
}

async function getData() {
  await ensureWorkshopManagementTables();
  const talleres = await query<TallerRow>(
    "SELECT id,titulo,fecha_label,fecha,lugar,descripcion,imagen,activo,created_at,updated_at FROM talleres_duelo WHERE deleted_at IS NULL ORDER BY fecha IS NULL, fecha ASC, id DESC",
  );
  const albums = await query<AlbumRow>(
    "SELECT id,taller_id,titulo,fecha_label,fecha,descripcion,activo,created_at,updated_at FROM talleres_duelo_albumes WHERE deleted_at IS NULL ORDER BY fecha IS NULL, fecha DESC, id DESC",
  );
  const images = await query<ImageRow>(
    "SELECT id,album_id,imagen,alt,descripcion,orden FROM talleres_duelo_imagenes ORDER BY orden,id",
  );
  const settings = await getWorkshopSettings(talleres.map((item) => item.id));
  const registrations = await query<{
    taller_id: number;
    confirmed: number;
    waiting: number;
  }>(
    "SELECT taller_id,SUM(estado='CONFIRMADA') AS confirmed,SUM(estado='LISTA_ESPERA') AS waiting FROM talleres_duelo_inscripciones GROUP BY taller_id",
  );
  return {
    talleres: talleres.map((item) => {
      const detail = settings.get(item.id)!;
      const registered = registrations.find(
        (row) => Number(row.taller_id) === item.id,
      );
      return {
        ...item,
        titulo: repairMojibake(item.titulo),
        fecha_label: repairMojibake(item.fecha_label),
        lugar: repairMojibake(item.lugar),
        descripcion: repairMojibake(item.descripcion),
        activo: Boolean(item.activo),
        ...detail,
        confirmedCount: Number(registered?.confirmed || 0),
        waitingCount: Number(registered?.waiting || 0),
      };
    }),
    albums: albums.map((item) => ({
      ...item,
      titulo: repairMojibake(item.titulo),
      fecha_label: repairMojibake(item.fecha_label),
      descripcion: repairMojibake(item.descripcion),
      activo: Boolean(item.activo),
      images: images
        .filter((image) => image.album_id === item.id)
        .map((image) => ({
          ...image,
          alt: repairMojibake(image.alt),
          descripcion: repairMojibake(image.descripcion),
        })),
    })),
  };
}

async function notifyWorkshopRegistrations(input: {
  workshopId: number;
  type: "updated" | "cancelled";
  title: string;
  date: string;
  place: string;
  connectionUrl?: string;
}) {
  const registrations = await query<{ nombre: string; email: string }>(
    "SELECT nombre,email FROM talleres_duelo_inscripciones WHERE taller_id=? AND estado IN ('CONFIRMADA','LISTA_ESPERA')",
    [input.workshopId],
  );
  let sent = 0;
  for (const registration of registrations) {
    try {
      const status = input.type === "cancelled"
        ? await sendWorkshopCancellation({ ...input, email: registration.email, name: registration.nombre })
        : await sendWorkshopUpdate({ ...input, email: registration.email, name: registration.nombre });
      if (status === "ENVIADO") sent += 1;
    } catch (error) {
      console.error("No fue posible notificar actualización de taller:", error);
    }
  }
  return { total: registrations.length, sent };
}

export async function GET(request: NextRequest) {
  if (
    !(await requireAdminPermission(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
      "workshops.view",
    ))
  )
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  try {
    return NextResponse.json({ data: await getData() });
  } catch (error) {
    console.error("GET talleres:", error);
    return NextResponse.json(
      {
        message:
          "No fue posible cargar los talleres. Verifica que la migración MySQL esté aplicada.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = clean(body.action, 40);
    const permission = action.includes("delete")
      ? "workshops.delete"
      : action.includes("save")
        ? body.id
          ? "workshops.update"
          : "workshops.create"
        : "";
    const session = permission
      ? await requireAdminPermission(
          request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
          permission,
        )
      : null;
    if (!session)
      return NextResponse.json({ message: "No autorizado." }, { status: 403 });

    if (action === "save-taller") {
      const titulo = clean(body.titulo, 180);
      const fechaLabel = clean(body.fechaLabel, 100);
      const lugar = clean(body.lugar, 180);
      const fecha = clean(body.fecha, 10) || null;
      const descripcion = clean(body.descripcion, 4000) || null;
      const imagen = validImage(body.imagen) ? (body.imagen as string) : null;
      const activo = body.activo !== false;
      if (!titulo || !fechaLabel || !lugar)
        return NextResponse.json(
          { message: "Completa título, fecha visible y lugar." },
          { status: 422 },
        );
      const id = Number(body.id);
      let workshopId = id;
      const isEditing = Number.isSafeInteger(id) && id > 0;
      const previous = isEditing
        ? (await query<Pick<TallerRow, "fecha_label" | "fecha" | "lugar" | "titulo">>(
            "SELECT titulo,fecha_label,fecha,lugar FROM talleres_duelo WHERE id=? AND deleted_at IS NULL LIMIT 1",
            [id],
          ))[0]
        : undefined;
      const previousSettings = isEditing
        ? (await getWorkshopSettings([id])).get(id)
        : undefined;
      if (Number.isSafeInteger(id) && id > 0)
        await execute(
          "UPDATE talleres_duelo SET titulo=?,fecha_label=?,fecha=?,lugar=?,descripcion=?,imagen=COALESCE(?,imagen),activo=?,updated_by=? WHERE id=? AND deleted_at IS NULL",
          [
            titulo,
            fechaLabel,
            fecha,
            lugar,
            descripcion,
            imagen,
            activo,
            session.userId,
            id,
          ],
        );
      else {
        const result = await execute(
          "INSERT INTO talleres_duelo (titulo,fecha_label,fecha,lugar,descripcion,imagen,activo,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?)",
          [
            titulo,
            fechaLabel,
            fecha,
            lugar,
            descripcion,
            imagen,
            activo,
            session.userId,
            session.userId,
          ],
        );
        workshopId = Number(result.insertId);
      }
      const modality = ["Presencial", "Virtual", "Híbrido"].includes(
        String(body.modalidad),
      )
        ? (String(body.modalidad) as WorkshopSettings["modality"])
        : "Presencial";
      const connectionUrl = cleanConnectionUrl(body.urlConexion);
      const capacity = Number(body.cupos);
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 5000)
        return NextResponse.json(
          { message: "Define una cantidad de cupos entre 1 y 5000." },
          { status: 422 },
        );
      if (modality !== "Presencial" && !connectionUrl)
        return NextResponse.json(
          {
            message:
              "Incluye un enlace válido de conexión para un taller virtual o híbrido.",
          },
          { status: 422 },
        );
      await saveWorkshopSettings({
        workshopId,
        city: clean(body.ciudad, 120),
        modality,
        capacity,
        facilitator: clean(body.facilitador, 180),
        duration: clean(body.duracion, 80),
        category: clean(body.categoria, 120) || "Acompañamiento en duelo",
        instructions: clean(body.instrucciones, 4000),
        connectionUrl,
      });
      await recordWorkshopActivity({
        workshopId,
        adminUserId: session.userId,
        action:
          Number.isSafeInteger(id) && id > 0
            ? "TALLER_ACTUALIZADO"
            : "TALLER_CREADO",
        detail: titulo,
      });
      const relevantChange = Boolean(
        previous && (
          previous.fecha_label !== fechaLabel ||
          previous.fecha !== fecha ||
          previous.lugar !== lugar ||
          previousSettings?.duration !== clean(body.duracion, 80) ||
          previousSettings?.modality !== modality ||
          previousSettings?.connectionUrl !== connectionUrl
        ),
      );
      if (relevantChange) {
        const notification = await notifyWorkshopRegistrations({
          workshopId,
          type: "updated",
          title: repairMojibake(titulo),
          date: repairMojibake(fechaLabel),
          place: repairMojibake(lugar),
          connectionUrl,
        });
        await recordWorkshopActivity({
          workshopId,
          adminUserId: session.userId,
          action: "CORREO_ACTUALIZACION",
          detail: `Actualización notificada a ${notification.sent} de ${notification.total} inscritos.`,
        });
      }
    } else if (action === "delete-taller") {
      const id = Number(body.id);
      if (!Number.isSafeInteger(id) || id < 1)
        return NextResponse.json(
          { message: "Taller inválido." },
          { status: 422 },
        );
      const workshop = (await query<Pick<TallerRow, "titulo" | "fecha_label" | "lugar">>(
        "SELECT titulo,fecha_label,lugar FROM talleres_duelo WHERE id=? AND deleted_at IS NULL LIMIT 1",
        [id],
      ))[0];
      const detail = (await getWorkshopSettings([id])).get(id);
      if (!workshop)
        return NextResponse.json({ message: "Taller no encontrado." }, { status: 404 });
      await execute(
        "UPDATE talleres_duelo SET activo=FALSE,deleted_at=NOW(),updated_by=? WHERE id=? AND deleted_at IS NULL",
        [session.userId, id],
      );
      await recordWorkshopActivity({
        workshopId: id,
        adminUserId: session.userId,
        action: "TALLER_DESACTIVADO",
        detail: "Taller desactivado desde el panel administrativo.",
      });
      const notification = await notifyWorkshopRegistrations({
        workshopId: id,
        type: "cancelled",
        title: repairMojibake(workshop.titulo),
        date: repairMojibake(workshop.fecha_label),
        place: repairMojibake(workshop.lugar),
        connectionUrl: detail?.connectionUrl,
      });
      await recordWorkshopActivity({
        workshopId: id,
        adminUserId: session.userId,
        action: "CORREO_CANCELACION",
        detail: `Cancelación notificada a ${notification.sent} de ${notification.total} inscritos.`,
      });
    } else if (action === "save-album") {
      const tallerId = Number(body.tallerId);
      const titulo = clean(body.titulo, 180);
      const fechaLabel = clean(body.fechaLabel, 100);
      const fecha = clean(body.fecha, 10) || null;
      const descripcion = clean(body.descripcion, 4000) || null;
      const activo = body.activo !== false;
      const received = Array.isArray(body.images) ? body.images : [];
      const images = received
        .slice(0, 10)
        .filter(
          (image): image is Record<string, unknown> =>
            Boolean(image) &&
            typeof image === "object" &&
            validImage((image as Record<string, unknown>).imagen),
        );
      if (
        !Number.isSafeInteger(tallerId) ||
        tallerId < 1 ||
        !titulo ||
        !fechaLabel
      )
        return NextResponse.json(
          { message: "Relaciona el álbum con un taller y completa sus datos." },
          { status: 422 },
        );
      if (images.length === 0)
        return NextResponse.json(
          { message: "Carga al menos una imagen válida de máximo 2 MB." },
          { status: 422 },
        );
      const id = Number(body.id);
      let albumId = id;
      if (Number.isSafeInteger(id) && id > 0) {
        await execute(
          "UPDATE talleres_duelo_albumes SET taller_id=?,titulo=?,fecha_label=?,fecha=?,descripcion=?,activo=?,updated_by=? WHERE id=? AND deleted_at IS NULL",
          [
            tallerId,
            titulo,
            fechaLabel,
            fecha,
            descripcion,
            activo,
            session.userId,
            id,
          ],
        );
        await execute("DELETE FROM talleres_duelo_imagenes WHERE album_id=?", [
          id,
        ]);
      } else {
        const duplicate = await query<{ id: number }>(
          "SELECT id FROM talleres_duelo_albumes WHERE taller_id=? AND titulo=? AND (fecha <=> ?) AND deleted_at IS NULL LIMIT 1",
          [tallerId, titulo, fecha],
        );
        if (duplicate.length)
          return NextResponse.json(
            { message: "Ya existe un álbum activo con ese taller, título y fecha. Edítalo en lugar de crear otro." },
            { status: 409 },
          );
        const result = await execute(
          "INSERT INTO talleres_duelo_albumes (taller_id,titulo,fecha_label,fecha,descripcion,activo,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?)",
          [
            tallerId,
            titulo,
            fechaLabel,
            fecha,
            descripcion,
            activo,
            session.userId,
            session.userId,
          ],
        );
        albumId = Number(result.insertId);
      }
      for (const [index, image] of images.entries())
        await execute(
          "INSERT INTO talleres_duelo_imagenes (album_id,imagen,alt,descripcion,orden) VALUES (?,?,?,?,?)",
          [
            albumId,
            image.imagen,
            clean(image.alt, 180) || `Imagen ${index + 1}`,
            clean(image.descripcion, 280) || null,
            index,
          ],
        );
    } else if (action === "delete-album") {
      const id = Number(body.id);
      if (!Number.isSafeInteger(id) || id < 1)
        return NextResponse.json(
          { message: "Álbum inválido." },
          { status: 422 },
        );
      await execute(
        "UPDATE talleres_duelo_albumes SET activo=FALSE,deleted_at=NOW(),updated_by=? WHERE id=? AND deleted_at IS NULL",
        [session.userId, id],
      );
    } else
      return NextResponse.json(
        { message: "Operación inválida." },
        { status: 400 },
      );
    return NextResponse.json({ data: await getData() });
  } catch (error) {
    console.error("POST talleres:", error);
    return NextResponse.json(
      {
        message:
          "No fue posible guardar. Revisa los datos y que la migración MySQL esté aplicada.",
      },
      { status: 500 },
    );
  }
}
