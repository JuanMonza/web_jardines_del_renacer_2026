import { NextRequest, NextResponse } from "next/server";
import {getVacanciesFromDB,createVacancyInDB,} from "@/lib/vacanciesStorageDB";
import { getVacancyApplicationCounts } from "@/lib/candidateStorageDB";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [dbVacancies, counts] = await Promise.all([
      getVacanciesFromDB(),
      getVacancyApplicationCounts(),
    ]);

    return NextResponse.json(
      dbVacancies.map((vacancy) => ({
        ...vacancy,
        applicationCount: counts[vacancy.id] ?? 0,
      })),
    );
  } catch (error) {
    console.error("Error en GET /api/vacantes:", error);

    return NextResponse.json({ success: false, message: 'No fue posible consultar las vacantes desde la base operativa.' }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.create');
    if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });
    const body = await request.json();

    const id = await createVacancyInDB(body);

    return NextResponse.json(
      {
        success: true,
        id,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error en POST /api/vacantes:", error);

    return NextResponse.json(
      {
        success: false,
        message: "No se pudo crear la vacante.",
      },
      {
        status: 500,
      },
    );
  }
}
