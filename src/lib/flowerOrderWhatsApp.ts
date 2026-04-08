import { buildWhatsAppUrl } from '@/config/contact';
import type { FlowerOrderRecord } from '@/lib/flowerOrdersStorage';

function buildItemsSummary(order: FlowerOrderRecord) {
  // Resumen compacto cuando el pedido trae varios arreglos.
  return order.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.nombre} x${item.cantidad} - $${(
          item.precio * item.cantidad
        ).toLocaleString('es-CO')}`,
    )
    .join('\n');
}

export function buildFlowerOrderWhatsAppMessage(order: FlowerOrderRecord) {
  // Para un solo arreglo mostramos texto corto; para carrito mostramos detalle por línea.
  const detail =
    order.items.length === 1
      ? `*Arreglo:* ${order.items[0].nombre}\n`
      : `*Detalle del pedido:*\n${buildItemsSummary(order)}\n`;

  return (
    `*PEDIDO FLORERÍA - ${order.orderCode}*\n\n` +
    `*Pago:* ${order.paymentStatus === 'aprobado' ? 'Aprobado' : 'Pendiente'}\n` +
    `*Estado del pedido:* ${order.status}\n` +
    (order.paymentTransactionId
      ? `*Transacción:* ${order.paymentTransactionId}\n`
      : '') +
    detail +
    `*TOTAL:* $${order.total.toLocaleString('es-CO')}\n\n` +
    `*DATOS DEL REMITENTE:*\n` +
    `Nombre: ${order.customerName}\n` +
    `Teléfono: ${order.customerPhone}\n` +
    `Email: ${order.customerEmail || 'No registra'}\n\n` +
    `*DATOS DE ENTREGA:*\n` +
    `Destinatario: ${order.recipientName}\n` +
    `${order.deliveryAddress}\n` +
    `Fecha entrega: ${order.deliveryDate}\n\n` +
    `*Mensaje en tarjeta:*\n${order.cardMessage || 'Sin mensaje'}`
  );
}

export function buildFlowerOrderWhatsAppUrl(order: FlowerOrderRecord) {
  return buildWhatsAppUrl(buildFlowerOrderWhatsAppMessage(order));
}
