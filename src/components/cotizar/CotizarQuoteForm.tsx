"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/config/contact";
import { PLANS_CONFIG, type PlanId } from "@/config/plans";

type SelectedPlan = {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
} | null;

type CotizarQuoteFormProps = {
  selectedPlan: SelectedPlan;
};

type CoverageType =
  | "individual"
  | "familiar"
  | "segmentado"
  | "especial"
  | "corporativo"
  | "independiente";

type FormState = {
  fullName: string;
  lastName: string;
  phone: string;
  city: string;
  beneficiaries: string;
  coverageType: CoverageType;
  selectedPlanId: PlanId;
  preferredContact: "WhatsApp" | "Llamada";
  preferredContactTime: string;
};

const COVERAGE_LABELS: Record<CoverageType, string> = {
  individual: "Plan individual",
  familiar: "Plan familiar",
  segmentado: "Plan segmentado",
  especial: "Plan especial",
  corporativo: "Plan corporativo",
  independiente: "Plan para independientes",
};

const COVERAGE_COUNT_LABELS: Record<CoverageType, string> = {
  individual: "Número de personas",
  familiar: "Número de beneficiarios",
  segmentado: "Número de afiliados",
  especial: "Número de servicios",
  corporativo: "Número de colaboradores",
  independiente: "Número de personas",
};

const COVERAGE_DEFAULT_COUNTS: Record<CoverageType, string> = {
  individual: "1",
  familiar: "4",
  segmentado: "1",
  especial: "1",
  corporativo: "15",
  independiente: "1",
};

const PLAN_OPTIONS_BY_COVERAGE: Record<CoverageType, PlanId[]> = {
  individual: ["tranquilidad-total"],
  familiar: ["proteccion-familiar-esencial"],
  segmentado: [
    "celestial",
    "aliado-tendero",
    "comunidad-activa",
    "vocacion-docente",
    "heroes-nacion",
  ],
  especial: ["prevision-inmediata"],
  corporativo: ["bienestar-empresarial"],
  independiente: ["profesional-independiente"],
};

const COVERAGE_BY_PLAN_ID: Record<PlanId, CoverageType> = {
  "tranquilidad-total": "individual",
  "proteccion-familiar-esencial": "familiar",
  celestial: "segmentado",
  "aliado-tendero": "segmentado",
  "comunidad-activa": "segmentado",
  "vocacion-docente": "segmentado",
  "heroes-nacion": "segmentado",
  "prevision-inmediata": "especial",
  "bienestar-empresarial": "corporativo",
  "profesional-independiente": "independiente",
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

export default function CotizarQuoteForm({
  selectedPlan,
}: CotizarQuoteFormProps) {
  const initialCoverage = selectedPlan
    ? getCoverageByPlanId(selectedPlan.id)
    : "individual";
  const initialPlanId =
    selectedPlan?.id ?? getDefaultPlanForCoverage(initialCoverage);
  const selectedPlanIdFromProp = selectedPlan?.id;

  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    lastName: "",
    phone: "",
    city: "",
    beneficiaries: COVERAGE_DEFAULT_COUNTS[initialCoverage],
    coverageType: initialCoverage,
    selectedPlanId: initialPlanId,
    preferredContact: "WhatsApp",
    preferredContactTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState("");
  const [showWhatsAppOption, setShowWhatsAppOption] = useState(false);
  const [sentQuoteMessage, setSentQuoteMessage] = useState("");
  // Campo trampa: los usuarios no lo ven; los bots que lo llenan se rechazan en el servidor.
  const [website, setWebsite] = useState("");

  const coverageTypeId = "cotizar-coverage-type";
  const selectedPlanFieldId = "cotizar-selected-plan";
  const contactChannelId = "cotizar-preferred-contact";
  const contactTimeId = "cotizar-preferred-contact-time";

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
    () =>
      PLAN_OPTIONS_BY_COVERAGE[formData.coverageType].map(
        (planId) => PLANS_CONFIG[planId],
      ),
    [formData.coverageType],
  );
  const selectedPlanConfig = PLANS_CONFIG[formData.selectedPlanId];

  const hasRequiredCount =
    formData.coverageType === "individual"
      ? true
      : Number(formData.beneficiaries) > 0;
  const isReady =
    formData.fullName.trim() &&
    formData.lastName.trim() &&
    formData.phone.trim() &&
    formData.city.trim() &&
    hasRequiredCount &&
    formData.preferredContactTime.trim();

  const quoteMessage = useMemo(() => {
    // Este bloque arma el mensaje final que viaja directo a WhatsApp.
    const countLine =
      formData.coverageType === "individual"
        ? "*Cobertura:* 1 persona"
        : `*${COVERAGE_COUNT_LABELS[formData.coverageType]}:* ${formData.beneficiaries || "Por definir"}`;

    return (
      `Hola, quiero cotizar un plan en Jardines del Renacer.\n\n` +
      `*Tipo de contratación:* ${COVERAGE_LABELS[formData.coverageType]}\n` +
      `*Plan deseado:* ${selectedPlanConfig.name} (${selectedPlanConfig.price})\n` +
      `${countLine}\n` +
      `*Nombre:* ${formData.fullName} ${formData.lastName}\n` +
      `*Teléfono:* ${formData.phone}\n` +
      `*Ciudad:* ${formData.city}\n` +
      `*Canal preferido:* ${formData.preferredContact}\n` +
      `*Hora preferida de contacto:* ${formData.preferredContactTime}`
    );
  }, [formData, selectedPlanConfig.name, selectedPlanConfig.price]);

  const handleSendWhatsApp = async () => {
    if (!isReady) {
      return;
    }
    setIsSubmitting(true);
    setSubmitFeedback("");
    try {
      const response = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nombre: formData.fullName,
          apellido: formData.lastName,
          telefono: formData.phone,
          ciudad: formData.city,
          planId: selectedPlanConfig.id,
          planNombre: selectedPlanConfig.name,
          cobertura: formData.coverageType,
          numBeneficiarios: Number(formData.beneficiaries) || 1,
          contactoPreferido: formData.preferredContact,
          horaContacto: formData.preferredContactTime,
          website,
        }),
      });
      if (!response.ok)
        throw new Error("No fue posible registrar tu solicitud.");
      setSubmitFeedback(
        "Tu solicitud fue registrada correctamente. Un asesor podrá atenderla desde nuestro centro de cotizaciones.",
      );
      setSentQuoteMessage(quoteMessage);
      setFormData({
        fullName: "",
        lastName: "",
        phone: "",
        city: "",
        beneficiaries: COVERAGE_DEFAULT_COUNTS[initialCoverage],
        coverageType: initialCoverage,
        selectedPlanId: initialPlanId,
        preferredContact: "WhatsApp",
        preferredContactTime: "",
      });
      setWebsite("");
      setShowWhatsAppOption(true);
    } catch (error) {
      setSubmitFeedback(
        error instanceof Error
          ? error.message
          : "No fue posible registrar tu solicitud. Intenta nuevamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-primary/20 bg-gradient-to-b from-white/80 to-primary/5 p-6 md:p-8 shadow-[0_20px_60px_-45px_rgba(13,56,138,0.55)]">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h4 className="text-2xl font-display text-text mb-1">
            Estructura de cotización
          </h4>
          <p className="text-sm text-textLight leading-relaxed">
            Completa estos datos para enviar una cotización más precisa por
            WhatsApp.
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${
            isReady
              ? "border-green-500/30 bg-green-500/10 text-green-700"
              : "border-primary/25 bg-primary/10 text-primary"
          }`}
        >
          {isReady
            ? "Formulario listo para enviar"
            : "Faltan datos obligatorios"}
        </span>
      </div>

      <div className="space-y-7">
        <div
          className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor="cotizar-website">Sitio web</label>
          <input
            id="cotizar-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
        <section>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Datos de contacto
            </h5>
            <p className="text-xs text-textLight">* Campos obligatorios</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombres *"
              value={formData.fullName}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  fullName: event.target.value.replace(/[^\p{L}\s]/gu, ""),
                }))
              }
              placeholder="Ej: Ana"
            />
            <Input
              label="Apellidos *"
              value={formData.lastName}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  lastName: event.target.value.replace(/[^\p{L}\s]/gu, ""),
                }))
              }
              placeholder="Ej: Pérez"
            />
            <Input
              label="Telefono *"
              value={formData.phone}
              inputMode="numeric"
              maxLength={15}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  phone: event.target.value.replace(/\D/g, ""),
                }))
              }
              placeholder="3001234567"
            />
            <Input
              label="Ciudad *"
              value={formData.city}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  city: event.target.value.replace(/[^\p{L}\s]/gu, ""),
                }))
              }
              placeholder="Ej: Pereira"
            />
          </div>
        </section>

        <section className="pt-6 border-t border-primary/10">
          <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary mb-4">
            Perfil de la cotización
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor={coverageTypeId}
                className="block text-sm font-medium text-text mb-2"
              >
                Tipo de contratación
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
                {(
                  Object.entries(COVERAGE_LABELS) as Array<
                    [CoverageType, string]
                  >
                ).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor={selectedPlanFieldId}
                className="block text-sm font-medium text-text mb-2"
              >
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

            {formData.coverageType !== "individual" && (
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

            <div className="md:max-w-xs">
              <label
                htmlFor={contactChannelId}
                className="block text-sm font-medium text-text mb-2"
              >
                Canal preferido
              </label>
              <select
                id={contactChannelId}
                value={formData.preferredContact}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    preferredContact: event.target
                      .value as FormState["preferredContact"],
                  }))
                }
                className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                <option value="WhatsApp">WhatsApp</option>
                <option value="Llamada">Llamada</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={contactTimeId}
                className="block text-sm font-medium text-text mb-2"
              >
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
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="12" cy="12" r="8" />
                    <path
                      d="M12 8v4l2.5 2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <p className="mt-2 text-xs text-textLight">
                Selecciona la hora en la que prefieres que te contacte un
                asesor.
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-7 rounded-2xl border border-primary/15 bg-white/60 px-4 py-3 md:px-5">
        <p className="text-xs uppercase tracking-[0.14em] text-primary mb-1">
          Resumen rápido
        </p>
        <p className="text-sm text-textLight leading-relaxed">
          Plan seleccionado: {selectedPlanConfig.name} (
          {selectedPlanConfig.price})
        </p>
      </div>

      {showWhatsAppOption &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cotizar-whatsapp-title"
          >
            <div className="w-full max-w-md rounded-3xl border border-white/80 bg-white p-7 text-center shadow-[0_28px_80px_-24px_rgba(15,23,42,.55)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl text-emerald-600">
                ✓
              </div>
              <h3
                id="cotizar-whatsapp-title"
                className="mt-4 text-xl font-bold text-text"
              >
                Solicitud registrada
              </h3>
              <p className="mt-2 text-sm leading-6 text-textLight">
                Tu información ya fue enviada a nuestro equipo. Si lo deseas,
                puedes continuar ahora mismo por WhatsApp.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  onClick={() => setShowWhatsAppOption(false)}
                  className="rounded-xl border border-primary/15 bg-white px-5 py-3 text-sm font-bold text-primary"
                >
                  Ahora no
                </button>
                <button
                  onClick={() => {
                    window.open(
                      buildWhatsAppUrl(sentQuoteMessage),
                      "_blank",
                      "noopener,noreferrer",
                    );
                    setShowWhatsAppOption(false);
                  }}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white"
                >
                  Continuar por WhatsApp
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      <div className="mt-6 pt-6 border-t border-primary/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-xs md:text-sm text-textLight">
          Al enviar, registraremos tu solicitud y podrás elegir si deseas
          continuar por WhatsApp.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="w-full md:w-auto md:min-w-[300px] justify-center"
          onClick={handleSendWhatsApp}
          disabled={!isReady || isSubmitting}
        >
          {isSubmitting
            ? "Registrando solicitud..."
            : "Enviar solicitud de cotización"}
        </Button>
      </div>
      {submitFeedback && (
        <p className="mt-4 text-sm font-medium text-primary" role="status">
          {submitFeedback}
        </p>
      )}
    </div>
  );
}
