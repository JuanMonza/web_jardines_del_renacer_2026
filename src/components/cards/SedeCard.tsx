import type { Sede } from '@/data/sedes';

interface SedeCardProps {
  sede: Sede;
}

export default function SedeCard({ sede }: SedeCardProps) {
  const phoneDigits = sede.telefono.replace(/\s/g, '');
  const phoneHref = phoneDigits ? `tel:+57${phoneDigits}` : null;

  return (
    <article className="glass rounded-2xl p-6 flex flex-col gap-5 hover:shadow-glass-lg hover:-translate-y-1 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-text text-lg leading-tight group-hover:text-primary transition-colors duration-200 truncate">
            {sede.nombre}
          </h3>
          <span className="text-sm text-textLight mt-0.5 inline-flex items-center gap-1">
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4l3 3" />
            </svg>
            {sede.ciudad}
          </span>
        </div>

        {/* Location icon badge */}
        <span
          aria-hidden="true"
          className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 14 6 14s6-8.75 6-14c0-3.314-2.686-6-6-6z"
            />
            <circle cx="12" cy="8" r="2" />
          </svg>
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-3 text-sm text-textLight flex-1">
        {/* Address */}
        <div className="flex items-start gap-2.5">
          <svg
            className="shrink-0 mt-0.5 text-primary/60"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="leading-snug">{sede.direccion}</span>
        </div>

        {/* Administrator (only shown when present) */}
        {sede.administradora && (
          <div className="flex items-center gap-2.5">
            <svg
              className="shrink-0 text-primary/60"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>{sede.administradora}</span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="pt-4 border-t border-primary/10">
        {phoneHref ? (
          <a
            href={phoneHref}
            className="inline-flex items-center gap-2 w-full justify-center bg-primary text-white rounded-xl px-4 py-3 text-sm font-medium hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label={`Llamar a sede ${sede.nombre}: ${sede.telefono}`}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z"
              />
            </svg>
            {sede.telefono}
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 w-full justify-center rounded-xl px-4 py-3 text-sm bg-gray-100 text-gray-400 cursor-default select-none">
            Sin teléfono registrado
          </span>
        )}
      </div>
    </article>
  );
}
