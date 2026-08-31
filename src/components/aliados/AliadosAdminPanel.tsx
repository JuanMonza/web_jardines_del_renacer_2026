'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SectionTitle from '@/components/ui/SectionTitle';
import {
  ALLY_DEPARTMENTS,
  ALLY_CATEGORIES,
  DEFAULT_ALLY_DEPARTMENT,
  buildAllyWhatsAppUrl,
  createEmptyAlly,
  getCategoryLabel,
  getDefaultAllyTemplate,
  getSubcategoriesByCategory,
  sanitizeWhatsAppNumber,
  type CommercialAlly,
} from '@/config/allies';
import {
  formatCurrency,
  getClientConsumptionSummary,
  getConsumptionComparatives,
  getDiscountStats,
  type AllyDiscountRequest,
  type DiscountRequestStatus,
} from '@/lib/allyMembershipStorage';

type AlliesSession = {
  role: 'admin_aliados' | 'ally_user';
  name: string;
  allyId?: string;
  loginId?: string;
};

type AllyAccessStatus = {
  allyId: string;
  accountConfigured: boolean;
  accessActive: boolean;
  lockedUntil: string | null;
  lastLogin: string | null;
};

type AllyActivityEntry = {
  id: string;
  allyId: string;
  allyName: string;
  actorType: 'ALLY' | 'ADMIN' | 'SYSTEM';
  eventType: string;
  createdAt: string;
};

const ACTIVITY_LABELS: Record<string, string> = {
  ALLY_CREATED: 'Aliado creado',
  ALLY_UPDATED: 'Datos actualizados',
  ALLY_DEACTIVATED: 'Aliado eliminado',
  ALLY_ACCESS_RESET: 'Credenciales restablecidas',
  DISCOUNT_REDEEMED: 'Descuento aplicado',
  DISCOUNT_VOIDED: 'Código anulado',
};

const STATUS_LABELS: Record<DiscountRequestStatus, string> = {
  active: 'Activo',
  redeemed: 'Usado',
  expired: 'Vencido',
  deleted: 'Eliminado',
};

const STATUS_STYLES: Record<DiscountRequestStatus, string> = {
  active: 'bg-sky-500/10 text-sky-700 border border-sky-500/20',
  redeemed: 'bg-green-500/10 text-green-700 border border-green-500/20',
  expired: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
  deleted: 'bg-red-500/10 text-red-700 border border-red-500/20',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeAllyLoginId(value: string) {
  const suffix = value.toUpperCase().replace(/^JDR-?/, '').replace(/[^A-Z0-9-]/g, '');
  return `JDR-${suffix}`;
}

function createTemporaryAllyFromDraft(draft: CommercialAlly): CommercialAlly {
  const now = new Date().toISOString();
  return {
    ...draft,
    id: draft.id || `preview-${Date.now()}`,
    name: draft.name || 'Aliado Comercial',
    departamento: draft.departamento || DEFAULT_ALLY_DEPARTMENT,
    municipio: draft.municipio || 'Ciudad por confirmar',
    categorySlug: draft.categorySlug || ALLY_CATEGORIES[0].slug,
    subcategory:
      draft.subcategory || getSubcategoriesByCategory(draft.categorySlug)[0] || '',
    discountLabel: draft.discountLabel || 'Descuento sujeto a condiciones',
    whatsappTemplate:
      draft.whatsappTemplate ||
      getDefaultAllyTemplate(draft.categorySlug, draft.subcategory),
    createdAt: draft.createdAt || now,
    updatedAt: now,
  };
}

export default function AliadosAdminPanel({ mode = 'admin' }: { mode?: 'admin' | 'ally' }) {
  const [allies, setAllies] = useState<CommercialAlly[]>([]);
  const [draft, setDraft] = useState<CommercialAlly>(createEmptyAlly());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [accessPassword, setAccessPassword] = useState('');
  const [showAccessPassword, setShowAccessPassword] = useState(false);
  const [confirmation, setConfirmation] = useState<{ title: string; description: string; confirmLabel: string; action: () => void } | null>(null);
  const [notice, setNotice] = useState<{ title: string; description: string; variant: 'error' | 'success' | 'info' } | null>(null);
  const [feedback, setFeedback] = useState('');
  const [session, setSession] = useState<AlliesSession | null>(null);
  const [requests, setRequests] = useState<AllyDiscountRequest[]>([]);
  const [verifyCedula, setVerifyCedula] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [consumedValue, setConsumedValue] = useState('');
  const [manualDiscountValue, setManualDiscountValue] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [activeRequest, setActiveRequest] = useState<AllyDiscountRequest | null>(null);
  const [loadingError, setLoadingError] = useState('');
  const [expandedClientCedula, setExpandedClientCedula] = useState<string | null>(null);
  const [allySearch, setAllySearch] = useState('');
  const [reportPeriod, setReportPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [formTab, setFormTab] = useState<'commercial' | 'access' | 'content'>('commercial');
  const [accessStatuses, setAccessStatuses] = useState<Record<string, AllyAccessStatus>>({});
  const [activity, setActivity] = useState<AllyActivityEntry[]>([]);
  const [savingAlly, setSavingAlly] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const sessionEndpoint = mode === 'ally' ? '/api/iam/ally/session' : '/api/iam/admin/session';
    const alliesEndpoint = mode === 'ally' ? '/api/aliados/public' : '/api/aliados';
    const requestsPromise = fetch(mode === 'ally' ? '/api/iam/ally/codes' : '/api/codigos-descuento');
    const accessStatusPromise = mode === 'admin' ? fetch('/api/aliados/access-status') : null;
    const activityPromise = mode === 'admin' ? fetch('/api/aliados/audit') : null;
    Promise.all([fetch(sessionEndpoint), fetch(alliesEndpoint), requestsPromise, accessStatusPromise, activityPromise])
      .then(async ([sessionResponse, alliesResponse, requestsResponse, accessStatusResponse, activityResponse]) => {
        if (!sessionResponse.ok || !alliesResponse.ok || (requestsResponse && !requestsResponse.ok)) throw new Error('No fue posible cargar el panel.');
        const sessionPayload = await sessionResponse.json() as { user: { name: string; allyId?: number; loginId?: string } };
        const alliesPayload = await alliesResponse.json() as { data: CommercialAlly[] };
        const requestsPayload = requestsResponse ? await requestsResponse.json() as { data: AllyDiscountRequest[] } : null;
        const accessStatusPayload = accessStatusResponse ? await accessStatusResponse.json() as { data?: AllyAccessStatus[] } : null;
        const activityPayload = activityResponse ? await activityResponse.json() as { data?: AllyActivityEntry[] } : null;
        if (mounted) {
          setSession(mode === 'ally'
            ? { role: 'ally_user', name: sessionPayload.user.name, allyId: String(sessionPayload.user.allyId ?? ''), loginId: sessionPayload.user.loginId }
            : { role: 'admin_aliados', name: sessionPayload.user.name });
          setAllies(alliesPayload.data);
          setRequests(requestsPayload?.data ?? []);
          setAccessStatuses(Object.fromEntries((accessStatusPayload?.data ?? []).map((item) => [item.allyId, item])));
          setActivity(activityPayload?.data ?? []);
          setLoadingError('');
        }
      })
      .catch(() => { if (mounted) setLoadingError('No fue posible cargar los aliados desde la base de datos.'); });

    return () => {
      mounted = false;
    };
  }, [mode]);

  const visibleRequests = session?.role === 'ally_user' && session.allyId
    ? requests.filter((request) => request.allyId === session.allyId)
    : requests;
  const currentAlly = useMemo(() => session?.role === 'ally_user'
    ? allies.find((ally) => ally.id === session.allyId) ?? null
    : null, [allies, session]);
  const hasFlexibleDiscount = Boolean(activeRequest && /sujet[oa].*(condicion|cambio)|por definir/i.test(activeRequest.discountLabel));
  const canSetManualDiscount = hasFlexibleDiscount && session?.role === 'ally_user';
  const previewConsumedValue = Number(consumedValue) || 0;
  const previewDiscountValue = canSetManualDiscount
    ? Math.min(Number(manualDiscountValue) || 0, previewConsumedValue)
    : Math.round((previewConsumedValue * (activeRequest?.discountPercent ?? 0)) / 100);

  const stats = useMemo(() => getDiscountStats(visibleRequests), [visibleRequests]);
  const comparatives = useMemo(
    () => getConsumptionComparatives(visibleRequests),
    [visibleRequests],
  );
  const queriedClientSummary = useMemo(
    () => (verifyCedula ? getClientConsumptionSummary(verifyCedula, visibleRequests) : null),
    [verifyCedula, visibleRequests],
  );

  // Agrupar todos los clientes con sus consumos
  const clientsSummary = useMemo(() => {
    const grouped = new Map<string, {
      cedula: string;
      name: string;
      totalConsumed: number;
      totalDiscount: number;
      requestCount: number;
      requests: AllyDiscountRequest[];
    }>();

    visibleRequests.forEach((request) => {
      const cedula = request.clientCedula;
      if (!grouped.has(cedula)) {
        grouped.set(cedula, {
          cedula,
          name: request.clientName,
          totalConsumed: 0,
          totalDiscount: 0,
          requestCount: 0,
          requests: [],
        });
      }
      const client = grouped.get(cedula)!;
      if (request.status === 'redeemed' && request.consumedValue) {
        client.totalConsumed += request.consumedValue;
        client.totalDiscount += request.discountValue ?? 0;
      }
      client.requestCount += 1;
      client.requests.push(request);
    });

    return Array.from(grouped.values()).sort(
      (a, b) => b.totalConsumed - a.totalConsumed,
    );
  }, [visibleRequests]);

  const availableSubcategories = useMemo(
    () => getSubcategoriesByCategory(draft.categorySlug),
    [draft.categorySlug],
  );

  const availableDepartments = useMemo(() => {
    const departments = allies.map((ally) => ally.departamento).filter(Boolean);
    return Array.from(new Set([...ALLY_DEPARTMENTS, ...departments])).sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
  }, [allies]);

  const filteredAllies = useMemo(() => {
    const term = allySearch.trim().toLocaleLowerCase('es-CO');
    if (!term) return allies;
    return allies.filter((ally) => [ally.name, ally.loginId, ally.departamento, ally.municipio, ally.categorySlug, ally.subcategory]
      .some((value) => value?.toLocaleLowerCase('es-CO').includes(term)));
  }, [allies, allySearch]);

  const downloadReport = () => {
    const now = new Date();
    const start = new Date(now);
    if (reportPeriod === 'day') start.setHours(0, 0, 0, 0);
    if (reportPeriod === 'week') start.setDate(now.getDate() - 6);
    if (reportPeriod === 'month') start.setMonth(now.getMonth() - 1);
    const reportRows = (isAllyUser ? visibleRequests : requests).filter((request) => new Date(request.redeemedAt ?? request.createdAt) >= start);
    const escape = (value: string | number | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const headers = ['Código', 'Estado', 'Fecha', 'Cliente', 'Cédula', 'Aliado', 'ID aliado', 'Beneficio', 'Consumo', 'Descuento', 'Total pagado', 'Registrado por'];
    const rows = reportRows.map((request) => [request.code, STATUS_LABELS[request.status], new Date(request.redeemedAt ?? request.createdAt).toLocaleString('es-CO'), request.clientName, request.clientCedula, request.allyName, request.allyLoginId, request.discountLabel, request.consumedValue, request.discountValue, request.totalAfterDiscount, request.redeemedBy]);
    const csv = `\uFEFF${headers.map(escape).join(';')}\n${rows.map((row) => row.map(escape).join(';')).join('\n')}`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    link.download = `reporte-aliados-${reportPeriod}-${now.toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice({ title: 'Reporte descargado', description: `${reportRows.length} registros exportados. El archivo CSV se abre directamente con Excel.`, variant: 'success' });
  };

  useEffect(() => {
    if (availableSubcategories.length === 0) {
      return;
    }

    if (!availableSubcategories.includes(draft.subcategory)) {
      setDraft((prev) => ({
        ...prev,
        subcategory: availableSubcategories[0],
      }));
    }
  }, [availableSubcategories, draft.subcategory]);

  const resetDraft = () => {
    setDraft(createEmptyAlly());
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback('');

    if (!draft.name.trim()) {
      setFeedback('Debes ingresar el nombre del aliado.');
      return;
    }

    if (!draft.departamento.trim()) {
      setFeedback('Debes seleccionar un departamento.');
      return;
    }

    if (!draft.municipio.trim()) {
      setFeedback('Debes ingresar el municipio o ciudad.');
      return;
    }

    const now = new Date().toISOString();
    const template =
      draft.whatsappTemplate.trim() ||
      getDefaultAllyTemplate(draft.categorySlug, draft.subcategory);
    const baseId = `${draft.categorySlug}-${slugify(draft.name)}` || `aliado-${Date.now()}`;

    const existing = editingId
      ? allies.find((ally) => ally.id === editingId)
      : null;

    const allyRecord: CommercialAlly = {
      ...draft,
      id: editingId || `${baseId}-${Date.now().toString(36).slice(-4)}`,
      name: draft.name.trim(),
      departamento: draft.departamento.trim(),
      municipio: draft.municipio.trim(),
      subcategory: draft.subcategory.trim(),
      discountLabel: draft.discountLabel.trim() || 'Descuento sujeto a condiciones',
      logo: draft.logo.trim(),
      address: draft.address.trim(),
      description: draft.description?.trim() || '',
      whatsappNumber: sanitizeWhatsAppNumber(draft.whatsappNumber),
      whatsappTemplate: template,
      actionLabel: draft.actionLabel.trim() || 'Mas informacion',
      loginId: normalizeAllyLoginId(draft.loginId || `JDR-${slugify(draft.name).slice(0, 3).toUpperCase()}${Date.now().toString().slice(-4)}`),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    setSavingAlly(true);
    try {
      const editableFields = ['name', 'loginId', 'categorySlug', 'subcategory', 'discountLabel', 'departamento', 'municipio', 'address', 'url', 'logo', 'whatsappNumber', 'whatsappTemplate', 'featured', 'email', 'telefono', 'description'] as const;
      const patch = editingId && existing ? Object.fromEntries(editableFields.filter((field) => allyRecord[field] !== existing[field]).map((field) => [field, allyRecord[field]])) : allyRecord;
      let payload: { data?: CommercialAlly; message?: string } = { data: existing ?? undefined };
      if (!editingId || Object.keys(patch).length > 0) {
        const response = await fetch(editingId ? `/api/aliados/${editingId}` : '/api/aliados', {
          method: editingId ? 'PATCH' : 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch),
        });
        payload = await response.json() as { data?: CommercialAlly; message?: string };
        if (!response.ok || !payload.data) throw new Error(payload.message);
      }
      setAllies((current) => editingId ? current.map((ally) => ally.id === editingId ? payload.data! : ally) : [...current, payload.data!]);
      if (accessPassword) {
        const accessResponse = await fetch(`/api/aliados/${editingId || payload.data!.id}/access`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ loginId: allyRecord.loginId, password: accessPassword }) });
        if (!accessResponse.ok) { const accessPayload = await accessResponse.json() as { message?: string }; throw new Error(accessPayload.message); }
        setAccessStatuses((current) => ({ ...current, [editingId || payload.data!.id]: { allyId: editingId || payload.data!.id, accountConfigured: true, accessActive: true, lockedUntil: null, lastLogin: current[editingId || payload.data!.id]?.lastLogin ?? null } }));
      }
      setAccessPassword(''); resetDraft();
      const message = editingId ? 'Aliado actualizado correctamente.' : 'Aliado creado correctamente.';
      setFeedback(message);
      setNotice({ title: 'Cambios guardados', description: message, variant: 'success' });
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'No fue posible guardar el aliado.';
      setFeedback(message);
      setNotice({ title: 'No fue posible guardar los cambios', description: message, variant: 'error' });
    } finally {
      setSavingAlly(false);
    }
  };

  const deactivateAlly = async (ally: CommercialAlly) => {
    try {
      const response = await fetch(`/api/aliados/${ally.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('No fue posible eliminar el aliado.');
      setAllies((current) => current.filter((item) => item.id !== ally.id));
      if (editingId === ally.id) resetDraft();
      setFeedback('Aliado eliminado correctamente.');
      setNotice({ title: 'Aliado eliminado', description: 'El aliado ya no aparece en el catálogo público y puede recuperarse desde MySQL.', variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible eliminar el aliado.';
      setFeedback(message);
      setNotice({ title: 'No fue posible eliminar el aliado', description: message, variant: 'error' });
    }
  };

  const handleDelete = (ally: CommercialAlly) => setConfirmation({ title: '¿Eliminar aliado?', description: `“${ally.name}” dejará de aparecer en el catálogo público. No se borrará definitivamente y podrá recuperarse desde MySQL.`, confirmLabel: 'Sí, eliminar', action: () => deactivateAlly(ally) });

  const handleEdit = (ally: CommercialAlly) => {
    setDraft({ ...ally });
    setEditingId(ally.id);
    setAccessPassword('');
    setFeedback(`Editando: ${ally.name}`);
  };

  const handleLogoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback('El archivo es muy grande. Usa una imagen de maximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      setDraft((prev) => ({ ...prev, logo: value }));
      setFeedback('Logo cargado desde archivo.');
    };
    reader.readAsDataURL(file);
  };

  const refreshRequests = async () => {
    const response = await fetch(mode === 'ally' ? '/api/iam/ally/codes' : '/api/codigos-descuento');
    const payload = await response.json() as { data?: AllyDiscountRequest[] };
    if (response.ok && payload.data) setRequests(payload.data);
  };

  const handleFindDiscount = async (event: React.FormEvent) => {
    event.preventDefault();
    setVerificationFeedback('');
    setActiveRequest(null);

    let request: AllyDiscountRequest | null;
    if (mode === 'ally') {
      const params = new URLSearchParams({ cedula: verifyCedula, code: verifyCode });
      const response = await fetch(`/api/iam/ally/codes?${params.toString()}`);
      const payload = await response.json() as { data?: AllyDiscountRequest };
      request = response.ok ? payload.data ?? null : null;
    } else {
      const params = new URLSearchParams({ cedula: verifyCedula });
      const response = await fetch(`/api/codigos-descuento/${encodeURIComponent(verifyCode)}?${params.toString()}`);
      const payload = await response.json() as { data?: AllyDiscountRequest };
      request = response.ok ? payload.data ?? null : null;
    }

    if (!request) {
      setVerificationFeedback('No encontramos un codigo para esa cedula y aliado.');
      return;
    }

    if (request.status !== 'active') {
      setVerificationFeedback(
        `Codigo ${STATUS_LABELS[request.status].toLowerCase()}. No se puede aplicar este descuento.`,
      );
      return;
    }

    setActiveRequest(request);
    setManualDiscountValue('');
    setVerificationFeedback('Codigo activo. Ingresa el valor consumido para aplicar el descuento.');
  };

  const handleRedeemDiscount = async () => {
    if (!isAllyUser) {
      setVerificationFeedback('La administración puede consultar códigos, pero solo el aliado puede aplicar descuentos.');
      return;
    }
    if (!activeRequest) {
      return;
    }

    const value = Number(consumedValue);
    if (!Number.isFinite(value) || value <= 0) {
      setVerificationFeedback('Ingresa un valor consumido valido mayor a cero.');
      return;
    }
    const manualValue = Number(manualDiscountValue);
    if (canSetManualDiscount && (!Number.isFinite(manualValue) || manualValue < 0 || manualValue > value)) {
      setVerificationFeedback('Ingresa un valor de descuento entre $0 y el valor consumido.');
      return;
    }

    let redeemed: AllyDiscountRequest | null;
    if (mode === 'ally') {
      const response = await fetch(`/api/iam/ally/codes/${activeRequest.id}/redeem`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ consumedValue: value, discountValue: canSetManualDiscount ? manualValue : undefined }) });
      const payload = await response.json() as { data?: AllyDiscountRequest };
      redeemed = response.ok ? payload.data ?? null : null;
    } else {
      const response = await fetch(`/api/codigos-descuento/${activeRequest.id}/canjear`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ consumedValue: value, discountValue: canSetManualDiscount ? manualValue : undefined }) });
      const payload = await response.json() as { data?: AllyDiscountRequest };
      redeemed = response.ok ? payload.data ?? null : null;
    }

    await refreshRequests();
    setActiveRequest(null);
    setConsumedValue('');
    setManualDiscountValue('');
    setVerifyCode('');
    setVerificationFeedback(
      redeemed
        ? `Descuento aplicado. Consumo ${formatCurrency(value)}, descuento ${formatCurrency(redeemed.discountValue ?? 0)}, total a pagar ${formatCurrency(redeemed.totalAfterDiscount ?? value)}.`
        : 'No se pudo actualizar el codigo.',
    );
  };

  const deleteDiscount = async (request: AllyDiscountRequest) => {
    const response = await fetch(`/api/codigos-descuento/${request.id}`, { method: 'DELETE' });
    if (!response.ok) { setVerificationFeedback('No fue posible anular el código.'); return; }
    await refreshRequests();
    setVerificationFeedback('Código anulado correctamente.');
  };
  const handleDeleteDiscount = (request: AllyDiscountRequest) => setConfirmation({ title: '¿Eliminar código de descuento?', description: `El código ${request.code} quedará anulado y no podrá usarse para un canje.`, confirmLabel: 'Sí, eliminar código', action: () => deleteDiscount(request) });

  const previewAlly = createTemporaryAllyFromDraft(draft);
  const isAllyUser = session?.role === 'ally_user';

  const handleReloadAlliesFromExcel = async () => {
    setFeedback('Actualizando aliados desde MySQL...');
    setLoadingError('');
    try {
      const response = await fetch('/api/aliados');
      const payload = await response.json() as { data?: CommercialAlly[]; message?: string };
      if (!response.ok || !payload.data) throw new Error(payload.message);
      setAllies(payload.data);
      setFeedback(`Cargados ${payload.data.length} aliados desde MySQL.`);
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : 'No fue posible actualizar los aliados.');
    }
  };

  return (
    <div id="inicio" className="min-h-screen pt-2 pb-10 scroll-mt-6">
      <ConfirmDialog open={Boolean(confirmation)} title={confirmation?.title ?? ''} description={confirmation?.description ?? ''} confirmLabel={confirmation?.confirmLabel} onCancel={() => setConfirmation(null)} onConfirm={() => { const action = confirmation?.action; setConfirmation(null); action?.(); }} />
      <ConfirmDialog open={Boolean(notice)} title={notice?.title ?? ''} description={notice?.description ?? ''} confirmLabel="Entendido" showCancel={false} variant={notice?.variant} onCancel={() => setNotice(null)} onConfirm={() => setNotice(null)} />
      {isAllyUser ? (
        <SectionTitle title="Portal del aliado comercial" subtitle="Valida códigos activos y registra el valor consumido por cada cliente." align="center" className="mb-8" />
      ) : (
        <section className="mb-8 overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br from-white/85 via-[#eef5fc]/90 to-[#dceafa]/80 p-6 shadow-[0_16px_40px_rgba(34,76,125,0.1)] backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#5c80ad]">Administración comercial</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#173861] md:text-4xl">Aliados comerciales</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#5c7190]">Gestiona el catálogo, las credenciales y la trazabilidad de descuentos desde un solo lugar.</p></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><select value={reportPeriod} onChange={(event) => setReportPeriod(event.target.value as 'day' | 'week' | 'month')} className="rounded-xl border border-[#bfd1e5] bg-white/85 px-4 py-3 text-sm font-semibold text-[#315d98] outline-none"><option value="day">Reporte de hoy</option><option value="week">Últimos 7 días</option><option value="month">Últimos 30 días</option></select><button type="button" onClick={downloadReport} className="rounded-xl bg-[#244f8a] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#193f73]">Descargar Excel</button></div>
          </div>
        </section>
      )}

      {isAllyUser && (
        <section className="mb-8 overflow-hidden rounded-[28px] border border-white/70 bg-gradient-to-br from-[#173861]/95 via-[#24548f]/92 to-[#5f89bc]/85 p-6 text-white shadow-[0_20px_55px_rgba(22,58,104,0.25)] backdrop-blur-xl md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d4e7ff]">Operación segura</p><h2 className="mt-3 text-2xl font-bold md:text-3xl">Valida descuentos sin salir de tu portal</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#e6f0fc]">Consulta códigos, registra consumos y conserva la trazabilidad exclusiva de tu establecimiento.</p>
        </section>
      )}

      {loadingError && (
        <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>{loadingError}</span>
          <button
            onClick={handleReloadAlliesFromExcel}
            className="ml-4 font-semibold px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Reintentar carga
          </button>
        </div>
      )}

      {allies.length === 0 && !loadingError && (
        <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-50 p-4 text-sm text-amber-700 flex items-center justify-between">
          <span>No hay aliados cargados aún. Crea el primer aliado o actualiza la consulta.</span>
          <button
            onClick={handleReloadAlliesFromExcel}
            className="ml-4 font-semibold px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Actualizar desde MySQL
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-4">
        {(isAllyUser ? [
          { label: 'Códigos activos', value: stats.active.toString(), mark: '✓', tone: 'bg-sky-500/10 text-sky-700', glow: 'bg-sky-400/20' },
          { label: 'Canjes realizados', value: stats.redeemed.toString(), mark: '↗', tone: 'bg-emerald-500/10 text-emerald-700', glow: 'bg-emerald-400/20' },
          { label: 'Consumo registrado', value: formatCurrency(stats.totalConsumed), mark: '$', tone: 'bg-[#315d98]/10 text-[#315d98]', glow: 'bg-[#5e8dca]/20' },
          { label: 'Total cobrado', value: formatCurrency(stats.totalAfterDiscount), mark: '$', tone: 'bg-violet-500/10 text-violet-700', glow: 'bg-violet-400/20' },
        ] : [
          { label: 'Códigos generados', value: stats.generated.toString(), mark: '01', tone: 'bg-[#315d98]/10 text-[#315d98]', glow: 'bg-[#5e8dca]/20' },
          { label: 'Códigos activos', value: stats.active.toString(), mark: '✓', tone: 'bg-sky-500/10 text-sky-700', glow: 'bg-sky-400/20' },
          { label: 'Códigos usados', value: stats.redeemed.toString(), mark: '↗', tone: 'bg-emerald-500/10 text-emerald-700', glow: 'bg-emerald-400/20' },
          { label: 'Códigos vencidos', value: stats.expired.toString(), mark: '◷', tone: 'bg-amber-500/10 text-amber-700', glow: 'bg-amber-400/20' },
          { label: 'Códigos anulados', value: stats.deleted.toString(), mark: '—', tone: 'bg-rose-500/10 text-rose-700', glow: 'bg-rose-400/20' },
          { label: 'Consumo registrado', value: formatCurrency(stats.totalConsumed), mark: '$', tone: 'bg-[#315d98]/10 text-[#315d98]', glow: 'bg-[#5e8dca]/20' },
          { label: 'Descuentos aplicados', value: formatCurrency(stats.totalDiscount), mark: '%', tone: 'bg-emerald-500/10 text-emerald-700', glow: 'bg-emerald-400/20' },
          { label: 'Total facturado', value: formatCurrency(stats.totalAfterDiscount), mark: '$', tone: 'bg-violet-500/10 text-violet-700', glow: 'bg-violet-400/20' },
        ]).map((metric) => (
          <article key={metric.label} className={`group relative min-h-[148px] overflow-hidden rounded-[24px] border p-5 transition duration-300 hover:-translate-y-1 ${isAllyUser ? 'border-white/80 bg-white/65 shadow-[0_14px_34px_rgba(32,75,125,0.12)] backdrop-blur-xl hover:shadow-[0_20px_44px_rgba(32,75,125,0.18)]' : 'border-primary/15 bg-white/55'}`}>
            <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl ${metric.glow}`} />
            <div className="relative flex items-start justify-between gap-3">
              <p className="max-w-[13rem] text-[11px] font-bold uppercase tracking-[0.15em] text-[#6681a0]">{metric.label}</p>
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-base font-bold ${metric.tone}`}>{metric.mark}</span>
            </div>
            <p className="relative mt-5 break-words text-2xl font-bold tracking-tight text-[#173861]">{metric.value}</p>
            <div className="relative mt-3 h-px w-full bg-gradient-to-r from-[#b6cbe5] to-transparent" />
            <p className="relative mt-2 text-xs text-[#7690ad]">Actualizado en tiempo real</p>
          </article>
        ))}
      </div>


      <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          ['Hoy', comparatives.today],
          ['Esta semana', comparatives.week],
          ['Este mes', comparatives.month],
        ].map(([label, item]) => {
          const summary = item as { count: number; consumed: number; discount: number };
          return (
            <article key={label as string} className={`relative overflow-hidden rounded-[26px] border p-5 ${isAllyUser ? 'border-white/80 bg-white/60 shadow-[0_12px_30px_rgba(32,75,125,0.1)] backdrop-blur-xl' : 'border-primary/15 bg-white/65 shadow-sm'}`}>
              <div className="absolute right-4 top-4 h-16 w-16 rounded-full bg-[#4f7fbb]/10 blur-xl" />
              <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-[#4874ab]">{label as string}</p>
              <div className="relative mt-5 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white/55 p-2.5">
                  <p className="text-textLight">Usos</p>
                  <p className="mt-1 text-xl font-bold text-[#173861]">{summary.count}</p>
                </div>
                <div className="rounded-xl bg-white/55 p-2.5">
                  <p className="text-textLight">Consumo</p>
                  <p className="mt-1 font-bold text-[#173861]">{formatCurrency(summary.consumed)}</p>
                </div>
                <div className="rounded-xl bg-emerald-50/75 p-2.5">
                  <p className="text-textLight">Descuento</p>
                  <p className="mt-1 font-bold text-emerald-700">{formatCurrency(summary.discount)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section id="validar" className={`scroll-mt-6 rounded-[30px] border p-4 md:p-5 mb-8 ${isAllyUser ? 'border-white/70 bg-white/55 shadow-[0_18px_48px_rgba(35,79,132,0.12)] backdrop-blur-xl' : 'glass border-primary/15'}`}>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[24px] border border-white/80 bg-white/75 p-6 shadow-[0_10px_26px_rgba(35,79,132,0.08)] backdrop-blur-xl">
            <div className="mb-6 flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#315d98]/10 text-lg font-bold text-[#315d98]">✓</span>
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6283aa]">Operación</p><h3 className="mt-1 text-2xl font-bold text-[#173861]">Verificar descuento</h3></div>
            </div>
            <p className="text-sm leading-6 text-textLight mb-6">
              {isAllyUser
                ? 'Consulta la cedula y el codigo generado por el cliente. Al aplicar el descuento se registra el consumo.'
                : 'Consulta la cedula y el codigo generado por el cliente. La aplicación del descuento solo está disponible para el aliado autorizado.'}
            </p>

            <form onSubmit={handleFindDiscount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Cedula del cliente"
                  value={verifyCedula}
                  onChange={(event) => setVerifyCedula(event.target.value)}
                  placeholder="Ej: 1234567890"
                  required
                />
                <Input
                  label="Codigo de descuento"
                  value={verifyCode}
                  onChange={(event) => setVerifyCode(event.target.value.toUpperCase())}
                  placeholder="JR-ABC123"
                />
              </div>

              <Button type="submit" variant="primary">
                Consultar código activo
              </Button>
            </form>

            {activeRequest && (
              <div className="mt-6 rounded-[22px] border border-emerald-400/25 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
                <p className="font-semibold text-green-800">{activeRequest.clientName}</p>
                <p className="text-sm text-green-700">
                  {activeRequest.allyName} - {activeRequest.discountLabel}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Codigo: <span className="font-mono">{activeRequest.code}</span>
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Vence: {new Date(activeRequest.expiresAt).toLocaleString('es-CO')}
                </p>
                <p className="text-xs text-green-700 mt-1">{hasFlexibleDiscount ? 'Beneficio sujeto a condiciones: define el valor autorizado para este consumo.' : `Descuento calculado: ${activeRequest.discountPercent}% sobre el valor consumido.`}</p>

                {isAllyUser ? (
                  <div className={`mt-4 grid grid-cols-1 gap-3 items-end ${hasFlexibleDiscount ? 'md:grid-cols-[1fr_1fr_auto]' : 'md:grid-cols-[1fr_auto]'}`}>
                    <Input
                      label="Valor consumido"
                      type="number"
                      min="0"
                      value={consumedValue}
                      onChange={(event) => setConsumedValue(event.target.value)}
                      placeholder="Ej: 85000"
                    />
                    {canSetManualDiscount && (
                      <Input
                        label="Valor a descontar"
                        type="number"
                        min="0"
                        max={consumedValue || undefined}
                        value={manualDiscountValue}
                        onChange={(event) => setManualDiscountValue(event.target.value)}
                        placeholder="Ej: 15000"
                      />
                    )}
                    <Button type="button" variant="primary" onClick={handleRedeemDiscount}>
                      Aplicar descuento
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-[#c9d9ed] bg-[#eef5fc]/75 p-4 text-sm leading-6 text-[#42668f]">
                    <p className="font-bold text-[#244f8a]">Consulta de administración</p>
                    <p className="mt-1">El código está activo. Solo el usuario del aliado puede registrar el consumo y aplicar el descuento.</p>
                  </div>
                )}
                {isAllyUser && Number(consumedValue) > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-textLight">Consumo</p>
                      <p className="font-semibold text-text">{formatCurrency(Number(consumedValue))}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-textLight">Descuento</p>
                      <p className="font-semibold text-green-700">
                        {formatCurrency(previewDiscountValue)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-textLight">Total a pagar</p>
                      <p className="font-semibold text-text">
                        {formatCurrency(Math.max(0, Number(consumedValue) - previewDiscountValue))}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {verificationFeedback && (
              <p className="mt-4 text-sm font-medium text-primary">{verificationFeedback}</p>
            )}

            {queriedClientSummary && queriedClientSummary.requests.length > 0 && (
              <div className="mt-6 rounded-2xl border border-primary/15 bg-white/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-primary">
                      Historial del usuario consultado
                    </p>
                    <p className="font-semibold text-text">
                      Cedula {queriedClientSummary.requests[0]?.clientCedula}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-textLight">Mes actual</p>
                    <p className="font-semibold text-text">
                      {formatCurrency(queriedClientSummary.comparatives.month.consumed)} consumo /
                      {' '}{formatCurrency(queriedClientSummary.comparatives.month.discount)} descuento
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <p className="text-textLight">Hoy</p>
                    <p className="font-semibold text-text">
                      {formatCurrency(queriedClientSummary.comparatives.today.consumed)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3">
                    <p className="text-textLight">Semana</p>
                    <p className="font-semibold text-text">
                      {formatCurrency(queriedClientSummary.comparatives.week.consumed)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-primary/10 p-3">
                    <p className="text-textLight">Descuento total</p>
                    <p className="font-semibold text-green-700">
                      {formatCurrency(queriedClientSummary.stats.totalDiscount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {queriedClientSummary.requests.map((request) => (
                    <div key={request.id} className="rounded-xl border border-primary/10 bg-white/70 p-3 text-sm">
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="font-semibold text-text">{request.allyName}</p>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[request.status]}`}>
                          {STATUS_LABELS[request.status]}
                        </span>
                      </div>
                      <p className="text-xs text-textLight">
                        {request.code} - {request.discountLabel}
                      </p>
                      {request.status === 'redeemed' && (
                        <p className="mt-1 text-xs text-text">
                          Consumio {formatCurrency(request.consumedValue ?? 0)} /
                          descuento {formatCurrency(request.discountValue ?? 0)} /
                          pago {formatCurrency(request.totalAfterDiscount ?? 0)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[24px] border border-white/80 bg-white/65 p-6 shadow-[0_10px_26px_rgba(35,79,132,0.08)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6283aa]">Historial</p><h3 className="mt-1 text-2xl font-bold text-[#173861]">Trazabilidad reciente</h3></div><span className="rounded-full bg-[#315d98]/10 px-3 py-1 text-xs font-bold text-[#315d98]">{visibleRequests.length} registros</span></div>
            <div className="max-h-[390px] overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {visibleRequests.length === 0 ? (
                <div className="rounded-2xl border border-primary/10 bg-white/50 p-4 text-sm text-textLight">
                  Aun no hay codigos generados.
                </div>
              ) : (
                visibleRequests.slice(0, 8).map((request) => (
                  <article key={request.id} className="rounded-2xl border border-[#d9e6f4] bg-white/80 p-4 transition hover:border-[#9db9dc] hover:shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text">{request.clientName}</p>
                        <p className="text-xs text-textLight">
                          {request.allyName} - {request.municipio}, {request.departamento}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[request.status]}`}>
                        {STATUS_LABELS[request.status]}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="font-mono px-2 py-1 rounded-lg bg-primary/10 text-primary">{request.code}</span>
                      <span className="px-2 py-1 rounded-lg bg-black/5 text-textLight">{request.discountLabel}</span>
                      <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700">
                        Vence {new Date(request.expiresAt).toLocaleDateString('es-CO')}
                      </span>
                      {request.consumedValue !== undefined && (
                        <span className="px-2 py-1 rounded-lg bg-green-500/10 text-green-700">
                          Consumo {formatCurrency(request.consumedValue)}
                        </span>
                      )}
                      {request.discountValue !== undefined && request.discountValue > 0 && (
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700">
                          Desc. {formatCurrency(request.discountValue)}
                        </span>
                      )}
                    </div>
                    {!isAllyUser && request.status === 'active' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDiscount(request)}
                        className="mt-3 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Eliminar codigo
                      </button>
                    )}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE CLIENTES CON DESGLOSE */}
      <section id="reportes" className={`scroll-mt-6 rounded-[30px] border p-6 md:p-8 mb-8 ${isAllyUser ? 'border-white/70 bg-white/60 shadow-[0_16px_42px_rgba(35,79,132,0.12)] backdrop-blur-xl' : 'glass border-primary/15'}`}>
        <div className="mb-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6283aa]">Relación comercial</p><h3 className="mt-1 text-2xl font-bold text-[#173861]">Consumo por cliente</h3></div><p className="max-w-xl text-sm leading-6 text-textLight">
          Revisa el consumo total de cada cliente y dónde aplicó los descuentos.
        </p></div>

        {clientsSummary.length === 0 ? (
          <div className="rounded-2xl border border-primary/10 bg-white/50 p-6 text-center text-sm text-textLight">
            Aún no hay consumos registrados.
          </div>
        ) : (
          <div className="space-y-3">
            {clientsSummary.map((client) => (
              <div key={client.cedula} className="rounded-[22px] border border-white/80 bg-white/75 p-5 shadow-[0_8px_22px_rgba(35,79,132,0.07)] transition hover:shadow-[0_14px_28px_rgba(35,79,132,0.12)]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-text">{client.name}</p>
                    <p className="text-xs text-textLight">Cédula: {client.cedula}</p>
                    <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                      <div className="rounded-xl bg-[#f3f7fc] p-3">
                        <p className="text-textLight">Consumo total</p>
                        <p className="font-semibold text-text">{formatCurrency(client.totalConsumed)}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50/70 p-3">
                        <p className="text-textLight">Descuento total</p>
                        <p className="font-semibold text-green-700">{formatCurrency(client.totalDiscount)}</p>
                      </div>
                      <div className="rounded-xl bg-[#f3f7fc] p-3">
                        <p className="text-textLight">Usos</p>
                        <p className="font-semibold text-text">{client.requestCount}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedClientCedula(
                      expandedClientCedula === client.cedula ? null : client.cedula
                    )}
                    className="px-4 py-2.5 rounded-xl border border-primary/25 bg-white text-primary font-semibold hover:bg-primary/10 transition-colors text-sm"
                  >
                    {expandedClientCedula === client.cedula ? 'Contraer' : 'Ver más'}
                  </button>
                </div>

                {/* DESGLOSE EXPANDIDO */}
                {expandedClientCedula === client.cedula && (
                  <div className="mt-4 pt-4 border-t border-primary/10 space-y-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-primary font-semibold">
                      Desglose por aliado
                    </p>
                    {client.requests
                      .filter((r) => r.status === 'redeemed')
                      .map((request) => (
                        <div key={request.id} className="rounded-xl bg-white/60 p-3 text-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="font-semibold text-text">{request.allyName}</p>
                              <p className="text-xs text-primary">{request.discountLabel}</p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-500/10 text-green-700">
                              Usado
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <p className="text-textLight">Consumo</p>
                              <p className="font-semibold text-text">
                                {formatCurrency(request.consumedValue ?? 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-textLight">Descuento ({request.discountPercent}%)</p>
                              <p className="font-semibold text-green-700">
                                {formatCurrency(request.discountValue ?? 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-textLight">Total pagado</p>
                              <p className="font-semibold text-text">
                                {formatCurrency(request.totalAfterDiscount ?? 0)}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-textLight mt-2">
                            Fecha: {new Date(request.redeemedAt ?? request.createdAt).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {isAllyUser && (
        <section id="perfil" className="scroll-mt-6 mb-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] border border-white/80 bg-white/65 p-6 shadow-[0_14px_36px_rgba(35,79,132,0.1)] backdrop-blur-xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6283aa]">Mi perfil comercial</p><h3 className="mt-2 text-2xl font-bold text-[#173861]">{currentAlly?.name ?? session?.name}</h3><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-[#f2f6fb] p-4"><p className="text-xs text-[#7189a4]">Beneficio registrado</p><p className="mt-1 font-semibold text-[#173861]">{currentAlly?.discountLabel ?? 'Por confirmar'}</p></div><div className="rounded-2xl bg-[#f2f6fb] p-4"><p className="text-xs text-[#7189a4]">Ubicación</p><p className="mt-1 font-semibold text-[#173861]">{currentAlly ? `${currentAlly.municipio}, ${currentAlly.departamento}` : 'Por confirmar'}</p></div><div className="rounded-2xl bg-[#f2f6fb] p-4"><p className="text-xs text-[#7189a4]">ID de acceso</p><p className="mt-1 font-mono text-sm font-semibold text-[#173861]">{session?.loginId}</p></div><div className="rounded-2xl bg-[#f2f6fb] p-4"><p className="text-xs text-[#7189a4]">Correo registrado</p><p className="mt-1 break-all font-semibold text-[#173861]">{currentAlly?.email ?? 'No registrado'}</p></div></div></article>
          <article className="rounded-[28px] border border-[#d8e6f4] bg-gradient-to-br from-[#edf5fd] to-white p-6 shadow-[0_14px_36px_rgba(35,79,132,0.08)]"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6283aa]">Acompañamiento</p><h3 className="mt-2 text-xl font-bold text-[#173861]">¿Necesitas ayuda?</h3><p className="mt-3 text-sm leading-6 text-[#607b99]">Solicita actualización de datos comerciales o apoyo durante una validación de descuento.</p><a href="/contacto" className="mt-6 inline-flex rounded-xl bg-[#315d98] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition hover:bg-[#244f8a]">Contactar soporte</a></article>
        </section>
      )}

      {session?.role === 'admin_aliados' && (
      <>
      {editingId && <button type="button" aria-label="Cerrar edición" onClick={resetDraft} className="fixed inset-0 z-[199] cursor-default bg-[#07182e]/55 backdrop-blur-sm" />}
      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8">
        <section className={editingId ? 'fixed left-1/2 top-1/2 z-[200] max-h-[92vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/80 bg-[#f8fbff]/95 p-6 shadow-2xl backdrop-blur-xl md:p-8' : 'glass rounded-3xl border border-primary/15 p-6 md:p-8'}>
          <h3 className="text-2xl font-display text-text mb-6">
            {editingId ? 'Editar aliado' : 'Crear nuevo aliado'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 rounded-2xl border border-[#d4e0ee] bg-[#eef4fa]/80 p-1">
              {([
                ['commercial', 'Comercial'],
                ['access', 'Acceso'],
                ['content', 'Contenido'],
              ] as const).map(([tab, label]) => <button key={tab} type="button" onClick={() => setFormTab(tab)} className={`rounded-xl px-2 py-2.5 text-xs font-bold transition sm:text-sm ${formTab === tab ? 'bg-white text-[#244f8a] shadow-[0_5px_14px_rgba(35,79,132,0.12)]' : 'text-[#7089a5] hover:text-[#315d98]'}`}>{label}</button>)}
            </div>

            {formTab === 'commercial' && <div className="space-y-4 animate-fade-in">
            <Input
              label="Nombre del aliado"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Ej: Guarderia Huellas Felices"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Categoria</label>
                <select
                  value={draft.categorySlug}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      categorySlug: event.target.value,
                      subcategory: getSubcategoriesByCategory(event.target.value)[0] || '',
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {ALLY_CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Departamento</label>
                <select
                  value={draft.departamento}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, departamento: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {availableDepartments.map((departamento) => (
                    <option key={departamento} value={departamento}>
                      {departamento}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Municipio / ciudad"
                value={draft.municipio}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, municipio: event.target.value }))
                }
                placeholder="Ej: Pereira"
                required
              />

              <div>
                <label className="block text-sm font-medium text-text mb-2">Subcategoria</label>
                <select
                  value={draft.subcategory}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, subcategory: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Descuento registrado"
              value={draft.discountLabel}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, discountLabel: event.target.value }))
              }
              placeholder="Ej: 10% de descuento"
            />

            <Input
              label="Direccion"
              value={draft.address}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, address: event.target.value }))
              }
              placeholder="Ej: Carrera 15 # 102 - 45, Pereira"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="WhatsApp del administrador"
                value={draft.whatsappNumber}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, whatsappNumber: event.target.value }))
                }
                placeholder="573001112233"
                required
              />

              <Input
                label="Texto del boton"
                value={draft.actionLabel}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, actionLabel: event.target.value }))
                }
                placeholder="Mas informacion"
              />
            </div>
            </div>}

            {formTab === 'access' && <div className="space-y-4 animate-fade-in">
            <Input
              label="Correo de recuperación del aliado"
              type="email"
              value={draft.email ?? ''}
              onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="correo@aliado.com"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Usuario / ID de ingreso</label>
                <div className="flex overflow-hidden rounded-xl border border-border bg-white focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary">
                  <span className="flex items-center border-r border-border bg-primary/10 px-3 text-sm font-bold text-primary">JDR-</span>
                  <input
                    value={(draft.loginId ?? 'JDR-').replace(/^JDR-?/, '')}
                    onChange={(event) => setDraft((prev) => ({ ...prev, loginId: normalizeAllyLoginId(event.target.value) }))}
                    placeholder="Ej: ALIADO1234"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-text outline-none"
                  />
                </div>
                <p className="mt-1 text-xs text-textLight">El prefijo JDR- es fijo y se agrega automáticamente.</p>
              </div>
              <div>
                <div className="relative">
                  <Input label="Contraseña provisional o nueva" type={showAccessPassword ? 'text' : 'password'} value={accessPassword} onChange={(event) => setAccessPassword(event.target.value)} placeholder="Mínimo 10 caracteres" />
                  <button type="button" onClick={() => setShowAccessPassword((value) => !value)} className="absolute bottom-3 right-3 rounded-md px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">
                    {showAccessPassword ? 'Ocultar' : 'Ver'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-textLight">Al guardar se crea o restablece el acceso. Por seguridad la contraseña no vuelve a mostrarse.</p>
              </div>
            </div>
            </div>}

            {formTab === 'content' && <div className="space-y-4 animate-fade-in">
            <Input
              label="Logo (URL o ruta publica)"
              value={draft.logo}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, logo: event.target.value }))
              }
              placeholder="/images/logos_aliados_jr/tu_logo.png"
            />

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Subir logo desde archivo (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                className="w-full text-sm text-textLight file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/15 file:text-primary file:font-semibold hover:file:bg-primary/25"
              />
            </div>

            <Textarea
              label='Mensaje WhatsApp (usa "{{nombre}}" para insertar el nombre)'
              value={draft.whatsappTemplate}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, whatsappTemplate: event.target.value }))
              }
              placeholder='Hola, quiero conocer los descuentos y beneficios de "{{nombre}}".'
              rows={3}
            />

            <Textarea
              label="Descripcion corta (opcional)"
              value={draft.description}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Describe brevemente el servicio del aliado."
              rows={2}
            />

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, featured: event.target.checked }))
                }
                className="accent-primary"
              />
              Mostrar como destacado (aparece en Home)
            </label>
            </div>}

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" variant="primary" disabled={savingAlly}>
                {savingAlly ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear aliado'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetDraft}>
                Limpiar formulario
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={resetDraft} disabled={savingAlly}>
                  Cancelar edición
                </Button>
              )}
            </div>
          </form>

          {feedback && <p className="mt-4 text-sm text-primary font-medium">{feedback}</p>}
        </section>

        <section className="space-y-6">
          <article className="glass rounded-3xl border border-primary/15 p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Vista previa CTA</h3>
            <div className="rounded-2xl border border-primary/15 bg-white/40 p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-white/80 p-2 shadow-sm">
                  {previewAlly.logo ? (
                    <Image
                      src={previewAlly.logo}
                      alt={`Logo de ${previewAlly.name || 'aliado comercial'}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="px-1 text-center text-[10px] font-semibold leading-tight text-textLight">Vista del logo</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary mb-1">
                    {getCategoryLabel(previewAlly.categorySlug)} - {previewAlly.subcategory}
                  </p>
                  <p className="text-xs text-textLight">
                    Ubicación: {previewAlly.municipio}, {previewAlly.departamento}
                  </p>
                </div>
              </div>
              <p className="inline-flex mb-2 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-700">
                {previewAlly.discountLabel}
              </p>
              <p className="font-semibold text-text mb-1">{previewAlly.name}</p>
              <p className="text-sm text-textLight mb-3">
                Mensaje: {previewAlly.whatsappTemplate || getDefaultAllyTemplate(previewAlly.categorySlug, previewAlly.subcategory)}
              </p>
              <a
                href={buildAllyWhatsAppUrl(previewAlly)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full">
                  {previewAlly.actionLabel || 'Mas informacion'}
                </Button>
              </a>
            </div>
          </article>

          <article className="glass rounded-3xl border border-primary/15 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-text">Aliados cargados</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                {filteredAllies.length} de {allies.length}
              </span>
            </div>

            <div className="relative mb-4"><input value={allySearch} onChange={(event) => setAllySearch(event.target.value)} placeholder="Buscar por nombre, ID, ciudad, departamento o categoría…" className="w-full rounded-xl border border-[#cbd9e8] bg-white/80 px-4 py-3 pr-10 text-sm text-[#173861] outline-none transition placeholder:text-[#88a0ba] focus:border-[#5a83b7] focus:ring-4 focus:ring-[#5a83b7]/10" /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6384aa]">⌕</span></div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredAllies.length === 0 ? <div className="rounded-2xl border border-dashed border-[#bfd1e5] bg-white/50 p-6 text-center text-sm text-[#6384aa]">No encontramos aliados con esa búsqueda.</div> : filteredAllies.map((ally) => (
                <div
                  key={ally.id}
                  className="rounded-2xl border border-primary/15 bg-white/40 p-4"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl border border-primary/20 bg-white p-2 flex items-center justify-center overflow-hidden shrink-0 relative">
                      {ally.logo ? (
                        <Image src={ally.logo} alt={ally.name} width={56} height={56} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs text-textLight">Sin logo</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text line-clamp-1">{ally.name}</p>
                      <p className="text-xs text-primary uppercase tracking-[0.16em]">
                        {getCategoryLabel(ally.categorySlug)} - {ally.subcategory}
                      </p>
                      <p className="text-xs text-textLight mt-1">{ally.municipio}, {ally.departamento}</p>
                      <p className="text-xs text-textLight line-clamp-1 mt-1">{ally.address}</p>
                      <p className="text-xs font-semibold text-green-700 mt-1">{ally.discountLabel}</p>
                      <p className="text-[11px] text-textLight mt-1">ID de aliado: <span className="font-mono">{ally.loginId || 'Sin ID'}</span></p>
                      {(() => {
                        const access = accessStatuses[ally.id];
                        const isLocked = Boolean(access?.lockedUntil && new Date(access.lockedUntil).getTime() > Date.now());
                        const statusLabel = !access?.accountConfigured ? 'Sin credenciales' : isLocked ? 'Acceso bloqueado' : access.accessActive ? 'Acceso activo' : 'Acceso inactivo';
                        const statusStyle = !access?.accountConfigured ? 'border-amber-400/30 bg-amber-50 text-amber-700' : isLocked ? 'border-red-400/30 bg-red-50 text-red-700' : access.accessActive ? 'border-emerald-400/30 bg-emerald-50 text-emerald-700' : 'border-slate-400/30 bg-slate-50 text-slate-700';
                        return <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className={`rounded-full border px-2 py-0.5 font-semibold ${statusStyle}`}>{statusLabel}</span>
                          <span className={`rounded-full border px-2 py-0.5 font-semibold ${ally.email ? 'border-sky-400/30 bg-sky-50 text-sky-700' : 'border-slate-300 bg-slate-50 text-slate-500'}`}>{ally.email ? 'Correo configurado' : 'Sin correo'}</span>
                          {access?.lastLogin && <span className="text-textLight">Último ingreso: {new Date(access.lastLogin).toLocaleDateString('es-CO')}</span>}
                        </div>;
                      })()}
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(ally)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/25 text-primary hover:bg-primary/10 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ally)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass rounded-3xl border border-primary/15 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6283aa]">Control operativo</p><h3 className="mt-1 text-lg font-semibold text-text">Bitácora reciente</h3></div>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">MySQL</span>
            </div>
            <div className="space-y-2.5">
              {activity.length === 0 ? <p className="rounded-xl border border-dashed border-[#bfd1e5] bg-white/45 p-4 text-sm text-[#6384aa]">Aún no hay movimientos registrados.</p> : activity.slice(0, 8).map((entry) => (
                <div key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/75 bg-white/55 p-3">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#173861]">{ACTIVITY_LABELS[entry.eventType] ?? entry.eventType}</p><p className="truncate text-xs text-[#6984a3]">{entry.allyName} · {entry.actorType === 'ALLY' ? 'Aliado' : entry.actorType === 'ADMIN' ? 'Administración' : 'Sistema'}</p></div>
                  <time className="shrink-0 text-[11px] text-[#6984a3]">{new Date(entry.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</time>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
      {savingAlly && <div className="fixed inset-0 z-[250] grid place-items-center bg-[#07182e]/45 p-4 backdrop-blur-sm"><div className="rounded-3xl border border-white/80 bg-white/95 px-7 py-6 text-center shadow-2xl"><span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /><p className="mt-4 font-bold text-text">Guardando información del aliado</p><p className="mt-1 text-sm text-textLight">Por favor espera la confirmación.</p></div></div>}
      </>
      )}
    </div>
  );
}
