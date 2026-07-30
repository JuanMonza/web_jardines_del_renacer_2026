/**
 * Contratos y cálculos puros del módulo de Aliados.
 * La persistencia se realiza exclusivamente en MySQL mediante allyMembershipStorageDB.
 */
export type DiscountRequestStatus = 'active' | 'redeemed' | 'expired' | 'deleted';

export interface AllyDiscountRequest {
  id: string;
  code: string;
  clientCedula: string;
  clientName: string;
  allyId: string;
  allyName: string;
  allyLoginId: string;
  departamento: string;
  municipio: string;
  categorySlug: string;
  subcategory: string;
  discountLabel: string;
  discountPercent: number;
  status: DiscountRequestStatus;
  consumedValue?: number;
  discountValue?: number;
  totalAfterDiscount?: number;
  redeemedBy?: string;
  createdAt: string;
  expiresAt: string;
  redeemedAt?: string;
  deletedAt?: string;
}

export function formatCurrency(value: number) { return `$${value.toLocaleString('es-CO')}`; }

export function extractDiscountPercent(discountLabel: string) {
  const match = discountLabel.replace(',', '.').match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 0;
}

function sameDay(date: Date, now: Date) { return date.toDateString() === now.toDateString(); }
function sameWeek(date: Date, now: Date) { const day = now.getDay() || 7; const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(now.getDate() - day + 1); const end = new Date(start); end.setDate(start.getDate() + 7); return date >= start && date < end; }
function sameMonth(date: Date, now: Date) { return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); }

export function getDiscountStats(requests: AllyDiscountRequest[]) {
  const redeemed = requests.filter((request) => request.status === 'redeemed');
  const totalConsumed = redeemed.reduce((sum, request) => sum + (request.consumedValue ?? 0), 0);
  const totalDiscount = redeemed.reduce((sum, request) => sum + (request.discountValue ?? 0), 0);
  return { generated: requests.length, active: requests.filter((request) => request.status === 'active').length, redeemed: redeemed.length, expired: requests.filter((request) => request.status === 'expired').length, deleted: requests.filter((request) => request.status === 'deleted').length, totalConsumed, totalDiscount, totalAfterDiscount: totalConsumed - totalDiscount };
}

export function getConsumptionComparatives(requests: AllyDiscountRequest[]) {
  const now = new Date();
  const summarize = (filter: (date: Date) => boolean) => requests.filter((request) => request.status === 'redeemed' && filter(new Date(request.redeemedAt ?? request.createdAt))).reduce((summary, request) => ({ count: summary.count + 1, consumed: summary.consumed + (request.consumedValue ?? 0), discount: summary.discount + (request.discountValue ?? 0) }), { count: 0, consumed: 0, discount: 0 });
  return { today: summarize((date) => sameDay(date, now)), week: summarize((date) => sameWeek(date, now)), month: summarize((date) => sameMonth(date, now)) };
}

export function getClientConsumptionSummary(cedula: string, requests: AllyDiscountRequest[]) {
  const cleanCedula = cedula.replace(/\D/g, '');
  const clientRequests = requests.filter((request) => request.clientCedula === cleanCedula);
  return { requests: clientRequests, stats: getDiscountStats(clientRequests), comparatives: getConsumptionComparatives(clientRequests) };
}
