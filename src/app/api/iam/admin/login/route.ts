import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, authenticateAdmin, signAdminSession } from '@/lib/iam/admin-session';
export const runtime = 'nodejs';
const permissions: Record<string, string> = { '/dashboard': 'dashboard.admin.view', '/dashboard-aliados': 'dashboard.aliados.view', '/dashboard-vacantes': 'dashboard.vacantes.view', '/dashboard-sedes': 'dashboard.sedes.view', '/dashboard/cotizaciones': 'quotes.view', '/dashboard-talleres': 'dashboard.talleres.view', '/dashboard-sorteos': 'dashboard.sorteos.view' };
export async function POST(request: NextRequest) {
  try {
    const body = await request.json(); const destination = typeof body.destination === 'string' ? body.destination : ''; const requiredPermission = permissions[destination];
    if (!requiredPermission) return NextResponse.json({ message: 'Destino de acceso no válido.' }, { status: 400 });
    const session = await authenticateAdmin({ cedula: body.cedula, password: body.password, requiredPermission, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '0.0.0.0', userAgent: request.headers.get('user-agent') || 'unknown' });
    if (!session) return NextResponse.json({ message: 'Credenciales inválidas o acceso no autorizado.' }, { status: 401 });
    const response = NextResponse.json({ user: { name: session.name, email: session.email }, destination });
    response.cookies.set(ADMIN_SESSION_COOKIE, await signAdminSession(session), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 8 });
    return response;
  } catch (error) { console.error('Error de autenticación administrativa:', error); return NextResponse.json({ message: 'No fue posible iniciar sesión.' }, { status: 500 }); }
}
