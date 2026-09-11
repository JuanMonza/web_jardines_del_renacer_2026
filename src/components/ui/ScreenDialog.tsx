"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function ScreenDialog({ children, onClose, ariaLabel = "Ventana de información" }: { children: ReactNode; onClose: () => void; ariaLabel?: string }) {
  const [ready, setReady] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    const rootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    setReady(true);
    return () => {
      document.body.style.overflow = overflow;
      document.documentElement.style.overflow = rootOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const elements = () => Array.from(container.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex="0"]') ?? []).filter(el => !el.hasAttribute("disabled"));
    elements()[0]?.focus({ preventScroll: true });
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab") return;
      const list = elements(), first = list[0], last = list[list.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [ready]);
  if (!ready) return null;
  return createPortal(
    <div ref={container} role="dialog" aria-modal="true" aria-label={ariaLabel} onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 2147483647, margin: 0, background: "rgba(9, 22, 40, .90)", backdropFilter: "blur(12px)" }}
      className="flex items-center justify-center overflow-hidden p-3 sm:p-6">
      {children}
    </div>, document.body);
}
