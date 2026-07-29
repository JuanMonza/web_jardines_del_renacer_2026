import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';

export type AdminTokenSession = { sessionId: string; userId: number; userUuid: string; name: string; email: string; permissions: string[] };
const ISSUER = 'jardines-del-renacer';
const AUDIENCE = 'jdr-admin';

function getSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('AUTH_JWT_SECRET debe tener al menos 32 caracteres.');
  return new TextEncoder().encode(secret);
}

export function hasPermission(session: Pick<AdminTokenSession, 'permissions'>, permission: string) {
  return session.permissions.includes(permission) || session.permissions.includes('system.manage');
}

export async function signAdminToken(session: AdminTokenSession) {
  return new SignJWT({ ...session }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setIssuer(ISSUER).setAudience(AUDIENCE).setExpirationTime('8h').sign(getSecret());
}

export async function verifyAdminToken(token: string | undefined): Promise<AdminTokenSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: ISSUER, audience: AUDIENCE });
    if (typeof payload.sessionId !== 'string' || typeof payload.userId !== 'number' || typeof payload.userUuid !== 'string' || typeof payload.name !== 'string' || typeof payload.email !== 'string' || !Array.isArray(payload.permissions) || !payload.permissions.every((item) => typeof item === 'string')) return null;
    return payload as unknown as AdminTokenSession;
  } catch { return null; }
}
