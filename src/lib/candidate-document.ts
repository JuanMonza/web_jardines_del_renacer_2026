import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "@/lib/db";
import { ensureApplicationSnapshotSchema } from "@/lib/candidateStorageDB";

type ChangeCandidateDocumentInput = {
  candidateId: string;
  documentNumber: string;
  actorType: "Admin" | "Postulante";
  actorDescription: string;
};

export async function changeCandidateDocument(input: ChangeCandidateDocumentInput) {
  await ensureApplicationSnapshotSchema();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.query<RowDataPacket[]>(
      `SELECT id, documento, nombres, apellidos, email
       FROM candidatos
       WHERE id = ? AND deleted_at IS NULL
       LIMIT 1 FOR UPDATE`,
      [input.candidateId],
    );
    const candidate = rows[0];
    if (!candidate) throw Object.assign(new Error("No encontramos el perfil del postulante."), { status: 404 });
    if (candidate.documento === input.documentNumber) {
      throw Object.assign(new Error("La cédula nueva es igual a la actual."), { status: 422 });
    }
    const [duplicates] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM candidatos WHERE documento = ? AND id <> ? AND deleted_at IS NULL LIMIT 1",
      [input.documentNumber, input.candidateId],
    );
    if (duplicates.length) throw Object.assign(new Error("Esta cédula ya pertenece a otra persona."), { status: 409 });

    await connection.execute<ResultSetHeader>(
      "UPDATE candidatos SET documento = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [input.documentNumber, input.candidateId],
    );
    await connection.execute(
      `UPDATE postulaciones
       SET application_snapshot = JSON_SET(
         COALESCE(application_snapshot, JSON_OBJECT()),
         '$.candidateDocument', ?
       )
       WHERE candidato_id = ?`,
      [input.documentNumber, input.candidateId],
    );
    await updateHistoricalDocument(connection, {
      oldDocument: String(candidate.documento),
      newDocument: input.documentNumber,
      email: String(candidate.email),
    });
    await connection.execute(
      `INSERT INTO activity_logs
       (usuario_tipo, accion, modulo, tabla_afectada, registro_id, descripcion)
       VALUES (?, 'POSTULANTE_CEDULA_ACTUALIZADA', 'Vacantes', 'candidatos', ?, ?)`,
      [
        input.actorType,
        input.candidateId,
        `${input.actorDescription} actualizó la cédula de ${candidate.nombres} ${candidate.apellidos}: ${candidate.documento} → ${input.documentNumber}. Las postulaciones conservaron su trazabilidad.`,
      ],
    );
    await connection.commit();
    return { documentNumber: input.documentNumber, email: String(candidate.email) };
  } catch (error) {
    await connection.rollback();
    if ((error as { code?: string })?.code === "ER_DUP_ENTRY") {
      throw Object.assign(new Error("Esta cédula ya pertenece a otra persona."), { status: 409 });
    }
    throw error;
  } finally {
    connection.release();
  }
}

async function updateHistoricalDocument(
  connection: PoolConnection,
  input: { oldDocument: string; newDocument: string; email: string },
) {
  const [tables] = await connection.query<RowDataPacket[]>(
    `SELECT 1 FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'historical_candidates' LIMIT 1`,
  );
  if (!tables.length) return;
  await connection.execute(
    `UPDATE historical_candidates
     SET documento = ?, last_seen = CURRENT_TIMESTAMP
     WHERE documento = ? OR LOWER(correo) = LOWER(?)`,
    [input.newDocument, input.oldDocument, input.email],
  );
}
