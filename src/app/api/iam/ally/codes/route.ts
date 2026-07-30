import { NextRequest, NextResponse } from 'next/server';
import { ALLY_SESSION_COOKIE, getActiveAllySession } from '@/lib/iam/ally-session';
import { findRequestForVerificationFromDB, getDiscountRequestsForAllyFromDB } from '@/lib/allyMembershipStorageDB';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const session = await getActiveAllySession(request.cookies.get(ALLY_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  const code = request.nextUrl.searchParams.get('code')?.trim();
  const cedula = request.nextUrl.searchParams.get('cedula')?.trim();
  if (code || cedula) {
    const data = await findRequestForVerificationFromDB({ code, cedula: cedula ?? '', allyId: String(session.allyId) });
    return data ? NextResponse.json({ data }) : NextResponse.json({ message: 'Código no encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ data: await getDiscountRequestsForAllyFromDB(String(session.allyId)) });
}
