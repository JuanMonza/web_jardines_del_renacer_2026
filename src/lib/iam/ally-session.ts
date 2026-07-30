import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { execute, query } from '@/lib/db';

export const ALLY_SESSION_COOKIE = 'jdr_ally_session';
const duration = 60 * 60 * 8;
type AllySession = { sessionId: string; accountId: number; allyId: number; name: string; loginId: string };
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
const secret = () => new TextEncoder().encode(process.env.AUTH_JWT_SECRET || '');

export async function setAllyPassword(allyId: number, loginId: string, password: string) {
  if (!/^.{3,40}$/.test(loginId) || password.length < 10 || password.length > 128) throw new Error('La credencial no cumple los requisitos de seguridad.');
  const passwordHash = await bcrypt.hash(password, 12);
  await execute(`INSERT INTO ally_accounts (aliado_id, login_id, password_hash, activo, intentos_fallidos, bloqueado_hasta)
    VALUES (?, ?, ?, TRUE, 0, NULL) ON DUPLICATE KEY UPDATE login_id=VALUES(login_id), password_hash=VALUES(password_hash), activo=TRUE, intentos_fallidos=0, bloqueado_hasta=NULL`, [allyId, loginId.toUpperCase(), passwordHash]);
}

export async function authenticateAlly(loginId: string, password: string, ip: string, userAgent: string): Promise<AllySession | null> {
  const rows = await query<{ account_id:number; ally_id:number; login_id:string; password_hash:string; name:string; activo:number; bloqueado_hasta:Date|null }>(`SELECT aa.id account_id, aa.aliado_id ally_id, aa.login_id, aa.password_hash, a.name, aa.activo, aa.bloqueado_hasta FROM ally_accounts aa JOIN aliados a ON a.id=aa.aliado_id WHERE aa.login_id=? AND a.active=TRUE LIMIT 1`, [loginId.toUpperCase()]);
  const account = rows[0];
  if (!account || !account.activo || (account.bloqueado_hasta && account.bloqueado_hasta.getTime() > Date.now()) || !(await bcrypt.compare(password, account.password_hash))) return null;
  const sessionId=randomBytes(32).toString('hex'); const expires=new Date(Date.now()+duration*1000);
  await execute('INSERT INTO ally_sessions (ally_account_id, session_token_hash, ip, user_agent, expira_en) VALUES (?, ?, ?, ?, ?)', [account.account_id, hash(sessionId), ip.slice(0,45), userAgent.slice(0,500), expires]);
  await execute('UPDATE ally_accounts SET ultimo_login=NOW(), intentos_fallidos=0, bloqueado_hasta=NULL WHERE id=?', [account.account_id]);
  return {sessionId, accountId:account.account_id, allyId:account.ally_id, name:account.name, loginId:account.login_id};
}
export async function signAllySession(value: AllySession) { return new SignJWT(value).setProtectedHeader({alg:'HS256'}).setIssuer('jdr-ally').setAudience('jdr-ally').setExpirationTime('8h').sign(secret()); }
export async function getActiveAllySession(token: string | undefined): Promise<AllySession | null> { if(!token) return null; try { const {payload}=await jwtVerify(token,secret(),{issuer:'jdr-ally',audience:'jdr-ally'}); if(typeof payload.sessionId!=='string'||typeof payload.accountId!=='number'||typeof payload.allyId!=='number'||typeof payload.name!=='string'||typeof payload.loginId!=='string') return null; const session=payload as unknown as AllySession; const rows=await query('SELECT id FROM ally_sessions WHERE session_token_hash=? AND activa=TRUE AND expira_en>NOW() LIMIT 1',[hash(session.sessionId)]); return rows[0]?session:null; } catch{return null;} }
export async function revokeAllySession(sessionId: string) { await execute('UPDATE ally_sessions SET activa=FALSE,cerrada_en=NOW() WHERE session_token_hash=?',[hash(sessionId)]); }
