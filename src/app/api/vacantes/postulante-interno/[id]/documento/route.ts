import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, requireAdminPermission, verifyAdminPassword } from "@/lib/iam/admin-session";
import { changeCandidateDocument } from "@/lib/candidate-document";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, "vacancies.applications.update");
  if (!session) return NextResponse.json({ message: "No autorizado." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 2048) return NextResponse.json({ message: "La solicitud supera el tamaño permitido." }, { status: 413 });
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const documentNumber = typeof body.documentNumber === "string" ? body.documentNumber.replace(/\D/g, "") : "";
  if (!/^\d+$/.test(id) || !/^\d{6,20}$/.test(documentNumber)) {
    return NextResponse.json({ message: "Indica una cédula válida de 6 a 20 dígitos." }, { status: 422 });
  }
  if (!(await verifyAdminPassword(session, body.password))) {
    return NextResponse.json({ message: "La contraseña del administrador no es correcta." }, { status: 401 });
  }
  try {
    await changeCandidateDocument({ candidateId: id, documentNumber, actorType: "Admin", actorDescription: `Administrador ${session.name} (ID ${session.userId})` });
    return NextResponse.json({ success: true, documentNumber });
  } catch (error) {
    const status = Number((error as { status?: number }).status) || 500;
    return NextResponse.json({ message: status === 500 ? "No fue posible corregir la cédula." : (error as Error).message }, { status });
  }
}
