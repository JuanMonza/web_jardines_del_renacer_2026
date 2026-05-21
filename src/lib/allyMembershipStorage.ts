import { mockClients, type ClientData } from '@/data/mockClients';
import { type CommercialAlly } from '@/config/allies';

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

const DISCOUNT_REQUESTS_KEY = 'jdr.ally-discount-requests.v1';
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function cleanDocument(value: string) {
  return value.replace(/\D/g, '');
}

export function formatCurrency(value: number) {
  return `$${value.toLocaleString('es-CO')}`;
}

export function extractDiscountPercent(discountLabel: string) {
  const normalized = discountLabel.replace(',', '.');
  const match = normalized.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : 0;
}

function isSameDay(date: Date, now = new Date()) {
  return date.toDateString() === now.toDateString();
}

function isSameWeek(date: Date, now = new Date()) {
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(now.getDate() - day + 1);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function isSameMonth(date: Date, now = new Date()) {
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function findActiveClientByCedula(cedula: string): ClientData | null {
  const cleanCedula = cleanDocument(cedula);
  const client = mockClients.find((item) => item.cedula === cleanCedula);
  return client?.estado === 'activo' ? client : null;
}

export function readDiscountRequests() {
  if (typeof window === 'undefined') {
    return [] as AllyDiscountRequest[];
  }

  const raw = window.localStorage.getItem(DISCOUNT_REQUESTS_KEY);
  if (!raw) {
    return [] as AllyDiscountRequest[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as AllyDiscountRequest[];
    }

    const now = Date.now();
    let changed = false;
    const normalized = (parsed as AllyDiscountRequest[]).map((request) => {
      const expiresAt =
        request.expiresAt ??
        new Date(new Date(request.createdAt).getTime() + ONE_DAY_IN_MS).toISOString();

      if (expiresAt !== request.expiresAt) {
        changed = true;
      }

      if (request.status === 'active' && new Date(expiresAt).getTime() <= now) {
        changed = true;
        return { ...request, expiresAt, status: 'expired' as const };
      }

      return {
        ...request,
        expiresAt,
        discountPercent: request.discountPercent ?? extractDiscountPercent(request.discountLabel),
        discountValue: request.discountValue ?? 0,
        totalAfterDiscount: request.totalAfterDiscount ?? 0,
      };
    });

    if (changed) {
      writeDiscountRequests(normalized);
    }

    return normalized;
  } catch {
    return [] as AllyDiscountRequest[];
  }
}

export function writeDiscountRequests(requests: AllyDiscountRequest[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(DISCOUNT_REQUESTS_KEY, JSON.stringify(requests));
}

function generateVerificationCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JR-${random}`;
}

// Flujo del codigo:
// 1. El cliente activo elige un aliado y se genera un codigo por 24 horas.
// 2. Solo puede existir un codigo activo por cedula + aliado.
// 3. El aliado valida el codigo; si esta activo registra consumo y se calcula el descuento.
// 4. El codigo cambia a usado, vencido o eliminado y queda en trazabilidad.
export function createDiscountRequest(client: ClientData, ally: CommercialAlly) {
  const cleanCedula = cleanDocument(client.cedula);
  const existingActiveCode = readDiscountRequests().find(
    (request) =>
      request.clientCedula === cleanCedula &&
      request.allyId === ally.id &&
      request.status === 'active',
  );

  if (existingActiveCode) {
    return existingActiveCode;
  }

  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ONE_DAY_IN_MS).toISOString();
  const discountLabel = ally.discountLabel || 'Descuento sujeto a condiciones';
  const request: AllyDiscountRequest = {
    id: `${cleanCedula}-${ally.id}-${Date.now()}`,
    code: generateVerificationCode(),
    clientCedula: cleanCedula,
    clientName: `${client.nombre} ${client.apellido}`.trim(),
    allyId: ally.id,
    allyName: ally.name,
    allyLoginId: ally.loginId ?? '',
    departamento: ally.departamento,
    municipio: ally.municipio,
    categorySlug: ally.categorySlug,
    subcategory: ally.subcategory,
    discountLabel,
    discountPercent: extractDiscountPercent(discountLabel),
    status: 'active',
    createdAt: now,
    expiresAt,
  };

  const next = [request, ...readDiscountRequests()];
  writeDiscountRequests(next);
  return request;
}

export function findActiveRequest(params: {
  cedula: string;
  code?: string;
  allyId?: string;
}) {
  const cedula = cleanDocument(params.cedula);
  const code = params.code?.trim().toUpperCase();

  const request = findRequestForVerification(params);
  return request?.status === 'active' ? request : null;
}

export function findRequestForVerification(params: {
  cedula: string;
  code?: string;
  allyId?: string;
}) {
  const cedula = cleanDocument(params.cedula);
  const code = params.code?.trim().toUpperCase();

  return (
    readDiscountRequests().find((request) => {
      const matchesCedula = request.clientCedula === cedula;
      const matchesCode = !code || request.code.toUpperCase() === code;
      const matchesAlly = !params.allyId || request.allyId === params.allyId;
      return matchesCedula && matchesCode && matchesAlly;
    }) ?? null
  );
}

export function redeemDiscountRequest(params: {
  requestId: string;
  consumedValue: number;
  redeemedBy: string;
}) {
  const now = new Date().toISOString();
  const requests = readDiscountRequests();
  const next = requests.map((request) =>
    request.id === params.requestId
      ? (() => {
          const discountPercent = request.discountPercent ?? extractDiscountPercent(request.discountLabel);
          const discountValue = Math.round((params.consumedValue * discountPercent) / 100);
          return {
            ...request,
            status: 'redeemed' as const,
            consumedValue: params.consumedValue,
            discountPercent,
            discountValue,
            totalAfterDiscount: params.consumedValue - discountValue,
            redeemedBy: params.redeemedBy,
            redeemedAt: now,
          };
        })()
      : request,
  );

  writeDiscountRequests(next);
  return next.find((request) => request.id === params.requestId) ?? null;
}

export function deleteDiscountRequest(requestId: string) {
  const now = new Date().toISOString();
  const requests = readDiscountRequests();
  const next = requests.map((request) =>
    request.id === requestId && request.status === 'active'
      ? {
          ...request,
          status: 'deleted' as const,
          deletedAt: now,
        }
      : request,
  );

  writeDiscountRequests(next);
  return next.find((request) => request.id === requestId) ?? null;
}

export function getDiscountStats(requests = readDiscountRequests()) {
  const redeemed = requests.filter((request) => request.status === 'redeemed');
  const totalConsumed = redeemed.reduce(
    (sum, request) => sum + (request.consumedValue ?? 0),
    0,
  );
  const totalDiscount = redeemed.reduce(
    (sum, request) => sum + (request.discountValue ?? 0),
    0,
  );

  return {
    generated: requests.length,
    active: requests.filter((request) => request.status === 'active').length,
    redeemed: redeemed.length,
    expired: requests.filter((request) => request.status === 'expired').length,
    deleted: requests.filter((request) => request.status === 'deleted').length,
    totalConsumed,
    totalDiscount,
    totalAfterDiscount: totalConsumed - totalDiscount,
  };
}

export function getConsumptionComparatives(requests = readDiscountRequests()) {
  const redeemed = requests.filter((request) => request.status === 'redeemed' && request.redeemedAt);

  const summarize = (items: AllyDiscountRequest[]) => ({
    count: items.length,
    consumed: items.reduce((sum, request) => sum + (request.consumedValue ?? 0), 0),
    discount: items.reduce((sum, request) => sum + (request.discountValue ?? 0), 0),
  });

  const today = redeemed.filter((request) => isSameDay(new Date(request.redeemedAt!)));
  const week = redeemed.filter((request) => isSameWeek(new Date(request.redeemedAt!)));
  const month = redeemed.filter((request) => isSameMonth(new Date(request.redeemedAt!)));

  return {
    today: summarize(today),
    week: summarize(week),
    month: summarize(month),
  };
}

export function getClientConsumptionSummary(cedula: string, requests = readDiscountRequests()) {
  const cleanCedula = cleanDocument(cedula);
  const clientRequests = requests.filter((request) => request.clientCedula === cleanCedula);
  return {
    requests: clientRequests,
    stats: getDiscountStats(clientRequests),
    comparatives: getConsumptionComparatives(clientRequests),
  };
}
