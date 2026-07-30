import { NextRequest, NextResponse } from 'next/server';
import { authenticateClient, CLIENT_SESSION_COOKIE, signClientSession } from '@/lib/iam/client-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { cedula?: string; password?: string };
    const cedula = String(body.cedula ?? '').replace(/\D/g, '');
    const password = String(body.password ?? '');
    if (cedula.length < 6 || password.length < 8) return NextResponse.json({ message: 'Ingresa una cédula y contraseña válidas.' }, { status: 422 });
    const session = await authenticateClient(cedula, password, request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? '', request.headers.get('user-agent') ?? '');
    if (!session) return NextResponse.json({ message: 'Cédula o contraseña incorrectas.' }, { status: 401 });
    const response = NextResponse.json({ data: { name: session.name, documentNumber: session.documentNumber } });
    response.cookies.set(CLIENT_SESSION_COOKIE, await signClientSession(session), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 });
    return response;
  } catch { return NextResponse.json({ message: 'No fue posible iniciar sesión.' }, { status: 500 }); }
}
