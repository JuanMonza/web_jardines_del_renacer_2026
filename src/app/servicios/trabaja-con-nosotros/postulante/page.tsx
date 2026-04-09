'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import FadeIn from '@/components/animations/FadeIn';
import {
  createEmptyCandidateProfile,
  type CandidateProfile,
  type JobApplication,
} from '@/config/candidates';
import { APPLICATION_PROGRESS_STEPS, getApplicationProgress } from '@/lib/applicationProgress';
import { VACANCY_DEPARTMENTS, type JobVacancy } from '@/config/vacancies';
import {
  readCandidateApplications,
  readCandidateProfile,
  writeCandidateApplications,
  writeCandidateProfile,
} from '@/lib/candidateStorage';
import { readJobVacancies } from '@/lib/vacanciesStorage';

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function calculateProfileCompletion(profile: CandidateProfile) {
  const checks = [
    profile.documentNumber,
    profile.fullName,
    profile.email,
    profile.phone,
    profile.department,
    profile.city,
    profile.professionalTitle,
    profile.about,
    profile.resumeFileData,
  ];
  const done = checks.filter((item) => item.trim().length > 0).length;
  return Math.round((done / checks.length) * 100);
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
          El proceso se cerro en estado "No continua".
        </p>
      )}
    </div>
  );
}

export default function PostulantePage() {
  const searchParams = useSearchParams();
  const requestedVacancyId = searchParams.get('vacante') ?? '';
  const requestedTrackingCedula =
    searchParams.get('cedula') ?? searchParams.get('documento') ?? '';
  const requestedTrackingEmail =
    searchParams.get('correo') ?? searchParams.get('email') ?? '';

  const [profile, setProfile] = useState<CandidateProfile>(createEmptyCandidateProfile());
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [trackingDocument, setTrackingDocument] = useState('');
  const [trackingEmail, setTrackingEmail] = useState('');

  useEffect(() => {
    // Centralizamos la carga inicial para perfil, postulaciones y vacantes.
    const syncData = () => {
      setProfile(readCandidateProfile());
      setApplications(readCandidateApplications());
      setVacancies(readJobVacancies());
    };

    syncData();
    window.addEventListener('candidate-storage-updated', syncData);
    return () => window.removeEventListener('candidate-storage-updated', syncData);
  }, []);

  useEffect(() => {
    if (requestedTrackingCedula) {
      setTrackingDocument(requestedTrackingCedula.replace(/\D/g, ''));
    }
    if (requestedTrackingEmail) {
      setTrackingEmail(requestedTrackingEmail.trim().toLowerCase());
    }
  }, [requestedTrackingCedula, requestedTrackingEmail]);

  const selectedVacancy = useMemo(
    () => vacancies.find((vacancy) => vacancy.id === requestedVacancyId) ?? null,
    [vacancies, requestedVacancyId],
  );

  const profileCompletion = useMemo(() => calculateProfileCompletion(profile), [profile]);
  const trackedApplications = useMemo(() => {
    const normalizedDoc = trackingDocument.replace(/\D/g, '');
    const normalizedEmail = trackingEmail.trim().toLowerCase();
    if (!normalizedDoc) {
      return [];
    }

    return applications.filter(
      (application) => {
        const matchesDocument = application.candidateDocument === normalizedDoc;
        if (!matchesDocument) {
          return false;
        }

        if (!normalizedEmail) {
          return true;
        }

        return application.candidateEmail.trim().toLowerCase() === normalizedEmail;
      },
    );
  }, [applications, trackingDocument, trackingEmail]);

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const isAllowed = /(\.pdf|\.doc|\.docx)$/i.test(file.name);
    if (!isAllowed) {
      setFeedback('Sube tu hoja de vida en PDF, DOC o DOCX.');
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setFeedback('El archivo supera 5MB. Usa una version mas liviana.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      // Guardamos el CV en base64 para que el postulante no pierda datos al recargar.
      const data = typeof reader.result === 'string' ? reader.result : '';
      setProfile((prev) => ({
        ...prev,
        resumeFileName: file.name,
        resumeFileData: data,
      }));
      setFeedback('Hoja de vida cargada correctamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    setSaving(true);
    setFeedback('');

    const normalizedDocument = profile.documentNumber.replace(/\D/g, '');
    if (!normalizedDocument || normalizedDocument.length < 6) {
      setFeedback('Ingresa un numero de documento valido.');
      setSaving(false);
      return;
    }

    if (!profile.fullName.trim() || !profile.email.trim() || !profile.phone.trim()) {
      setFeedback('Completa documento, nombre, correo y telefono para guardar tu perfil.');
      setSaving(false);
      return;
    }

    const nextProfile: CandidateProfile = {
      ...profile,
      documentNumber: normalizedDocument,
      updatedAt: new Date().toISOString(),
    };
    setProfile(nextProfile);
    writeCandidateProfile(nextProfile);
    setSaving(false);
    setFeedback('Perfil guardado. Puedes editarlo cuando quieras.');
  };

  const handleApplyToVacancy = () => {
    if (!selectedVacancy) {
      setFeedback('Selecciona una vacante para postularte.');
      return;
    }

    setApplying(true);
    setFeedback('');

    const normalizedDocument = profile.documentNumber.replace(/\D/g, '');

    if (!normalizedDocument || normalizedDocument.length < 6) {
      setFeedback('Completa tu numero de documento antes de postularte.');
      setApplying(false);
      return;
    }

    if (!profile.fullName.trim() || !profile.email.trim() || !profile.phone.trim()) {
      setFeedback('Completa documento, nombre, correo y telefono antes de postularte.');
      setApplying(false);
      return;
    }

    if (!profile.resumeFileData) {
      setFeedback('Debes cargar tu hoja de vida para postularte.');
      setApplying(false);
      return;
    }

    const alreadyApplied = applications.some(
      (application) =>
        application.vacancyId === selectedVacancy.id &&
        application.candidateDocument === normalizedDocument,
    );

    // Evitamos duplicados por vacante + documento para mantener trazabilidad limpia.
    if (alreadyApplied) {
      setFeedback('Ya registraste una postulacion para esta vacante.');
      setApplying(false);
      return;
    }

    const newApplication: JobApplication = {
      id: `app-${Date.now().toString(36)}`,
      vacancyId: selectedVacancy.id,
      vacancyTitle: selectedVacancy.title,
      candidateDocument: normalizedDocument,
      candidateName: profile.fullName.trim(),
      candidateEmail: profile.email.trim(),
      candidatePhone: profile.phone.trim(),
      resumeFileName: profile.resumeFileName || 'Hoja de vida adjunta',
      appliedAt: new Date().toISOString(),
      status: 'Recibida',
      trackingCode: '',
      resumeFileData: ''
    };

    const nextApplications = [newApplication, ...applications];
    setApplications(nextApplications);
    writeCandidateApplications(nextApplications);

    const nextProfile: CandidateProfile = {
      ...profile,
      documentNumber: normalizedDocument,
      updatedAt: new Date().toISOString(),
    };
    setProfile(nextProfile);
    writeCandidateProfile(nextProfile);

    setApplying(false);
    setFeedback(`Postulacion enviada a "${selectedVacancy.title}".`);
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container maxWidth="2xl">
          <FadeIn>
            <SectionTitle
              title="Perfil del Postulante"
              subtitle="Completa tu informacion profesional, sube tu hoja de vida y postulate en linea."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
            <FadeIn>
              <article className="glass rounded-3xl border border-primary/15 p-6 md:p-8">
                <h3 className="text-2xl font-display text-text mb-6">Tu perfil profesional</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Numero de documento"
                      value={profile.documentNumber}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, documentNumber: event.target.value }))
                      }
                      placeholder="Ej: 1023456789"
                    />
                    <Input
                      label="Nombre completo"
                      value={profile.fullName}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, fullName: event.target.value }))
                      }
                      placeholder="Ej: Maria Fernanda Gomez"
                    />
                    <Input
                      label="Correo electronico"
                      type="email"
                      value={profile.email}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Telefono"
                      value={profile.phone}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="3001234567"
                    />
                    <Input
                      label="Cargo o perfil profesional"
                      value={profile.professionalTitle}
                      onChange={(event) =>
                        setProfile((prev) => ({
                          ...prev,
                          professionalTitle: event.target.value,
                        }))
                      }
                      placeholder="Ej: Asesor comercial"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text mb-2">
                        Departamento
                      </label>
                      <select
                        value={profile.department}
                        onChange={(event) =>
                          setProfile((prev) => ({ ...prev, department: event.target.value }))
                        }
                        className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Selecciona un departamento</option>
                        {VACANCY_DEPARTMENTS.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Ciudad"
                      value={profile.city}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, city: event.target.value }))
                      }
                      placeholder="Ej: Pereira"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Años de experiencia"
                      value={profile.yearsExperience}
                      onChange={(event) =>
                        setProfile((prev) => ({
                          ...prev,
                          yearsExperience: event.target.value,
                        }))
                      }
                      placeholder="Ej: 3 anos"
                    />
                    <Input
                      label="Formacion academica"
                      value={profile.education}
                      onChange={(event) =>
                        setProfile((prev) => ({ ...prev, education: event.target.value }))
                      }
                      placeholder="Tecnico, tecnologo o profesional"
                    />
                  </div>

                  <Input
                    label="Habilidades (separadas por coma)"
                    value={profile.skills}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, skills: event.target.value }))
                    }
                    placeholder="Servicio al cliente, ventas, Excel..."
                  />

                  <Textarea
                    label="Resumen profesional"
                    value={profile.about}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, about: event.target.value }))
                    }
                    placeholder="Cuéntanos sobre tu experiencia, logros y fortalezas."
                    rows={4}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Perfil LinkedIn (opcional)"
                      value={profile.linkedinUrl}
                      onChange={(event) =>
                        setProfile((prev) => ({
                          ...prev,
                          linkedinUrl: event.target.value,
                        }))
                      }
                      placeholder="https://linkedin.com/in/..."
                    />
                    <Input
                      label="Portafolio o web (opcional)"
                      value={profile.portfolioUrl}
                      onChange={(event) =>
                        setProfile((prev) => ({
                          ...prev,
                          portfolioUrl: event.target.value,
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Hoja de vida (PDF, DOC, DOCX)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="w-full text-sm text-textLight file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/15 file:text-primary file:font-semibold hover:file:bg-primary/25"
                    />
                    {profile.resumeFileName && (
                      <p className="text-xs text-textLight mt-2">
                        Archivo cargado: <span className="text-text">{profile.resumeFileName}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="primary" onClick={handleSaveProfile} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar perfil'}
                  </Button>
                  <Link href="/servicios/trabaja-con-nosotros">
                    <Button variant="secondary">Volver a vacantes</Button>
                  </Link>
                </div>

                {feedback && <p className="mt-4 text-sm text-primary font-medium">{feedback}</p>}
              </article>
            </FadeIn>

            <section className="space-y-6">
              <FadeIn delay={0.1}>
                <article id="consulta-proceso" className="glass rounded-3xl border border-primary/15 p-6">
                  <h3 className="text-xl font-display text-text mb-3">Estado de tu perfil</h3>
                  <div className="h-3 rounded-full bg-primary/10 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <p className="text-sm text-textLight mt-2">
                    Perfil completado: <span className="font-semibold text-text">{profileCompletion}%</span>
                  </p>

                  {profile.updatedAt && (
                    <p className="text-xs text-textLight mt-3">
                      Ultima actualizacion: {formatDate(profile.updatedAt)}
                    </p>
                  )}
                </article>
              </FadeIn>

              <FadeIn delay={0.15}>
                <article className="glass rounded-3xl border border-primary/15 p-6">
                  <h3 className="text-xl font-display text-text mb-3">Postulacion actual</h3>
                  {selectedVacancy ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-primary/15 bg-white/50 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-primary mb-1">
                          Vacante seleccionada
                        </p>
                        <p className="font-semibold text-text">{selectedVacancy.title}</p>
                        <p className="text-sm text-textLight mt-1">
                          {selectedVacancy.city}, {selectedVacancy.department}
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={handleApplyToVacancy}
                        disabled={applying}
                      >
                        {applying ? 'Enviando postulacion...' : 'Postularme a esta vacante'}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-textLight mb-3">
                        Abre una vacante y pulsa “Aplicar aqui” para postularte desde esta pantalla.
                      </p>
                      <Link href="/servicios/trabaja-con-nosotros">
                        <Button variant="secondary" className="w-full">
                          Ver vacantes disponibles
                        </Button>
                      </Link>
                    </div>
                  )}
                </article>
              </FadeIn>

              <FadeIn delay={0.2}>
                <article className="glass rounded-3xl border border-primary/15 p-6">
                  <h3 className="text-xl font-display text-text mb-3">Tus postulaciones</h3>
                  {applications.length === 0 ? (
                    <p className="text-textLight text-sm">
                      Aun no tienes postulaciones registradas.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                      {applications.map((application) => (
                        <div
                          key={application.id}
                          className="rounded-2xl border border-primary/15 bg-white/50 p-4"
                        >
                          <p className="font-semibold text-text">{application.vacancyTitle}</p>
                          <p className="text-xs text-textLight mt-1">
                            Enviada: {formatDate(application.appliedAt)}
                          </p>
                          <p className="text-xs text-primary mt-1">
                            Estado: {application.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              </FadeIn>

              <FadeIn delay={0.25}>
                <article className="glass rounded-3xl border border-primary/15 p-6">
                  <h3 className="text-xl font-display text-text mb-3">
                    Consulta tu proceso por cedula
                  </h3>

                  <div className="space-y-3">
                    <Input
                      label="Numero de cedula"
                      value={trackingDocument}
                      onChange={(event) => setTrackingDocument(event.target.value)}
                      placeholder="Ingresa tu cedula"
                    />
                    <Input
                      label="Correo electronico (opcional)"
                      type="email"
                      value={trackingEmail}
                      onChange={(event) => setTrackingEmail(event.target.value)}
                      placeholder="Si quieres, filtra tambien por correo"
                    />
                  </div>

                  {trackingDocument ? (
                    trackedApplications.length > 0 ? (
                      <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                        {trackedApplications.map((application) => (
                          <div
                            key={application.id}
                            className="rounded-2xl border border-primary/15 bg-white/50 p-4"
                          >
                            <p className="font-semibold text-text">{application.vacancyTitle}</p>
                            <p className="text-xs text-textLight mt-1">
                              Documento: {application.candidateDocument}
                            </p>
                            <p className="text-xs text-textLight mt-1">
                              Fecha: {formatDate(application.appliedAt)}
                            </p>
                            <p className="text-xs text-primary mt-1">
                              Estado actual: {application.status}
                            </p>
                            <ApplicationProgressTrack status={application.status} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-textLight mt-4">
                        {trackingEmail
                          ? 'No encontramos postulaciones con esa cedula y correo.'
                          : 'No encontramos postulaciones con esa cedula.'}
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-textLight mt-4">
                      Ingresa tu cedula para consultar tu proceso de seleccion.
                    </p>
                  )}
                </article>
              </FadeIn>
            </section>
          </div>
        </Container>
      </section>
    </>
  );
}
