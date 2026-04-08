'use client';

import { useEffect, useMemo, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/config/contact';
import { PLANS_CONFIG, type PlanId } from '@/config/plans';

type SelectedPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
} | null;

type CotizarQuoteFormProps = {
  selectedPlan: SelectedPlan;
};

type CoverageType = 'individual' | 'familiar' | 'mascotas' | 'empresarial';

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  beneficiaries: string;
  coverageType: CoverageType;
  selectedPlanId: PlanId;
  transferService: 'No aplica' | 'Repatriacion' | 'Expatriacion';
  preferredContact: 'WhatsApp' | 'Llamada' | 'Correo';
  preferredContactTime: string;
};

const COVERAGE_LABELS: Record<CoverageType, string> = {
  individual: 'Plan para 1 persona',
  familiar: 'Plan familiar (mas de 1 persona)',
  mascotas: 'Exequial mascotas',
  empresarial: 'Plan empresarial',
};

const COVERAGE_COUNT_LABELS: Record<CoverageType, string> = {
  individual: 'Numero de personas',
  familiar: 'Numero de beneficiarios',
  mascotas: 'Numero de mascotas',
  empresarial: 'Numero de colaboradores',
};

const COVERAGE_DEFAULT_COUNTS: Record<CoverageType, string> = {
  individual: '1',
  familiar: '4',
  mascotas: '1',
  empresarial: '15',
};

const PLAN_OPTIONS_BY_COVERAGE: Record<CoverageType, PlanId[]> = {
  individual: ['exequial', 'premium', 'excellence'],
  familiar: ['familiar'],
  mascotas: ['mascotas'],
  empresarial: ['corporativo'],
};

const COVERAGE_BY_PLAN_ID: Record<PlanId, CoverageType> = {
  exequial: 'individual',
  premium: 'individual',
  excellence: 'individual',
  familiar: 'familiar',
  mascotas: 'mascotas',
  corporativo: 'empresarial',
};

function isPlanId(value: string): value is PlanId {
  return value in PLANS_CONFIG;
}

function getCoverageByPlanId(planId: PlanId): CoverageType {
  return COVERAGE_BY_PLAN_ID[planId];
}

function getDefaultPlanForCoverage(coverage: CoverageType): PlanId {
  return PLAN_OPTIONS_BY_COVERAGE[coverage][0];
}

export default function CotizarQuoteForm({ selectedPlan }: CotizarQuoteFormProps) {
  const initialCoverage = selectedPlan ? getCoverageByPlanId(selectedPlan.id) : 'individual';
  const initialPlanId = selectedPlan?.id ?? getDefaultPlanForCoverage(initialCoverage);
  const selectedPlanIdFromProp = selectedPlan?.id;

  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    beneficiaries: COVERAGE_DEFAULT_COUNTS[initialCoverage],
    coverageType: initialCoverage,
    selectedPlanId: initialPlanId,
    transferService: 'No aplica',
    preferredContact: 'WhatsApp',
    preferredContactTime: '',
  });

  const coverageTypeId = 'cotizar-coverage-type';
  const selectedPlanFieldId = 'cotizar-selected-plan';
  const contactChannelId = 'cotizar-preferred-contact';
  const contactTimeId = 'cotizar-preferred-contact-time';

  useEffect(() => {
    if (!selectedPlanIdFromProp) {
      return;
    }
    // Si el usuario llega desde una tarjeta de plan, respetamos esa selección.
    const nextCoverage = getCoverageByPlanId(selectedPlanIdFromProp);
    setFormData((prev) => ({
      ...prev,
      coverageType: nextCoverage,
      selectedPlanId: selectedPlanIdFromProp,
      beneficiaries: COVERAGE_DEFAULT_COUNTS[nextCoverage],
    }));
  }, [selectedPlanIdFromProp]);

  const availablePlans = useMemo(
    () => PLAN_OPTIONS_BY_COVERAGE[formData.coverageType].map((planId) => PLANS_CONFIG[planId]),
    [formData.coverageType],
  );
  const selectedPlanConfig = PLANS_CONFIG[formData.selectedPlanId];

  const hasRequiredCount =
    formData.coverageType === 'individual' ? true : Number(formData.beneficiaries) > 0;
  const isReady =
    formData.fullName.trim() &&
    formData.phone.trim() &&
    formData.city.trim() &&
    hasRequiredCount &&
    formData.preferredContactTime.trim();

  const quoteMessage = useMemo(() => {
    // Este bloque arma el mensaje final que viaja directo a WhatsApp.
    const countLine =
      formData.coverageType === 'individual'
        ? '*Cobertura:* 1 persona'
        : `*${COVERAGE_COUNT_LABELS[formData.coverageType]}:* ${formData.beneficiaries || 'Por definir'}`;

    return (
      `Hola, quiero cotizar un plan en Jardines del Renacer.\n\n` +
      `*Tipo de contratacion:* ${COVERAGE_LABELS[formData.coverageType]}\n` +
      `*Plan deseado:* ${selectedPlanConfig.name} (${selectedPlanConfig.price})\n` +
      `${countLine}\n` +
      `*Servicio de traslado:* ${formData.transferService}\n` +
      `*Nombre:* ${formData.fullName}\n` +
      `*Telefono:* ${formData.phone}\n` +
      `*Correo:* ${formData.email || 'No registra'}\n` +
      `*Ciudad:* ${formData.city}\n` +
      `*Canal preferido:* ${formData.preferredContact}\n` +
      `*Hora preferida de contacto:* ${formData.preferredContactTime}`
    );
  }, [formData, selectedPlanConfig.name, selectedPlanConfig.price]);

  const handleSendWhatsApp = () => {
    if (!isReady) {
      return;
    }
    window.open(buildWhatsAppUrl(quoteMessage), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-8 rounded-3xl border border-primary/20 bg-gradient-to-b from-white/80 to-primary/5 p-6 md:p-8 shadow-[0_20px_60px_-45px_rgba(13,56,138,0.55)]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h4 className="text-2xl font-display text-text mb-1">Estructura de cotizacion</h4>
          <p className="text-sm text-textLight leading-relaxed">
            Completa estos datos para enviar una cotizacion mas precisa por WhatsApp.
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${
            isReady
              ? 'border-green-500/30 bg-green-500/10 text-green-700'
              : 'border-primary/25 bg-primary/10 text-primary'
          }`}
        >
          {isReady ? 'Formulario listo para enviar' : 'Faltan datos obligatorios'}
        </span>
      </div>

      <div className="space-y-7">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Datos de contacto</h5>
            <p className="text-xs text-textLight">* Campos obligatorios</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre completo *"
              value={formData.fullName}
              onChange={(event) => setFormData((prev) => ({ ...prev, fullName: event.target.value }))}
              placeholder="Ej: Ana Perez"
            />
            <Input
              label="Telefono *"
              value={formData.phone}
              onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
              placeholder="3001234567"
            />
            <Input
              label="Correo electronico"
              type="email"
              value={formData.email}
              onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Ciudad *"
              value={formData.city}
              onChange={(event) => setFormData((prev) => ({ ...prev, city: event.target.value }))}
              placeholder="Ej: Pereira"
            />
          </div>
        </section>

        <section className="pt-6 border-t border-primary/10">
          <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary mb-4">
            Perfil de la cotizacion
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor={coverageTypeId} className="block text-sm font-medium text-text mb-2">
                Tipo de contratacion
              </label>
              <select
                id={coverageTypeId}
                value={formData.coverageType}
                onChange={(event) => {
                  const nextCoverage = event.target.value as CoverageType;
                  const nextPlan = getDefaultPlanForCoverage(nextCoverage);
                  setFormData((prev) => ({
                    ...prev,
                    coverageType: nextCoverage,
                    selectedPlanId: nextPlan,
                    beneficiaries: COVERAGE_DEFAULT_COUNTS[nextCoverage],
                  }));
                }}
                className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                {(Object.entries(COVERAGE_LABELS) as Array<[CoverageType, string]>).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={selectedPlanFieldId} className="block text-sm font-medium text-text mb-2">
                Plan que deseas contratar
              </label>
              <select
                id={selectedPlanFieldId}
                value={formData.selectedPlanId}
                onChange={(event) => {
                  const nextPlanId = event.target.value;
                  if (!isPlanId(nextPlanId)) {
                    return;
                  }
                  setFormData((prev) => ({
                    ...prev,
                    selectedPlanId: nextPlanId,
                  }));
                }}
                className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                {availablePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.price}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Servicio de traslado
              </label>
              <select
                value={formData.transferService}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    transferService: event.target.value as FormState['transferService'],
                  }))
                }
                className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                <option value="No aplica">No aplica</option>
                <option value="Repatriacion">Repatriacion</option>
                <option value="Expatriacion">Expatriacion</option>
              </select>
            </div>

            {formData.coverageType !== 'individual' && (
              <Input
                label={COVERAGE_COUNT_LABELS[formData.coverageType]}
                type="number"
                min={1}
                value={formData.beneficiaries}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    beneficiaries: event.target.value,
                  }))
                }
                placeholder="Ingresa la cantidad"
              />
            )}

            <div className={formData.coverageType !== 'individual' ? '' : 'md:col-span-2'}>
              <label htmlFor={contactChannelId} className="block text-sm font-medium text-text mb-2">
                Canal preferido
              </label>
              <select
                id={contactChannelId}
                value={formData.preferredContact}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredContact: event.target.value as FormState['preferredContact'],
                  }))
                }
                className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Llamada">Llamada</option>
                <option value="Correo">Correo</option>
              </select>
            </div>

            <div>
              <label htmlFor={contactTimeId} className="block text-sm font-medium text-text mb-2">
                Hora preferida de contacto *
              </label>
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.55)] transition-all duration-300 focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/20">
                <input
                  id={contactTimeId}
                  type="time"
                  value={formData.preferredContactTime}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredContactTime: event.target.value,
                    }))
                  }
                  className="w-full bg-transparent pr-8 text-[15px] font-semibold tracking-[0.01em] text-slate-700 outline-none [color-scheme:light]"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="8" />
                    <path d="M12 8v4l2.5 2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-xs text-textLight">Selecciona la hora en la que prefieres que te contacte un asesor.</p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-7 rounded-2xl border border-primary/15 bg-white/60 px-4 py-3 md:px-5">
        <p className="text-xs uppercase tracking-[0.14em] text-primary mb-1">Resumen rapido</p>
        <p className="text-sm text-textLight leading-relaxed">
          Plan seleccionado: {selectedPlanConfig.name} ({selectedPlanConfig.price})
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-primary/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-xs md:text-sm text-textLight">
          Al enviar, abriremos WhatsApp con la estructura completa de tu solicitud.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full md:w-auto md:min-w-[300px] justify-center"
          onClick={handleSendWhatsApp}
          disabled={!isReady}
        >
          Enviar cotizacion a WhatsApp
        </Button>
      </div>
    </div>
  );
}
