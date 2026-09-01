import { createHash, randomInt, timingSafeEqual } from 'crypto';

function codeSecret() {
  return process.env.AUTH_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'jdr-local-email-access';
}

export function createCandidateEmailAccessCode() {
  return randomInt(100000, 1000000).toString();
}

export function hashCandidateEmailAccessCode(email: string, code: string) {
  return createHash('sha256')
    .update(`${email.trim().toLowerCase()}:${code}:${codeSecret()}`)
    .digest('hex');
}

export function isCandidateEmailAccessCodeValid(expectedHash: string, receivedHash: string) {
  const expected = Buffer.from(expectedHash, 'hex');
  const received = Buffer.from(receivedHash, 'hex');
  return expected.length === received.length && timingSafeEqual(expected, received);
}

