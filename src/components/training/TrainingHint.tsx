"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CircleHelp } from "lucide-react";
import { usePathname } from "next/navigation";

type TrainingHintProps = {
  text: string;
  children: ReactNode;
  className?: string;
};

export default function TrainingHint({ text, children, className = "" }: TrainingHintProps) {
  const enabled = process.env.NEXT_PUBLIC_APP_ENV === "training";
  const id = useId();
  const pathname = usePathname();
  const targetRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const dismiss = () => setOpen(false);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    const onPointerDown = (event: PointerEvent) => { if (!targetRef.current?.contains(event.target as Node)) dismiss(); };
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (!enabled) return <>{children}</>;

  const show = () => {
    const rect = helpRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(320, window.innerWidth - 32);
    const below = window.innerHeight - rect.bottom > 160;
    setPosition({
      top: below ? rect.bottom + 8 : Math.max(12, rect.top - 120),
      left: Math.max(16, Math.min(rect.left, window.innerWidth - width - 16)),
    });
    setOpen(true);
  };

  return <div
    ref={targetRef}
    className={`relative ${className}`}
  >
    {children}
    <button type="button" ref={helpRef} aria-label={`Ayuda: ${text}`} aria-describedby={open ? id : undefined} onMouseEnter={show} onMouseLeave={() => setOpen(false)} onFocus={show} onBlur={() => setOpen(false)} onClick={(event) => { event.preventDefault(); event.stopPropagation(); show(); }} className="absolute -right-1 -top-1 z-10 grid h-6 w-6 place-items-center rounded-full border border-[#1ce46a] bg-[#70ff9c] text-[#064522] shadow-[0_0_14px_rgba(41,255,111,.55)] hover:bg-[#97ffb5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b8d42]" title="Ver ayuda"><CircleHelp className="h-4 w-4" /></button>
    {open && createPortal(<div id={id} role="tooltip" style={position} className="pointer-events-none fixed z-[2147483647] w-[min(20rem,calc(100vw-2rem))] rounded-xl border-2 border-[#4dfb85] bg-[#f2fff5] px-4 py-3 text-sm font-semibold leading-5 text-[#124b2a] shadow-[0_0_22px_rgba(54,255,123,.45),0_12px_35px_rgba(3,48,24,.25)]">{text}</div>, document.body)}
  </div>;
}
