import { query, execute } from './db';

export type FlowerOrderStatus =
  | 'Creada'
  | 'Confirmada'
  | 'En preparacion'
  | 'En ruta'
  | 'Entregada';

export type FlowerPaymentStatus =
  | 'pendiente'
  | 'aprobado'
  | 'rechazado'
  | 'error';

export const FLOWER_ORDER_STATUS_STEPS: FlowerOrderStatus[] = [
  'Creada',
  'Confirmada',
  'En preparacion',
  'En ruta',
  'Entregada',
];

export interface FlowerOrderEvent {
  status: FlowerOrderStatus;
  timestamp: string;
  note: string;
}

export interface FlowerOrderItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface FlowerOrderRecord {
  id: string;
  orderCode: string;
  status: FlowerOrderStatus;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  recipientName: string;
  deliveryAddress: string;
  deliveryDate: string;
  cardMessage: string;
  items: FlowerOrderItem[];
  total: number;
  source: 'single' | 'cart';
  events: FlowerOrderEvent[];
  paymentStatus?: FlowerPaymentStatus;
  paymentProvider?: 'wompi';
  paymentReference?: string;
  paymentTransactionId?: string;
  paymentMethodType?: string;
  paidAt?: string;
}

export const FLOWER_ORDERS_STORAGE_KEY = 'jdr.floreria.orders.v1';

/**
 * Mapea una fila de la tabla `flores_ordenes` a la interfaz `FlowerOrderRecord`.
 * @param dbOrder - El objeto de la orden desde la base de datos.
 * @returns Un objeto `FlowerOrderRecord` normalizado o `null`.
 */
function mapDbOrderToFlowerOrderRecord(dbOrder: any): FlowerOrderRecord | null {
  if (!dbOrder || !dbOrder.id || !dbOrder.order_code) {
    return null;
  }

  return {
    id: dbOrder.id,
    orderCode: dbOrder.order_code,
    status: dbOrder.status,
    createdAt: new Date(dbOrder.created_at).toISOString(),
    customerName: dbOrder.customer_name,
    customerPhone: dbOrder.customer_phone,
    customerEmail: dbOrder.customer_email,
    recipientName: dbOrder.recipient_name,
    deliveryAddress: dbOrder.delivery_address,
    deliveryDate: dbOrder.delivery_date,
    cardMessage: dbOrder.card_message,
    // Los campos JSON se parsean. Si son nulos o inválidos, se devuelve un array vacío.
    items: dbOrder.items ? JSON.parse(dbOrder.items) : [],
    total: Number(dbOrder.total),
    source: dbOrder.source,
    events: dbOrder.events ? JSON.parse(dbOrder.events) : [],
    paymentStatus: dbOrder.payment_status,
    paymentProvider: dbOrder.payment_provider,
    paymentReference: dbOrder.payment_reference,
    paymentTransactionId: dbOrder.payment_transaction_id,
    paymentMethodType: dbOrder.payment_method_type,
    paidAt: dbOrder.paid_at ? new Date(dbOrder.paid_at).toISOString() : undefined,
  };
}

/**
 * Crea una nueva orden de florería en la base de datos.
 * @param orderData - Los datos de la nueva orden.
 * @returns El ID de la nueva orden creada.
 */
export async function createFlowerOrderInDB(orderData: Omit<FlowerOrderRecord, 'id'>) {
  const {
    orderCode, status, createdAt, customerName, customerPhone, customerEmail,
    recipientName, deliveryAddress, deliveryDate, cardMessage, items, total,
    source, events, paymentStatus, paymentProvider, paymentReference,
  } = orderData;

  const sql = `
    INSERT INTO flores_ordenes (
      order_code, status, created_at, customer_name, customer_phone, customer_email,
      recipient_name, delivery_address, delivery_date, card_message, items, total,
      source, events, payment_status, payment_provider, payment_reference
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    orderCode, status, createdAt, customerName, customerPhone, customerEmail,
    recipientName, deliveryAddress, deliveryDate, cardMessage,
    JSON.stringify(items), // Los arrays de objetos se guardan como texto JSON
    total, source,
    JSON.stringify(events),
    paymentStatus, paymentProvider, paymentReference,
  ];

  const result = await execute(sql, params);
  return result.insertId;
}

/**
 * Busca una orden de florería por su código único.
 * @param orderCode - El código de la orden a buscar.
 * @returns Una promesa que se resuelve en el objeto `FlowerOrderRecord` o `null`.
 */
export async function getFlowerOrderByCodeFromDB(orderCode: string): Promise<FlowerOrderRecord | null> {
  const rows = await query('SELECT * FROM flores_ordenes WHERE order_code = ?', [orderCode]);
  if (rows.length === 0) {
    return null;
  }
  return mapDbOrderToFlowerOrderRecord(rows[0]);
}

/**
 * Actualiza el estado de pago de una orden de florería.
 * @param orderCode - El código de la orden a actualizar.
 * @param paymentData - Los datos del pago a actualizar.
 * @returns El número de filas afectadas.
 */
export async function updateFlowerOrderPaymentInDB(
  orderCode: string,
  paymentData: Partial<Pick<FlowerOrderRecord, 'paymentStatus' | 'paymentTransactionId' | 'paymentMethodType' | 'paidAt'>>,
) {
  const { paymentStatus, paymentTransactionId, paymentMethodType, paidAt } = paymentData;

  const sql = `
    UPDATE flores_ordenes
    SET
      payment_status = ?,
      payment_transaction_id = ?,
      payment_method_type = ?,
      paid_at = ?
    WHERE order_code = ?
  `;

  const params = [paymentStatus, paymentTransactionId, paymentMethodType, paidAt, orderCode];
  const result = await execute(sql, params);
  return result.affectedRows;
}
