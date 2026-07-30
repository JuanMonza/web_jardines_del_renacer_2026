import { NextRequest, NextResponse } from 'next/server';
import { CLIENT_SESSION_COOKIE, getActiveClientSession, revokeClientSession } from '@/lib/iam/client-session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const session = await getActiveClientSession(request.cookies.get(CLIENT_SESSION_COOKIE)?.value);
  if (session) await revokeClientSession(session.sessionId);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(CLIENT_SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}
