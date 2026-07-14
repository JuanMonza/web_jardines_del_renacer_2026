'use client';

import { useState, useMemo, useEffect } from 'react';
import { SEDES, Sede } from '@/data/sedes';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import SedeFormModal from '@/data/SedeFormModal';
import { CONTACT_INFO } from '@/config/contact';
import { loadSedes, saveSedes } from '@/lib/sedesStorage';

const DEFAULT_SEDE_IMAGE = '/logos_jr_favico.png';
const LINEA_NACIONAL = CONTACT_INFO.primaryLine.number;

export default function AdminSedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSede, setSelectedSede] = useState<Sede | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState('todos');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const showToast = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    setSedes(loadSedes());
  }, []);

  const filteredSedes = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return sedes.filter((sede) => {
      const municipioMatches =
        selectedDepartamento === 'todos' || sede.departamento === selectedDepartamento;
      const queryMatches =
        !query ||
        sede.nombre.toLowerCase().includes(query) ||
        sede.ciudad.toLowerCase().includes(query) ||
        sede.departamento.toLowerCase().includes(query) ||
        sede.administradora.toLowerCase().includes(query);

      return municipioMatches && queryMatches;
    });
  }, [sedes, searchQuery, selectedDepartamento]);

  const departamentos = useMemo(
    () => Array.from(new Set(sedes.map((sede) => sede.departamento))).sort((a, b) => a.localeCompare(b, 'es')),
    [sedes],
  );

  const handleOpenModal = (sede: Sede | null) => {
    setSelectedSede(sede);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSede(null);
  };

  const handleSave = (sedeToSave: Sede) => {
    const newSedes = selectedSede
      ? sedes.map((s) => (s.id === sedeToSave.id ? sedeToSave : s))
      : [{ ...sedeToSave, id: `sede-${Date.now()}` }, ...sedes];
    setSedes(newSedes);
    saveSedes(newSedes);
    handleCloseModal();
    showToast(true, selectedSede ? 'Sede actualizada correctamente.' : 'Nueva sede creada correctamente.');
  };

  const handleDelete = (sedeId: string) => {
    setConfirmDeleteId(sedeId);
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      const newSedes = sedes.filter((s) => s.id !== confirmDeleteId);
      setSedes(newSedes);
      saveSedes(newSedes);
      showToast(true, 'Sede eliminada.');
    }
    setConfirmDeleteId(null);
  };

  return (
    <>
      <Container className="py-10">
        <SectionTitle
          title="Gestión de Sedes"
          subtitle={`Administra los ${sedes.length} puntos de atención de la empresa.`}
        />

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-[1fr_230px_auto] md:items-center">
          <div className="w-full">
            <Input
              type="search"
              placeholder="Buscar por nombre, ciudad, admin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-textLight">
              Departamento
            </label>
            <select
              value={selectedDepartamento}
              onChange={(event) => setSelectedDepartamento(event.target.value)}
              className="w-full rounded-xl border border-border bg-white/75 px-4 py-3 text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/25"
            >
              <option value="todos">Todos</option>
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => handleOpenModal(null)} variant="primary">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Nueva Sede
          </Button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-white/60 backdrop-blur">
          <table className="w-full table-fixed divide-y divide-border">
            <colgroup>
              <col className="w-[260px]" />
              <col className="w-[190px]" />
              <col className="w-[200px]" />
              <col className="w-[160px]" />
              <col className="w-[160px]" />
            </colgroup>
            <thead className="bg-black/5">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Administrador(a)
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-textLight uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-textLight uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {filteredSedes.map((sede) => (
                  <motion.tr
                    key={sede.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                            src={sede.fotoUrl || DEFAULT_SEDE_IMAGE}
                            alt={sede.nombre}
                            onError={(event) => {
                              if (event.currentTarget.dataset.fallbackApplied === 'true') {
                                return;
                              }
                              event.currentTarget.dataset.fallbackApplied = 'true';
                              event.currentTarget.src = DEFAULT_SEDE_IMAGE;
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text">
                            {sede.nombre}
                          </div>
                          <div className="text-xs text-textLight">{sede.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-textLight">
                      <span className="block truncate">{sede.ciudad}, {sede.departamento}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-textLight">
                      <span className="block truncate">{sede.administradora || <span className="italic opacity-60">No asignado</span>}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-textLight">
                      {sede.telefono || (
                        <span className="font-medium text-primary">{LINEA_NACIONAL}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-medium">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(sede)}
                          className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sede.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Container>

      <SedeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        sede={selectedSede}
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[70] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl text-sm font-semibold text-white transition-all ${
          toast.ok ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.ok
            ? <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {toast.msg}
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
            <h3 className="mb-1 text-lg font-bold text-text">¿Eliminar sede?</h3>
            <p className="mb-6 text-sm text-textLight">
              Esta acción no se puede deshacer. ¿Seguro que deseas continuar?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}