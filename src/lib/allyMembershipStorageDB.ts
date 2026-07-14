import { query, execute } from './db';
import { type ClientData } from '@/data/mockClients'; // Se mantiene el tipo por ahora
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

/**
 * Valida si un cliente está activo.
 * NOTA: Esta función ahora debería consultar una tabla de 'clientes' o 'afiliados'.
 * Por ahora, se mantiene una lógica simulada.
 */
export function findActiveClientByCedula(cedula: string): ClientData | null {
  const cleanCedula = cleanDocument(cedula);
  // TODO: Reemplazar con una consulta a la tabla de clientes/afiliados.
  if (cleanCedula) {
    return { cedula: cleanCedula, nombre: 'Cliente', apellido: 'Activo', estado: 'activo' };
  }
  return null;
}

function mapDbCodeToDiscountRequest(dbCode: any): AllyDiscountRequest | null {
  if (!dbCode || !dbCode.id) {
    return null;
  }
  return {
    id: dbCode.id,
    code: dbCode.codigo,
    clientCedula: dbCode.cliente_cedula,
    clientName: dbCode.cliente_nombre,
    allyId: dbCode.aliado_id,
    allyName: dbCode.aliado_nombre,
    allyLoginId: dbCode.aliado_login_id,
    departamento: dbCode.aliado_departamento,
    municipio: dbCode.aliado_municipio,
    categorySlug: dbCode.aliado_categoria,
    subcategory: dbCode.aliado_subcategoria,
    discountLabel: dbCode.descuento_etiqueta,
    discountPercent: Number(dbCode.descuento_porcentaje),
    status: dbCode.estado,
    consumedValue: dbCode.valor_consumido ? Number(dbCode.valor_consumido) : undefined,
    discountValue: dbCode.valor_descuento ? Number(dbCode.valor_descuento) : undefined,
    totalAfterDiscount: dbCode.total_despues_dto ? Number(dbCode.total_despues_dto) : undefined,
    redeemedBy: dbCode.canjeado_por,
    createdAt: new Date(dbCode.creado_en).toISOString(),
    expiresAt: new Date(dbCode.expira_en).toISOString(),
    redeemedAt: dbCode.canjeado_en ? new Date(dbCode.canjeado_en).toISOString() : undefined,
    deletedAt: dbCode.eliminado_en ? new Date(dbCode.eliminado_en).toISOString() : undefined,
  };
}

function generateVerificationCode() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `JR-${random}`;
}

export async function createDiscountRequestInDB(client: ClientData, ally: CommercialAlly): Promise<AllyDiscountRequest> {
  const cleanCedula = cleanDocument(client.cedula);

  // 1. Verificar si ya existe un código activo para este cliente y aliado.
  const existingRows = await query(
    'SELECT * FROM codigos_descuento WHERE cliente_cedula = ? AND aliado_id = ? AND estado = "active" AND expira_en > NOW()',
    [cleanCedula, ally.id],
  );

  const existingActiveCode = existingRows.length > 0 ? mapDbCodeToDiscountRequest(existingRows[0]) : null;

  if (existingActiveCode) {
    return existingActiveCode;
  }

  // 2. Generar un nuevo código.
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ONE_DAY_IN_MS);
  const discountLabel = ally.discountLabel || 'Descuento sujeto a condiciones';
  const newCode = generateVerificationCode();

  const sql = `
    INSERT INTO codigos_descuento (
      codigo, cliente_cedula, cliente_nombre, aliado_id, aliado_nombre, aliado_login_id,
      aliado_departamento, aliado_municipio, aliado_categoria, aliado_subcategoria,
      descuento_etiqueta, descuento_porcentaje, estado, creado_en, expira_en
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `;

  const clientName = `${client.nombre} ${client.apellido}`.trim();
  const discountPercent = extractDiscountPercent(discountLabel);

  const params = [
    newCode, cleanCedula, clientName, ally.id, ally.name, ally.loginId ?? '',
    ally.departamento, ally.municipio, ally.categorySlug, ally.subcategory,
    discountLabel, discountPercent, now, expiresAt
  ];

  const result = await execute(sql, params);
  const newId = result.insertId; // Asumiendo que `execute` devuelve un objeto con `insertId`

  // 3. Devolver el objeto completo del código recién creado.
  // Esto es una simulación, lo ideal sería volver a consultar por el ID.
  const createdRequest: AllyDiscountRequest = {
    id: String(newId),
    code: generateVerificationCode(),
    clientCedula: cleanCedula,
    clientName: clientName,
    allyId: ally.id,
    allyName: ally.name,
    allyLoginId: ally.loginId ?? '',
    departamento: ally.departamento,
    municipio: ally.municipio,
    categorySlug: ally.categorySlug,
    subcategory: ally.subcategory,
    discountLabel,
    discountPercent,
    status: 'active',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  return createdRequest;
}

export async function findRequestForVerificationFromDB(params: {
  cedula: string;
  code?: string;
  allyId?: string;
}): Promise<AllyDiscountRequest | null> {
  const cedula = cleanDocument(params.cedula);
  const code = params.code?.trim().toUpperCase();

  let sql = 'SELECT * FROM codigos_descuento WHERE cliente_cedula = ?';
  const queryParams: (string | undefined)[] = [cedula];

  if (code) {
    sql += ' AND codigo = ?';
    queryParams.push(code);
  }
  if (params.allyId) {
    sql += ' AND aliado_id = ?';
    queryParams.push(params.allyId);
  }
  sql += ' LIMIT 1';

  const rows = await query(sql, queryParams);
  if (rows.length === 0) {
    return null;
  }

  return mapDbCodeToDiscountRequest(rows[0]);
}

export async function redeemDiscountRequestInDB(params: {
  requestId: string;
  consumedValue: number;
  redeemedBy: string;
}): Promise<AllyDiscountRequest | null> {
  const now = new Date();
  const requestToRedeem = await findRequestForVerificationFromDB({ cedula: '', code: undefined, allyId: undefined, requestId: params.requestId });

  if (!requestToRedeem || requestToRedeem.status !== 'active') {
    return null; // No se puede canjear un código que no está activo
  }

  const discountPercent = requestToRedeem.discountPercent ?? extractDiscountPercent(requestToRedeem.discountLabel);
  const discountValue = Math.round((params.consumedValue * discountPercent) / 100);
  const totalAfterDiscount = params.consumedValue - discountValue;

  const sql = `
    UPDATE codigos_descuento
    SET
      estado = 'redeemed',
      valor_consumido = ?,
      valor_descuento = ?,
      total_despues_dto = ?,
      canjeado_por = ?,
      canjeado_en = ?
    WHERE id = ? AND estado = 'active'
  `;

  const queryParams = [params.consumedValue, discountValue, totalAfterDiscount, params.redeemedBy, now, params.requestId];
  const result = await execute(sql, queryParams);

  if (result.affectedRows > 0) {
    const updatedRows = await query('SELECT * FROM codigos_descuento WHERE id = ?', [params.requestId]);
    return mapDbCodeToDiscountRequest(updatedRows[0]);
  }

  return null;
}
