'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SectionTitle from '@/components/ui/SectionTitle';
import {
  ALLY_DEPARTMENTS,
  ALLY_CATEGORIES,
  DEFAULT_ALLY_DEPARTMENT,
  buildAllyWhatsAppUrl,
  createEmptyAlly,
  getCategoryLabel,
  getDefaultAllyTemplate,
  getSubcategoriesByCategory,
  sanitizeWhatsAppNumber,
  type CommercialAlly,
} from '@/config/allies';
import {
  readCommercialAllies,
  removeCommercialAlly,
  upsertCommercialAlly,
  writeCommercialAllies,
} from '@/lib/alliesStorage';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createTemporaryAllyFromDraft(draft: CommercialAlly): CommercialAlly {
  const now = new Date().toISOString();
  return {
    ...draft,
    id: draft.id || `preview-${Date.now()}`,
    name: draft.name || 'Aliado Comercial',
    departamento: draft.departamento || DEFAULT_ALLY_DEPARTMENT,
    categorySlug: draft.categorySlug || ALLY_CATEGORIES[0].slug,
    subcategory:
      draft.subcategory || getSubcategoriesByCategory(draft.categorySlug)[0] || '',
    whatsappTemplate:
      draft.whatsappTemplate ||
      getDefaultAllyTemplate(draft.categorySlug, draft.subcategory),
    createdAt: draft.createdAt || now,
    updatedAt: now,
  };
}

export default function AliadosAdminPanel() {
  const [allies, setAllies] = useState<CommercialAlly[]>([]);
  const [draft, setDraft] = useState<CommercialAlly>(createEmptyAlly());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setAllies(readCommercialAllies());
  }, []);

  const availableSubcategories = useMemo(
    () => getSubcategoriesByCategory(draft.categorySlug),
    [draft.categorySlug],
  );

  useEffect(() => {
    if (availableSubcategories.length === 0) {
      return;
    }

    if (!availableSubcategories.includes(draft.subcategory)) {
      setDraft((prev) => ({
        ...prev,
        subcategory: availableSubcategories[0],
      }));
    }
  }, [availableSubcategories, draft.subcategory]);

  const resetDraft = () => {
    setDraft(createEmptyAlly());
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback('');

    if (!draft.name.trim()) {
      setFeedback('Debes ingresar el nombre del aliado.');
      return;
    }

    if (!draft.departamento.trim()) {
      setFeedback('Debes seleccionar un departamento.');
      return;
    }

    if (!draft.logo.trim()) {
      setFeedback('Agrega el logo del aliado (URL o archivo).');
      return;
    }

    const now = new Date().toISOString();
    const template =
      draft.whatsappTemplate.trim() ||
      getDefaultAllyTemplate(draft.categorySlug, draft.subcategory);
    const baseId = `${draft.categorySlug}-${slugify(draft.name)}` || `aliado-${Date.now()}`;

    const existing = editingId
      ? allies.find((ally) => ally.id === editingId)
      : null;

    const allyRecord: CommercialAlly = {
      ...draft,
      id: editingId || `${baseId}-${Date.now().toString(36).slice(-4)}`,
      name: draft.name.trim(),
      departamento: draft.departamento.trim(),
      subcategory: draft.subcategory.trim(),
      logo: draft.logo.trim(),
      address: draft.address.trim(),
      description: draft.description?.trim() || '',
      whatsappNumber: sanitizeWhatsAppNumber(draft.whatsappNumber),
      whatsappTemplate: template,
      actionLabel: draft.actionLabel.trim() || 'Mas informacion',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    const next = upsertCommercialAlly(allies, allyRecord);
    setAllies(next);
    writeCommercialAllies(next);
    resetDraft();
    setFeedback(editingId ? 'Aliado actualizado correctamente.' : 'Aliado creado correctamente.');
  };

  const handleDelete = (ally: CommercialAlly) => {
    const confirmed = window.confirm(`¿Deseas eliminar el aliado "${ally.name}"?`);
    if (!confirmed) {
      return;
    }
    const next = removeCommercialAlly(allies, ally.id);
    setAllies(next);
    writeCommercialAllies(next);
    if (editingId === ally.id) {
      resetDraft();
    }
    setFeedback('Aliado eliminado correctamente.');
  };

  const handleEdit = (ally: CommercialAlly) => {
    setDraft({ ...ally });
    setEditingId(ally.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback(`Editando: ${ally.name}`);
  };

  const handleLogoFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback('El archivo es muy grande. Usa una imagen de maximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      setDraft((prev) => ({ ...prev, logo: value }));
      setFeedback('Logo cargado desde archivo.');
    };
    reader.readAsDataURL(file);
  };

  const previewAlly = createTemporaryAllyFromDraft(draft);

  return (
    <div className="min-h-screen pt-2 pb-10">
      <SectionTitle
        title="Panel de Aliados Comerciales"
        subtitle="Crea, edita o elimina aliados por categoria, subcategoria y departamento."
        align="center"
        className="mb-8"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8">
        <section className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
          <h3 className="text-2xl font-display text-text mb-6">
            {editingId ? 'Editar aliado' : 'Crear nuevo aliado'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre del aliado"
              value={draft.name}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="Ej: Guarderia Huellas Felices"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Categoria</label>
                <select
                  value={draft.categorySlug}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      categorySlug: event.target.value,
                      subcategory: getSubcategoriesByCategory(event.target.value)[0] || '',
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {ALLY_CATEGORIES.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Departamento</label>
                <select
                  value={draft.departamento}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, departamento: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {ALLY_DEPARTMENTS.map((departamento) => (
                    <option key={departamento} value={departamento}>
                      {departamento}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Subcategoria</label>
                <select
                  value={draft.subcategory}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, subcategory: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {availableSubcategories.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Direccion"
              value={draft.address}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, address: event.target.value }))
              }
              placeholder="Ej: Carrera 15 # 102 - 45, Pereira"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="WhatsApp del administrador"
                value={draft.whatsappNumber}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, whatsappNumber: event.target.value }))
                }
                placeholder="573001112233"
                required
              />

              <Input
                label="Texto del boton"
                value={draft.actionLabel}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, actionLabel: event.target.value }))
                }
                placeholder="Mas informacion"
              />
            </div>

            <Input
              label="Logo (URL o ruta publica)"
              value={draft.logo}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, logo: event.target.value }))
              }
              placeholder="/images/logos_aliados_jr/tu_logo.png"
            />

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Subir logo desde archivo (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                className="w-full text-sm text-textLight file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/15 file:text-primary file:font-semibold hover:file:bg-primary/25"
              />
            </div>

            <Textarea
              label='Mensaje WhatsApp (usa "{{nombre}}" para insertar el nombre)'
              value={draft.whatsappTemplate}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, whatsappTemplate: event.target.value }))
              }
              placeholder='Hola, quiero mas informacion de "{{nombre}}".'
              rows={3}
            />

            <Textarea
              label="Descripcion corta (opcional)"
              value={draft.description}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, description: event.target.value }))
              }
              placeholder="Describe brevemente el servicio del aliado."
              rows={2}
            />

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, featured: event.target.checked }))
                }
                className="accent-primary"
              />
              Mostrar como destacado (aparece en Home)
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" variant="primary">
                {editingId ? 'Guardar cambios' : 'Crear aliado'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetDraft}>
                Limpiar formulario
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={() => setEditingId(null)}>
                  Cancelar edicion
                </Button>
              )}
            </div>
          </form>

          {feedback && <p className="mt-4 text-sm text-primary font-medium">{feedback}</p>}
        </section>

        <section className="space-y-6">
          <article className="glass rounded-3xl border border-primary/15 p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Vista previa CTA</h3>
            <div className="rounded-2xl border border-primary/15 bg-white/40 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-primary mb-1">
                {getCategoryLabel(previewAlly.categorySlug)} - {previewAlly.subcategory}
              </p>
              <p className="text-xs text-textLight mb-1">Departamento: {previewAlly.departamento}</p>
              <p className="font-semibold text-text mb-1">{previewAlly.name}</p>
              <p className="text-sm text-textLight mb-3">
                Mensaje: {previewAlly.whatsappTemplate || getDefaultAllyTemplate(previewAlly.categorySlug, previewAlly.subcategory)}
              </p>
              <a
                href={buildAllyWhatsAppUrl(previewAlly)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" className="w-full">
                  {previewAlly.actionLabel || 'Mas informacion'}
                </Button>
              </a>
            </div>
          </article>

          <article className="glass rounded-3xl border border-primary/15 p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h3 className="text-lg font-semibold text-text">Aliados cargados</h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                {allies.length} registros
              </span>
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
              {allies.map((ally) => (
                <div
                  key={ally.id}
                  className="rounded-2xl border border-primary/15 bg-white/40 p-4"
                >
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-xl border border-primary/20 bg-white p-2 flex items-center justify-center overflow-hidden shrink-0">
                      {ally.logo ? (
                        <img src={ally.logo} alt={ally.name} className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-xs text-textLight">Sin logo</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text line-clamp-1">{ally.name}</p>
                      <p className="text-xs text-primary uppercase tracking-[0.16em]">
                        {getCategoryLabel(ally.categorySlug)} - {ally.subcategory}
                      </p>
                      <p className="text-xs text-textLight mt-1">{ally.departamento}</p>
                      <p className="text-xs text-textLight line-clamp-1 mt-1">{ally.address}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => handleEdit(ally)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/25 text-primary hover:bg-primary/10 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ally)}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
