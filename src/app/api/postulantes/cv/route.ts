import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { CANDIDATE_SESSION_COOKIE_NAME, verifyVacantesCandidateJwt } from '@/lib/candidateAuth';
import { execute } from '@/lib/db';
import { getCandidateAccountForLogin } from '@/lib/candidateStorageDB';

export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  const token = request.cookies.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifyVacantesCandidateJwt(token) : null;
  if (!session) return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });

  const candidate = await getCandidateAccountForLogin({
    documentNumber: session.documentNumber,
    email: session.email,
  });
  if (!candidate) return NextResponse.json({ success: false, message: 'No encontramos tu perfil de postulante.' }, { status: 404 });

  const { fileName, fileData } = await request.json() as { fileName?: string; fileData?: string };
  if (!fileName || !fileData?.startsWith('data:')) return NextResponse.json({ success: false, message: 'Archivo inválido.' }, { status: 422 });
  const [meta, base64] = fileData.split(',', 2); const mime = meta.match(/data:([^;]+)/)?.[1] ?? '';
  if (!['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mime)) return NextResponse.json({ success: false, message: 'Solo se permiten PDF, DOC o DOCX.' }, { status: 422 });
  const buffer = Buffer.from(base64, 'base64'); if (buffer.length > 5 * 1024 * 1024) return NextResponse.json({ success: false, message: 'El archivo supera 5 MB.' }, { status: 422 });
  const ext = path.extname(fileName).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.pdf'; const name = `cv-${candidate.id}-${Date.now()}${ext}`;
  await mkdir(path.join(process.cwd(), 'public', 'uploads', 'cvs'), { recursive: true });
  await writeFile(path.join(process.cwd(), 'public', 'uploads', 'cvs', name), buffer);
  const url = `/uploads/cvs/${name}`;
  await execute('UPDATE candidatos SET cv_url = ? WHERE id = ? AND deleted_at IS NULL', [url, candidate.id]);
  return NextResponse.json({ success: true, data: { url, fileName } });
}
