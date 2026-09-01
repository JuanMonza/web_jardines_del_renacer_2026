'use client';

import { ArrowUpRight, ChevronDown, Mail, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const recipient = 'lineaetica@jardinesdelrenacer.co';
const subject = 'Reporte Línea Ética';
const body = 'Deseo reportar una situación para conocimiento de la Línea Ética de Jardines del Renacer.';

const emailOptions = [
  { name: 'Gmail', description: 'Abrir redacción en Gmail', icon: 'https://img.icons8.com/color/96/gmail-new.png', href: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` },
  { name: 'Outlook', description: 'Abrir redacción en Outlook', icon: 'https://img.icons8.com/color/96/microsoft-outlook-2019.png', href: `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` },
  { name: 'Yahoo Mail', description: 'Abrir redacción en Yahoo', icon: 'https://img.icons8.com/color/96/yahoo.png', href: `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipient)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` },
  { name: 'Aplicación predeterminada', description: 'Usar el correo configurado en este dispositivo', href: `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` },
];

export default function EthicsReportButton() {
  const [selection, setSelection] = useState<'email' | 'anonymous' | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-5">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-primary px-5 py-3.5 text-left text-sm font-bold text-white shadow-[0_12px_28px_-18px_rgba(22,58,104,0.8)] transition hover:bg-primary-hover"
        >
          <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" aria-hidden />¿Cómo deseas enviar tu reporte?</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-primary/15 bg-white p-2 shadow-[0_18px_40px_rgba(22,58,104,0.18)]">
            <button type="button" onClick={() => { setSelection('email'); setIsOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary/[0.06]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Mail className="h-5 w-5" aria-hidden /></span>
              <span><strong className="block text-sm text-text">Enviar con mi correo</strong><span className="mt-0.5 block text-xs text-textLight">Confidencial; tu dirección será visible para Línea Ética.</span></span>
            </button>
            <button type="button" onClick={() => { setSelection('anonymous'); setIsOpen(false); }} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-primary/[0.06]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" aria-hidden /></span>
              <span><strong className="block text-sm text-text">Reporte anónimo</strong><span className="mt-0.5 block text-xs text-textLight">No utilizará tu correo ni solicitará datos personales.</span></span>
            </button>
          </motion.div>
        )}
      </div>

      {selection === 'email' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4"><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10"><Mail className="h-3.5 w-3.5" aria-hidden /></span>Elige tu proveedor de correo</div><div className="grid gap-3 sm:grid-cols-2">{emailOptions.map((option, index) => <motion.a key={option.name} href={option.href} target={option.href.startsWith('mailto:') ? undefined : '_blank'} rel={option.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: index * 0.06 }} whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.98 }} className="group flex min-h-[92px] items-center gap-3 rounded-2xl border border-primary/15 bg-white/80 p-3 shadow-[0_10px_25px_-22px_rgba(22,58,104,0.8)] transition-colors hover:border-primary/40 hover:bg-[#f4f8fd] hover:shadow-[0_18px_34px_-22px_rgba(22,58,104,0.7)]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 p-1.5 text-primary transition-transform duration-300 group-hover:scale-110">{option.icon ? <img src={option.icon} alt={`Logo de ${option.name}`} className="h-full w-full object-contain" /> : <Mail className="h-5 w-5" aria-hidden />}</span><span className="min-w-0 flex-1 text-left"><strong className="block text-sm text-text">{option.name}</strong><span className="mt-1 block text-xs leading-4 text-textLight">{option.description}</span></span><ArrowUpRight className="h-4 w-4 shrink-0 text-primary/55 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" aria-hidden /></motion.a>)}</div></motion.div>}

      {selection === 'anonymous' && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-amber-300/60 bg-amber-50/70 p-4"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700"><ShieldCheck className="h-5 w-5" aria-hidden /></span><div><p className="font-bold text-amber-900">Canal anónimo en activación</p><p className="mt-1 text-sm leading-6 text-amber-800">Para proteger tu anonimato, este canal no enviará correos ni pedirá datos personales. Requiere la configuración de un formulario seguro antes de recibir reportes.</p></div></div></motion.div>}
    </div>
  );
}
