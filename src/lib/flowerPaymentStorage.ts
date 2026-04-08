import type { FlowerOrderRecord } from '@/lib/flowerOrdersStorage';

export interface PendingFlowerPayment {
  orderCode: string;
  createdAt: string;
  source: 'single' | 'cart';
  order: FlowerOrderRecord;
}

// Este storage mantiene pedidos "en tránsito" mientras el cliente termina el pago.
const FLOWER_PENDING_PAYMENTS_STORAGE_KEY = 'jdr.floreria.pending-payments.v1';

function readRawPendingPayments() {
  if (typeof window === 'undefined') {
    return [] as PendingFlowerPayment[];
  }

  const raw = window.localStorage.getItem(FLOWER_PENDING_PAYMENTS_STORAGE_KEY);
  if (!raw) {
    return [] as PendingFlowerPayment[];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [] as PendingFlowerPayment[];
    }

    // Limpiamos registros dañados para no romper el retorno desde la pasarela.
    return parsed.filter(
      (item) =>
        item &&
        typeof item.orderCode === 'string' &&
        item.order &&
        typeof item.order.orderCode === 'string',
    ) as PendingFlowerPayment[];
  } catch {
    return [] as PendingFlowerPayment[];
  }
}

function writeRawPendingPayments(payload: PendingFlowerPayment[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(FLOWER_PENDING_PAYMENTS_STORAGE_KEY, JSON.stringify(payload));
}

export function savePendingFlowerPayment(payload: PendingFlowerPayment) {
  const current = readRawPendingPayments().filter(
    (item) => item.orderCode !== payload.orderCode,
  );
  writeRawPendingPayments([payload, ...current]);
}

export function getPendingFlowerPayment(orderCode: string) {
  return readRawPendingPayments().find((item) => item.orderCode === orderCode) ?? null;
}

export function consumePendingFlowerPayment(orderCode: string) {
  const current = readRawPendingPayments();
  const target = current.find((item) => item.orderCode === orderCode) ?? null;
  if (!target) {
    return null;
  }
  // Lo consumimos para que no se vuelva a procesar dos veces la misma orden.
  const next = current.filter((item) => item.orderCode !== orderCode);
  writeRawPendingPayments(next);
  return target;
}
