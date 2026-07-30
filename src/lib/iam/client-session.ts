import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { execute, query } from '@/lib/db';

export const CLIENT_SESSION_COOKIE = 'jdr_client_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
type ClientSession = { sessionId: string; clientId: number; documentNumber: string; name: string };

const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const secret = () => new TextEncoder().encode(process.env.AUTH_JWT_SECRET || '');

export async function authenticateClient(documentNumber: string, password: string, ip: string, userAgent: string): Promise<ClientSession | null> {
  const rows = await query<{ id: number; cedula: string; nombres: string; apellidos: string; password_hash: string | null }>(
    `SELECT id, cedula, nombres, apellidos, password_hash FROM clientes_membresia WHERE cedula = ? AND estado = 'activo' LIMIT 1`,
    [documentNumber.replace(/\D/g, '')],
  );
  const client = rows[0];
  if (!client?.password_hash || !(await bcrypt.compare(password, client.password_hash))) return null;

  const sessionId = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
  await execute('INSERT INTO cliente_sessions (cliente_id, session_token_hash, ip, user_agent, expira_en) VALUES (?, ?, ?, ?, ?)', [client.id, hash(sessionId), ip.slice(0, 45), userAgent.slice(0, 500), expiresAt]);
  await execute('UPDATE clientes_membresia SET ultimo_login = NOW() WHERE id = ?', [client.id]);
  return { sessionId, clientId: client.id, documentNumber: client.cedula, name: [client.nombres, client.apellidos].filter(Boolean).join(' ') };
}

export async function signClientSession(session: ClientSession) {
  return new SignJWT(session).setProtectedHeader({ alg: 'HS256' }).setIssuer('jdr-client').setAudience('jdr-client').setExpirationTime('8h').sign(secret());
}

export async function getActiveClientSession(token: string | undefined): Promise<ClientSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { issuer: 'jdr-client', audience: 'jdr-client' });
    if (typeof payload.sessionId !== 'string' || typeof payload.clientId !== 'number' || typeof payload.documentNumber !== 'string' || typeof payload.name !== 'string') return null;
    const session = payload as unknown as ClientSession;
    const rows = await query('SELECT id FROM cliente_sessions WHERE session_token_hash = ? AND activa = TRUE AND expira_en > NOW() LIMIT 1', [hash(session.sessionId)]);
    return rows[0] ? session : null;
  } catch { return null; }
}

export async function revokeClientSession(sessionId: string) {
  await execute('UPDATE cliente_sessions SET activa = FALSE, cerrada_en = NOW() WHERE session_token_hash = ?', [hash(sessionId)]);
}
