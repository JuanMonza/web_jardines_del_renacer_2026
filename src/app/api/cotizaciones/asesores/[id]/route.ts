import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  hasPermission,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

async function coordinator(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "quotes.update",
  );
  return session && hasPermission(session, "quotes.view.all") ? session : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await coordinator(request);
  if (!session)
    return NextResponse.json(
      { message: "Solo un coordinador puede gestionar asesores." },
      { status: 403 },
    );
  try {
    const { id } = await params;
    if (!/^\d+$/.test(id))
      return NextResponse.json(
        { message: "Asesor inválido." },
        { status: 400 },
      );
    const body = (await request.json()) as {
      nombre?: string;
      email?: string;
      cargo?: string;
      password?: string;
      rol?: "gestor" | "coordinador";
      activo?: boolean;
    };
    const user = (
      await query<{
        id: number;
        nombres: string;
        apellidos: string;
        cargo: string | null;
        activo: number;
      }>(
        `SELECT u.id, u.nombres, u.apellidos, u.cargo, u.activo FROM admin_users u
       INNER JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE
       INNER JOIN roles r ON r.id = aur.role_id AND r.deleted_at IS NULL
       WHERE u.id = ? AND u.deleted_at IS NULL AND r.nombre IN ('Gestor de Cotizaciones', 'Coordinador de Cotizaciones') LIMIT 1`,
        [id],
      )
    )[0];
    if (!user)
      return NextResponse.json(
        { message: "Asesor no encontrado." },
        { status: 404 },
      );
    if (user.id === session.userId && body.activo === false)
      return NextResponse.json(
        { message: "No puedes suspender tu propio acceso." },
        { status: 400 },
      );
    const fullName =
      typeof body.nombre === "string"
        ? body.nombre.trim()
        : `${user.nombres} ${user.apellidos}`;
    const parts = fullName.split(/\s+/).filter(Boolean);
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const cargo =
      typeof body.cargo === "string" ? body.cargo.trim() : user.cargo || "";
    if (
      parts.length < 2 ||
      !/^[\p{L}\s'.-]{4,240}$/u.test(fullName) ||
      !/^[\p{L}\s]{2,120}$/u.test(cargo) ||
      !/^\S+@\S+\.\S+$/.test(email)
    )
      return NextResponse.json(
        { message: "Verifica el nombre completo, el cargo y el correo." },
        { status: 400 },
      );
    const duplicate = await query<{ id: number }>(
      "SELECT id FROM admin_users WHERE email = ? AND id <> ? AND deleted_at IS NULL LIMIT 1",
      [email, id],
    );
    if (duplicate[0])
      return NextResponse.json(
        { message: "Ese correo ya está en uso." },
        { status: 409 },
      );
    const password = typeof body.password === "string" ? body.password : "";
    if (password && (password.length < 12 || password.length > 128))
      return NextResponse.json(
        { message: "La nueva contraseña debe tener al menos 12 caracteres." },
        { status: 400 },
      );
    const active =
      typeof body.activo === "boolean" ? body.activo : Boolean(user.activo);
    await execute(
      "UPDATE admin_users SET nombres = ?, apellidos = ?, email = ?, cargo = ?, activo = ?, password_hash = COALESCE(?, password_hash) WHERE id = ?",
      [
        parts[0],
        parts.slice(1).join(" "),
        email,
        cargo,
        active,
        password ? await bcrypt.hash(password, 12) : null,
        id,
      ],
    );
    if (body.rol) {
      const roleName =
        body.rol === "coordinador"
          ? "Coordinador de Cotizaciones"
          : "Gestor de Cotizaciones";
      const role = (
        await query<{ id: number }>(
          "SELECT id FROM roles WHERE nombre = ? AND activo = TRUE AND deleted_at IS NULL LIMIT 1",
          [roleName],
        )
      )[0];
      if (!role) throw new Error("Rol no encontrado.");
      await execute(
        "UPDATE admin_user_roles SET activo = FALSE WHERE admin_user_id = ? AND role_id IN (SELECT id FROM roles WHERE nombre IN (?, ?))",
        [id, "Gestor de Cotizaciones", "Coordinador de Cotizaciones"],
      );
      await execute(
        "INSERT INTO admin_user_roles (admin_user_id, role_id, activo) VALUES (?, ?, TRUE) ON DUPLICATE KEY UPDATE activo = TRUE",
        [id, role.id],
      );
    }
    return NextResponse.json({ ok: true, message: "Asesor actualizado." });
  } catch (error) {
    console.error("[PATCH /api/cotizaciones/asesores/:id]", error);
    return NextResponse.json(
      { message: "No fue posible actualizar el asesor." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await coordinator(request);
  if (!session)
    return NextResponse.json(
      { message: "Solo un coordinador puede eliminar asesores." },
      { status: 403 },
    );
  const { id } = await params;
  if (Number(id) === session.userId)
    return NextResponse.json(
      { message: "No puedes eliminar tu propio acceso." },
      { status: 400 },
    );
  const result = await execute(
    `UPDATE admin_users u INNER JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE
     INNER JOIN roles r ON r.id = aur.role_id AND r.deleted_at IS NULL
     SET u.activo = FALSE, u.deleted_at = NOW()
     WHERE u.id = ? AND u.deleted_at IS NULL AND r.nombre IN ('Gestor de Cotizaciones', 'Coordinador de Cotizaciones')`,
    [id],
  );
  if (!result.affectedRows)
    return NextResponse.json(
      { message: "Asesor no encontrado." },
      { status: 404 },
    );
  return NextResponse.json({
    ok: true,
    message: "Asesor eliminado. Su historial se conserva.",
  });
}
