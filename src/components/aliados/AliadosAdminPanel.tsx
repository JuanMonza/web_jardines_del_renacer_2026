'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
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
} from '@/config/all ies';
import {
  readCommercialAllies,
  removeCommercialAlly,
  upsertCommercialAlly,
  writeCommercialAllies,
} from '@/lib/alliesStorage';
import { ensureExcelAlliesSeeded } from '@/lib/allyExcelImport';
import {
  deleteDiscountRequest,
  findRequestForVerification,
  formatCurrency,
  getClientConsumptionSummary,
  getConsumptionComparatives,
  getDiscountStats,
  readDiscountRequests,
  redeemDiscountRequest,
  type AllyDiscountRequest,
  type DiscountRequestStatus,
} from '@/lib/allyMembershipStorage';

type AlliesSession = {
  cedula: string;
  role: 'admin_aliados' | 'ally_user';
  name: string;
  allyId?: string;
  loginId?: string;
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

export default function AliadosAdminPanel() {
  const [allies, setAllies] = useState<CommercialAlly[]>([]);
  const [draft, setDraft] = useState<CommercialAlly>(createEmptyAlly());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [session, setSession] = useState<AlliesSession | null>(null);
  const [requests, setRequests] = useState<AllyDiscountRequest[]>([]);
  const [verifyCedula, setVerifyCedula] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [consumedValue, setConsumedValue] = useState('');
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [activeRequest, setActiveRequest] = useState<AllyDiscountRequest | null>(null);
  const [loadingError, setLoadingError] = useState('');
  const [expandedClientCedula, setExpandedClientCedula] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    // Priorizar sesión de admin sobre aliado
    let rawSession = localStorage.getItem('alliesAdminUser');
    if (rawSession) {
      // Si hay sesión de admin, limpiar sesión de aliado
      localStorage.removeItem('allyPortalUser');
    } else {
      // Si no hay admin, intentar con aliado
      rawSession = localStorage.getItem('allyPortalUser');
    }
    
    if (rawSession) {
      try {
        setSession(JSON.parse(rawSession) as AlliesSession);
      } catch {
        setSession(null);
      }
    }
    setRequests(readDiscountRequests());
    
    ensureExcelAlliesSeeded()
      .then((seededAllies) => {
        if (mounted) {
          setAllies(seededAllies);
          setLoadingError('');
          console.log('Aliados cargados:', seededAllies.length);
        }
      })
      .catch((error) => {
        console.error('Error cargando aliados:', error);
        if (mounted) {
          const fallback = readCommercialAllies();
          setAllies(fallback);
          if (fallback.length === 0) {
            setLoadingError('No se pudieron cargar aliados de Excel ni localStorage.');
          }
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const sessionAlly = useMemo(
    () => allies.find((ally) => ally.id === session?.allyId) ?? null,
    [allies, session?.allyId],
  );

  const visibleRequests = useMemo(() => {
    if (session?.role === 'ally_user' && sessionAlly) {
      return requests.filter((request) => request.allyId === sessionAlly.id);
    }
    return requests;
  }, [requests, session?.role, sessionAlly]);

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

  const handleSubmit = (event: React.FormEvent) => {
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

    if (!draft.logo.trim()) {
      setFeedback('Agrega el logo del aliado (URL o archivo).');
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
      loginId: draft.loginId?.trim() || `${slugify(draft.name).slice(0, 3).toUpperCase()}${Date.now().toString().slice(-4)}`,
      loginPassword: draft.loginPassword?.trim() || `JR${Date.now().toString().slice(-4)}`,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const next = upsertCommercialAlly(allies, allyRecord);
    setAllies(next);
    writeCommercialAllies(next);
    resetDraft();
    setFeedback(editingId ? 'Aliado actualizado correctamente.' : 'Aliado creado correctamente.');
  };

  const handleDelete = (ally: CommercialAlly) => {
    const confirmed = window.confirm(`¿Deseas eliminar el aliado "${ally.name}"?`);
    if (!confirmed) {
      return;
    }
    const next = removeCommercialAlly(allies, ally.id);
    setAllies(next);
    writeCommercialAllies(next);
    if (editingId === ally.id) {
      resetDraft();
    }
    setFeedback('Aliado eliminado correctamente.');
  };

  const handleEdit = (ally: CommercialAlly) => {
    setDraft({ ...ally });
    setEditingId(ally.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const refreshRequests = () => setRequests(readDiscountRequests());

  const handleFindDiscount = (event: React.FormEvent) => {
    event.preventDefault();
    setVerificationFeedback('');
    setActiveRequest(null);

    const request = findRequestForVerification({
      cedula: verifyCedula,
      code: verifyCode,
      allyId: session?.role === 'ally_user' ? sessionAlly?.id : undefined,
    });

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
    setVerificationFeedback('Codigo activo. Ingresa el valor consumido para aplicar el descuento.');
  };

  const handleRedeemDiscount = () => {
    if (!activeRequest) {
      return;
    }

    const value = Number(consumedValue);
    if (!Number.isFinite(value) || value <= 0) {
      setVerificationFeedback('Ingresa un valor consumido valido mayor a cero.');
      return;
    }

    const redeemed = redeemDiscountRequest({
      requestId: activeRequest.id,
      consumedValue: value,
      redeemedBy: session?.loginId || session?.cedula || 'admin',
    });

    refreshRequests();
    setActiveRequest(null);
    setConsumedValue('');
    setVerifyCode('');
    setVerificationFeedback(
      redeemed
        ? `Descuento aplicado. Consumo ${formatCurrency(value)}, descuento ${formatCurrency(redeemed.discountValue ?? 0)}, total a pagar ${formatCurrency(redeemed.totalAfterDiscount ?? value)}.`
        : 'No se pudo actualizar el codigo.',
    );
  };

  const handleDeleteDiscount = (request: AllyDiscountRequest) => {
    const confirmed = window.confirm(`¿Deseas eliminar el codigo ${request.code}?`);
    if (!confirmed) {
      return;
    }

    deleteDiscountRequest(request.id);
    refreshRequests();
    setVerificationFeedback('Codigo eliminado correctamente.');
  };

  const previewAlly = createTemporaryAllyFromDraft(draft);
  const isAllyUser = session?.role === 'ally_user';

  const handleReloadAlliesFromExcel = async () => {
    setFeedback('Recargando aliados desde Excel...');
    setLoadingError('');
    
    // Limpiar la marca de ya cargado
    localStorage.removeItem('jdr.commercial-allies.excel-seeded.v1');
    
    try {
      const reloaded = await ensureExcelAlliesSeeded();
      setAllies(reloaded);
      setFeedback(`✓ Cargados ${reloaded.length} aliados desde Excel.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      setLoadingError(`Error al recargar: ${message}`);
      const fallback = readCommercialAllies();
      setAllies(fallback);
    }
  };

  return (
    <div className="min-h-screen pt-2 pb-10">
      <SectionTitle
        title="Panel de Aliados Comerciales"
        subtitle={
          isAllyUser
            ? 'Valida codigos activos y registra el valor consumido por cada cliente.'
            : 'Administra aliados, credenciales, codigos de descuento y consumos.'
        }
        align="center"
        className="mb-8"
      />

      {loadingError && (
        <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-50 p-4 text-sm text-red-700 flex items-center justify-between">
          <span>⚠️ {loadingError}</span>
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
          <span>ℹ️ No hay aliados cargados aun. Crea el primer aliado o recarga desde Excel.</span>
          <button
            onClick={handleReloadAlliesFromExcel}
            className="ml-4 font-semibold px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
          >
            Cargar desde Excel
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          ['Codigos generados', stats.generated.toString()],
          ['Codigos activos', stats.active.toString()],
          ['Codigos usados', stats.redeemed.toString()],
          ['Codigos vencidos', stats.expired.toString()],
          ['Codigos eliminados', stats.deleted.toString()],
          ['Consumo total', formatCurrency(stats.totalConsumed)],
          ['Descuento total', formatCurrency(stats.totalDiscount)],
          ['Total despues desc.', formatCurrency(stats.totalAfterDiscount)],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-primary/15 bg-white/55 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-textLight">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
          </article>
        ))}
      </div>

      {isAllyUser && sessionAlly && (
        <div className="mb-6 rounded-2xl border border-primary/15 bg-primary/10 p-4 text-sm text-text">
          Sesion de aliado activa: <span className="font-semibold">{sessionAlly.name}</span> -
          {' '}ID <span className="font-mono">{sessionAlly.loginId}</span>
        </div>
      )}

      <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          ['Hoy', comparatives.today],
          ['Esta semana', comparatives.week],
          ['Este mes', comparatives.month],
        ].map(([label, item]) => {
          const summary = item as { count: number; consumed: number; discount: number };
          return (
            <article key={label as string} className="rounded-3xl border border-primary/15 bg-white/65 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-primary">{label as string}</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-textLight">Usos</p>
                  <p className="text-xl font-semibold text-text">{summary.count}</p>
                </div>
                <div>
                  <p className="text-textLight">Consumo</p>
                  <p className="font-semibold text-text">{formatCurrency(summary.consumed)}</p>
                </div>
                <div>
                  <p className="text-textLight">Descuento</p>
                  <p className="font-semibold text-green-700">{formatCurrency(summary.discount)}</p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="glass rounded-3xl border border-primary/15 p-6 md:p-8 mb-8">
        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-8">
          <div>
            <h3 className="text-2xl font-display text-text mb-2">Verificar descuento</h3>
            <p className="text-sm text-textLight mb-5">
              Consulta la cedula y el codigo generado por el cliente. Al aplicar el descuento se registra el consumo.
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
                Consultar codigo activo
              </Button>
            </form>

            {activeRequest && (
              <div className="mt-5 rounded-2xl border border-green-500/25 bg-green-50 p-4">
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
                <p className="text-xs text-green-700 mt-1">
                  Descuento calculado: {activeRequest.discountPercent}% sobre el valor consumido.
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                  <Input
                    label="Valor consumido"
                    type="number"
                    min="0"
                    value={consumedValue}
                    onChange={(event) => setConsumedValue(event.target.value)}
                    placeholder="Ej: 85000"
                  />
                  <Button type="button" variant="primary" onClick={handleRedeemDiscount}>
                    Aplicar descuento
                  </Button>
                </div>
                {Number(consumedValue) > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-textLight">Consumo</p>
                      <p className="font-semibold text-text">{formatCurrency(Number(consumedValue))}</p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-textLight">Descuento</p>
                      <p className="font-semibold text-green-700">
                        {formatCurrency(Math.round((Number(consumedValue) * activeRequest.discountPercent) / 100))}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/70 p-3">
                      <p className="text-textLight">Total a pagar</p>
                      <p className="font-semibold text-text">
                        {formatCurrency(Number(consumedValue) - Math.round((Number(consumedValue) * activeRequest.discountPercent) / 100))}
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

          <div>
            <h3 className="text-lg font-semibold text-text mb-4">Trazabilidad reciente</h3>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {visibleRequests.length === 0 ? (
                <div className="rounded-2xl border border-primary/10 bg-white/50 p-4 text-sm text-textLight">
                  Aun no hay codigos generados.
                </div>
              ) : (
                visibleRequests.slice(0, 8).map((request) => (
                  <article key={request.id} className="rounded-2xl border border-primary/10 bg-white/50 p-4">
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
      <section className="glass rounded-3xl border border-primary/15 p-6 md:p-8 mb-8">
        <h3 className="text-2xl font-display text-text mb-2">Consumo por cliente</h3>
        <p className="text-sm text-textLight mb-6">
          Revisa el consumo total de cada cliente y dónde aplicó los descuentos.
        </p>

        {clientsSummary.length === 0 ? (
          <div className="rounded-2xl border border-primary/10 bg-white/50 p-6 text-center text-sm text-textLight">
            Aún no hay consumos registrados.
          </div>
        ) : (
          <div className="space-y-3">
            {clientsSummary.map((client) => (
              <div key={client.cedula} className="rounded-2xl border border-primary/15 bg-white/50 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-text">{client.name}</p>
                    <p className="text-xs text-textLight">Cédula: {client.cedula}</p>
                    <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-textLight">Consumo total</p>
                        <p className="font-semibold text-text">{formatCurrency(client.totalConsumed)}</p>
                      </div>
                      <div>
                        <p className="text-textLight">Descuento total</p>
                        <p className="font-semibold text-green-700">{formatCurrency(client.totalDiscount)}</p>
                      </div>
                      <div>
                        <p className="text-textLight">Usos</p>
                        <p className="font-semibold text-text">{client.requestCount}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedClientCedula(
                      expandedClientCedula === client.cedula ? null : client.cedula
                    )}
                    className="px-4 py-2 rounded-lg border border-primary/25 text-primary font-semibold hover:bg-primary/10 transition-colors text-sm"
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

      {session?.role === 'admin_aliados' && (
      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8">
        <section className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
          <h3 className="text-2xl font-display text-text mb-6">
            {editingId ? 'Editar aliado' : 'Crear nuevo aliado'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ID login aliado"
                value={draft.loginId ?? ''}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, loginId: event.target.value.toUpperCase() }))
                }
                placeholder="Ej: AMM1234"
              />

              <Input
                label="Contrasena aliado"
                value={draft.loginPassword ?? ''}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, loginPassword: event.target.value }))
                }
                placeholder="Ej: JR1234"
              />
            </div>

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
              placeholder='Hola, quiero mas informacion de "{{nombre}}".'
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

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" variant="primary">
                {editingId ? 'Guardar cambios' : 'Crear aliado'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetDraft}>
                Limpiar formulario
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancelar edicion
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
              <p className="text-xs uppercase tracking-[0.18em] text-primary mb-1">
                {getCategoryLabel(previewAlly.categorySlug)} - {previewAlly.subcategory}
              </p>
              <p className="text-xs text-textLight mb-1">
                Ubicacion: {previewAlly.municipio}, {previewAlly.departamento}
              </p>
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
                {allies.length} registros
              </span>
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
              {allies.map((ally) => (
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
                      <p className="text-[11px] text-textLight mt-1">
                        Login: <span className="font-mono">{ally.loginId || 'Sin ID'}</span> /
                        {' '}<span className="font-mono">{ally.loginPassword || 'Sin clave'}</span>
                      </p>
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
        </section>
      </div>
      )}
    </div>
  );
}
