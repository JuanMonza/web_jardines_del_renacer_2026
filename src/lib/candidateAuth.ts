import type { CandidateProfile } from '@/config/candidates';
import { readCandidateProfile, writeCandidateProfile } from '@/lib/candidateStorage';

export interface VacantesCandidateSession {
  documentNumber: string;
  email: string;
  name: string;
  role: 'vacantes_usuario';
  createdAt: string;
}

export interface CandidatePasswordResetRequest {
  token: string;
  code: string;
  documentNumber: string;
  email: string;
  createdAt: string;
  expiresAt: string;
}

const CANDIDATE_SESSION_STORAGE_KEY = 'jdr.vacantes.candidate.session.v1';
const CANDIDATE_RESET_STORAGE_KEY = 'jdr.vacantes.candidate.reset.v1';
export const CANDIDATE_SESSION_COOKIE_NAME = 'jdr.vacantes.candidate.session';
export const CANDIDATE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function profileHasIdentity(profile: CandidateProfile) {
  return profile.documentNumber.trim().length > 0 && profile.email.trim().length > 0;
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('');
}

function buildFallbackHash(value: string) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
}

function randomHex(size: number) {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(size);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((part) => part.toString(16).padStart(2, '0'))
      .join('');
  }

  return Array.from({ length: size })
    .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
    .join('');
}

function isExpired(isoDate: string) {
  return Number.isNaN(new Date(isoDate).getTime()) || new Date(isoDate).getTime() < Date.now();
}

function getCandidateJwtSecret() {
  return process.env.CANDIDATE_JWT_SECRET || process.env.JWT_SECRET || '';
}

export async function signVacantesCandidateJwt(
  session: Omit<VacantesCandidateSession, 'createdAt'>,
) {
  const secretValue = getCandidateJwtSecret();
  if (!secretValue) {
    throw new Error('CANDIDATE_JWT_SECRET o JWT_SECRET no esta definido.');
  }

  const { SignJWT } = await import('jose');
  const secret = new TextEncoder().encode(secretValue);
  const documentNumber = normalizeDocumentNumber(session.documentNumber);
  const email = normalizeEmail(session.email);

  return new SignJWT({
    email,
    name: session.name,
    role: 'vacantes_usuario',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(documentNumber)
    .setIssuedAt()
    .setExpirationTime(`${CANDIDATE_SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret);
}

export async function verifyVacantesCandidateJwt(token: string) {
  const secretValue = getCandidateJwtSecret();
  if (!secretValue) {
    return null as VacantesCandidateSession | null;
  }

  try {
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(secretValue);
    const { payload } = await jwtVerify(token, secret);
    const documentNumber = typeof payload.sub === 'string' ? normalizeDocumentNumber(payload.sub) : '';
    const email = typeof payload.email === 'string' ? normalizeEmail(payload.email) : '';
    const name = typeof payload.name === 'string' ? payload.name : '';
    const role = payload.role === 'vacantes_usuario' ? 'vacantes_usuario' : null;
    const issuedAt = typeof payload.iat === 'number'
      ? new Date(payload.iat * 1000).toISOString()
      : new Date().toISOString();

    if (!documentNumber || !email || !name || !role) {
      return null;
    }

    return {
      documentNumber,
      email,
      name,
      role,
      createdAt: issuedAt,
    };
  } catch {
    return null;
  }
}

export async function hashCandidatePassword(password: string) {
  const normalized = password.trim();
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(normalized);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    return toHex(digest);
  }

  return buildFallbackHash(normalized);
}

export async function withCandidatePassword(profile: CandidateProfile, password: string) {
  return {
    ...profile,
    passwordHash: await hashCandidatePassword(password),
    passwordUpdatedAt: new Date().toISOString(),
  };
}

export function readVacantesCandidateSession() {
  if (typeof window === 'undefined') {
    return null as VacantesCandidateSession | null;
  }
  const raw = window.localStorage.getItem(CANDIDATE_SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<VacantesCandidateSession>;
    if (
      !parsed.documentNumber ||
      !parsed.email ||
      !parsed.name ||
      parsed.role !== 'vacantes_usuario' ||
      !parsed.createdAt
    ) {
      return null;
    }

    return {
      documentNumber: normalizeDocumentNumber(parsed.documentNumber),
      email: normalizeEmail(parsed.email),
      name: parsed.name,
      role: 'vacantes_usuario',
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

export function saveVacantesCandidateSession(session: Omit<VacantesCandidateSession, 'createdAt'>) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: VacantesCandidateSession = {
    ...session,
    documentNumber: normalizeDocumentNumber(session.documentNumber),
    email: normalizeEmail(session.email),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CANDIDATE_SESSION_STORAGE_KEY, JSON.stringify(payload));
}

export function clearVacantesCandidateSession() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(CANDIDATE_SESSION_STORAGE_KEY);
}

export async function verifyVacantesCandidateCredentials(input: {
  documentNumber: string;
  password: string;
}) {
  const documentNumber = normalizeDocumentNumber(input.documentNumber);
  const profile = readCandidateProfile();

  if (!profileHasIdentity(profile)) {
    return { ok: false as const, reason: 'profile_not_found' as const };
  }

  if (normalizeDocumentNumber(profile.documentNumber) !== documentNumber) {
    return { ok: false as const, reason: 'invalid_credentials' as const };
  }

  if (!profile.passwordHash) {
    return { ok: false as const, reason: 'password_not_configured' as const };
  }

  const hashedPassword = await hashCandidatePassword(input.password);
  if (hashedPassword !== profile.passwordHash) {
    return { ok: false as const, reason: 'invalid_credentials' as const };
  }

  return {
    ok: true as const,
    profile,
  };
}

export function createCandidatePasswordResetRequest(input: {
  documentNumber: string;
  email: string;
}) {
  if (typeof window === 'undefined') {
    return { ok: false as const, reason: 'storage_unavailable' as const };
  }

  const documentNumber = normalizeDocumentNumber(input.documentNumber);
  const email = normalizeEmail(input.email);
  const profile = readCandidateProfile();

  if (!profileHasIdentity(profile)) {
    return { ok: false as const, reason: 'profile_not_found' as const };
  }

  if (
    normalizeDocumentNumber(profile.documentNumber) !== documentNumber ||
    normalizeEmail(profile.email) !== email
  ) {
    return { ok: false as const, reason: 'identity_mismatch' as const };
  }

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
  const payload: CandidatePasswordResetRequest = {
    token: randomHex(24),
    code: Math.floor(100000 + Math.random() * 900000).toString(),
    documentNumber,
    email,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  window.localStorage.setItem(CANDIDATE_RESET_STORAGE_KEY, JSON.stringify(payload));
  return { ok: true as const, request: payload };
}

export function readCandidatePasswordResetRequest() {
  if (typeof window === 'undefined') {
    return null as CandidatePasswordResetRequest | null;
  }
  const raw = window.localStorage.getItem(CANDIDATE_RESET_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CandidatePasswordResetRequest>;
    if (
      !parsed.token ||
      !parsed.code ||
      !parsed.documentNumber ||
      !parsed.email ||
      !parsed.createdAt ||
      !parsed.expiresAt
    ) {
      return null;
    }
    return {
      token: parsed.token,
      code: parsed.code,
      documentNumber: normalizeDocumentNumber(parsed.documentNumber),
      email: normalizeEmail(parsed.email),
      createdAt: parsed.createdAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function clearCandidatePasswordResetRequest() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(CANDIDATE_RESET_STORAGE_KEY);
}

export function validateCandidatePasswordResetToken(input: {
  token: string;
  documentNumber: string;
}) {
  const request = readCandidatePasswordResetRequest();
  if (!request) {
    return { ok: false as const, reason: 'missing_request' as const };
  }

  if (
    request.token !== input.token ||
    request.documentNumber !== normalizeDocumentNumber(input.documentNumber)
  ) {
    return { ok: false as const, reason: 'invalid_token' as const };
  }

  if (isExpired(request.expiresAt)) {
    clearCandidatePasswordResetRequest();
    return { ok: false as const, reason: 'expired' as const };
  }

  return { ok: true as const, request };
}

export async function completeCandidatePasswordReset(input: {
  token: string;
  documentNumber: string;
  code: string;
  newPassword: string;
}) {
  const tokenValidation = validateCandidatePasswordResetToken({
    token: input.token,
    documentNumber: input.documentNumber,
  });

  if (!tokenValidation.ok) {
    return tokenValidation;
  }

  if (tokenValidation.request.code !== input.code.trim()) {
    return { ok: false as const, reason: 'invalid_code' as const };
  }

  if (input.newPassword.trim().length < 8) {
    return { ok: false as const, reason: 'weak_password' as const };
  }

  const profile = readCandidateProfile();
  if (!profileHasIdentity(profile)) {
    return { ok: false as const, reason: 'profile_not_found' as const };
  }

  if (normalizeDocumentNumber(profile.documentNumber) !== tokenValidation.request.documentNumber) {
    return { ok: false as const, reason: 'identity_mismatch' as const };
  }

  const updatedProfile = await withCandidatePassword(profile, input.newPassword);
  writeCandidateProfile(updatedProfile);
  clearCandidatePasswordResetRequest();

  return {
    ok: true as const,
    profile: updatedProfile,
  };
}
