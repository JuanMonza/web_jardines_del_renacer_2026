import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ensureCandidateCvStorageSchema } from "@/lib/candidate-cv-storage";
import {
  ADMIN_SESSION_COOKIE,
  requireAdminPermission,
} from "@/lib/iam/admin-session";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { document: string } },
) {
  await ensureCandidateCvStorageSchema();
  const session = await requireAdminPermission(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    "vacancies.applications.view",
  );
  if (!session)
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 403 },
    );
  const document = decodeURIComponent(params.document).replace(/\D/g, "");
  if (!document)
    return NextResponse.json(
      { success: false, message: "Documento inválido." },
      { status: 400 },
    );
  try {
    const candidates = await query<{
      id: string;
      documentNumber: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      birthDate: string | null;
      address: string | null;
      city: string | null;
      department: string | null;
      professionalTitle: string | null;
      yearsExperience: string | null;
      education: string | null;
      linkedinUrl: string | null;
      portfolioUrl: string | null;
      cvUrl: string | null;
      hasCv: number;
      createdAt: string;
      lastLoginAt: string | null;
    }>(
      `SELECT id, documento AS documentNumber, nombres AS firstName, apellidos AS lastName, email, telefono AS phone, fecha_nacimiento AS birthDate, direccion AS address, ciudad AS city, departamento AS department, profesion AS professionalTitle, experiencia AS yearsExperience, educacion AS education, linkedin AS linkedinUrl, portfolio AS portfolioUrl, cv_url AS cvUrl, (cv_filedata IS NOT NULL) AS hasCv, created_at AS createdAt, ultimo_login AS lastLoginAt FROM candidatos WHERE documento = ? AND deleted_at IS NULL AND activo = TRUE LIMIT 1`,
      [document],
    );
    if (!candidates[0])
      return NextResponse.json(
        { success: false, message: "Postulante no encontrado." },
        { status: 404 },
      );
    const applications = await query<{
      id: string;
      vacancyTitle: string;
      status: string;
      appliedAt: string;
    }>(
      `SELECT p.id, v.titulo AS vacancyTitle, p.estado AS status, p.created_at AS appliedAt FROM postulaciones p INNER JOIN candidatos c ON c.id = p.candidato_id INNER JOIN vacantes v ON v.id = p.vacante_id WHERE c.documento = ? AND p.deleted_at IS NULL ORDER BY p.created_at DESC`,
      [document],
    );
    const candidate = candidates[0];
    return NextResponse.json({
      success: true,
      data: {
        ...candidate,
        cvUrl: candidate.hasCv ? `/api/postulantes/cv/${candidate.id}` : null,
        hasCv: undefined,
      },
      applications,
    });
  } catch (error) {
    console.error("No fue posible consultar el perfil del postulante:", error);
    return NextResponse.json(
      { success: false, message: "No fue posible consultar el perfil." },
      { status: 500 },
    );
  }
}
