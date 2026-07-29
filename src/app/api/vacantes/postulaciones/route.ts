import { NextRequest, NextResponse } from "next/server";
import { getAllApplicationsFromDB } from "@/lib/candidateStorageDB";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'vacancies.applications.view');
    if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 403 });

    const data = await getAllApplicationsFromDB();

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );

  }
}
