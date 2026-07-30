import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { setAllyPassword } from '@/lib/iam/ally-session';
import { recordAllyAudit } from '@/lib/ally-audit';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.update');
  if (!admin) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });

  try {
    const { id } = await params;
    const body = await request.json() as { loginId?: string; password?: string };
    await setAllyPassword(Number(id), String(body.loginId || ''), String(body.password || ''));
    await recordAllyAudit({
      allyId: id,
      adminUserId: admin.userId,
      actorType: 'ADMIN',
      eventType: 'ALLY_ACCESS_RESET',
      entityType: 'ally_accounts',
      entityId: id,
      details: { loginId: String(body.loginId || '').toUpperCase() },
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    });
    return NextResponse.json({ message: 'Acceso restablecido correctamente.' });
  } catch {
    return NextResponse.json({ message: 'No fue posible restablecer el acceso. Usa una contraseña de mínimo 10 caracteres.' }, { status: 422 });
  }
}
