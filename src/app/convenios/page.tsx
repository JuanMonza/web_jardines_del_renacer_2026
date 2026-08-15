'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

type Agreement = {
  id: string;
  name: string;
  channel: 'online' | 'in-person';
  logo?: string;
  mark?: string;
  description: string;
  referenceLabel: string;
  referenceValue: string;
  onlineUrl?: string;
};

const agreements: Agreement[] = [
  { id: 'apostar', name: 'Apostar', channel: 'in-person', logo: '/images/flayers/logos-convenios/02_apostar_sin_fondo.png', description: 'En Apostar indica al asesor el nombre del convenio para registrar el recaudo de tu plan.', referenceLabel: 'Nombre del convenio', referenceValue: 'Renacer' },
  { id: 'consuerte', name: 'Consuerte', channel: 'in-person', logo: '/images/flayers/logos-convenios/03_con_suerte_sin_fondo.png', description: 'En Consuerte solicita el recaudo de tu plan con el nombre de convenio indicado.', referenceLabel: 'Nombre del convenio', referenceValue: 'Jardines del Renacer' },
  { id: 'facilisimo', name: 'Facilisimo', channel: 'in-person', logo: '/images/flayers/logos-convenios/04_facilisimo_sin_fondo.png', description: 'En Facilisimo brinda el nombre del convenio para realizar el pago de tu plan.', referenceLabel: 'Nombre del convenio', referenceValue: 'Jardines del Renacer' },
  { id: 'gana', name: 'Gana', channel: 'in-person', logo: '/images/flayers/logos-convenios/05_gana_sin_fondo.png', description: 'En Gana solicita el pago de tu plan indicando el nombre de convenio correcto.', referenceLabel: 'Nombre del convenio', referenceValue: 'Jardines del Renacer' },
  { id: 'ganagana', name: 'GanaGana', channel: 'in-person', logo: '/images/flayers/logos-convenios/06_gana_gana_su_red_sin_fondo.png', description: 'En GanaGana o Su Red brinda el número de convenio para el recaudo de tu plan.', referenceLabel: 'Número de convenio', referenceValue: '18145' },
  { id: 'la-perla', name: 'La Perla', channel: 'in-person', logo: '/images/flayers/logos-convenios/07_la_perla_sin_fondo.png', description: 'En La Perla realiza el pago indicando el nombre del convenio Jardines del Renacer.', referenceLabel: 'Nombre del convenio', referenceValue: 'Jardines del Renacer' },
  { id: 'pagatodo', name: 'PagaTodo', channel: 'in-person', logo: '/images/flayers/logos-convenios/08_paga_todo_sin_fondo.png', description: 'En PagaTodo solicita el recaudo utilizando el nombre del convenio Jardines del Renacer.', referenceLabel: 'Nombre del convenio', referenceValue: 'Jardines del Renacer' },
  { id: 'su-chance', name: 'Su Chance', channel: 'in-person', logo: '/images/flayers/logos-convenios/09_su_chance_sin_fondo.png', description: 'En Su Chance brinda el número de convenio para pagar tu plan.', referenceLabel: 'Número de convenio', referenceValue: '3432' },
  { id: 'su-suerte', name: 'SuSuerte', channel: 'in-person', logo: '/images/flayers/logos-convenios/10_susuerte_sin_fondo.png', description: 'En SuSuerte solicita el pago indicando el nombre de convenio Jardines del Renacer.', referenceLabel: 'Nombre del convenio', referenceValue: 'Jardines del Renacer' },
  { id: 'breb', name: 'Bre-B', channel: 'online', logo: '/images/flayers/logos-convenios/01_bre_b_sin_fondo.png', description: 'Paga por Bre-B usando la llave oficial de Jardines del Renacer.', referenceLabel: 'Llave Bre-B', referenceValue: '@9003407247' },
  { id: 'wompi', name: 'Wompi', channel: 'online', logo: '/images/flayers/logos-convenios/15_wompi_sin_fondo.png', description: 'Realiza tu pago en línea de forma segura a través del checkout oficial de Wompi.', referenceLabel: 'Canal de pago', referenceValue: 'Checkout en línea Jardines del Renacer', onlineUrl: 'https://checkout.wompi.co/l/VPOS_BZBTG1' },
  { id: 'cuenta', name: 'Cuenta corriente', channel: 'online', logo: '/images/flayers/logos-convenios/11_davivienda_sin_fondo.png', description: 'Realiza una transferencia o consignación a la cuenta corriente de Jardines del Renacer.', referenceLabel: 'Número de cuenta', referenceValue: '127-669-999-972' },
  { id: 'nequi', name: 'Nequi', channel: 'online', logo: '/images/flayers/logos-convenios/13_nequi_sin_fondo.png', description: 'Realiza el pago a la cuenta Nequi registrada a nombre de Adriana Ospina Ocampo.', referenceLabel: 'Cuenta Nequi', referenceValue: '3232516832' },
  { id: 'efecty', name: 'Efecty', channel: 'in-person', logo: '/images/flayers/logos-convenios/12_efecty_sin_fondo.png', description: 'En Efecty brinda el número de convenio para realizar el pago de tu plan.', referenceLabel: 'Número de convenio', referenceValue: '111489' },
  { id: 'supergiros', name: 'SuperGIROS', channel: 'in-person', logo: '/images/flayers/logos-convenios/14_supergiros_sin_fondo.png', description: 'En SuperGIROS solicita el recaudo de tu plan indicando el nombre del convenio.', referenceLabel: 'Nombre del convenio', referenceValue: 'Jardines del Renacer' },
];

export default function ConveniosPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedReference, setCopiedReference] = useState<string | null>(null);
  const selected = agreements.find((agreement) => agreement.id === selectedId) ?? null;
  const onlineAgreements = agreements.filter((agreement) => agreement.channel === 'online');
  const inPersonAgreements = agreements.filter((agreement) => agreement.channel === 'in-person');

  const copyReference = async (agreement: Agreement) => {
    try {
      await navigator.clipboard.writeText(agreement.referenceValue);
    } catch {
      const input = document.createElement('textarea');
      input.value = agreement.referenceValue;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

    setCopiedReference(agreement.id);
    window.setTimeout(() => setCopiedReference((current) => current === agreement.id ? null : current), 1800);
  };

  const renderAgreementTile = (agreement: Agreement) => {
    const isSelected = agreement.id === selectedId;

    return (
      <button
        key={agreement.id}
        type="button"
        onClick={() => setSelectedId(agreement.id)}
        aria-pressed={isSelected}
        aria-label={`Consultar convenio ${agreement.name}`}
        className={`group relative min-h-28 rounded-2xl border p-3 text-left transition-all duration-300 ${
          isSelected
            ? 'border-primary bg-primary/10 shadow-[0_14px_28px_rgba(47,95,169,0.18)] ring-2 ring-primary/25'
            : agreement.id === 'wompi'
              ? 'border-[#12835a]/35 bg-[linear-gradient(145deg,rgba(246,255,251,0.96),rgba(229,248,239,0.8))] shadow-[0_10px_24px_rgba(18,131,90,0.12)] ring-1 ring-[#12835a]/15 hover:-translate-y-1 hover:border-[#12835a]/55 hover:shadow-lg'
              : 'border-primary/10 bg-white/75 hover:-translate-y-1 hover:border-primary/35 hover:bg-white hover:shadow-lg'
        }`}
      >
        {agreement.id === 'wompi' && (
          <span className="absolute -right-1.5 -top-2 rounded-full border border-white/70 bg-[#12835a] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white shadow-md">Recomendado</span>
        )}
        <span className="flex h-14 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
          <Image src={agreement.logo!} alt={`Convenio ${agreement.name}`} width={150} height={72} className="h-full w-full object-contain" />
        </span>
        <span className={`mx-auto mt-3 flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold leading-4 shadow-sm backdrop-blur-md transition-all duration-300 ${
          isSelected
            ? 'border-primary/35 bg-primary/10 text-primary shadow-[0_6px_16px_rgba(47,95,169,0.16)]'
            : 'border-white/80 bg-white/65 text-textLight group-hover:border-primary/20 group-hover:bg-primary/5 group-hover:text-primary'
        }`}>
          <span className={`relative flex h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-primary' : 'bg-primary/45 group-hover:bg-primary'}`} aria-hidden="true">
            {isSelected && <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />}
          </span>
          {isSelected ? 'Seleccionado' : 'Ver información'}
        </span>
      </button>
    );
  };

  return (
    <main className="relative overflow-hidden bg-[#f8fafc] pb-20 pt-28 text-text">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(47,95,169,0.23),transparent_70%)]" />
      <div className="pointer-events-none absolute -right-28 top-36 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-[#8fc0e5]/20 blur-3xl" />

      <section className="relative mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/55 px-6 py-10 shadow-[0_24px_80px_rgba(34,65,105,0.12)] backdrop-blur-xl sm:px-10 lg:px-12">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary">Opciones de recaudo</p>
              <h1 className="text-4xl font-extrabold leading-[1.05] text-[#173861] sm:text-5xl">Convenios de pago</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-textLight sm:text-lg">
                Elige entre pago en línea o pago presencial. Selecciona un logo para consultar el dato de recaudo y cómo usarlo.
              </p>
            </div>
            <div className="flex w-fit flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-2xl border border-[#12835a]/20 bg-[#f2fbf6]/80 px-4 py-3 text-sm font-bold text-[#176243] shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true"><path d="M12 3 4.5 6v5c0 4.7 3.2 8.8 7.5 10 4.3-1.2 7.5-5.3 7.5-10V6L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>
                Canales oficiales de pago
              </span>
              <span className="inline-flex items-center gap-3 rounded-2xl border border-primary/15 bg-white/70 px-4 py-3 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">{agreements.length}</span>
                <span className="text-sm font-semibold leading-tight text-[#173861]">Opciones de pago<br />disponibles</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)]">
          <section className="rounded-[2rem] border border-white/70 bg-white/55 p-5 shadow-[0_20px_70px_rgba(34,65,105,0.1)] backdrop-blur-xl sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-[#173861]">Elige cómo prefieres pagar</p>
                <p className="text-sm text-textLight">Los canales se muestran separados para que elijas el adecuado.</p>
              </div>
              <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">{onlineAgreements.length} en línea · {inPersonAgreements.length} presenciales</span>
            </div>
            <div className="rounded-2xl border border-[#3f70bc]/20 bg-[linear-gradient(135deg,rgba(224,237,255,0.8),rgba(255,255,255,0.88))] p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-extrabold text-[#173861]">Paga en línea</p>
                  <p className="text-xs text-textLight">Desde tu celular o computador.</p>
                </div>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">{onlineAgreements.length} opciones</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {onlineAgreements.map(renderAgreementTile)}
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-primary/10 bg-white/65 p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-extrabold text-[#173861]">Paga presencialmente</p>
                  <p className="text-xs text-textLight">Acércate a un punto autorizado con el dato del convenio.</p>
                </div>
                <span className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">{inPersonAgreements.length} puntos de recaudo</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {inPersonAgreements.map(renderAgreementTile)}
              </div>
            </div>
          </section>

          <aside className="hidden min-h-[420px] rounded-[2rem] border border-primary/15 bg-[linear-gradient(145deg,rgba(255,255,255,0.88),rgba(230,240,250,0.72))] p-5 shadow-[0_20px_70px_rgba(34,65,105,0.12)] backdrop-blur-xl lg:block sm:p-7">
            {selected ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Convenio seleccionado</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-white p-3 shadow-sm">
                    {selected.logo ? (
                      <Image src={selected.logo} alt={`Logo ${selected.name}`} width={100} height={80} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-center text-base font-extrabold text-primary">{selected.mark}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-[#173861]">{selected.name}</h2>
                    <p className="mt-1 text-sm font-medium text-primary">{selected.channel === 'online' ? 'Pago en línea' : 'Pago presencial'} · Jardines del Renacer</p>
                  </div>
                </div>
                <p className="mt-6 text-sm leading-6 text-textLight">{selected.description}</p>
                <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{selected.referenceLabel}</p>
                      <p className="mt-1 break-words text-lg font-extrabold tracking-tight text-[#173861]">{selected.referenceValue}</p>
                    </div>
                    <button type="button" onClick={() => copyReference(selected)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-white/85 px-2.5 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white" aria-label={`Copiar ${selected.referenceLabel}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></svg>
                      {copiedReference === selected.id ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-primary/10 bg-white/70 p-4">
                  <p className="text-sm font-bold text-[#173861]">Cómo usar este convenio</p>
                  <ol className="mt-3 space-y-3 text-sm leading-5 text-textLight">
                    <li className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">1</span>{selected.channel === 'online' ? 'Ingresa al canal digital o a la aplicación correspondiente.' : 'Acércate a un punto autorizado.'}</li>
                    <li className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">2</span>Presenta tu documento y proporciona el dato de recaudo indicado arriba.</li>
                    <li className="flex gap-3"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">3</span>Guarda el comprobante para cualquier validación.</li>
                  </ol>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {selected.onlineUrl ? (
                    <a href={selected.onlineUrl} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-primary/90">Ir a pagar con Wompi</a>
                  ) : (
                    <a href={`https://wa.me/573113906052?text=${encodeURIComponent(`Hola, necesito orientación para pagar por ${selected.name}.`)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-primary/90">Solicitar orientación</a>
                  )}
                  <Link href="/contacto" className="rounded-xl border border-primary/25 bg-white/70 px-4 py-3 text-center text-sm font-bold text-primary transition hover:bg-primary/10">Ver canales de contacto</Link>
                </div>
                <div className="mt-5 rounded-2xl border border-[#12835a]/20 bg-[#eaf8f1]/75 p-4">
                  <p className="text-sm font-extrabold text-[#176243]">¿Ya realizaste el pago?</p>
                  <p className="mt-1 text-sm leading-5 text-[#356b55]">Envía el comprobante, tu cédula y el nombre del titular para validar el pago.</p>
                  <a href={`https://wa.me/573113906052?text=${encodeURIComponent(`Hola, adjunto mi comprobante de pago por ${selected.name}. Mi cédula y nombre del titular son:`)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-[#12835a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f6e4c]">Enviar comprobante por WhatsApp</a>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center px-5 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/15 bg-white/70 text-primary shadow-sm">
                  <img width="94" height="94" src="https://img.icons8.com/3d-fluency/94/receive-cash.png" alt="" className="h-14 w-14 object-contain" />
                </span>
                <h2 className="mt-6 text-2xl font-extrabold text-[#173861]">Consulta tu convenio</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-textLight">Selecciona uno de los logos para conocer la guía de recaudo y las acciones disponibles.</p>
              </div>
            )}
          </aside>
        </div>

        {selected && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10284a]/55 p-4 backdrop-blur-md lg:hidden" role="dialog" aria-modal="true" aria-labelledby="convenio-modal-title" onClick={() => setSelectedId(null)}>
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md animate-in fade-in zoom-in-95 slide-in-from-bottom-4 overflow-y-auto rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(229,240,252,0.94))] p-5 shadow-[0_28px_80px_rgba(11,35,69,0.38)] duration-300 sm:p-7" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <p className="pt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{selected.channel === 'online' ? 'Pago en línea' : 'Pago presencial'}</p>
                <button type="button" onClick={() => setSelectedId(null)} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-primary/15 bg-white px-3 text-sm font-bold text-primary transition hover:bg-primary/10" aria-label="Cerrar detalle del convenio">Cerrar <span className="text-lg font-medium leading-none" aria-hidden="true">×</span></button>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/15 bg-white p-3 shadow-sm">
                  <Image src={selected.logo!} alt={`Logo ${selected.name}`} width={100} height={80} className="h-full w-full object-contain" />
                </div>
                <div>
                  <h2 id="convenio-modal-title" className="text-2xl font-extrabold text-[#173861]">{selected.name}</h2>
                  <p className="mt-1 text-sm leading-5 text-textLight">{selected.description}</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{selected.referenceLabel}</p>
                    <p className="mt-1 break-words text-lg font-extrabold tracking-tight text-[#173861]">{selected.referenceValue}</p>
                  </div>
                  <button type="button" onClick={() => copyReference(selected)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-primary/20 bg-white/85 px-2.5 py-2 text-xs font-bold text-primary transition hover:bg-primary hover:text-white" aria-label={`Copiar ${selected.referenceLabel}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></svg>
                    {copiedReference === selected.id ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>
              <p className="mt-4 rounded-2xl border border-primary/10 bg-white/70 px-4 py-3 text-sm leading-6 text-textLight">{selected.channel === 'online' ? 'Completa el pago desde el canal seleccionado y conserva el comprobante.' : 'Acércate a un punto autorizado, presenta tu documento y proporciona el dato de recaudo.'}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {selected.onlineUrl ? (
                  <a href={selected.onlineUrl} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-primary/90">Ir a pagar con Wompi</a>
                ) : (
                  <a href={`https://wa.me/573113906052?text=${encodeURIComponent(`Hola, necesito orientación para pagar por ${selected.name}.`)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-primary/90">Solicitar orientación</a>
                )}
                <button type="button" onClick={() => setSelectedId(null)} className="rounded-xl border border-primary/25 bg-white/80 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary/10">Elegir otro convenio</button>
              </div>
              <div className="mt-4 rounded-2xl border border-[#12835a]/20 bg-[#eaf8f1]/75 p-4">
                <p className="text-sm font-extrabold text-[#176243]">Al finalizar, envía tu comprobante</p>
                <p className="mt-1 text-sm leading-5 text-[#356b55]">Incluye tu cédula y el nombre del titular del plan.</p>
                <a href={`https://wa.me/573113906052?text=${encodeURIComponent(`Hola, adjunto mi comprobante de pago por ${selected.name}. Mi cédula y nombre del titular son:`)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-[#12835a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f6e4c]">Enviar comprobante por WhatsApp</a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-4 rounded-[1.6rem] border border-primary/15 bg-[#173861] px-6 py-5 text-white shadow-[0_16px_50px_rgba(23,56,97,0.2)] sm:flex-row sm:items-center sm:px-8">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-2xl">✓</span>
          <p className="text-sm leading-6 text-white/90 sm:text-base"><strong className="font-extrabold text-white">Después de pagar:</strong> envía el comprobante junto con el número de cédula y nombre completo del contratante del plan al WhatsApp <a href="https://wa.me/573113906052" target="_blank" rel="noreferrer" className="font-extrabold text-[#f5cf6e] underline decoration-[#f5cf6e]/50 underline-offset-4">3113906052</a>.</p>
        </div>
      </section>
    </main>
  );
}
