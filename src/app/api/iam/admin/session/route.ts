import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getActiveAdminSession } from '@/lib/iam/admin-session';
export const runtime = 'nodejs';
export async function GET(request: NextRequest) {
  const session = await getActiveAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 401 });
  return NextResponse.json({ user: { name: session.name, email: session.email, permissions: session.permissions } });
}
