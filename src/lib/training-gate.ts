export const TRAINING_GATE_COOKIE = 'jdr_training_access';
export const TRAINING_GATE_TTL_SECONDS = 8 * 60 * 60;

const encoder = new TextEncoder();

function toHex(value: ArrayBuffer) {
  return Array.from(new Uint8Array(value))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function sign(expiresAt: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(expiresAt)));
}

export async function createTrainingGateToken(secret: string) {
  const expiresAt = String(Math.floor(Date.now() / 1000) + TRAINING_GATE_TTL_SECONDS);
  return `${expiresAt}.${await sign(expiresAt, secret)}`;
}

export async function verifyTrainingGateToken(token: string | undefined, secret: string) {
  if (!token || !secret) return false;
  const [expiresAt, receivedSignature, extra] = token.split('.');
  if (extra || !/^\d{10}$/.test(expiresAt || '') || !/^[a-f0-9]{64}$/.test(receivedSignature || '')) return false;
  const expiration = Number(expiresAt);
  if (!Number.isSafeInteger(expiration) || expiration <= Math.floor(Date.now() / 1000)) return false;
  return constantTimeEqual(receivedSignature, await sign(expiresAt, secret));
}

export async function secureTextEqual(left: string, right: string) {
  const [leftHash, rightHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(left)),
    crypto.subtle.digest('SHA-256', encoder.encode(right)),
  ]);
  return constantTimeEqual(toHex(leftHash), toHex(rightHash));
}
