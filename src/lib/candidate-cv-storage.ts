import { execute, query } from "@/lib/db";

let candidateCvSchemaPromise: Promise<void> | null = null;

/** Keeps persistent CV storage available even if a deployment missed its migration. */
export function ensureCandidateCvStorageSchema() {
  if (!candidateCvSchemaPromise) {
    candidateCvSchemaPromise = (async () => {
      const columns = await query<{ Field: string }>(
        `SHOW COLUMNS FROM candidatos
         WHERE Field IN ('cv_filename', 'cv_mime', 'cv_filedata')`,
      );
      const existing = new Set(columns.map(({ Field }) => Field));

      if (!existing.has("cv_filename")) {
        await execute(
          "ALTER TABLE candidatos ADD COLUMN cv_filename VARCHAR(255) NULL AFTER cv_url",
        );
      }
      if (!existing.has("cv_mime")) {
        await execute(
          "ALTER TABLE candidatos ADD COLUMN cv_mime VARCHAR(127) NULL AFTER cv_filename",
        );
      }
      if (!existing.has("cv_filedata")) {
        await execute(
          "ALTER TABLE candidatos ADD COLUMN cv_filedata MEDIUMBLOB NULL AFTER cv_mime",
        );
      }
    })().catch((error) => {
      candidateCvSchemaPromise = null;
      throw error;
    });
  }

  return candidateCvSchemaPromise;
}
