import { NextRequest, NextResponse } from "next/server";
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  verifyVacantesCandidateJwt,
} from "@/lib/candidateAuth";
import { query } from "@/lib/db";
import { ensureCandidateCvStorageSchema } from "@/lib/candidate-cv-storage";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type CandidateCvRow = {
  documento: string;
  cv_filename: string | null;
  cv_mime: string | null;
  cv_filedata: Buffer | Uint8Array | null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  await ensureCandidateCvStorageSchema();
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json(
      { success: false, message: "Identificador inválido." },
      { status: 400 },
    );
  }

  const candidateToken = request.cookies.get(
    CANDIDATE_SESSION_COOKIE_NAME,
  )?.value;
  const candidateSession = candidateToken
    ? await verifyVacantesCandidateJwt(candidateToken)
    : null;

  let rows: CandidateCvRow[] = [];
  if (candidateSession) {
    rows = await query<CandidateCvRow>(
      `SELECT documento, cv_filename, cv_mime, cv_filedata
       FROM candidatos
       WHERE id = ? AND documento = ? AND activo = TRUE AND deleted_at IS NULL
       LIMIT 1`,
      [params.id, candidateSession.documentNumber],
    );
  } else {
    const adminSession = await requireAdminPermission(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
      "vacancies.applications.view",
    );
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 403 },
      );
    }
    rows = await query<CandidateCvRow>(
      `SELECT documento, cv_filename, cv_mime, cv_filedata
       FROM candidatos
       WHERE id = ? AND activo = TRUE AND deleted_at IS NULL
       LIMIT 1`,
      [params.id],
    );
  }

  const cv = rows[0];
  if (!cv?.cv_filedata) {
    return NextResponse.json(
      { success: false, message: "La hoja de vida no está disponible. El postulante debe cargarla nuevamente." },
      { status: 404 },
    );
  }

  const fileName = (cv.cv_filename || "hoja-de-vida.pdf").replace(
    /[^a-zA-Z0-9._-]/g,
    "_",
  );
  const body = Buffer.from(cv.cv_filedata);

  return new NextResponse(body, {
    headers: {
      "Content-Type": cv.cv_mime || "application/octet-stream",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
