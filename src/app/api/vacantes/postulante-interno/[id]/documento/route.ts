import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { ensureApplicationSnapshotSchema } from "@/lib/candidateStorageDB";
import { ADMIN_SESSION_COOKIE, requireAdminPermission, verifyAdminPassword } from "@/lib/iam/admin-session";
import { isTrainingEnvironment } from "@/lib/training-environment";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!isTrainingEnvironment()) return NextResponse.json({ message: "Disponible solo en el ambiente de prueba." }, { status: 403 });
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.applications.update");
  if (!session) return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const documentNumber = typeof body.documentNumber === "string" ? body.documentNumber.replace(/\D/g, "") : "";
  if (!/^\d+$/.test(id) || !/^\d{6,20}$/.test(documentNumber)) {
    return NextResponse.json({ message: "Indica una cédula válida de 6 a 20 dígitos." }, { status: 422 });
  }
  if (!(await verifyAdminPassword(session, body.password))) {
    return NextResponse.json({ message: "La contraseña del administrador no es correcta." }, { status: 401 });
  }
  await ensureApplicationSnapshotSchema();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT c.id,c.documento,c.nombres,c.apellidos FROM candidatos c
       WHERE c.id=? AND c.deleted_at IS NULL AND EXISTS (
         SELECT 1 FROM activity_logs a WHERE a.tabla_afectada='candidatos'
           AND a.registro_id=c.id AND a.accion='POSTULANTE_INTERNO_CREADO'
       ) FOR UPDATE`, [id],
    );
    const candidate = rows[0];
    if (!candidate) {
      await connection.rollback();
      return NextResponse.json({ message: "Solo puedes corregir la cédula de un perfil creado desde este dashboard." }, { status: 404 });
    }
    if (candidate.documento === documentNumber) {
      await connection.rollback();
      return NextResponse.json({ message: "La cédula nueva es igual a la actual." }, { status: 422 });
    }
    const [duplicates] = await connection.query<RowDataPacket[]>("SELECT id FROM candidatos WHERE documento=? AND id<>? LIMIT 1", [documentNumber, id]);
    if (duplicates.length) {
      await connection.rollback();
      return NextResponse.json({ message: "Esta cédula ya pertenece a otra persona." }, { status: 409 });
    }
    await connection.execute<ResultSetHeader>("UPDATE candidatos SET documento=? WHERE id=?", [documentNumber, id]);
    await connection.execute(
      "UPDATE postulaciones SET application_snapshot=JSON_SET(COALESCE(application_snapshot,JSON_OBJECT()),'$.candidateDocument',?) WHERE candidato_id=?",
      [documentNumber, id],
    );
    await connection.execute(
      `INSERT INTO activity_logs(usuario_tipo,accion,modulo,tabla_afectada,registro_id,descripcion)
       VALUES ('Admin','POSTULANTE_INTERNO_CEDULA_CORREGIDA','Vacantes','candidatos',?,?)`,
      [id, `Administrador ${session.name} (ID ${session.userId}) corrigió la cédula de ${candidate.nombres} ${candidate.apellidos}: ${candidate.documento} → ${documentNumber}.`],
    );
    await connection.commit();
    return NextResponse.json({ success: true, documentNumber });
  } catch (error) {
    await connection.rollback();
    const code = (error as { code?: string })?.code;
    return NextResponse.json({ message: code === "ER_DUP_ENTRY" ? "Esta cédula ya pertenece a otra persona." : "No fue posible corregir la cédula." }, { status: code === "ER_DUP_ENTRY" ? 409 : 500 });
  } finally {
    connection.release();
  }
}
