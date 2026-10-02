import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
  verifyAdminPassword,
} from "@/lib/iam/admin-session";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.applications.update",
  );
  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") || 0) > 2048) {
    return NextResponse.json(
      { message: "La solicitud supera el tamaño permitido." },
      { status: 413 },
    );
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : "";
  const parsedBirthDate = new Date(`${birthDate}T12:00:00Z`);
  if (
    !/^\d+$/.test(id) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(birthDate) ||
    Number.isNaN(parsedBirthDate.getTime()) ||
    parsedBirthDate.toISOString().slice(0, 10) !== birthDate ||
    parsedBirthDate > new Date()
  ) {
    return NextResponse.json(
      { message: "Indica una fecha de nacimiento válida." },
      { status: 422 },
    );
  }
  if (!(await verifyAdminPassword(session, body.password))) {
    return NextResponse.json(
      { message: "La contraseña del administrador no es correcta." },
      { status: 401 },
    );
  }

  const candidates = await query<{ id: number; fecha_nacimiento: string | null }>(
    "SELECT id, fecha_nacimiento FROM candidatos WHERE id = ? AND deleted_at IS NULL LIMIT 1",
    [id],
  );
  if (!candidates[0]) {
    return NextResponse.json(
      { message: "No encontramos el perfil del postulante." },
      { status: 404 },
    );
  }

  await execute(
    "UPDATE candidatos SET fecha_nacimiento = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL",
    [birthDate, id],
  );
  await execute(
    `INSERT INTO activity_logs
      (usuario_tipo, accion, modulo, tabla_afectada, registro_id, descripcion)
     VALUES ('Admin','FECHA_NACIMIENTO_ACTUALIZADA','Vacantes','candidatos',?,?)`,
    [
      id,
      `Administrador ${session.name} (ID ${session.userId}) actualizó la fecha de nacimiento del postulante.`,
    ],
  );

  return NextResponse.json({ success: true, birthDate });
}
