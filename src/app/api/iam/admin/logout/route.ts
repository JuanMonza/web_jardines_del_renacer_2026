import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, revokeAdminSession, verifyAdminSession } from '@/lib/iam/admin-session';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) { const session = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value); if (session) await revokeAdminSession(session.sessionId); const response = NextResponse.json({ ok: true }); response.cookies.set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 }); return response; }
