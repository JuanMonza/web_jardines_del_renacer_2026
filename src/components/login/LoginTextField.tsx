'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';

interface LoginTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export default function LoginTextField({
  label,
  icon,
  className = '',
  ...props
}: LoginTextFieldProps) {
  return (
    <label className="block">
      <span className="text-sm md:text-base font-medium text-black/80">{label}</span>
      <div className="mt-2 relative">
        <input
          className={`w-full bg-transparent border-0 border-b-2 border-black/45 pb-2.5 pr-10 text-black placeholder:text-black/45 focus:outline-none focus:border-[#2f5bd6] transition-colors ${className}`}
          {...props}
        />
        {icon && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-black/55">
            {icon}
          </span>
        )}
      </div>
    </label>
  );
}
