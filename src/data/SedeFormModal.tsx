'use client';

import { useState, useEffect } from 'react';
import { Sede, getAllDepartamentos } from '@/data/sedes';
import { motion } from 'framer-motion';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const DEFAULT_SEDE_IMAGE = '/logos_jr_favico.png';

interface SedeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sede: Sede) => void;
  sede: Sede | null;
}

const emptySede: Omit<Sede, 'id'> = {
  nombre: '',
  direccion: '',
  direccionVisible: '',
  administradora: '',
  lat: 0,
  lng: 0,
  telefono: '',
  departamento: 'Risaralda',
  ciudad: '',
  fotoUrl: '',
};

export default function SedeFormModal({
  isOpen,
  onClose,
  onSave,
  sede,
}: SedeFormModalProps) {
  const [formData, setFormData] = useState<Omit<Sede, 'id'>>(emptySede);
  const [imagePreview, setImagePreview] = useState(DEFAULT_SEDE_IMAGE);

  // Bloquea scroll del body y fuerza scroll al top cuando el modal abre
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0 });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (sede) {
      setFormData(sede);
      setImagePreview(sede.fotoUrl || DEFAULT_SEDE_IMAGE);
    } else {
      setFormData(emptySede);
      setImagePreview(DEFAULT_SEDE_IMAGE);
    }
  }, [sede, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'fotoUrl') {
      setImagePreview(value.trim() || DEFAULT_SEDE_IMAGE);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sedeToSave = {
      ...formData,
      id: sede?.id || '', // El ID se manejará en la lógica de guardado
      lat: parseFloat(String(formData.lat)) || 0,
      lng: parseFloat(String(formData.lng)) || 0,
    };
    onSave(sedeToSave);
  };

  if (!isOpen) return null;

  const departamentos = getAllDepartamentos();

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass rounded-3xl border-2 border-primary/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-text mb-6">
          {sede ? 'Editar Sede' : 'Crear Nueva Sede'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre de la Sede"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-text mb-2">
                Departamento
              </label>
              <select
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              >
                {departamentos.map((d) => (
                  <option key={d.slug} value={d.nombre}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Ciudad"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            />
          </div>
          <Input
            label="Dirección Técnica (o Plus Code)"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
          />
          <Input
            label="Dirección Visible (amigable)"
            name="direccionVisible"
            value={formData.direccionVisible}
            onChange={handleChange}
          />
          <Input
            label="Administrador(a)"
            name="administradora"
            value={formData.administradora}
            onChange={handleChange}
          />
          <Input
            label="Teléfono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
          />
          <Input
            label="URL de la Foto"
            name="fotoUrl"
            type="url"
            value={formData.fotoUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/foto.jpg"
          />

          {/* Subir imagen local */}
          <div className="w-full">
            <label className="block text-sm font-medium text-text mb-2">O subir imagen desde tu equipo</label>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-xl border border-border bg-white/75 px-3 py-2 text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-primary/80"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const url = ev.target?.result as string;
                  setFormData((prev) => ({ ...prev, fotoUrl: url }));
                  setImagePreview(url);
                };
                reader.readAsDataURL(file);
              }}
            />
          </div>

          <div className="rounded-2xl border border-border bg-white/55 p-4">
            <p className="mb-3 text-sm font-medium text-text">Vista previa de la foto</p>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Vista previa de sede"
                className="h-20 w-20 rounded-xl border border-border object-cover"
                onError={(event) => {
                  if (event.currentTarget.dataset.fallbackApplied === 'true') {
                    return;
                  }
                  event.currentTarget.dataset.fallbackApplied = 'true';
                  setImagePreview(DEFAULT_SEDE_IMAGE);
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, fotoUrl: '' }));
                    setImagePreview(DEFAULT_SEDE_IMAGE);
                  }}
                >
                  Quitar foto
                </Button>
                {sede?.fotoUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, fotoUrl: sede.fotoUrl || '' }));
                      setImagePreview(sede.fotoUrl || DEFAULT_SEDE_IMAGE);
                    }}
                  >
                    Restaurar actual
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}