import { NextResponse } from 'next/server';
import { getApplicationsByCandidateFromDB } from '@/lib/candidateStorageDB';

export const dynamic = 'force-dynamic';

/**
 * Endpoint para obtener todas las postulaciones de un candidato específico.
 *
 * @param request - La solicitud HTTP.
 * @param params - Los parámetros de la ruta, que incluyen el documento del candidato.
 */
export async function GET(request: Request, { params }: { params: { document: string } }) {
  const { document } = params;

  if (!document) {
    return NextResponse.json({ success: false, message: 'Documento del candidato no proporcionado.' }, { status: 400 });
  }

  try {
    const applications = await getApplicationsByCandidateFromDB(document);
    return NextResponse.json({ success: true, data: applications });
  } catch (error: any) {
    console.error(`Error al obtener las postulaciones para el documento ${document}:`, error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}