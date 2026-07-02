import { cn } from '@/lib/utils';

interface CountdownUnitProps {
  value: number;
  label: string;
  className?: string;
}

export default function CountdownUnit({ value, label, className }: CountdownUnitProps) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2 text-center", className)}>
      <span className="text-3xl font-black leading-none text-primary sm:text-4xl">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-textLight">
        {label}
      </span>
    </div>
  );
}