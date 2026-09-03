"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import Container from "@/components/ui/Container";
import PageHero from "@/components/ui/PageHero";
import TitleBand from "@/components/ui/TitleBand";
import FadeIn from "@/components/animations/FadeIn";
import Button from "@/components/ui/Button";
import type { DueloGalleryAlbum, TallerDuelo } from "@/data/talleres-duelo";
import { buildWhatsAppUrl } from "@/config/contact";
import {
  getStoredActiveTalleres,
  getTallerTitle,
  loadDueloAlbums,
  loadTalleresDuelo,
  TALLERES_DUELO_UPDATED_EVENT,
} from "@/lib/talleresDueloStorage";

type WorkshopView = TallerDuelo & {
  city?: string;
  modalidad?: string;
  cupos?: number;
  inscritos?: number;
  facilitador?: string;
  duracion?: string;
  categoria?: string;
  instrucciones?: string;
  urlConexion?: string;
  imagen?: string | null;
};

const serviciosDuelo = [
  {
    title: "Acompañamiento Individual",
    description:
      "Sesiones personalizadas con nuestros psicólogos para abordar el duelo de manera íntima y adaptada a tus necesidades.",
    icon: (
      <img
        width="94"
        height="94"
        src="https://img.icons8.com/3d-fluency/94/person-female.png"
        alt="person-female"
      />
    ),
  },
  {
    title: "Grupos de Apoyo",
    description:
      "Espacios seguros y confidenciales donde puedes compartir tu experiencia con otras personas que atraviesan situaciones similares.",
    icon: (
      <img
        width="94"
        height="94"
        src="https://img.icons8.com/3d-fluency/94/group--v3.png"
        alt="group--v3"
      />
    ),
  },
  {
    title: "Talleres y Conferencias",
    description:
      "Actividades formativas y reflexivas sobre el manejo del duelo, la resiliencia y el crecimiento personal tras una pérdida.",
    icon: (
      <img
        width="94"
        height="94"
        src="https://img.icons8.com/3d-fluency/94/collaboration-female-male--v4.png"
        alt="collaboration-female-male--v4"
      />
    ),
  },
  {
    title: "Línea de Apoyo Telefónico",
    description:
      "Un canal directo para momentos de crisis o necesidad de escucha, disponible para todos nuestros afiliados.",
    icon: (
      <img
        width="94"
        height="94"
        src="https://img.icons8.com/3d-fluency/94/technical-support--v2.png"
        alt="technical-support--v2"
      />
    ),
  },
];

function getLocalDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sortByDateAsc(a: TallerDuelo, b: TallerDuelo) {
  return (a.fechaISO ?? "9999-12-31").localeCompare(b.fechaISO ?? "9999-12-31");
}

export default function AcompanamientoDueloPage() {
  const todayISO = useMemo(() => getLocalDateISO(), []);
  const [allTalleres, setAllTalleres] = useState<WorkshopView[]>(() =>
    loadTalleresDuelo(),
  );
  const [proximosTalleres, setProximosTalleres] = useState<WorkshopView[]>(() =>
    getStoredActiveTalleres()
      .filter((taller) => !taller.fechaISO || taller.fechaISO >= todayISO)
      .sort(sortByDateAsc),
  );
  const [albumes, setAlbumes] = useState<DueloGalleryAlbum[]>(() =>
    loadDueloAlbums().filter((album) => album.activo),
  );
  const [selectedTallerIndex, setSelectedTallerIndex] = useState(0);
  const [selectedAlbumDate, setSelectedAlbumDate] = useState("all");
  const [openAlbum, setOpenAlbum] = useState<DueloGalleryAlbum | null>(null);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [registering, setRegistering] = useState(false);
  const [cityFilter, setCityFilter] = useState("todas");
  const [modalityFilter, setModalityFilter] = useState("todas");

  useEffect(() => {
    const syncData = () => {
      const storedTalleres = loadTalleresDuelo();
      const activeTalleres = getStoredActiveTalleres()
        .filter((taller) => !taller.fechaISO || taller.fechaISO >= todayISO)
        .sort(sortByDateAsc);
      setAllTalleres(storedTalleres);
      setProximosTalleres(activeTalleres);
      setSelectedTallerIndex((current) =>
        activeTalleres[current] ? current : 0,
      );
      setAlbumes(loadDueloAlbums().filter((album) => album.activo));
    };

    syncData();
    fetch("/api/talleres-duelo/public")
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload?.data?.talleres?.length) return;
        const serverTalleres = payload.data.talleres as WorkshopView[];
        const serverAlbums = (
          payload.data.albums as DueloGalleryAlbum[]
        ).filter((album) => album.activo);
        const serverActive = serverTalleres
          .filter(
            (taller) =>
              taller.activo &&
              (!taller.fechaISO || taller.fechaISO >= todayISO),
          )
          .sort(sortByDateAsc);
        setAllTalleres(serverTalleres);
        setProximosTalleres(serverActive);
        setSelectedTallerIndex((current) =>
          serverActive[current] ? current : 0,
        );
        setAlbumes(serverAlbums);
      })
      .catch(() => undefined);
    window.addEventListener(TALLERES_DUELO_UPDATED_EVENT, syncData);
    return () =>
      window.removeEventListener(TALLERES_DUELO_UPDATED_EVENT, syncData);
  }, [todayISO]);

  const albumDateOptions = useMemo(() => {
    const options = new Map<string, string>();
    albumes.forEach((album) => options.set(album.fechaISO, album.fecha));
    return Array.from(options.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [albumes]);

  const visibleAlbumes = useMemo(
    () =>
      albumes.filter(
        (album) =>
          selectedAlbumDate === "all" || album.fechaISO === selectedAlbumDate,
      ),
    [albumes, selectedAlbumDate],
  );
  const availableCities = useMemo(
    () =>
      Array.from(
        new Set(proximosTalleres.map((item) => item.city).filter(Boolean)),
      ).sort(),
    [proximosTalleres],
  );
  const filteredUpcoming = useMemo(
    () =>
      proximosTalleres.filter(
        (item) =>
          (cityFilter === "todas" || item.city === cityFilter) &&
          (modalityFilter === "todas" || item.modalidad === modalityFilter),
      ),
    [proximosTalleres, cityFilter, modalityFilter],
  );
  const selectedTaller = proximosTalleres[selectedTallerIndex];

  useEffect(() => {
    if (!filteredUpcoming.length) return;
    if (!filteredUpcoming.some((item) => item.id === selectedTaller?.id)) {
      const firstIndex = proximosTalleres.findIndex(
        (item) => item.id === filteredUpcoming[0].id,
      );
      setSelectedTallerIndex(firstIndex >= 0 ? firstIndex : 0);
    }
  }, [filteredUpcoming, proximosTalleres, selectedTaller?.id]);

  const handleWorkshopSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const nombre = String(formData.get("nombre") || "").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    const correo = String(formData.get("correo") || "").trim();
    const selectedTaller = proximosTalleres[selectedTallerIndex];
    if (!selectedTaller) return;
    setRegistering(true);
    setRegistrationMessage("");
    try {
      const response = await fetch("/api/talleres-duelo/inscripciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopId: selectedTaller.id,
          name: nombre,
          phone: telefono,
          email: correo,
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !result.success)
        throw new Error(
          result.message || "No fue posible registrar tu inscripción.",
        );
      setRegistrationMessage(
        result.message || "Tu inscripción fue registrada correctamente.",
      );
      form.reset();
      const workshopsResponse = await fetch("/api/talleres-duelo/public");
      const workshopsPayload = workshopsResponse.ok
        ? await workshopsResponse.json()
        : null;
      const refreshed = workshopsPayload?.data?.talleres as WorkshopView[] | undefined;
      if (refreshed) {
        const active = refreshed
          .filter((taller) => taller.activo && (!taller.fechaISO || taller.fechaISO >= todayISO))
          .sort(sortByDateAsc);
        setAllTalleres(refreshed);
        setProximosTalleres(active);
        const nextIndex = active.findIndex((taller) => taller.id === selectedTaller.id);
        setSelectedTallerIndex(nextIndex >= 0 ? nextIndex : 0);
      }
    } catch (error) {
      setRegistrationMessage(
        error instanceof Error
          ? error.message
          : "No fue posible registrar tu inscripción.",
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <main className="min-h-screen">
      <PageHero
        title="Acompañamiento en Duelo"
        subtitle="Un espacio de apoyo y sanación para quienes han perdido a un ser querido."
        image="/images/images-baners/acompañamientoenduelo.webp"
        imageAlt="Acompañamiento en Duelo - Jardines del Renacer"
      />

      <TitleBand title="Nuestro Compromiso es Acompañarte" />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviciosDuelo.map((servicio, index) => (
              <FadeIn key={servicio.title} delay={index * 0.08}>
                <div className="group relative flex h-full flex-col rounded-3xl border border-primary/10 bg-white/60 p-6 text-center shadow-lg backdrop-blur-lg transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:-translate-y-2">
                  <div className="flex-grow">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                      {servicio.icon}
                    </div>
                    <h3 className="text-xl font-bold text-text">
                      {servicio.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-textLight">
                      {servicio.description}
                    </p>
                  </div>
                  <div className="mt-6">
                    <a
                      href={buildWhatsAppUrl(
                        `Hola, quisiera más información sobre el servicio de ${servicio.title}.`,
                        "3228400549",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white"
                    >
                      Solicitar Información
                    </a>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      <TitleBand title="Próximos Talleres de Duelo" />

      <section className="py-16 md:py-24">
        <Container>
          {selectedTaller && (
            <FadeIn>
              <div className="mb-10 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-50 to-sky-50 p-6 shadow-sm">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                      Próximo taller
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-text md:text-3xl">
                      {selectedTaller.titulo}
                    </h2>
                    <p className="mt-1 text-sm text-textLight">
                      {selectedTaller.fecha} - {selectedTaller.lugar}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-6 py-5 text-center shadow-sm">
                    <p className="text-4xl font-extrabold text-primary">
                      {selectedTaller.fecha.split(" ")[0] || "—"}
                    </p>
                    <p className="text-xs font-bold uppercase tracking-wider text-textLight">
                      {selectedTaller.fecha.split(" ").slice(1).join(" ") ||
                        "Fecha del encuentro"}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
            <select
              value={cityFilter}
              onChange={(event) => setCityFilter(event.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-3 text-sm"
            >
              <option value="todas">Todas las ciudades</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              value={modalityFilter}
              onChange={(event) => setModalityFilter(event.target.value)}
              className="rounded-xl border border-border bg-white px-4 py-3 text-sm"
            >
              <option value="todas">Todas las modalidades</option>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Híbrido">Híbrido</option>
            </select>
            <p className="self-center text-sm font-semibold text-textLight">
              {filteredUpcoming.length} taller(es) disponibles
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <div className="space-y-4">
                {filteredUpcoming.length > 0 ? (
                  filteredUpcoming.map((taller) => (
                    <button
                      key={taller.id}
                      onClick={() =>
                        setSelectedTallerIndex(
                          proximosTalleres.findIndex(
                            (item) => item.id === taller.id,
                          ),
                        )
                      }
                      className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
                        selectedTaller?.id === taller.id
                          ? "bg-primary/10 border-primary/30 shadow-lg"
                          : "glass border-border hover:bg-base-100/50"
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <p className="font-bold text-primary text-sm uppercase tracking-wider">
                          {taller.fecha}
                        </p>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                          {selectedTaller?.id === taller.id
                            ? "Seleccionado"
                            : "Programado"}
                        </span>
                        {taller.categoria && (
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            {taller.categoria}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-text mt-1">
                        {taller.titulo}
                      </h3>
                      <p className="text-sm text-textLight">
                        {[taller.lugar, taller.city, taller.modalidad]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      <p className="mt-2 text-xs font-semibold text-primary">
                        {Math.max(
                          0,
                          (taller.cupos ?? 0) - (taller.inscritos ?? 0),
                        )}{" "}
                        cupos disponibles
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="glass rounded-2xl border border-border p-6">
                    <h3 className="text-xl font-bold text-text">
                      Estamos preparando nuevos talleres
                    </h3>
                    <p className="mt-2 text-sm text-textLight">
                      Escríbenos para recibir acompañamiento o ser avisado
                      cuando publiquemos nuevas fechas.
                    </p>
                  </div>
                )}
                {selectedTaller && (
                  <article className="relative min-h-[310px] overflow-hidden rounded-3xl border border-primary/15 bg-[#173f73] p-6 text-white shadow-[0_24px_60px_-38px_rgba(10,52,108,.75)]">
                    {selectedTaller.imagen ? (
                      <img
                        src={selectedTaller.imagen}
                        alt={`Imagen del ${selectedTaller.titulo}`}
                        className="absolute inset-0 h-full w-full object-cover opacity-35"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(125,185,255,.6),_transparent_42%),linear-gradient(135deg,_#173f73,_#28599b_58%,_#78a7db)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#102d57] via-[#173f73]/75 to-transparent" />
                    <div className="relative flex h-full min-h-[262px] flex-col justify-end">
                      <p className="text-xs font-bold uppercase tracking-[.2em] text-white/70">
                        Información del encuentro
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold leading-tight">
                        {selectedTaller.titulo}
                      </h3>
                      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
                        {selectedTaller.instrucciones ||
                          "Un espacio seguro de escucha, aprendizaje y acompañamiento para transitar el duelo."}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
                        {selectedTaller.facilitador && (
                          <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                            Facilita: {selectedTaller.facilitador}
                          </span>
                        )}
                        {selectedTaller.duracion && (
                          <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                            {selectedTaller.duracion}
                          </span>
                        )}
                        <span className="rounded-full bg-white/15 px-3 py-2 backdrop-blur">
                          {selectedTaller.modalidad || "Presencial"}
                        </span>
                      </div>
                    </div>
                  </article>
                )}
              </div>
            </FadeIn>

            <FadeIn className="lg:sticky lg:top-28">
              <div className="overflow-hidden rounded-3xl border border-primary/20 bg-white shadow-[0_24px_70px_-45px_rgba(18,62,120,.55)]">
                <div className="bg-gradient-to-r from-primary to-[#4b74ad] px-7 py-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-white/75">
                    Reserva tu espacio
                  </p>
                  <h3 className="mt-2 text-2xl font-extrabold">
                    Inscríbete al taller
                  </h3>
                  <p className="mt-1 text-sm text-white/80">
                    Recibirás la confirmación en tu correo electrónico.
                  </p>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-[#f6f9ff] to-white p-5 shadow-sm">
                    <div
                      key={selectedTaller?.id}
                      className="animate-in fade-in duration-500"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start md:items-center gap-5">
                          <div className="bg-primary/10 text-primary font-bold px-5 py-4 rounded-2xl text-center min-w-[130px] flex flex-col items-center justify-center">
                            <span className="text-3xl leading-none">
                              {selectedTaller?.fecha.split(" ")[0] ?? "--"}
                            </span>
                            <span className="text-xs uppercase tracking-wider">
                              {selectedTaller?.fecha
                                .split(" ")
                                .slice(1)
                                .join(" ") ?? "PRÓXIMAMENTE"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-text text-lg">
                              {selectedTaller?.titulo ??
                                "Acompañamiento disponible"}
                            </h4>
                            <p className="text-sm text-textLight">
                              {[
                                selectedTaller?.lugar,
                                selectedTaller?.city,
                                selectedTaller?.modalidad,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "Comunícate con nuestro equipo"}
                            </p>
                            <p className="mt-2 text-xs font-semibold text-primary">
                              {selectedTaller?.facilitador &&
                                `Facilita: ${selectedTaller.facilitador}`}
                              {selectedTaller?.facilitador &&
                                selectedTaller?.duracion &&
                                " · "}
                              {selectedTaller?.duracion}
                            </p>
                            <p className="mt-2 text-xs font-medium text-textLight">
                              {Math.max(
                                0,
                                (selectedTaller?.cupos ?? 0) -
                                  (selectedTaller?.inscritos ?? 0),
                              )}{" "}
                              cupos disponibles
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedTaller?.urlConexion && (
                    <a
                      href={selectedTaller.urlConexion}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 flex w-full items-center justify-center rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                    >
                      Conectarme al taller
                    </a>
                  )}

                  <form
                    onSubmit={handleWorkshopSubmit}
                    className="mt-6 space-y-4"
                  >
                    <p className="text-sm font-bold text-text">
                      Tus datos de contacto
                    </p>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre Completo"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <input
                      type="tel"
                      name="telefono"
                      placeholder="Teléfono de Contacto"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    <input
                      type="email"
                      name="correo"
                      placeholder="Correo Electrónico"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-text outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                    />
                    {registrationMessage && (
                      <p role="status" className={`rounded-xl border px-4 py-3 text-sm font-semibold ${registrationMessage.includes("No fue posible") ? "border-red-200 bg-red-50 text-red-700" : registrationMessage.includes("agotaron") ? "border-amber-200 bg-amber-50 text-amber-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                        {registrationMessage}
                      </p>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      disabled={registering}
                    >
                      {registering ? "Registrando…" : "Reservar mi cupo"}
                    </Button>
                    <p className="text-center text-xs leading-relaxed text-textLight">
                      Al reservar, autorizas el uso de tus datos únicamente para
                      gestionar este taller y sus comunicaciones.
                    </p>
                  </form>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {albumes.length > 0 && (
        <>
          <TitleBand title="Galería de Talleres Pasados" />

          <section className="py-16 md:py-24">
            <Container>
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                    Memorias por fecha
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-text">
                    Álbumes de acompañamiento
                  </h2>
                </div>
                <select
                  value={selectedAlbumDate}
                  onChange={(event) => setSelectedAlbumDate(event.target.value)}
                  className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todas las fechas</option>
                  {albumDateOptions.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {visibleAlbumes.map((album) => (
                  <FadeIn key={album.id}>
                    <button type="button" onClick={() => setOpenAlbum(album)} className="w-full overflow-hidden rounded-2xl border border-primary/10 bg-white text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1">
                        {album.images.slice(0, 3).map((image) => (
                          <img
                            key={image.id}
                            src={image.src}
                            alt={image.alt}
                            className="h-36 w-full rounded-xl object-cover sm:h-44"
                          />
                        ))}
                      </div>
                      <div className="p-6">
                        <p className="text-sm font-bold uppercase tracking-wider text-primary">
                          {album.fecha}
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-text">
                          {album.titulo}
                        </h3>
                        <p className="mt-1 text-sm text-textLight">
                          {getTallerTitle(allTalleres, album.tallerId)}
                        </p>
                        {album.descripcion && (
                          <p className="mt-4 text-sm leading-relaxed text-textLight">
                            {album.descripcion}
                          </p>
                        )}
                      </div>
                    </button>
                  </FadeIn>
                ))}
              </div>
            </Container>
          </section>
        </>
      )}

      {openAlbum && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm" onClick={() => setOpenAlbum(null)}>
          <section className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Galería del taller</p><h2 className="mt-2 text-2xl font-bold text-text">{openAlbum.titulo}</h2><p className="mt-1 text-sm text-textLight">{openAlbum.fecha} · {openAlbum.images.length} fotografías</p></div><button type="button" onClick={() => setOpenAlbum(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-border text-xl font-bold text-textLight" aria-label="Cerrar galería">×</button></div>
            {openAlbum.descripcion && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-textLight">{openAlbum.descripcion}</p>}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{openAlbum.images.map((image) => <figure key={image.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50"><img src={image.src} alt={image.alt} className="h-60 w-full object-cover" />{(image.caption || image.alt) && <figcaption className="p-3 text-sm text-textLight">{image.caption || image.alt}</figcaption>}</figure>)}</div>
          </section>
        </div>
      )}
    </main>
  );
}
