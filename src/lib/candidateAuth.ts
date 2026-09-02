export interface VacantesCandidateSession {
  candidateId?: string;
  documentNumber: string;
  email: string;
  name: string;
  role: 'vacantes_usuario';
  passwordResetAuthorized?: boolean;
  createdAt: string;
}

export const CANDIDATE_SESSION_COOKIE_NAME = 'jdr.vacantes.candidate.session';
export const CANDIDATE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((part) => part.toString(16).padStart(2, '0'))
    .join('');
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
    candidateId: session.candidateId,
    email,
    name: session.name,
    role: 'vacantes_usuario',
    passwordResetAuthorized: session.passwordResetAuthorized === true,
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
    const candidateId = typeof payload.candidateId === 'string' ? payload.candidateId : undefined;
    const email = typeof payload.email === 'string' ? normalizeEmail(payload.email) : '';
    const name = typeof payload.name === 'string' ? payload.name : '';
    const role = payload.role === 'vacantes_usuario' ? 'vacantes_usuario' : null;
    const passwordResetAuthorized = payload.passwordResetAuthorized === true;
    const issuedAt = typeof payload.iat === 'number'
      ? new Date(payload.iat * 1000).toISOString()
      : new Date().toISOString();

    if (!documentNumber || !email || !name || !role) {
      return null;
    }

    return {
      documentNumber,
      candidateId,
      email,
      name,
      role,
      passwordResetAuthorized,
      createdAt: issuedAt,
    };
  } catch {
    return null;
  }
}

export async function hashCandidatePasswordForDB(password: string) {
  const normalized = password.trim();
  if (normalized.length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres.');
  }

  const bcrypt = await import('bcryptjs');
  return bcrypt.hash(normalized, 12);
}

export async function verifyCandidatePasswordForDB(password: string, passwordHash: string) {
  if (!password.trim() || !passwordHash) {
    return false;
  }

  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password.trim(), passwordHash);
}

export async function hashCandidateResetToken(token: string) {
  const encoded = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return toHex(digest);
}
