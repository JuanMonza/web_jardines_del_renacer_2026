'use client';

import { createPortal } from 'react-dom';

type DialogVariant = 'danger' | 'error' | 'success' | 'info';
type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  variant?: DialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
};

const variantStyles: Record<DialogVariant, { icon: string; iconClass: string; buttonClass: string }> = {
  danger: { icon: '!', iconClass: 'bg-red-500/10 text-red-600', buttonClass: 'bg-[#bd3348] hover:bg-[#a92a3e] shadow-red-900/15' },
  error: { icon: '!', iconClass: 'bg-red-500/10 text-red-600', buttonClass: 'bg-[#bd3348] hover:bg-[#a92a3e] shadow-red-900/15' },
  success: { icon: '✓', iconClass: 'bg-emerald-500/10 text-emerald-700', buttonClass: 'bg-[#19704b] hover:bg-[#125c3d] shadow-emerald-900/15' },
  info: { icon: 'i', iconClass: 'bg-[#315d98]/10 text-[#315d98]', buttonClass: 'bg-[#244f8a] hover:bg-[#193f73] shadow-blue-900/15' },
};

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', showCancel = true, variant = 'danger', onConfirm, onCancel }: Props) {
  if (!open) return null;
  const style = variantStyles[variant];
  return createPortal(<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#07182e]/55 p-4 backdrop-blur-sm" style={{ zIndex: 2147483647 }} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
    <section className="w-full max-w-md rounded-[26px] border border-white/70 bg-[#f8fbff]/95 p-6 shadow-[0_28px_90px_rgba(4,22,52,0.42)]">
      <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl text-xl font-bold ${style.iconClass}`}>{style.icon}</div>
      <h2 id="confirm-dialog-title" className="text-xl font-bold text-[#173861]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#58718f]">{description}</p>
      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {showCancel && <button type="button" onClick={onCancel} className="rounded-xl border border-[#b4c7df] bg-white px-5 py-3 text-sm font-bold text-[#345477] transition hover:bg-[#eef5fc]">{cancelLabel}</button>}
        <button type="button" onClick={onConfirm} className={`rounded-xl px-5 py-3 text-sm font-bold text-white shadow-lg transition ${style.buttonClass}`}>{confirmLabel}</button>
      </div>
    </section>
  </div>, document.body);
}
