"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Edit3, ImagePlus, Plus, Trash2 } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { DueloGalleryAlbum, DueloGalleryImage, TallerDuelo } from '@/data/talleres-duelo';
import {
  getTallerTitle,
  loadDueloAlbums,
  loadTalleresDuelo,
  saveDueloAlbums,
  saveTalleresDuelo,
} from '@/lib/talleresDueloStorage';

type TallerFormData = {
  fecha: string;
  fechaISO: string;
  titulo: string;
  lugar: string;
  activo: boolean;
};

type AlbumFormData = {
  tallerId: string;
  titulo: string;
  fecha: string;
  fechaISO: string;
  descripcion: string;
  activo: boolean;
  images: DueloGalleryImage[];
};

type TallerDateStatus = 'past' | 'next' | 'scheduled' | 'no-date';

const EMPTY_TALLER_FORM: TallerFormData = {
  fecha: '',
  fechaISO: '',
  titulo: '',
  lugar: '',
  activo: true,
};

const EMPTY_ALBUM_FORM: AlbumFormData = {
  tallerId: '',
  titulo: '',
  fecha: '',
  fechaISO: '',
  descripcion: '',
  activo: true,
  images: [],
};

const MAX_IMAGES_PER_ALBUM = 10;
const MAX_IMAGE_SIZE = 8_000_000;

function sortAlbums(albums: DueloGalleryAlbum[]) {
  return [...albums].sort((a, b) => b.fechaISO.localeCompare(a.fechaISO));
}

function formatDateLabel(date: string) {
  if (!date) return '';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed
    .toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
    .toUpperCase();
}

function getLocalDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysUntil(fechaISO: string | undefined, todayISO: string) {
  if (!fechaISO) return null;

  const today = new Date(`${todayISO}T00:00:00`);
  const target = new Date(`${fechaISO}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function getStatusLabel(status: TallerDateStatus) {
  const labels: Record<TallerDateStatus, string> = {
    past: 'Finalizado',
    next: 'Proximo',
    scheduled: 'Programado',
    'no-date': 'Sin fecha',
  };
  return labels[status];
}

function getStatusClass(status: TallerDateStatus) {
  const styles: Record<TallerDateStatus, string> = {
    past: 'bg-slate-100 text-slate-600',
    next: 'bg-green-100 text-green-700',
    scheduled: 'bg-sky-100 text-sky-700',
    'no-date': 'bg-amber-100 text-amber-700',
  };
  return styles[status];
}

function readImageFile(file: File): Promise<DueloGalleryImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new window.Image();
      image.onload = () => {
        const maxEdge = 1000;
        const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('No se pudo preparar la imagen.'));
          return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          src: canvas.toDataURL('image/jpeg', 0.72),
          alt: file.name.replace(/\.[^.]+$/, ''),
          caption: '',
        });
      };
      image.onerror = () => reject(new Error('No se pudo leer la imagen.'));
      image.src = String(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function DashboardTalleresPage() {
  const todayISO = useMemo(() => getLocalDateISO(), []);
  const [activeTab, setActiveTab] = useState<'talleres' | 'galeria'>('talleres');
  const [talleres, setTalleres] = useState<TallerDuelo[]>(() => loadTalleresDuelo());
  const [albums, setAlbums] = useState<DueloGalleryAlbum[]>(() => loadDueloAlbums());
  const [isTallerModalOpen, setIsTallerModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingTaller, setEditingTaller] = useState<TallerDuelo | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<DueloGalleryAlbum | null>(null);
  const [tallerFormData, setTallerFormData] = useState<TallerFormData>(EMPTY_TALLER_FORM);
  const [albumFormData, setAlbumFormData] = useState<AlbumFormData>(EMPTY_ALBUM_FORM);
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'taller' | 'album'; id: string } | null>(null);
  const [albumDateFilter, setAlbumDateFilter] = useState('all');
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const hasOpenModal = isTallerModalOpen || isAlbumModalOpen || confirmDelete;
    document.body.style.overflow = hasOpenModal ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isTallerModalOpen, isAlbumModalOpen, confirmDelete]);

  const totalActivos = useMemo(
    () => talleres.filter((taller) => taller.activo).length,
    [talleres],
  );

  const nextTallerId = useMemo(() => {
    return [...talleres]
      .filter((taller) => taller.activo && (!taller.fechaISO || taller.fechaISO >= todayISO))
      .sort((a, b) => (a.fechaISO ?? '9999-12-31').localeCompare(b.fechaISO ?? '9999-12-31'))[0]?.id;
  }, [talleres, todayISO]);

  const talleresWithStatus = useMemo(() => {
    return talleres.map((taller) => {
      let status: TallerDateStatus = 'no-date';
      if (taller.fechaISO && taller.fechaISO < todayISO) {
        status = 'past';
      } else if (taller.id === nextTallerId) {
        status = 'next';
      } else if (taller.fechaISO) {
        status = 'scheduled';
      }

      return {
        taller,
        status,
        daysUntil: getDaysUntil(taller.fechaISO, todayISO),
      };
    });
  }, [nextTallerId, talleres, todayISO]);

  const nextTaller = useMemo(
    () => talleresWithStatus.find((item) => item.status === 'next'),
    [talleresWithStatus],
  );

  const albumDateOptions = useMemo(() => {
    const options = new Map<string, string>();
    albums.forEach((album) => options.set(album.fechaISO, album.fecha));
    return Array.from(options.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [albums]);

  const visibleAlbums = useMemo(
    () => albums.filter((album) => albumDateFilter === 'all' || album.fechaISO === albumDateFilter),
    [albums, albumDateFilter],
  );

  const persistTalleres = (nextTalleres: TallerDuelo[]) => {
    setTalleres(nextTalleres);
    saveTalleresDuelo(nextTalleres);
  };

  const persistAlbums = (nextAlbums: DueloGalleryAlbum[]) => {
    const sorted = sortAlbums(nextAlbums);
    try {
      saveDueloAlbums(sorted);
      setAlbums(sorted);
      return true;
    } catch {
      showToast(false, 'No hay espacio local suficiente para guardar tantas imagenes. Reduce cantidad o peso.');
      return false;
    }
  };

  const openCreateTallerModal = () => {
    setEditingTaller(null);
    setTallerFormData(EMPTY_TALLER_FORM);
    setIsTallerModalOpen(true);
  };

  const openEditTallerModal = (taller: TallerDuelo) => {
    setEditingTaller(taller);
    setTallerFormData({
      fecha: taller.fecha,
      fechaISO: taller.fechaISO ?? '',
      titulo: taller.titulo,
      lugar: taller.lugar,
      activo: taller.activo,
    });
    setIsTallerModalOpen(true);
  };

  const closeTallerModal = () => {
    setIsTallerModalOpen(false);
    setEditingTaller(null);
    setTallerFormData(EMPTY_TALLER_FORM);
  };

  const openCreateAlbumModal = () => {
    const relatedTaller = talleres.find((taller) => !taller.activo) ?? talleres[0];

    setEditingAlbum(null);
    setAlbumFormData({
      ...EMPTY_ALBUM_FORM,
      tallerId: relatedTaller?.id ?? '',
      titulo: relatedTaller?.titulo ?? '',
      fecha: relatedTaller?.fecha ?? '',
      fechaISO: relatedTaller?.fechaISO ?? '',
    });
    setIsAlbumModalOpen(true);
  };

  const openEditAlbumModal = (album: DueloGalleryAlbum) => {
    setEditingAlbum(album);
    setAlbumFormData({
      tallerId: album.tallerId,
      titulo: album.titulo,
      fecha: album.fecha,
      fechaISO: album.fechaISO,
      descripcion: album.descripcion ?? '',
      activo: album.activo,
      images: album.images,
    });
    setIsAlbumModalOpen(true);
  };

  const closeAlbumModal = () => {
    setIsAlbumModalOpen(false);
    setEditingAlbum(null);
    setAlbumFormData(EMPTY_ALBUM_FORM);
  };

  const handleSaveTaller = (event: FormEvent) => {
    event.preventDefault();

    const payload: TallerDuelo = {
      id: editingTaller?.id ?? `td-${Date.now()}`,
      fecha: tallerFormData.fecha.trim(),
      fechaISO: tallerFormData.fechaISO || undefined,
      titulo: tallerFormData.titulo.trim(),
      lugar: tallerFormData.lugar.trim(),
      activo: tallerFormData.activo,
    };

    if (!payload.fecha || !payload.titulo || !payload.lugar) {
      showToast(false, 'Completa fecha, titulo y lugar.');
      return;
    }

    if (editingTaller) {
      persistTalleres(talleres.map((taller) => (taller.id === editingTaller.id ? payload : taller)));
      showToast(true, 'Taller actualizado correctamente.');
    } else {
      persistTalleres([payload, ...talleres]);
      showToast(true, 'Taller creado correctamente.');
    }

    closeTallerModal();
  };

  const toggleActivo = (id: string) => {
    persistTalleres(
      talleres.map((taller) => (taller.id === id ? { ...taller, activo: !taller.activo } : taller)),
    );
    showToast(true, 'Estado del taller actualizado.');
  };

  const handleAlbumFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) return;

    const currentCount = albumFormData.images.length;
    const availableSlots = MAX_IMAGES_PER_ALBUM - currentCount;
    const allowedFiles = files
      .filter((file) => file.type.startsWith('image/') && file.size <= MAX_IMAGE_SIZE)
      .slice(0, availableSlots);

    if (allowedFiles.length !== files.length) {
      showToast(false, `Solo se agregaron imagenes validas: maximo ${MAX_IMAGES_PER_ALBUM} por album y 8 MB por imagen.`);
    }

    if (allowedFiles.length === 0) return;

    try {
      const images = await Promise.all(allowedFiles.map(readImageFile));
      setAlbumFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...images],
      }));
    } catch {
      showToast(false, 'No se pudieron cargar algunas imagenes.');
    }
  };

  const removeAlbumImage = (imageId: string) => {
    setAlbumFormData((prev) => ({
      ...prev,
      images: prev.images.filter((image) => image.id !== imageId),
    }));
  };

  const handleSaveAlbum = (event: FormEvent) => {
    event.preventDefault();

    const now = new Date().toISOString();
    const payload: DueloGalleryAlbum = {
      id: editingAlbum?.id ?? `album-${Date.now()}`,
      tallerId: albumFormData.tallerId,
      titulo: albumFormData.titulo.trim(),
      fecha: albumFormData.fecha.trim(),
      fechaISO: albumFormData.fechaISO,
      descripcion: albumFormData.descripcion.trim(),
      activo: albumFormData.activo,
      images: albumFormData.images,
      createdAt: editingAlbum?.createdAt ?? now,
      updatedAt: now,
    };

    if (!payload.tallerId || !payload.titulo || !payload.fecha || !payload.fechaISO) {
      showToast(false, 'Relaciona el album con un taller y una fecha.');
      return;
    }

    if (payload.images.length === 0) {
      showToast(false, 'Agrega al menos una imagen al album.');
      return;
    }

    if (editingAlbum) {
      if (!persistAlbums(albums.map((album) => (album.id === editingAlbum.id ? payload : album)))) return;
      showToast(true, 'Album actualizado correctamente.');
    } else {
      if (!persistAlbums([payload, ...albums])) return;
      showToast(true, 'Album creado correctamente.');
    }

    closeAlbumModal();
  };

  const handleDeleteConfirmed = () => {
    if (!confirmDelete) return;

    if (confirmDelete.type === 'taller') {
      persistTalleres(talleres.filter((taller) => taller.id !== confirmDelete.id));
      showToast(true, 'Taller eliminado.');
    } else {
      persistAlbums(albums.filter((album) => album.id !== confirmDelete.id));
      showToast(true, 'Album eliminado.');
    }

    setConfirmDelete(null);
  };

  const handleAlbumWorkshopChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const tallerId = event.target.value;
    const selectedTaller = talleres.find((taller) => taller.id === tallerId);

    setAlbumFormData((prev) => ({
      ...prev,
      tallerId,
      titulo: prev.titulo || selectedTaller?.titulo || '',
      fecha: selectedTaller?.fecha || prev.fecha,
      fechaISO: selectedTaller?.fechaISO || prev.fechaISO,
    }));
  };

  return (
    <>
      <Container className="py-10">
        <SectionTitle
          title="Gestion de Talleres de Duelo"
          subtitle={`Administra ${talleres.length} talleres, ${totalActivos} activos y ${albums.length} albumes de galeria.`}
        />

        {nextTaller && (
          <div className="mt-6 rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-50 to-sky-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
                  Proximo taller
                </p>
                <h3 className="mt-1 text-2xl font-bold text-text">{nextTaller.taller.titulo}</h3>
                <p className="text-sm text-textLight">{nextTaller.taller.fecha} - {nextTaller.taller.lugar}</p>
              </div>
              <div className="rounded-2xl bg-white px-6 py-4 text-center shadow-sm">
                <p className="text-4xl font-extrabold text-primary">
                  {nextTaller.daysUntil === 0 ? 'Hoy' : nextTaller.daysUntil}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-textLight">
                  {nextTaller.daysUntil === 0 ? 'Es el taller' : 'Dias restantes'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="inline-flex rounded-2xl border border-border bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('talleres')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'talleres' ? 'bg-primary text-white' : 'text-textLight hover:text-text'}`}
            >
              Talleres
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('galeria')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === 'galeria' ? 'bg-primary text-white' : 'text-textLight hover:text-text'}`}
            >
              Galeria
            </button>
          </div>

          {activeTab === 'talleres' ? (
            <Button variant="primary" onClick={openCreateTallerModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Taller
            </Button>
          ) : (
            <Button variant="primary" onClick={openCreateAlbumModal} className="gap-2">
              <ImagePlus className="h-4 w-4" />
              Nuevo Album
            </Button>
          )}
        </div>

        {activeTab === 'talleres' && (
          <div className="mt-8 overflow-x-auto glass rounded-2xl border border-border">
            <table className="min-w-[980px] w-full divide-y divide-border">
              <thead className="bg-black/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Taller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Lugar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-textLight uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {talleresWithStatus.map(({ taller, status, daysUntil }) => (
                  <tr key={taller.id} className={status === 'past' ? 'bg-slate-50/70' : status === 'next' ? 'bg-green-50/60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textLight">
                      <div className="font-semibold text-text">{taller.fecha}</div>
                      {taller.fechaISO && <div className="text-xs text-textLight">{taller.fechaISO}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text">{taller.titulo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-textLight">{taller.lugar}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(status)}`}>
                          {getStatusLabel(status)}
                          {status !== 'past' && daysUntil !== null && daysUntil > 0 ? ` · ${daysUntil} dias` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleActivo(taller.id)}
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                            taller.activo ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {taller.activo ? 'Activo' : 'Inactivo'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEditTallerModal(taller)} className="gap-2">
                          <Edit3 className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-2 text-red-600 hover:bg-red-50"
                          onClick={() => setConfirmDelete({ type: 'taller', id: taller.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'galeria' && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white/70 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-text">Albumes por fecha</h3>
                <p className="text-sm text-textLight">Relaciona cada album con un taller pasado y controla si se publica.</p>
              </div>
              <select
                value={albumDateFilter}
                onChange={(event) => setAlbumDateFilter(event.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas las fechas</option>
                {albumDateOptions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {visibleAlbums.map((album) => (
                <article key={album.id} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1">
                    {album.images.slice(0, 3).map((image) => (
                      <img
                        key={image.id}
                        src={image.src}
                        alt={image.alt}
                        className="h-32 w-full rounded-xl object-cover"
                      />
                    ))}
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {album.fecha}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${album.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {album.activo ? 'Publicado' : 'Oculto'}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {album.images.length} imagenes
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-text">{album.titulo}</h3>
                    <p className="mt-1 text-sm text-textLight">{getTallerTitle(talleres, album.tallerId)}</p>
                    {album.descripcion && <p className="mt-3 text-sm leading-relaxed text-textLight">{album.descripcion}</p>}
                    <div className="mt-5 flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditAlbumModal(album)} className="gap-2">
                        <Edit3 className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-2 text-red-600 hover:bg-red-50"
                        onClick={() => setConfirmDelete({ type: 'album', id: album.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {visibleAlbums.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-white/70 p-10 text-center">
                <ImagePlus className="mx-auto h-10 w-10 text-primary/70" />
                <h3 className="mt-3 text-lg font-bold text-text">Aun no hay albumes para esta fecha</h3>
                <p className="mt-1 text-sm text-textLight">Crea un album y carga las imagenes del taller pasado.</p>
              </div>
            )}
          </div>
        )}
      </Container>

      {isTallerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={closeTallerModal}>
          <div className="w-full max-w-xl rounded-3xl border border-primary/30 bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="mb-4 text-2xl font-bold text-text">{editingTaller ? 'Editar taller' : 'Crear nuevo taller'}</h2>
            <form onSubmit={handleSaveTaller} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Fecha visible"
                  name="fecha"
                  placeholder="Ej: 28 DE JULIO"
                  value={tallerFormData.fecha}
                  onChange={(event) => setTallerFormData((prev) => ({ ...prev, fecha: event.target.value }))}
                  required
                />
                <Input
                  label="Fecha calendario"
                  type="date"
                  value={tallerFormData.fechaISO}
                  onChange={(event) => setTallerFormData((prev) => ({
                    ...prev,
                    fechaISO: event.target.value,
                    fecha: prev.fecha || formatDateLabel(event.target.value),
                  }))}
                />
              </div>
              <Input
                label="Titulo del taller"
                name="titulo"
                value={tallerFormData.titulo}
                onChange={(event) => setTallerFormData((prev) => ({ ...prev, titulo: event.target.value }))}
                required
              />
              <Input
                label="Lugar"
                name="lugar"
                value={tallerFormData.lugar}
                onChange={(event) => setTallerFormData((prev) => ({ ...prev, lugar: event.target.value }))}
                required
              />

              <label className="flex items-center gap-2 rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={tallerFormData.activo}
                  onChange={(event) => setTallerFormData((prev) => ({ ...prev, activo: event.target.checked }))}
                />
                Taller activo
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={closeTallerModal}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm" onClick={closeAlbumModal}>
          <div className="mx-auto my-8 w-full max-w-4xl rounded-3xl border border-primary/30 bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h2 className="mb-4 text-2xl font-bold text-text">{editingAlbum ? 'Editar album' : 'Crear album de galeria'}</h2>
            <form onSubmit={handleSaveAlbum} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Taller relacionado</label>
                  <select
                    value={albumFormData.tallerId}
                    onChange={handleAlbumWorkshopChange}
                    required
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Seleccionar taller</option>
                    {talleres.map((taller) => (
                      <option key={taller.id} value={taller.id}>{taller.titulo}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Titulo del album"
                  value={albumFormData.titulo}
                  onChange={(event) => setAlbumFormData((prev) => ({ ...prev, titulo: event.target.value }))}
                  required
                />
                <Input
                  label="Fecha visible"
                  value={albumFormData.fecha}
                  onChange={(event) => setAlbumFormData((prev) => ({ ...prev, fecha: event.target.value }))}
                  required
                />
                <Input
                  label="Fecha calendario"
                  type="date"
                  value={albumFormData.fechaISO}
                  onChange={(event) => setAlbumFormData((prev) => ({
                    ...prev,
                    fechaISO: event.target.value,
                    fecha: prev.fecha || formatDateLabel(event.target.value),
                  }))}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text">Descripcion</label>
                <textarea
                  value={albumFormData.descripcion}
                  onChange={(event) => setAlbumFormData((prev) => ({ ...prev, descripcion: event.target.value }))}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-white px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Texto corto para contextualizar el album"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl bg-white/70 p-6 text-center transition-colors hover:bg-white">
                  <ImagePlus className="h-9 w-9 text-primary" />
                  <span className="text-sm font-semibold text-text">Cargar imagenes del album</span>
                  <span className="text-xs text-textLight">Maximo {MAX_IMAGES_PER_ALBUM} imagenes, 8 MB cada una. Se optimizan antes de guardar.</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleAlbumFiles} />
                </label>

                {albumFormData.images.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {albumFormData.images.map((image) => (
                      <div key={image.id} className="group relative overflow-hidden rounded-xl border border-border bg-white">
                        <img src={image.src} alt={image.alt} className="h-32 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeAlbumImage(image.id)}
                          className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-90 transition-opacity hover:opacity-100"
                          aria-label="Eliminar imagen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-border bg-slate-50 px-3 py-2 text-sm text-text">
                <input
                  type="checkbox"
                  checked={albumFormData.activo}
                  onChange={(event) => setAlbumFormData((prev) => ({ ...prev, activo: event.target.checked }))}
                />
                Publicar album en la pagina de acompanamiento en duelo
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={closeAlbumModal}>Cancelar</Button>
                <Button type="submit" variant="primary">Guardar album</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-lg font-bold text-text">Eliminar {confirmDelete.type === 'taller' ? 'taller' : 'album'}</h3>
            <p className="mb-6 text-sm text-textLight">Esta accion no se puede deshacer. ¿Seguro que deseas continuar?</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text hover:bg-slate-50">
                Cancelar
              </button>
              <button type="button" onClick={handleDeleteConfirmed} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-6 right-6 z-[70] rounded-2xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
    </>
  );
}
