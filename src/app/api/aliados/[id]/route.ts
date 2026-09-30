import { NextRequest, NextResponse } from 'next/server';
import { deleteAllyFromDB, getAllyByIdFromDB, updateAllyInDB } from '@/lib/alliesStorageDB';
import { ADMIN_SESSION_COOKIE, requireAdminPermission } from '@/lib/iam/admin-session';
import { recordAllyAudit } from '@/lib/ally-audit';

export const runtime = 'nodejs';

const textLimits: Record<string, { label: string; max: number; required?: boolean }> = {
  name: { label: 'nombre', max: 150, required: true },
  loginId: { label: 'ID de acceso', max: 20, required: true },
  categorySlug: { label: 'categoría', max: 80 },
  subcategory: { label: 'subcategoría', max: 80 },
  discountLabel: { label: 'beneficio', max: 100 },
  departamento: { label: 'departamento', max: 80, required: true },
  municipio: { label: 'municipio', max: 80, required: true },
  address: { label: 'dirección', max: 10000 },
  url: { label: 'URL', max: 2000 },
  whatsappNumber: { label: 'WhatsApp', max: 30 },
  whatsappTemplate: { label: 'mensaje de WhatsApp', max: 10000 },
  email: { label: 'correo', max: 150 },
  telefono: { label: 'teléfono', max: 30 },
  description: { label: 'descripción', max: 10000 },
};

function validatePatch(body: Record<string, unknown>) {
  for (const [field, rule] of Object.entries(textLimits)) {
    if (!(field in body)) continue;
    const value = body[field];
    if (typeof value !== 'string') return `${rule.label} debe ser texto válido.`;
    const length = value.trim().length;
    if (rule.required && length === 0) return `${rule.label} es obligatorio.`;
    if (length > rule.max) return `${rule.label} supera el máximo de ${rule.max.toLocaleString('es-CO')} caracteres.`;
  }
  if ('featured' in body && typeof body.featured !== 'boolean') return 'El estado destacado no es válido.';
  if ('logo' in body) {
    if (typeof body.logo !== 'string') return 'El logo no es válido.';
    const logo = body.logo.trim();
    if (logo.startsWith('data:image/')) {
      if (logo.length > 3 * 1024 * 1024) return 'El logo supera el máximo permitido de 2 MB.';
    } else if (logo.length > 2000) return 'La URL del logo supera el máximo permitido.';
  }
  return null;
}

const databaseColumnLabels: Record<string, string> = {
  name: 'nombre', login_id: 'ID de acceso', category_slug: 'categoría', subcategory: 'subcategoría',
  discount_label: 'beneficio', departamento: 'departamento', municipio: 'municipio', address: 'dirección',
  url: 'URL', logo: 'logo', whatsapp_number: 'WhatsApp', whatsapp_template: 'mensaje de WhatsApp',
  email: 'correo', telefono: 'teléfono', description: 'descripción',
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.update');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try {
    const { id } = await params;
    const body = await request.json() as Record<string, unknown>;
    if (!id || Object.keys(body).length === 0) return NextResponse.json({ message: 'No hay cambios para guardar.' }, { status: 422 });
    const validationError = validatePatch(body);
    if (validationError) return NextResponse.json({ message: validationError }, { status: 422 });
    const previous = await getAllyByIdFromDB(id);
    if (!await updateAllyInDB(id, body)) return NextResponse.json({ message: 'Aliado no encontrado.' }, { status: 404 });
    const ally = await getAllyByIdFromDB(id);
    if (ally) await recordAllyAudit({ allyId: id, adminUserId: session.userId, actorType: 'ADMIN', eventType: 'ALLY_UPDATED', entityType: 'aliados', entityId: id, details: { changedFields: Object.keys(body), previousName: previous?.name, currentName: ally.name }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'), userAgent: request.headers.get('user-agent') });
    return NextResponse.json({ data: ally });
  } catch (error) {
    // El detalle queda solo en el servidor para diagnosticar sin exponer datos de MySQL al navegador.
    console.error('[aliados] Error al actualizar aliado', error);
    const mysqlError = error as { code?: string; sqlMessage?: string };
    if (mysqlError.code === 'ER_DATA_TOO_LONG') {
      const column = mysqlError.sqlMessage?.match(/column '([^']+)'/i)?.[1] ?? '';
      const label = databaseColumnLabels[column] ?? 'uno de los campos';
      return NextResponse.json({ message: `El campo ${label} supera el tamaño permitido. Revisa su contenido e intenta nuevamente.` }, { status: 422 });
    }
    if (mysqlError.code === 'ER_DUP_ENTRY') return NextResponse.json({ message: 'El ID de acceso ya pertenece a otro aliado.' }, { status: 409 });
    return NextResponse.json({ message: 'No fue posible actualizar el aliado.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminPermission(request.cookies.get(ADMIN_SESSION_COOKIE)?.value, 'allies.delete');
  if (!session) return NextResponse.json({ message: 'No autorizado.' }, { status: 403 });
  try {
    const { id } = await params;
    const ally = await getAllyByIdFromDB(id);
    if (!await deleteAllyFromDB(id)) return NextResponse.json({ message: 'Aliado no encontrado.' }, { status: 404 });
    if (ally) await recordAllyAudit({ allyId: id, adminUserId: session.userId, actorType: 'ADMIN', eventType: 'ALLY_DEACTIVATED', entityType: 'aliados', entityId: id, details: { name: ally.name, loginId: ally.loginId }, ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip'), userAgent: request.headers.get('user-agent') });
    return new NextResponse(null, { status: 204 });
  } catch { return NextResponse.json({ message: 'No fue posible desactivar el aliado.' }, { status: 500 }); }
}
