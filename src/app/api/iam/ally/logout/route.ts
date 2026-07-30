import { NextRequest, NextResponse } from 'next/server';
import { ALLY_SESSION_COOKIE, getActiveAllySession, revokeAllySession } from '@/lib/iam/ally-session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(ALLY_SESSION_COOKIE)?.value;
  const session = await getActiveAllySession(token);
  if (session) await revokeAllySession(session.sessionId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ALLY_SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}
