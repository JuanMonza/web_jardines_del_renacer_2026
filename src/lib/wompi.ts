import { createHash } from 'crypto';

export interface WompiConfig {
  publicKey: string;
  privateKey: string;
  integritySecret: string;
  checkoutBaseUrl: string;
  apiBaseUrl: string;
}

interface IntegritySignatureInput {
  reference: string;
  amountInCents: number;
  currency: string;
  integritySecret: string;
  expirationTime?: string;
}

interface CheckoutUrlInput {
  publicKey: string;
  reference: string;
  amountInCents: number;
  currency: string;
  redirectUrl: string;
  integritySignature: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressCity: string;
  shippingAddressPhone: string;
  expirationTime?: string;
}

function resolveApiBaseUrl(publicKey: string) {
  const override = process.env.WOMPI_API_BASE_URL?.trim();
  if (override) {
    return override;
  }

  // Puedes sobreescribir este valor por env cuando tu cuenta use otro endpoint.
  // Si la llave empieza por pub_test_, asumimos sandbox para evitar cobros reales.
  return publicKey.startsWith('pub_test_')
    ? 'https://sandbox.wompi.co/v1'
    : 'https://production.wompi.co/v1';
}

export function getWompiConfig(): WompiConfig {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.trim() || '';
  const privateKey = process.env.WOMPI_PRIVATE_KEY?.trim() || '';
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET?.trim() || '';
  const checkoutBaseUrl =
    process.env.WOMPI_CHECKOUT_BASE_URL?.trim() || 'https://checkout.wompi.co/p/';

  return {
    publicKey,
    privateKey,
    integritySecret,
    checkoutBaseUrl,
    apiBaseUrl: resolveApiBaseUrl(publicKey),
  };
}

export function isWompiConfigured(config: WompiConfig) {
  return Boolean(config.publicKey && config.integritySecret);
}

export function buildIntegritySignature({
  reference,
  amountInCents,
  currency,
  integritySecret,
  expirationTime,
}: IntegritySignatureInput) {
  // Wompi pide este orden exacto para firmar la transacción.
  const base = `${reference}${amountInCents}${currency}${
    expirationTime ? expirationTime : ''
  }${integritySecret}`;
  return createHash('sha256').update(base).digest('hex');
}

export function buildWompiCheckoutUrl({
  publicKey,
  reference,
  amountInCents,
  currency,
  redirectUrl,
  integritySignature,
  customerEmail,
  customerName,
  customerPhone,
  shippingAddressLine1,
  shippingAddressCity,
  shippingAddressPhone,
  expirationTime,
}: CheckoutUrlInput) {
  // Usamos query params porque el checkout de Wompi se inicializa por URL.
  const params = new URLSearchParams();
  params.set('public-key', publicKey);
  params.set('currency', currency);
  params.set('amount-in-cents', String(amountInCents));
  params.set('reference', reference);
  params.set('redirect-url', redirectUrl);
  params.set('signature:integrity', integritySignature);
  params.set('customer-data:email', customerEmail);
  params.set('customer-data:full-name', customerName);
  params.set('customer-data:phone-number', customerPhone);
  params.set('shipping-address:address-line-1', shippingAddressLine1);
  params.set('shipping-address:city', shippingAddressCity);
  params.set('shipping-address:phone-number', shippingAddressPhone);
  params.set('shipping-address:country', 'CO');

  if (expirationTime) {
    params.set('expiration-time', expirationTime);
  }

  const checkoutBaseUrl =
    process.env.WOMPI_CHECKOUT_BASE_URL?.trim() || 'https://checkout.wompi.co/p/';
  return `${checkoutBaseUrl}?${params.toString()}`;
}
