import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { execute, query } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  hasPermission,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export async function GET(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "quotes.view",
  );
  if (!session)
    return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  const all = hasPermission(session, "quotes.view.all");
  const data = await query<{
    id: number;
    nombre: string;
    cedula: string;
    email: string;
    cargo: string | null;
    activo: number;
    rol: string;
  }>(
    `SELECT u.id, TRIM(CONCAT(u.nombres, ' ', u.apellidos)) AS nombre, u.cedula, u.email, u.cargo, u.activo,
      COALESCE(GROUP_CONCAT(DISTINCT r.nombre ORDER BY r.prioridad SEPARATOR ', '), '') AS rol
     FROM admin_users u INNER JOIN admin_user_roles aur ON aur.admin_user_id = u.id AND aur.activo = TRUE
     INNER JOIN roles r ON r.id = aur.role_id AND r.deleted_at IS NULL
     WHERE u.deleted_at IS NULL AND r.nombre IN ('Gestor de Cotizaciones', 'Coordinador de Cotizaciones') ${all ? "" : "AND u.id = ?"}
     GROUP BY u.id, u.nombres, u.apellidos, u.cedula, u.email, u.cargo, u.activo ORDER BY u.nombres, u.apellidos`,
    all ? [] : [session.userId],
  );
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "quotes.update",
  );
  if (!session || !hasPermission(session, "quotes.view.all"))
    return NextResponse.json(
      { message: "Solo un coordinador puede crear asesores." },
      { status: 403 },
    );
  try {
    const body = (await request.json()) as {
      cedula?: string;
      nombres?: string;
      apellidos?: string;
      email?: string;
      cargo?: string;
      password?: string;
      rol?: "gestor" | "coordinador";
    };
    const cedula = body.cedula?.replace(/\D/g, "") ?? "";
    const nombres = body.nombres?.trim() ?? "";
    const apellidos = body.apellidos?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const cargo = body.cargo?.trim() ?? "";
    const roleName =
      body.rol === "coordinador"
        ? "Coordinador de Cotizaciones"
        : "Gestor de Cotizaciones";
    if (
      !/^\d{6,20}$/.test(cedula) ||
      !/^[\p{L}\s'.-]{2,120}$/u.test(nombres) ||
      !/^[\p{L}\s'.-]{2,120}$/u.test(apellidos) ||
      !/^[\p{L}\s]{2,120}$/u.test(cargo) ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      password.length < 12 ||
      password.length > 128
    )
      return NextResponse.json(
        {
          message:
            "Verifica los datos. El cargo debe contener solo letras y la contraseña al menos 12 caracteres.",
        },
        { status: 400 },
      );
    const duplicate = await query<{ id: number }>(
      "SELECT id FROM admin_users WHERE cedula = ? OR email = ? LIMIT 1",
      [cedula, email],
    );
    if (duplicate[0])
      return NextResponse.json(
        { message: "Ya existe un usuario con esa cédula o correo." },
        { status: 409 },
      );
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await execute(
      "INSERT INTO admin_users (cedula, nombres, apellidos, email, cargo, password_hash, email_verificado, activo) VALUES (?, ?, ?, ?, ?, ?, TRUE, TRUE)",
      [cedula, nombres, apellidos, email, cargo, passwordHash],
    );
    const role = (
      await query<{ id: number }>(
        "SELECT id FROM roles WHERE nombre = ? AND activo = TRUE AND deleted_at IS NULL LIMIT 1",
        [roleName],
      )
    )[0];
    if (!role) throw new Error("No se encontró el rol de cotizaciones.");
    await execute(
      "INSERT INTO admin_user_roles (admin_user_id, role_id, activo) VALUES (?, ?, TRUE)",
      [result.insertId, role.id],
    );
    return NextResponse.json(
      {
        ok: true,
        message: `${body.rol === "coordinador" ? "Coordinador" : "Gestor"} creado correctamente.`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/cotizaciones/asesores]", error);
    return NextResponse.json(
      { message: "No fue posible crear el asesor." },
      { status: 500 },
    );
  }
}
