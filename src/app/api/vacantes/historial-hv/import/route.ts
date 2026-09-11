import { NextRequest, NextResponse } from "next/server";
import { importHistoricalCandidateRows, parseHistoricalCandidateWorkbook } from "@/lib/historical-candidate-records";
import { recordVacancyAudit } from "@/lib/vacancy-audit";
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from "@/lib/iam/admin-session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.create");
  if (!session) return NextResponse.json({ success: false, message: "No autorizado." }, { status: 403 });
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !/\.xlsx$/i.test(file.name)) return NextResponse.json({ success: false, message: "Selecciona un archivo Excel .xlsx." }, { status: 422 });
    if (file.size > 30 * 1024 * 1024) return NextResponse.json({ success: false, message: "El archivo supera el máximo de 30 MB." }, { status: 422 });
    const { rows, skippedSheets } = parseHistoricalCandidateWorkbook(Buffer.from(await file.arrayBuffer()));
    if (!rows.length) return NextResponse.json({ success: false, message: "No encontramos filas válidas con nombre y datos de contacto." }, { status: 422 });
    const importedMovements = await importHistoricalCandidateRows(rows);
    await recordVacancyAudit({ action: "HISTORICO_HV_IMPORTADO", table: "candidatos", recordId: 0, description: `Administrador ${session.name} (ID ${session.userId}) importó ${importedMovements} movimiento(s) del historial laboral desde “${file.name}”. Filas analizadas: ${rows.length}.` });
    return NextResponse.json({ success: true, data: { analyzedRows: rows.length, importedMovements, skippedSheets } });
  } catch (error) {
    console.error("No fue posible importar el histórico laboral:", error);
    const detail = error instanceof Error ? error.message : "Error no identificado.";
    return NextResponse.json({ success: false, message: process.env.NODE_ENV === "development" ? `No fue posible importar: ${detail}` : "No fue posible importar el archivo histórico." }, { status: 500 });
  }
}
