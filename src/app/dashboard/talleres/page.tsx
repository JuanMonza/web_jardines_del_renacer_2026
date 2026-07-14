"use client";

import { useEffect, useMemo, useState } from 'react';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { TallerDuelo } from '@/data/talleres-duelo';
import { getAllTalleres } from '@/data/talleres-duelo';

type TallerFormData = {
  fecha: string;
  titulo: string;
  lugar: string;
  activo: boolean;
};

const EMPTY_FORM: TallerFormData = {
  fecha: '',
  titulo: '',
  lugar: '',
  activo: true,
};

export default function DashboardTalleresPage() {
  const [talleres, setTalleres] = useState<TallerDuelo[]>(getAllTalleres());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaller, setEditingTaller] = useState<TallerDuelo | null>(null);
  const [formData, setFormData] = useState<TallerFormData>(EMPTY_FORM);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const totalActivos = useMemo(
    () => talleres.filter((taller) => taller.activo).length,
    [talleres],
  );

  const openCreateModal = () => {
    setEditingTaller(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (taller: TallerDuelo) => {
    setEditingTaller(taller);
    setFormData({
      fecha: taller.fecha,
      titulo: taller.titulo,
      lugar: taller.lugar,
      activo: taller.activo,
    });
    setIsModalOpen(true);
  };

  // Bloquea scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0 });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTaller(null);
    setFormData(EMPTY_FORM);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();

    const payload: TallerDuelo = {
      id: editingTaller?.id ?? `td-${Date.now()}`,
      fecha: formData.fecha.trim(),
      titulo: formData.titulo.trim(),
      lugar: formData.lugar.trim(),
      activo: formData.activo,
    };

    if (!payload.fecha || !payload.titulo || !payload.lugar) {
      showToast(false, 'Completa todos los campos obligatorios.');
      return;
    }

    if (editingTaller) {
      setTalleres((prev) =>
        prev.map((taller) => (taller.id === editingTaller.id ? payload : taller)),
      );
      showToast(true, 'Taller actualizado correctamente.');
    } else {
      setTalleres((prev) => [payload, ...prev]);
      showToast(true, 'Taller creado correctamente.');
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      setTalleres((prev) => prev.filter((taller) => taller.id !== confirmDeleteId));
      showToast(true, 'Taller eliminado.');
    }
    setConfirmDeleteId(null);
  };

  const toggleActivo = (id: string) => {
    setTalleres((prev) =>
      prev.map((taller) =>
        taller.id === id ? { ...taller, activo: !taller.activo } : taller,
      ),
    );
    showToast(true, 'Estado del taller actualizado.');
  };

  return (
    <>
      <Container className="py-10">
        <SectionTitle
          title="Gestion de Talleres de Duelo"
          subtitle={`Administra ${talleres.length} talleres programados. ${totalActivos} activos actualmente.`}
        />

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={openCreateModal}>
            + Nuevo Taller
          </Button>
        </div>

        <div className="mt-8 overflow-x-auto glass rounded-2xl border border-border">
          <table className="min-w-[980px] w-full divide-y divide-border">
            <thead className="bg-black/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                  Taller
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                  Lugar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-textLight uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {talleres.map((taller) => (
                <tr key={taller.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textLight">{taller.fecha}</td>
                  <td className="px-6 py-4 text-sm font-medium text-text">{taller.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textLight">{taller.lugar}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleActivo(taller.id)}
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        taller.activo
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {taller.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(taller)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(taller.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-primary/30 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="mb-4 text-2xl font-bold text-text">
              {editingTaller ? 'Editar taller' : 'Crear nuevo taller'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Fecha"
                name="fecha"
                placeholder="Ej: 28 DE JULIO"
                value={formData.fecha}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, fecha: event.target.value }))
                }
                required
              />
              <Input
                label="Titulo del taller"
                name="titulo"
                value={formData.titulo}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, titulo: event.target.value }))
                }
                required
              />
              <Input
                label="Lugar"
                name="lugar"
                value={formData.lugar}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, lugar: event.target.value }))
                }
                required
              />

              <div className="flex items-center gap-2 rounded-xl border border-border bg-slate-50 px-3 py-2">
                <input
                  id="activo"
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, activo: event.target.checked }))
                  }
                />
                <label htmlFor="activo" className="text-sm text-text">
                  Taller activo
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación de borrado */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="mb-1 text-lg font-bold text-text">¿Eliminar taller?</h3>
            <p className="mb-6 text-sm text-textLight">Esta acción no se puede deshacer. ¿Seguro que deseas continuar?</p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text hover:bg-slate-50">
                Cancelar
              </button>
              <button type="button" onClick={confirmDelete} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl text-sm font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.ok
            ? <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.msg}
        </div>
      )}
    </>
  );
}
