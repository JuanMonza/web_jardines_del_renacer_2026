import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  verifyVacantesCandidateJwt,
} from "@/lib/candidateAuth";
import { execute } from "@/lib/db";
import { getCandidateAccountForLogin } from "@/lib/candidateStorageDB";

export const runtime = "nodejs";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyVacantesCandidateJwt(token) : null;
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 },
    );
  try {
    const { fileData } = (await request.json()) as { fileData?: string };
    if (!fileData?.startsWith("data:"))
      return NextResponse.json(
        { success: false, message: "Selecciona una imagen válida." },
        { status: 422 },
      );
    const [metadata, base64] = fileData.split(",", 2);
    const mime = metadata.match(/data:([^;]+)/)?.[1] ?? "";
    const extension = ALLOWED_TYPES[mime];
    if (!extension)
      return NextResponse.json(
        {
          success: false,
          message: "Solo se permiten imágenes JPG, PNG o WEBP.",
        },
        { status: 422 },
      );
    const buffer = Buffer.from(base64, "base64");
    if (!buffer.length || buffer.length > MAX_PHOTO_BYTES)
      return NextResponse.json(
        { success: false, message: "La fotografía debe pesar máximo 4 MB." },
        { status: 422 },
      );
    const candidate = await getCandidateAccountForLogin({
      documentNumber: session.documentNumber,
      email: session.email,
    });
    if (!candidate)
      return NextResponse.json(
        { success: false, message: "No encontramos tu perfil de postulante." },
        { status: 404 },
      );
    const filename = `foto-${candidate.id}-${Date.now()}${extension}`;
    const directory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "postulantes",
    );
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), buffer);
    const url = `/uploads/postulantes/${filename}`;
    await execute(
      "UPDATE candidatos SET foto_url = ? WHERE id = ? AND deleted_at IS NULL",
      [url, candidate.id],
    );
    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error("No fue posible guardar la foto de perfil:", error);
    return NextResponse.json(
      { success: false, message: "No fue posible guardar la fotografía." },
      { status: 500 },
    );
  }
}
