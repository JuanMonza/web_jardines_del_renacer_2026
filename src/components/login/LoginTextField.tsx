'use client';

import { useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

interface LoginTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  allowPasswordToggle?: boolean;
}

export default function LoginTextField({
  label,
  icon,
  type,
  allowPasswordToggle = true,
  className = '',
  ...props
}: LoginTextFieldProps) {
  const isPasswordField = type === 'password';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const resolvedType = isPasswordField && allowPasswordToggle
    ? (isPasswordVisible ? 'text' : 'password')
    : type;
  const iconRightClass = isPasswordField && allowPasswordToggle ? 'right-10' : 'right-1';
  const rightPaddingClass = isPasswordField && allowPasswordToggle
    ? (icon ? 'pr-20' : 'pr-12')
    : icon
      ? 'pr-10'
      : 'pr-2';

  return (
    <label className="block">
      <span className="text-sm font-medium text-white/85">{label}</span>
      <div className="mt-2 relative">
        <input
          type={resolvedType}
          className={`w-full rounded-xl border border-white/20 bg-white/[0.07] px-3 py-3 text-white placeholder:text-white/45 shadow-inner shadow-black/10 outline-none transition-colors focus:border-[#b7d5f4] focus:bg-white/[0.12] ${rightPaddingClass} ${className}`}
          {...props}
        />
        {icon && (
          <span className={`absolute ${iconRightClass} top-1/2 -translate-y-1/2 text-white/55`}>
            {icon}
          </span>
        )}
        {isPasswordField && allowPasswordToggle && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
            aria-label={isPasswordVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          >
            {isPasswordVisible ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M10.58 10.58A3 3 0 0014 13.42M9.88 5.09A9.953 9.953 0 0112 5c5 0 9.27 3.11 11 7.5a11.82 11.82 0 01-2.41 3.78M6.1 6.1C3.88 7.58 2.15 9.85 1 12.5A11.76 11.76 0 006.64 18m2.19 1.02A9.9 9.9 0 0012 20c1.83 0 3.55-.5 5.02-1.38" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
              </svg>
            )}
          </button>
        )}
      </div>
    </label>
  );
}
