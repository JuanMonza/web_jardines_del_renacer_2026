import { NextRequest, NextResponse } from 'next/server';
import {
  createTrainingGateToken,
  secureTextEqual,
  TRAINING_GATE_COOKIE,
  TRAINING_GATE_TTL_SECONDS,
} from '@/lib/training-gate';
import { isTrainingEnvironment } from '@/lib/training-environment';

export const dynamic = 'force-dynamic';

const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; startedAt: number }>();

function clientAddress(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || 'unknown';
}

export async function POST(request: NextRequest) {
  if (!isTrainingEnvironment()) return NextResponse.json({ message: 'No encontrado.' }, { status: 404 });

  const expectedUser = String(process.env.TRAINING_GATE_USER || 'capacitacion');
  const expectedPassword = String(process.env.TRAINING_GATE_PASSWORD || '');
  const secret = String(process.env.TRAINING_GATE_SECRET || '');
  if (expectedPassword.length < 12 || secret.length < 32) {
    return NextResponse.json({ message: 'El acceso de capacitación no está configurado.' }, { status: 503 });
  }

  const ip = clientAddress(request);
  const now = Date.now();
  const current = attempts.get(ip);
  const state = !current || now - current.startedAt >= ATTEMPT_WINDOW_MS
    ? { count: 0, startedAt: now }
    : current;
  if (state.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ message: 'Demasiados intentos. Espera 15 minutos.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as { username?: unknown; password?: unknown } | null;
  const username = typeof body?.username === 'string' ? body.username.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  const validUser = await secureTextEqual(username, expectedUser);
  const validPassword = await secureTextEqual(password, expectedPassword);
  if (!validUser || !validPassword) {
    attempts.set(ip, { ...state, count: state.count + 1 });
    return NextResponse.json({ message: 'Usuario o contraseña incorrectos.' }, { status: 401 });
  }

  attempts.delete(ip);
  const response = NextResponse.json({ success: true });
  response.cookies.set(TRAINING_GATE_COOKIE, await createTrainingGateToken(secret), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: process.env.TRAINING_BASE_PATH || '/',
    maxAge: TRAINING_GATE_TTL_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(TRAINING_GATE_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: process.env.TRAINING_BASE_PATH || '/',
    maxAge: 0,
  });
  return response;
}
