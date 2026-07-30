import { NextRequest, NextResponse } from 'next/server';
import { CLIENT_SESSION_COOKIE, getActiveClientSession } from '@/lib/iam/client-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getActiveClientSession(request.cookies.get(CLIENT_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ message: 'Sesión no válida.' }, { status: 401 });
  return NextResponse.json({ user: { name: session.name, documentNumber: session.documentNumber } });
}
