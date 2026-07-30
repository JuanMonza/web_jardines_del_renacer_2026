import { NextRequest, NextResponse } from 'next/server';
import { ALLY_SESSION_COOKIE, getActiveAllySession } from '@/lib/iam/ally-session';
import { redeemDiscountRequestInDB } from '@/lib/allyMembershipStorageDB';
import { recordAllyAudit } from '@/lib/ally-audit';

export const runtime = 'nodejs';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getActiveAllySession(request.cookies.get(ALLY_SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  const body = await request.json() as { consumedValue?: number; discountValue?: number };
  const consumedValue = Number(body.consumedValue);
  const discountValue = body.discountValue === undefined ? undefined : Number(body.discountValue);
  if (!Number.isFinite(consumedValue) || consumedValue <= 0 || (discountValue !== undefined && (!Number.isFinite(discountValue) || discountValue < 0 || discountValue > consumedValue))) return NextResponse.json({ message: 'Los valores del consumo no son válidos.' }, { status: 422 });
  const { id } = await params;
  const data = await redeemDiscountRequestInDB({ requestId: id, consumedValue, discountValueOverride: discountValue, redeemedBy: session.name, allyId: String(session.allyId) });
  if (data) await recordAllyAudit({ allyId: session.allyId, allyAccountId: session.accountId, actorType: 'ALLY', eventType: 'DISCOUNT_REDEEMED', entityType: 'codigos_descuento', entityId: data.id, details: { code: data.code, consumedValue: data.consumedValue, discountValue: data.discountValue, totalAfterDiscount: data.totalAfterDiscount }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'), userAgent: request.headers.get('user-agent') });
  return data ? NextResponse.json({ data }) : NextResponse.json({ message: 'Código no disponible para este aliado.' }, { status: 409 });
}
