import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";
import { repairMojibake } from "@/lib/text-encoding";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type SorteoRow = {
  id: number;
  titulo: string;
  descripcion: string | null;
  fecha_sorteo: string;
  premio: string | null;
  imagen: string | null;
  estado: string;
  created_at: string;
};
type WinnerRow = {
  sorteo_id: number;
  participante_id: number;
  posicion: number;
  validado: number;
  nombre: string;
  numero_contrato: string;
  seleccionado_at: string;
};
function text(value: unknown, length: number) {
  return typeof value === "string" ? value.trim().slice(0, length) : "";
}
function image(value: unknown) {
  return typeof value === "string" &&
    /^data:image\/(png|jpe?g|webp);base64,/i.test(value) &&
    value.length <= 2_800_000
    ? value
    : null;
}
async function data() {
  const sorteos = await query<SorteoRow>(
    "SELECT id,titulo,descripcion,fecha_sorteo,premio,imagen,estado,created_at FROM sorteos WHERE deleted_at IS NULL ORDER BY fecha_sorteo DESC",
  );
  const participants = await query<{
    sorteo_id: number;
    total: number;
    habilitados: number;
  }>(
    "SELECT sorteo_id,COUNT(*) total,SUM(habilitado=TRUE) habilitados FROM sorteo_participantes GROUP BY sorteo_id",
  );
  const winners = await query<WinnerRow>(
    "SELECT g.sorteo_id,g.participante_id,g.posicion,g.validado,p.nombre,p.numero_contrato,g.seleccionado_at FROM sorteo_ganadores g INNER JOIN sorteo_participantes p ON p.id=g.participante_id ORDER BY g.posicion",
  );
  return sorteos.map((sorteo) => ({
    ...sorteo,
    titulo: repairMojibake(sorteo.titulo),
    descripcion: repairMojibake(sorteo.descripcion),
    premio: repairMojibake(sorteo.premio),
    participantes: participants.find((row) => row.sorteo_id === sorteo.id) ?? {
      total: 0,
      habilitados: 0,
    },
    ganadores: winners
      .filter((winner) => winner.sorteo_id === sorteo.id)
      .map((winner) => ({
        ...winner,
        nombre: repairMojibake(winner.nombre),
        numero_contrato: repairMojibake(winner.numero_contrato),
        validado: Boolean(winner.validado),
      })),
  }));
}
export async function GET(request: NextRequest) {
  if (
    !(await requireAdminPermission(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
      "giveaways.view",
    ))
  )
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  try {
    return NextResponse.json({ data: await data() });
  } catch (error) {
    console.error("GET sorteos:", error);
    return NextResponse.json(
      {
        message:
          "No fue posible cargar los sorteos. Verifica que la migración MySQL esté aplicada.",
      },
      { status: 500 },
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = text(body.action, 40);
    const permission =
      action === "draw"
        ? "giveaways.draw"
        : action === "delete"
          ? "giveaways.delete"
          : action === "winner" ||
              action === "save" ||
              action === "participants" ||
              action === "validate"
            ? action === "winner" || body.id
              ? "giveaways.update"
              : "giveaways.create"
            : "";
    const session = permission
      ? await requireAdminPermission(
          request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
          permission,
        )
      : null;
    if (!session)
      return NextResponse.json({ message: "No autorizado." }, { status: 403 });
    if (action === "save") {
      const title = text(body.titulo, 180),
        date = text(body.fechaSorteo, 25),
        estado = [
          "BORRADOR",
          "PROGRAMADO",
          "CERRADO",
          "PUBLICADO",
          "CANCELADO",
        ].includes(text(body.estado, 20))
          ? text(body.estado, 20)
          : "BORRADOR";
      if (!title || !date)
        return NextResponse.json(
          { message: "Completa nombre y fecha del sorteo." },
          { status: 422 },
        );
      const id = Number(body.id);
      const values = [
        title,
        text(body.descripcion, 4000) || null,
        date,
        text(body.premio, 180) || null,
        image(body.imagen),
        estado,
        text(body.terminosUrl, 255) || null,
        session.userId,
      ];
      if (id > 0)
        await execute(
          "UPDATE sorteos SET titulo=?,descripcion=?,fecha_sorteo=?,premio=?,imagen=COALESCE(?,imagen),estado=?,terminos_url=?,updated_by=? WHERE id=? AND deleted_at IS NULL",
          [...values, id],
        );
      else
        await execute(
          "INSERT INTO sorteos (titulo,descripcion,fecha_sorteo,premio,imagen,estado,terminos_url,created_by,updated_by) VALUES (?,?,?,?,?,?,?,?,?)",
          [...values, session.userId],
        );
    } else if (action === "participants") {
      const sorteoId = Number(body.sorteoId);
      const rows = Array.isArray(body.participantes) ? body.participantes : [];
      if (!(sorteoId > 0) || !rows.length)
        return NextResponse.json(
          { message: "Carga al menos un participante válido." },
          { status: 422 },
        );
      for (const raw of rows.slice(0, 10000)) {
        const row = raw as Record<string, unknown>;
        const contrato = text(row.contrato, 80),
          nombre = text(row.nombre, 180);
        if (!contrato || !nombre) continue;
        await execute(
          "INSERT INTO sorteo_participantes (sorteo_id,numero_contrato,nombre,documento,telefono,email,habilitado) VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),documento=VALUES(documento),telefono=VALUES(telefono),email=VALUES(email),habilitado=VALUES(habilitado)",
          [
            sorteoId,
            contrato,
            nombre,
            text(row.documento, 40) || null,
            text(row.telefono, 50) || null,
            text(row.email, 160) || null,
            row.habilitado !== false,
          ],
        );
      }
      await execute(
        "INSERT INTO sorteo_activity_logs (sorteo_id,admin_user_id,accion,detalle) VALUES (?,?,?,?)",
        [
          sorteoId,
          session.userId,
          "PARTICIPANTES_CARGADOS",
          `${rows.length} registros recibidos`,
        ],
      );
    } else if (action === "winner") {
      const sorteoId = Number(body.sorteoId),
        nombre = text(body.nombre, 180),
        numeroContrato = text(body.numeroContrato, 80);
      if (!(sorteoId > 0) || !nombre || !numeroContrato)
        return NextResponse.json(
          { message: "Completa el nombre y número de contrato del ganador." },
          { status: 422 },
        );
      await execute(
        "INSERT INTO sorteo_participantes (sorteo_id,numero_contrato,nombre,documento,telefono,email,habilitado) VALUES (?,?,?,?,?,?,TRUE) ON DUPLICATE KEY UPDATE nombre=VALUES(nombre),documento=VALUES(documento),telefono=VALUES(telefono),email=VALUES(email),habilitado=TRUE",
        [sorteoId, numeroContrato, nombre, null, null, null],
      );
      const participant = await query<{ id: number }>(
        "SELECT id FROM sorteo_participantes WHERE sorteo_id=? AND numero_contrato=? LIMIT 1",
        [sorteoId, numeroContrato],
      );
      if (!participant[0]) throw Error("No se pudo registrar el ganador.");
      await execute("DELETE FROM sorteo_ganadores WHERE sorteo_id=?", [
        sorteoId,
      ]);
      await execute(
        "INSERT INTO sorteo_ganadores (sorteo_id,participante_id,posicion,seleccionado_por) VALUES (?,?,1,?)",
        [sorteoId, participant[0].id, session.userId],
      );
      await execute(
        "UPDATE sorteos SET estado='CERRADO',updated_by=? WHERE id=?",
        [session.userId, sorteoId],
      );
      await execute(
        "INSERT INTO sorteo_activity_logs (sorteo_id,admin_user_id,accion,detalle) VALUES (?,?,?,?)",
        [
          sorteoId,
          session.userId,
          "GANADOR_REGISTRADO_MANUALMENTE",
          `Ganador registrado manualmente: ${nombre} · Contrato ${numeroContrato}`,
        ],
      );
    } else if (action === "draw") {
      const sorteoId = Number(body.sorteoId);
      const active = await query<{ id: number }>(
        "SELECT id FROM sorteo_participantes WHERE sorteo_id=? AND habilitado=TRUE ORDER BY RAND() LIMIT 1",
        [sorteoId],
      );
      if (!active[0])
        return NextResponse.json(
          {
            message:
              "No hay participantes habilitados para realizar el sorteo.",
          },
          { status: 422 },
        );
      await execute("DELETE FROM sorteo_ganadores WHERE sorteo_id=?", [
        sorteoId,
      ]);
      await execute(
        "INSERT INTO sorteo_ganadores (sorteo_id,participante_id,posicion,seleccionado_por) VALUES (?,?,1,?)",
        [sorteoId, active[0].id, session.userId],
      );
      await execute(
        "UPDATE sorteos SET estado='CERRADO',updated_by=? WHERE id=?",
        [session.userId, sorteoId],
      );
      await execute(
        "INSERT INTO sorteo_activity_logs (sorteo_id,admin_user_id,accion,detalle) VALUES (?,?,?,?)",
        [
          sorteoId,
          session.userId,
          "GANADOR_SELECCIONADO",
          "Selección aleatoria ejecutada sobre participantes habilitados",
        ],
      );
    } else if (action === "validate") {
      const sorteoId = Number(body.sorteoId);
      await execute(
        "UPDATE sorteo_ganadores SET validado=TRUE,validado_por=?,validado_at=NOW() WHERE sorteo_id=?",
        [session.userId, sorteoId],
      );
      await execute(
        "UPDATE sorteos SET estado='PUBLICADO',updated_by=? WHERE id=?",
        [session.userId, sorteoId],
      );
    } else if (action === "delete") {
      const id = Number(body.id);
      if (!(id > 0))
        return NextResponse.json(
          { message: "Sorteo inválido." },
          { status: 422 },
        );
      await execute(
        "UPDATE sorteos SET estado='CANCELADO',deleted_at=NOW(),updated_by=? WHERE id=?",
        [session.userId, id],
      );
    } else
      return NextResponse.json(
        { message: "Operación inválida." },
        { status: 400 },
      );
    return NextResponse.json({ data: await data() });
  } catch (error) {
    console.error("POST sorteos:", error);
    return NextResponse.json(
      {
        message:
          "No fue posible guardar el sorteo. Revisa los datos y la migración MySQL.",
      },
      { status: 500 },
    );
  }
}
