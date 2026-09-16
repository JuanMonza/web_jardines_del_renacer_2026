import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, verifyAdminToken } from '@/lib/iam/admin-token';
import { isTrainingEnvironment } from '@/lib/training-environment';
const ADMIN_SESSION_COOKIE = 'jdr_admin_session';
const routes = [{ prefix: '/dashboard/cotizaciones', permission: 'quotes.view', login: '/login/cotizaciones' }, { prefix: '/dashboard-vacantes', permission: 'dashboard.vacantes.view', login: '/login/admin-vacantes' }, { prefix: '/dashboard-aliados', permission: 'dashboard.aliados.view', login: '/login/admin-aliados' }, { prefix: '/dashboard-sedes', permission: 'dashboard.sedes.view', login: '/login/admin-sedes' }, { prefix: '/dashboard-talleres', permission: 'dashboard.talleres.view', login: '/login/admin-talleres' }, { prefix: '/dashboard-sorteos', permission: 'dashboard.sorteos.view', login: '/login/admin-sorteos' }, { prefix: '/dashboard', permission: 'dashboard.admin.view', login: '/login/admin' }];
function environmentHeaders(response: NextResponse) {
  if (isTrainingEnvironment()) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('X-Training-Environment', 'true');
    response.headers.set('Cache-Control', 'no-store');
  }
  return response;
}
export async function middleware(request: NextRequest) {
  const route = routes.find(
    ({ prefix }) =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (!route) return environmentHeaders(NextResponse.next());

  const session = await verifyAdminToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!session || !hasPermission(session, route.permission)) {
    const params = new URLSearchParams({ next: request.nextUrl.pathname });
    const forwardedHost = request.headers
      .get('x-forwarded-host')
      ?.split(',')[0]
      .trim();
    const requestHost = request.headers.get('host')?.trim();
    const candidateHost = forwardedHost || requestHost || request.nextUrl.host;
    const host = /^[a-z0-9.-]+(?::\d+)?$/i.test(candidateHost)
      ? candidateHost
      : request.nextUrl.host;
    const forwardedProtocol = request.headers
      .get('x-forwarded-proto')
      ?.split(',')[0]
      .trim();
    const protocol = forwardedProtocol === 'http' || forwardedProtocol === 'https'
      ? forwardedProtocol
      : request.nextUrl.protocol.replace(':', '');
    const url = new URL(`${route.login}?${params.toString()}`, `${protocol}://${host}`);

    // The public Host headers keep an internal proxy origin (for example,
    // localhost:3000) out of redirects returned to production browsers.
    return environmentHeaders(NextResponse.redirect(url));
  }

  return environmentHeaders(NextResponse.next());
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
