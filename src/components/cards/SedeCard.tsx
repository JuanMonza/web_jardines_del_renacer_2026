import Image from 'next/image';
import type { Sede } from '@/data/sedes';
import { getCiudadImagePath } from '@/config/ciudades';

interface SedeCardProps {
  sede: Sede;
}

export default function SedeCard({ sede }: SedeCardProps) {
  const phoneDigits = sede.telefono.replace(/\s/g, '');
  const phoneHref = phoneDigits ? `tel:+57${phoneDigits}` : null;
  const cityImage = getCiudadImagePath(sede.departamento, sede.ciudad);

  const mapsQuery = encodeURIComponent(
    `${sede.direccion}, ${sede.ciudad}, ${sede.departamento}, Colombia`,
  );
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const wazeUrl = `https://waze.com/ul?q=${mapsQuery}`;

  return (
    <article className="rounded-2xl overflow-hidden glass shadow-glass-lg hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group">

      {/* ── Zona superior con imagen de ciudad ─────────────── */}
      <div className="relative h-[280px] bg-gradient-to-br from-primary/20 via-primary/10 to-[#e8edf5] overflow-hidden">
        {/* Imagen de fondo de la ciudad */}
        {cityImage && (
          <Image
            src={cityImage}
            alt={`${sede.ciudad}, ${sede.departamento}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent" />

        {/* Barra de acento */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {/* Logo badge top-right */}
        <div className="absolute top-4 right-3 z-10">
          <div className="w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center border border-white/20 overflow-hidden">
            <Image
              src="/logo-oficial.webp"
              alt="JR"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        </div>

        {/* City label top-left */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-primary/90 backdrop-blur-sm px-4 py-2.5 rounded-full border border-primary/30 shadow-lg">
            <span className="text-white text-sm font-bold uppercase tracking-wider drop-shadow">
              {sede.ciudad}
            </span>
          </div>
        </div>
      </div>

      {/* ── Panel de info con borde curvo ─────────────── */}
      <div className="relative -mt-6 bg-white rounded-t-[28px] px-5 pt-5 pb-5 border-t border-primary/10">

        {/* Info rows */}
        <div className="space-y-3 mb-5">
          {/* Nombre sede */}
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
              <svg width="14" height="14" fill="none" stroke="#3C60A2" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
            <span className="text-text font-semibold text-sm leading-tight">
              Sede {sede.nombre}
            </span>
          </div>

          {/* Atención 24h */}
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
              <svg width="14" height="14" fill="none" stroke="#3C60A2" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
            </span>
            <span className="text-textLight text-sm">24 Horas</span>
          </div>
        </div>

        {/* Dirección */}
        <div className="flex items-start gap-3 mb-5">
          <span className="shrink-0 w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center mt-0.5">
            <svg width="14" height="14" fill="none" stroke="#3C60A2" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <p className="text-textLight text-xs leading-snug flex-1">
            {sede.direccion}
          </p>
        </div>

        {/* ── Botones de acción ────────────────────────── */}
        <div className="space-y-2">
          {/* Llamar */}
          {phoneHref ? (
            <a
              href={phoneHref}
              className="inline-flex items-center gap-2 w-full justify-center bg-primary hover:bg-[#2f4d82] text-white rounded-xl px-4 py-2.5 text-sm font-semibold active:scale-95 transition-all duration-200"
              aria-label={`Llamar a sede ${sede.nombre}`}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
              </svg>
              {sede.telefono}
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 w-full justify-center rounded-xl px-4 py-2.5 text-xs bg-primary/5 text-textLight cursor-default select-none border border-primary/10">
              Sin teléfono registrado
            </span>
          )}

          {/* Maps / Waze */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold bg-primary/8 hover:bg-primary/15 text-text hover:text-primary border border-primary/15 transition-all duration-200"
              aria-label={`Google Maps — ${sede.nombre}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335" />
                <circle cx="12" cy="9" r="2.5" fill="white" />
              </svg>
              Google Maps
            </a>
            <a
              href={wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold bg-primary/8 hover:bg-primary/15 text-text hover:text-primary border border-primary/15 transition-all duration-200"
              aria-label={`Waze — ${sede.nombre}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <ellipse cx="12" cy="13" rx="9" ry="8" fill="#33CCFF" />
                <circle cx="9" cy="12" r="1.5" fill="#1a1a1a" />
                <circle cx="15" cy="12" r="1.5" fill="#1a1a1a" />
                <path d="M9 15.5c1 1 5 1 6 0" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Waze
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
