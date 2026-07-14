'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import SectionTitle from '@/components/ui/SectionTitle';
import {
  APPLICATION_STATUS_OPTIONS,
  type JobApplication,
} from '@/config/candidates';
import {
  VACANCY_DEPARTMENTS,
  createEmptyVacancy,
  type JobVacancy,
} from '@/config/vacancies';
import {
  readCandidateApplications,
  writeCandidateApplications,
} from '@/lib/candidateStorage';
import { APPLICATION_PROGRESS_STEPS, getApplicationProgress } from '@/lib/applicationProgress';
import {
  readJobVacancies,
  removeJobVacancy,
  upsertJobVacancy,
  writeJobVacancies,
} from '@/lib/vacanciesStorage';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseLines(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function createDraftFromVacancy(vacancy: JobVacancy) {
  return {
    ...vacancy,
    requirementsText: vacancy.requirements.join('\n'),
    benefitsText: vacancy.benefits.join('\n'),
  };
}

type VacancyDraft = JobVacancy & {
  requirementsText: string;
  benefitsText: string;
};

type VacanciesSession = {
  cedula: string;
  role: string;
  name: string;
};

function createInitialDraft(): VacancyDraft {
  const base = createEmptyVacancy();
  return {
    ...base,
    requirementsText: '',
    benefitsText: '',
  };
}

const APPLICATION_PROGRESS_SHORT_LABELS: Record<
  (typeof APPLICATION_PROGRESS_STEPS)[number],
  string
> = {
  Recibida: 'Recibida',
  'En revision': 'Revision',
  Entrevista: 'Entrevista',
  'Prueba tecnica': 'Prueba',
  Seleccionado: 'Seleccionado',
};

function ApplicationProgressTrack({ status }: { status: JobApplication['status'] }) {
  const progress = getApplicationProgress(status);
  const barClass = progress.isRejected ? 'bg-red-500' : 'bg-primary';
  const trailClass = progress.isRejected ? 'bg-red-100' : 'bg-primary/15';

  return (
    <div className="mt-3 rounded-xl border border-primary/10 bg-white/70 p-3">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-[11px] uppercase tracking-[0.12em] text-textLight">Ruta del proceso</p>
        <span
          className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
            progress.isRejected
              ? 'text-red-700 bg-red-100 border border-red-200'
              : progress.isFinished
                ? 'text-green-700 bg-green-100 border border-green-200'
                : 'text-primary bg-primary/10 border border-primary/20'
          }`}
        >
          {status}
        </span>
      </div>

      <div className={`relative h-1 rounded-full ${trailClass}`}>
        <span
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${barClass}`}
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      <div className="mt-2 grid grid-cols-5 gap-2">
        {APPLICATION_PROGRESS_STEPS.map((step, index) => {
          const reached = !progress.isRejected && index <= progress.activeIndex;
          const isCurrent = !progress.isRejected && index === progress.activeIndex;

          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <span
                className={`h-3 w-3 rounded-full border transition-colors ${
                  reached
                    ? 'bg-primary border-primary'
                    : 'bg-white border-primary/25'
                } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
              />
              <span className="text-[10px] text-textLight text-center leading-tight">
                {APPLICATION_PROGRESS_SHORT_LABELS[step]}
              </span>
            </div>
          );
        })}
      </div>

      {progress.isRejected && (
        <p className="text-xs text-red-700 mt-2">
          Proceso finalizado en estado "No continua".
        </p>
      )}
    </div>
  );
}

export default function VacantesAdminPanel() {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [session, setSession] = useState<VacanciesSession | null>(null);
  const [draft, setDraft] = useState<VacancyDraft>(createInitialDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const rawSession = localStorage.getItem('vacanciesAdminUser');
    if (rawSession) {
      try {
        setSession(JSON.parse(rawSession) as VacanciesSession);
      } catch {
        setSession(null);
      }
    }

    setVacancies(readJobVacancies());
    setApplications(readCandidateApplications());

    const syncFromStorage = () => {
      setVacancies(readJobVacancies());
      setApplications(readCandidateApplications());
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('candidate-storage-updated', syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('candidate-storage-updated', syncFromStorage);
    };
  }, []);

  const ownedVacancies = useMemo(() => {
    if (!session?.cedula) {
      return vacancies;
    }

    return vacancies.filter((vacancy) => {
      return !vacancy.createdByCedula || vacancy.createdByCedula === session.cedula;
    });
  }, [session?.cedula, vacancies]);

  const ownedApplications = useMemo(() => {
    const visibleVacancyIds = new Set(ownedVacancies.map((vacancy) => vacancy.id));
    return applications.filter((application) => visibleVacancyIds.has(application.vacancyId));
  }, [applications, ownedVacancies]);

  const filteredVacancies = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return ownedVacancies;
    }
    return ownedVacancies.filter((vacancy) => {
      return (
        vacancy.title.toLowerCase().includes(query) ||
        vacancy.area.toLowerCase().includes(query) ||
        vacancy.city.toLowerCase().includes(query) ||
        vacancy.department.toLowerCase().includes(query)
      );
    });
  }, [ownedVacancies, search]);

  const resetDraft = () => {
    setDraft(createInitialDraft());
    setEditingId(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback('');

    if (!draft.title.trim()) {
      setFeedback('Debes ingresar el cargo de la vacante.');
      return;
    }

    if (!draft.area.trim()) {
      setFeedback('Debes ingresar el area.');
      return;
    }

    if (!draft.city.trim()) {
      setFeedback('Debes ingresar la ciudad.');
      return;
    }

    if (!draft.summary.trim()) {
      setFeedback('Debes ingresar un resumen de la vacante.');
      return;
    }

    const now = new Date().toISOString();
    const current = editingId ? vacancies.find((vacancy) => vacancy.id === editingId) : null;
    const record: JobVacancy = {
      ...draft,
      id:
        editingId ||
        `vac-${slugify(draft.title || 'vacante')}-${Date.now().toString(36).slice(-4)}`,
      title: draft.title.trim(),
      area: draft.area.trim(),
      city: draft.city.trim(),
      contractType: draft.contractType.trim() || 'Tiempo completo',
      schedule: draft.schedule.trim(),
      salary: draft.salary.trim() || 'A convenir',
      experience: draft.experience.trim(),
      summary: draft.summary.trim(),
      requirements: parseLines(draft.requirementsText),
      benefits: parseLines(draft.benefitsText),
      postedAt: draft.postedAt || now.slice(0, 10),
      createdAt: current?.createdAt || now,
      updatedAt: now,
      createdByCedula: current?.createdByCedula || session?.cedula || '',
      createdByName: current?.createdByName || session?.name || '',
    };

    const next = upsertJobVacancy(vacancies, record);
    setVacancies(next);
    writeJobVacancies(next);
    resetDraft();
    setFeedback(editingId ? 'Vacante actualizada correctamente.' : 'Vacante creada correctamente.');
  };

  const handleEdit = (vacancy: JobVacancy) => {
    setDraft(createDraftFromVacancy(vacancy));
    setEditingId(vacancy.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFeedback(`Editando vacante: ${vacancy.title}`);
  };

  const handleDelete = (vacancy: JobVacancy) => {
    const confirmed = window.confirm(`¿Deseas eliminar la vacante "${vacancy.title}"?`);
    if (!confirmed) {
      return;
    }
    const next = removeJobVacancy(vacancies, vacancy.id);
    setVacancies(next);
    writeJobVacancies(next);
    if (editingId === vacancy.id) {
      resetDraft();
    }
    setFeedback('Vacante eliminada correctamente.');
  };

  const handleUpdateApplicationStatus = (
    applicationId: string,
    status: JobApplication['status'],
  ) => {
    const target = applications.find((application) => application.id === applicationId);
    const next = applications.map((application) =>
      application.id === applicationId ? { ...application, status } : application,
    );
    setApplications(next);
    writeCandidateApplications(next);
    setFeedback('Estado de postulacion actualizado. Enviando notificacion por correo...');

    if (!target || !target.candidateEmail) {
      setFeedback('Estado actualizado. No se envio correo porque la postulacion no tiene email.');
      return;
    }

    void (async () => {
      try {
        const response = await fetch('/api/vacantes/notificar-estado', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateName: target.candidateName,
            candidateEmail: target.candidateEmail,
            candidateDocument: target.candidateDocument,
            vacancyTitle: target.vacancyTitle,
            trackingCode: target.trackingCode,
            status,
          }),
        });

        const result = (await response.json()) as { ok: boolean; message?: string };
        if (!response.ok || !result.ok) {
          setFeedback(
            `Estado actualizado, pero no se pudo notificar por correo: ${
              result.message || 'Error de envio'
            }`,
          );
          return;
        }

        setFeedback('Estado de postulacion actualizado y notificado por correo.');
      } catch {
        setFeedback('Estado actualizado, pero fallo la notificacion por correo.');
      }
    })();
  };

  return (
    <div className="min-h-screen pt-2 pb-10">
      <SectionTitle
        title="Panel de Vacantes"
        subtitle={session?.name ? `Administra las vacantes creadas por ${session.name}.` : 'Administra vacantes de Trabaja con Nosotros en un panel exclusivo.'}
        align="left"
        className="mb-8"
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-8">
        <section className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
          <h3 className="text-2xl font-display text-text mb-6">
            {editingId ? 'Editar vacante' : 'Crear nueva vacante'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Cargo"
              value={draft.title}
              onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Ej: Auxiliar de servicio al cliente"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Input
                label="Area"
                value={draft.area}
                onChange={(event) => setDraft((prev) => ({ ...prev, area: event.target.value }))}
                placeholder="Ej: Comercial"
                required
              />

              <div>
                <label className="block text-sm font-medium text-text mb-2">Departamento</label>
                <select
                  value={draft.department}
                  onChange={(event) =>
                    setDraft((prev) => ({ ...prev, department: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  {VACANCY_DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Ciudad"
                value={draft.city}
                onChange={(event) => setDraft((prev) => ({ ...prev, city: event.target.value }))}
                placeholder="Ej: Pereira"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">Modalidad</label>
                <select
                  value={draft.modality}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      modality: event.target.value as JobVacancy['modality'],
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                >
                  <option value="Presencial">Presencial</option>
                  <option value="Hibrido">Hibrido</option>
                  <option value="Remoto">Remoto</option>
                </select>
              </div>

              <Input
                label="Tipo de contrato"
                value={draft.contractType}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contractType: event.target.value }))
                }
                placeholder="Tiempo completo"
              />

              <Input
                label="Fecha de publicacion"
                type="date"
                value={draft.postedAt}
                onChange={(event) => setDraft((prev) => ({ ...prev, postedAt: event.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Horario"
                value={draft.schedule}
                onChange={(event) => setDraft((prev) => ({ ...prev, schedule: event.target.value }))}
                placeholder="Lunes a viernes"
              />
              <Input
                label="Salario"
                value={draft.salary}
                onChange={(event) => setDraft((prev) => ({ ...prev, salary: event.target.value }))}
                placeholder="A convenir"
              />
              <Input
                label="Experiencia"
                value={draft.experience}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, experience: event.target.value }))
                }
                placeholder="1+ ano"
              />
            </div>

            <Textarea
              label="Resumen de la vacante"
              value={draft.summary}
              onChange={(event) => setDraft((prev) => ({ ...prev, summary: event.target.value }))}
              placeholder="Describe la vacante en pocas lineas."
              rows={3}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Requisitos (uno por linea)"
                value={draft.requirementsText}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, requirementsText: event.target.value }))
                }
                placeholder={'Ej:\nComunicacion asertiva\nManejo de Excel'}
                rows={5}
              />

              <Textarea
                label="Beneficios (uno por linea)"
                value={draft.benefitsText}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, benefitsText: event.target.value }))
                }
                placeholder={'Ej:\nEstabilidad laboral\nCapacitacion continua'}
                rows={5}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-text">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, featured: event.target.checked }))
                }
                className="accent-primary"
              />
              Marcar como vacante destacada
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="submit" variant="primary">
                {editingId ? 'Guardar cambios' : 'Crear vacante'}
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

        <section className="glass rounded-3xl border border-primary/15 p-6 md:p-7">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-xl font-display text-text">Vacantes cargadas</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                {ownedVacancies.length} vacantes
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-green-500/25 bg-green-500/10 text-green-700">
                {ownedApplications.length} postulaciones
              </span>
            </div>
          </div>

          <Input
            label="Buscar en listado"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cargo, area, ciudad o departamento..."
          />

          <div className="mt-4 space-y-3 max-h-[660px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredVacancies.map((vacancy) => (
              <article
                key={vacancy.id}
                className="rounded-2xl border border-primary/15 bg-white/45 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-text line-clamp-1">{vacancy.title}</p>
                    <p className="text-xs text-primary uppercase tracking-[0.16em] mt-1">
                      {vacancy.area}
                    </p>
                    <p className="text-xs text-textLight mt-1">
                      {vacancy.city}, {vacancy.department}
                    </p>
                    <p className="text-xs text-textLight mt-1">
                      {vacancy.modality} | {vacancy.contractType}
                    </p>
                  </div>
                  {vacancy.featured && (
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-full border border-green-500/25 bg-green-500/10 text-green-700">
                      Destacada
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(vacancy)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/25 text-primary hover:bg-primary/10 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(vacancy)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-primary/10">
            <h4 className="text-lg font-display text-text mb-3">Postulaciones recibidas</h4>
            {ownedApplications.length === 0 ? (
              <p className="text-sm text-textLight">
                Aun no hay postulaciones registradas.
              </p>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                {ownedApplications.map((application) => (
                  <article
                    key={application.id}
                    className="rounded-2xl border border-primary/15 bg-white/45 p-4"
                  >
                    <p className="font-semibold text-text line-clamp-1">
                      {application.vacancyTitle}
                    </p>
                    <p className="text-sm text-textLight mt-1">
                      {application.candidateName || 'Postulante'} - {application.candidateEmail}
                    </p>
                    <p className="text-xs text-textLight mt-1">
                      Codigo: <span className="font-mono text-text">{application.trackingCode}</span>
                    </p>
                    <p className="text-xs text-textLight mt-1">
                      Documento: {application.candidateDocument || 'No registrado'}
                    </p>
                    {application.candidatePhone && (
                      <p className="text-xs text-textLight mt-1">
                        Tel: {application.candidatePhone}
                      </p>
                    )}
                    {application.resumeFileName && (
                      <p className="text-xs text-textLight mt-1">
                        HV: {application.resumeFileName}
                      </p>
                    )}
                    {application.resumeFileData ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <a
                          href={application.resumeFileData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/25 text-primary hover:bg-primary/10 transition-colors"
                        >
                          Ver CV
                        </a>
                        <a
                          href={application.resumeFileData}
                          download={application.resumeFileName || `cv-${application.candidateDocument || 'postulante'}`}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-primary/25 text-primary hover:bg-primary/10 transition-colors"
                        >
                          Descargar CV
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700 mt-2">
                        CV no disponible en este registro.
                      </p>
                    )}
                    <div className="mt-2">
                      <label className="block text-xs text-textLight mb-1">Estado</label>
                      <select
                        value={application.status}
                        onChange={(event) =>
                          handleUpdateApplicationStatus(
                            application.id,
                            event.target.value as JobApplication['status'],
                          )
                        }
                        className="w-full px-3 py-2 rounded-lg border border-primary/20 bg-white text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        {APPLICATION_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                    <ApplicationProgressTrack status={application.status} />
                    <p className="text-xs text-textLight mt-1">
                      Fecha: {new Date(application.appliedAt).toLocaleString('es-CO')}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
