'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import {
  readFlowerOrders,
  type FlowerOrderRecord,
  writeFlowerOrders,
} from '@/lib/flowerOrdersStorage';
import {
  consumePendingFlowerPayment,
  getPendingFlowerPayment,
} from '@/lib/flowerPaymentStorage';
import { buildFlowerOrderWhatsAppUrl } from '@/lib/flowerOrderWhatsApp';

type VerificationUiStatus = 'loading' | 'approved' | 'pending' | 'declined' | 'error';

type VerifyApiResponse = {
  ok: boolean;
  approved?: boolean;
  status?: string;
  reference?: string;
  amountInCents?: number;
  paymentMethodType?: string;
  transactionId?: string;
  finalizedAt?: string;
  message?: string;
};

function normalizeUiStatus(status: string | undefined): VerificationUiStatus {
  if (status === 'APPROVED') {
    return 'approved';
  }
  if (status === 'PENDING') {
    return 'pending';
  }
  if (status === 'DECLINED' || status === 'VOIDED') {
    return 'declined';
  }
  return 'error';
}

function upsertFlowerOrder(order: FlowerOrderRecord) {
  const current = readFlowerOrders();
  const index = current.findIndex((record) => record.orderCode === order.orderCode);

  if (index === -1) {
    // Cuando no existe, lo insertamos arriba para que aparezca primero en seguimiento.
    writeFlowerOrders([order, ...current]);
    return order;
  }

  const next = [...current];
  next[index] = order;
  writeFlowerOrders(next);
  return order;
}

function FlowerPaymentResultContent() {
  const searchParams = useSearchParams();
  const [uiStatus, setUiStatus] = useState<VerificationUiStatus>('loading');
  const [feedback, setFeedback] = useState('Verificando tu pago...');
  const [order, setOrder] = useState<FlowerOrderRecord | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [refreshTick, setRefreshTick] = useState(0);

  const orderCode = (searchParams.get('orderCode') || '').trim().toUpperCase();
  const urlTransactionId = (searchParams.get('id') || '').trim();
  const whatsappUrl = useMemo(
    () => (order ? buildFlowerOrderWhatsAppUrl(order) : ''),
    [order],
  );

  useEffect(() => {
    let isMounted = true;

    const verifyPayment = async () => {
      if (!orderCode || !urlTransactionId) {
        if (isMounted) {
          setUiStatus('error');
          setFeedback(
            'No recibimos el identificador de transacción. Intenta realizar el pago nuevamente.',
          );
        }
        return;
      }

      if (isMounted) {
        setUiStatus('loading');
        setFeedback('Verificando tu pago en la pasarela...');
      }

      const pendingPayment = getPendingFlowerPayment(orderCode);
      const expectedAmountInCents = pendingPayment
        ? Math.round(pendingPayment.order.total * 100)
        : null;
      const params = new URLSearchParams({
        id: urlTransactionId,
        orderCode,
      });
      if (expectedAmountInCents) {
        params.set('amountInCents', String(expectedAmountInCents));
      }

      try {
        const response = await fetch(`/api/floreria/pagos/verificar?${params.toString()}`, {
          method: 'GET',
          cache: 'no-store',
        });
        const result = (await response.json()) as VerifyApiResponse;

        if (!response.ok || !result.ok) {
          throw new Error(result.message || 'No pudimos verificar la transacción.');
        }

        if (!isMounted) {
          return;
        }

        setTransactionId(result.transactionId || urlTransactionId);
        const currentStatus = normalizeUiStatus(result.status);

        if (!result.approved || currentStatus !== 'approved') {
          setUiStatus(currentStatus);
          setFeedback(
            currentStatus === 'pending'
              ? 'Tu pago aún está en proceso. Puedes volver a consultar en unos minutos.'
              : 'El pago no fue aprobado. Puedes intentarlo nuevamente.',
          );
          return;
        }

        const existingOrder = readFlowerOrders().find(
          (record) => record.orderCode === orderCode,
        );
        // Prioridad: orden ya guardada > orden pendiente en memoria local.
        const baseOrder = existingOrder ?? pendingPayment?.order ?? null;

        if (!baseOrder) {
          setUiStatus('error');
          setFeedback(
            'Pago aprobado, pero no encontramos el pedido asociado. Contacta soporte para finalizar la solicitud.',
          );
          return;
        }

        const now = new Date().toISOString();
        const alreadyRecordedEvent = baseOrder.events.some((event) =>
          event.note.includes(urlTransactionId),
        );
        const nextEvents = alreadyRecordedEvent
          ? baseOrder.events
          : [
              ...baseOrder.events,
              {
                status: 'Confirmada' as const,
                timestamp: now,
                note: `Pago aprobado y verificado (${result.transactionId || urlTransactionId}).`,
              },
            ];

        const verifiedOrder: FlowerOrderRecord = {
          ...baseOrder,
          status: 'Confirmada',
          paymentStatus: 'aprobado',
          paymentProvider: 'wompi',
          paymentReference: result.reference || orderCode,
          paymentTransactionId: result.transactionId || urlTransactionId,
          paymentMethodType: result.paymentMethodType || '',
          paidAt: result.finalizedAt || now,
          events: nextEvents,
        };

        const savedOrder = upsertFlowerOrder(verifiedOrder);
        consumePendingFlowerPayment(orderCode);

        setOrder(savedOrder);
        setUiStatus('approved');
        setFeedback('Pago aprobado y verificado. Ya puedes enviar la solicitud a nuestro equipo.');
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setUiStatus('error');
        setFeedback(
          error instanceof Error
            ? error.message
            : 'No fue posible verificar tu pago en este momento.',
        );
      }
    };

    void verifyPayment();
    return () => {
      isMounted = false;
    };
  }, [orderCode, refreshTick, urlTransactionId]);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-gradient-to-br from-background via-primary/5 to-background">
      <Container>
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            {uiStatus === 'loading' && (
              <article className="glass rounded-3xl border border-primary/20 p-10 text-center">
                <div className="flex justify-center mb-6">
                  <svg
                    className="h-14 w-14 animate-spin text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-text mb-2">Validando tu pago</h1>
                <p className="text-textLight">{feedback}</p>
              </article>
            )}

            {uiStatus === 'approved' && order && (
              <article className="glass rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-8 md:p-10">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 text-white mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-text mb-2">Pago aprobado</h1>
                  <p className="text-textLight">{feedback}</p>
                </div>

                <div className="mt-6 rounded-2xl border border-primary/15 bg-white/50 p-5 space-y-2">
                  <p className="text-sm text-text">
                    <strong>Pedido:</strong> <span className="font-mono">{order.orderCode}</span>
                  </p>
                  <p className="text-sm text-text">
                    <strong>Transacción:</strong> <span className="font-mono">{transactionId}</span>
                  </p>
                  <p className="text-sm text-text">
                    <strong>Total pagado:</strong> ${order.total.toLocaleString('es-CO')}
                  </p>
                  <p className="text-sm text-text">
                    <strong>Estado del pedido:</strong> {order.status}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                  >
                    Enviar solicitud por WhatsApp
                  </Button>
                  <Link href="/floreria" className="w-full">
                    <Button variant="secondary" className="w-full justify-center">
                      Volver a florería
                    </Button>
                  </Link>
                </div>
              </article>
            )}

            {(uiStatus === 'pending' || uiStatus === 'declined' || uiStatus === 'error') && (
              <article className="glass rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-transparent p-8 md:p-10">
                <h1 className="text-3xl font-bold text-text mb-3">
                  {uiStatus === 'pending'
                    ? 'Pago en proceso'
                    : uiStatus === 'declined'
                      ? 'Pago no aprobado'
                      : 'No pudimos validar tu pago'}
                </h1>
                <p className="text-textLight mb-4">{feedback}</p>
                {transactionId && (
                  <p className="text-xs text-textLight mb-6">
                    Transacción: <span className="font-mono">{transactionId}</span>
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => setRefreshTick((prev) => prev + 1)}
                  >
                    Consultar nuevamente
                  </Button>
                  <Link href="/floreria" className="w-full">
                    <Button variant="secondary" className="w-full justify-center">
                      Volver a florería
                    </Button>
                  </Link>
                </div>
              </article>
            )}
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}

export default function FlowerPaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-28 pb-20">
          <Container>
            <p className="text-center text-textLight">Cargando verificación de pago...</p>
          </Container>
        </div>
      }
    >
      <FlowerPaymentResultContent />
    </Suspense>
  );
}
