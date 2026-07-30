import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { deleteDiscountRequestInDB, findRequestForVerificationFromDB } from '@/lib/allyMembershipStorageDB';
import { recordAllyAudit } from '@/lib/ally-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.codes.redeem');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  const { id: code } = await params;
  const cedula = request.nextUrl.searchParams.get('cedula') ?? '';
  const data = await findRequestForVerificationFromDB({ code, cedula });
  return data ? NextResponse.json({ data }) : NextResponse.json({ message: 'Código no encontrado.' }, { status: 404 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.codes.redeem');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  const { id } = await params;
  const current = await findRequestForVerificationFromDB({ cedula: '', requestId: id });
  if (!current || !(await deleteDiscountRequestInDB(id))) return NextResponse.json({ message: 'El código no puede anularse.' }, { status: 409 });
  await recordAllyAudit({ allyId: current.allyId, adminUserId: session.userId, actorType: 'ADMIN', eventType: 'DISCOUNT_VOIDED', entityType: 'codigos_descuento', entityId: id, details: { code: current.code, clientCedula: current.clientCedula }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'), userAgent: request.headers.get('user-agent') });
  return new NextResponse(null, { status: 204 });
}
