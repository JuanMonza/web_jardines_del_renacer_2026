import { NextRequest, NextResponse } from 'next/server';
import { hasPermission, verifyAdminToken } from '@/lib/iam/admin-token';
import { isTrainingEnvironment } from '@/lib/training-environment';
import { TRAINING_GATE_COOKIE, verifyTrainingGateToken } from '@/lib/training-gate';
const ADMIN_SESSION_COOKIE = isTrainingEnvironment() ? 'jdr_training_admin_session' : 'jdr_admin_session';
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
  const training = isTrainingEnvironment();
  const basePath = training ? (process.env.TRAINING_BASE_PATH || '') : '';
  const pathname = basePath && request.nextUrl.pathname.startsWith(basePath)
    ? request.nextUrl.pathname.slice(basePath.length) || '/'
    : request.nextUrl.pathname;

  if (training) {
    const publicTrainingPath = pathname === '/acceso-capacitacion'
      || pathname === '/api/training/access'
      || /\.(?:css|js|png|jpe?g|webp|gif|svg|ico|woff2?)$/i.test(pathname);
    if (!publicTrainingPath) {
      const gateSecret = String(process.env.TRAINING_GATE_SECRET || '');
      const allowed = await verifyTrainingGateToken(
        request.cookies.get(TRAINING_GATE_COOKIE)?.value,
        gateSecret,
      );
      if (!allowed) {
        if (pathname.startsWith('/api/')) {
          return environmentHeaders(NextResponse.json({ message: 'Acceso de capacitación requerido.' }, { status: 401 }));
        }
        const accessUrl = request.nextUrl.clone();
        accessUrl.pathname = `${basePath}/acceso-capacitacion`;
        accessUrl.search = new URLSearchParams({ next: `${pathname}${request.nextUrl.search}` }).toString();
        return environmentHeaders(NextResponse.redirect(accessUrl));
      }
    }
  }

  const route = routes.find(
    ({ prefix }) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`),
  );

  if (!route) return environmentHeaders(NextResponse.next());

  const session = await verifyAdminToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );

  if (!session || !hasPermission(session, route.permission)) {
    const params = new URLSearchParams({ next: pathname });
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
    const url = new URL(`${basePath}${route.login}?${params.toString()}`, `${protocol}://${host}`);

    // The public Host headers keep an internal proxy origin (for example,
    // localhost:3000) out of redirects returned to production browsers.
    return environmentHeaders(NextResponse.redirect(url));
  }

  return environmentHeaders(NextResponse.next());
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
