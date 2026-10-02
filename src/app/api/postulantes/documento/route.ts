import { NextRequest, NextResponse } from "next/server";
import {
  CANDIDATE_SESSION_COOKIE_NAME,
  CANDIDATE_SESSION_MAX_AGE_SECONDS,
  signVacantesCandidateJwt,
  verifyCandidatePasswordForDB,
  verifyVacantesCandidateJwt,
} from "@/lib/candidateAuth";
import { getCandidateAccountForLogin } from "@/lib/candidateStorageDB";
import { changeCandidateDocument } from "@/lib/candidate-document";
import { trainingCookiePath } from "@/lib/training-environment";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  const token = request.cookies.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyVacantesCandidateJwt(token) : null;
  if (!session) return NextResponse.json({ success: false, message: "No autorizado." }, { status: 401 });
  if (Number(request.headers.get("content-length") || 0) > 2048) {
    return NextResponse.json({ success: false, message: "La solicitud supera el tamaño permitido." }, { status: 413 });
  }
  const body = await request.json().catch(() => ({}));
  const documentNumber = typeof body.documentNumber === "string" ? body.documentNumber.replace(/\D/g, "") : "";
  if (!/^\d{6,20}$/.test(documentNumber)) {
    return NextResponse.json({ success: false, message: "Indica una cédula válida de 6 a 20 dígitos." }, { status: 422 });
  }
  if (typeof body.password !== "string" || body.password.length > 128) {
    return NextResponse.json({ success: false, message: "Confirma tu contraseña actual." }, { status: 422 });
  }
  const account = await getCandidateAccountForLogin({ documentNumber: session.documentNumber, email: session.email });
  if (!account || !(await verifyCandidatePasswordForDB(body.password, account.password_hash))) {
    return NextResponse.json({ success: false, message: "La contraseña actual no es correcta." }, { status: 401 });
  }
  try {
    const changed = await changeCandidateDocument({
      candidateId: String(account.id),
      documentNumber,
      actorType: "Postulante",
      actorDescription: "El postulante",
    });
    const refreshedToken = await signVacantesCandidateJwt({
      candidateId: String(account.id),
      documentNumber: changed.documentNumber,
      email: session.email,
      name: session.name,
      role: "vacantes_usuario",
    });
    const response = NextResponse.json({ success: true, data: { documentNumber: changed.documentNumber } });
    response.cookies.set(CANDIDATE_SESSION_COOKIE_NAME, refreshedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: trainingCookiePath(),
      maxAge: CANDIDATE_SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    const status = Number((error as { status?: number }).status) || 500;
    return NextResponse.json(
      { success: false, message: status === 500 ? "No fue posible actualizar la cédula." : (error as Error).message },
      { status },
    );
  }
}
