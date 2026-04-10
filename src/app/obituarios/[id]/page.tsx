'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import Image from 'next/image';
import Link from 'next/link';
import { buildObituaryMapQuery, getObituaryById } from '@/data/obituaries';

const OBITUARIO_BACKGROUND_IMAGE = '/images/white-tulips-sunlight.jpg';

type SharePlatform = 'facebook' | 'x' | 'whatsapp' | 'telegram' | 'copiar';

const serviciosIconos: Record<string, string> = {
  Cafeteria: '☕',
  Floreria: '💐',
  Crematorio: '⚱️',
  Estacionamiento: '🅿️',
  Wifi: '📶',
  Accesibilidad: '♿',
  Nichos: '🕯️',
  'Capilla Ecumenica': '⛪',
};

function SocialIcon({ platform }: { platform: Exclude<SharePlatform, 'copiar'> }) {
  if (platform === 'facebook') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.02H7.9v-2.92h2.54V9.84c0-2.52 1.5-3.92 3.8-3.92 1.1 0 2.25.2 2.25.2v2.48h-1.27c-1.25 0-1.64.78-1.64 1.58v1.9h2.8l-.45 2.92h-2.35V22C18.34 21.24 22 17.08 22 12.06z" />
      </svg>
    );
  }

  if (platform === 'x') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.9-6.35L6.5 22H3.4l7.24-8.27L1 2h6.4l4.42 5.77L18.9 2zm-1.1 18h1.73L6.46 3.9H4.6L17.8 20z" />
      </svg>
    );
  }

  if (platform === 'whatsapp') {
    return (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.31-1.66a11.87 11.87 0 0 0 5.75 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.43zM12.07 21.8h-.01a9.9 9.9 0 0 1-5.03-1.37l-.36-.21-3.75.99 1-3.66-.24-.38a9.9 9.9 0 0 1-1.51-5.27C2.17 6.42 6.6 2 12.06 2c2.64 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7.01c0 5.46-4.44 9.9-9.89 9.9zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48a8.9 8.9 0 0 1-1.66-2.06c-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.22 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
      </svg>
    );
  }

  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.04 15.34l-.39 5.49c.56 0 .8-.24 1.09-.53l2.62-2.5 5.43 3.97c1 .56 1.7.27 1.95-.92l3.53-16.52h.01c.3-1.42-.51-1.98-1.48-1.62L1.58 10.2c-1.38.54-1.36 1.31-.24 1.66l5.17 1.61L18.5 6c.57-.35 1.08-.16.65.2l-10.11 9.14z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H10V7h9v14z" />
    </svg>
  );
}

export default function ObituarioDetallePage() {
  const params = useParams<{ id: string }>();
  const obituaryId = Array.isArray(params?.id) ? params.id[0] : params?.id || '';

  const obituario = useMemo(() => getObituaryById(obituaryId), [obituaryId]);

  const mapQuery = useMemo(
    () => (obituario ? buildObituaryMapQuery(obituario) : ''),
    [obituario],
  );
  const googleMapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    mapQuery,
  )}&output=embed`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    mapQuery,
  )}`;

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const formatearHora = (fecha: string) =>
    new Date(fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const compartir = (plataforma: SharePlatform) => {
    if (!obituario) {
      return;
    }

    const url = window.location.href;
    const texto = `En memoria de ${obituario.nombre}`;

    if (plataforma === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
      );
      return;
    }

    if (plataforma === 'x') {
      window.open(
        `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`,
        '_blank',
      );
      return;
    }

    if (plataforma === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${texto} ${url}`)}`, '_blank');
      return;
    }

    if (plataforma === 'telegram') {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`,
        '_blank',
      );
      return;
    }

    void navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles');
  };

  if (!obituario) {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <Container>
          <div className="max-w-2xl mx-auto glass rounded-3xl border border-primary/15 p-8 text-center">
            <h1 className="text-2xl font-display text-text mb-3">Obituario no encontrado</h1>
            <p className="text-textLight mb-6">
              No encontramos el homenaje solicitado. Revisa el enlace o vuelve al listado general.
            </p>
            <Link href="/obituarios">
              <Button variant="primary">Volver a obituarios</Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-background via-primary/5 to-background">
      <Container>
        <FadeIn>
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl">
            <Image
              src={OBITUARIO_BACKGROUND_IMAGE}
              alt={obituario.nombre}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-textLight text-lg mb-2">En memoria de</p>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-text mb-4">
                {obituario.nombre}
              </h1>
              <p className="text-xl text-textLight">
                {formatearFecha(obituario.fechaNacimiento)} -{' '}
                {formatearFecha(obituario.fechaFallecimiento)}
              </p>
              <p className="text-primary mt-2 font-medium">{obituario.ubicacionSala}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-textLight">Sala</p>
                    <p className="font-semibold text-text text-lg">{obituario.sala}</p>
                  </div>
                </div>
              </div>

              <div className="glass rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-textLight">Horario</p>
                    <p className="font-semibold text-text">
                      Inicio: {formatearFecha(obituario.inicioVelacion)} |{' '}
                      {formatearHora(obituario.inicioVelacion)}
                    </p>
                    <p className="font-semibold text-text">
                      Fin: {formatearFecha(obituario.cierreVelacion)} |{' '}
                      {formatearHora(obituario.cierreVelacion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-primary/20 mb-8">
              <h3 className="text-xl font-semibold text-text mb-4">Compartir homenaje</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  type="button"
                  onClick={() => compartir('facebook')}
                  className="rounded-xl border border-primary/20 bg-white/80 hover:bg-primary/10 text-text px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <SocialIcon platform="facebook" />
                  <span className="text-sm font-medium">Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => compartir('x')}
                  className="rounded-xl border border-primary/20 bg-white/80 hover:bg-primary/10 text-text px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <SocialIcon platform="x" />
                  <span className="text-sm font-medium">X</span>
                </button>
                <button
                  type="button"
                  onClick={() => compartir('whatsapp')}
                  className="rounded-xl border border-primary/20 bg-white/80 hover:bg-primary/10 text-text px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <SocialIcon platform="whatsapp" />
                  <span className="text-sm font-medium">WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => compartir('telegram')}
                  className="rounded-xl border border-primary/20 bg-white/80 hover:bg-primary/10 text-text px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <SocialIcon platform="telegram" />
                  <span className="text-sm font-medium">Telegram</span>
                </button>
                <button
                  type="button"
                  onClick={() => compartir('copiar')}
                  className="rounded-xl border border-primary/20 bg-white/80 hover:bg-primary/10 text-text px-4 py-3 flex items-center justify-center gap-2 transition-colors"
                >
                  <CopyIcon />
                  <span className="text-sm font-medium">Copiar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Button
                onClick={() => {
                  window.location.href = '/floreria';
                }}
                variant="primary"
                className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                Mandar Flores
              </Button>

              <a href={googleMapsSearchUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="w-full h-14 text-lg">
                  Abrir en Google Maps
                </Button>
              </a>
            </div>

            <div className="glass rounded-2xl p-6 border border-primary/20 mb-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-text mb-1">Direccion del servicio ceremonial</p>
                    <p className="text-textLight text-sm">
                      {obituario.direccionServicio || 'Direccion por confirmar'}
                    </p>
                  </div>
                </div>

                {obituario.direccionCementerio && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-text mb-1">Direccion del cementerio</p>
                      <p className="text-textLight text-sm">{obituario.direccionCementerio}</p>
                    </div>
                  </div>
                )}

                {obituario.horaDestinoFinal && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="font-semibold text-text">
                        Hora destino final: {obituario.horaDestinoFinal}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {obituario.servicios && obituario.servicios.length > 0 && (
              <div className="glass rounded-2xl p-6 border border-primary/20 mb-8">
                <h3 className="text-xl font-semibold text-text mb-6 text-center">
                  Servicios de la sede
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {obituario.servicios.map((servicio) => (
                    <div
                      key={servicio}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl glass border border-primary/10 hover:border-primary/30 transition-colors"
                    >
                      <span className="text-3xl">{serviciosIconos[servicio] || '•'}</span>
                      <span className="text-sm text-text text-center font-medium">{servicio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-6 border border-primary/20">
              <h3 className="text-xl font-semibold text-text mb-4">Ubicacion</h3>
              <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className="text-sm text-textLight mt-3 text-center">{obituario.ubicacionSala}</p>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
