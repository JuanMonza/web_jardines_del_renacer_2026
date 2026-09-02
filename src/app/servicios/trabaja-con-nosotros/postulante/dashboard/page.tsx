'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Calendar, Loader2, LogOut, MapPin, Save, User } from 'lucide-react';
import type { CandidateProfile, JobApplication } from '@/config/candidates';
import { createEmptyCandidateProfile } from '@/config/candidates';
import { VACANCY_DEPARTMENTS, type JobVacancy } from '@/config/vacancies';
import Container from '@/components/ui/Container';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatDate } from '@/lib/utils';

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

function StatusBadge({ status }: { status: JobApplication['status'] }) {
  const className =
    status === 'Seleccionado'
      ? 'border-green-200 bg-green-50 text-green-700'
      : status === 'No continua'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-primary/20 bg-primary/10 text-primary';

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {status}
    </span>
  );
}

function PostulanteDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedVacancyId = searchParams.get('vacante') ?? '';
  const [profile, setProfile] = useState<CandidateProfile>(createEmptyCandidateProfile());
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [notice, setNotice] = useState<{ title: string; description: string; variant: 'success' | 'error' } | null>(null);
  const selectedVacancy = useMemo(
    () => vacancies.find((vacancy) => vacancy.id === requestedVacancyId) ?? null,
    [requestedVacancyId, vacancies],
  );
  const alreadyApplied = selectedVacancy
    ? applications.some((application) => application.vacancyId === selectedVacancy.id)
    : false;

  useEffect(() => {
    async function refreshApplications() {
      try {
        const response = await fetch('/api/postulantes/mis-postulaciones', { cache: 'no-store' });
        if (!response.ok) return;

        const result = (await response.json()) as ApiResponse<JobApplication[]>;
        if (result.success && result.data) {
          // Solo relee el estado persistido: nunca escribe ni reemplaza datos del candidato.
          setApplications(result.data);
        }
      } catch {
        // La actualización en segundo plano no debe interrumpir el uso del portal.
      }
    }

    async function fetchPortalData() {
      try {
        const [profileResponse, applicationsResponse, vacanciesResponse] = await Promise.all([
          fetch('/api/postulantes/perfil', { cache: 'no-store' }),
          fetch('/api/postulantes/mis-postulaciones', { cache: 'no-store' }),
          fetch('/api/vacantes', { cache: 'no-store' }),
        ]);

        if (profileResponse.status === 401 || applicationsResponse.status === 401) {
          router.replace(
            `/login/usuario-vacantes?next=${encodeURIComponent(`/servicios/trabaja-con-nosotros/postulante/dashboard${requestedVacancyId ? `?vacante=${requestedVacancyId}` : ''}`)}`,
          );
          return;
        }

        const profileResult = (await profileResponse.json()) as ApiResponse<CandidateProfile>;
        const applicationsResult = (await applicationsResponse.json()) as ApiResponse<JobApplication[]>;

        if (!profileResponse.ok || !profileResult.success || !profileResult.data) {
          throw new Error(profileResult.message || 'No se pudo cargar tu perfil.');
        }

        if (!applicationsResponse.ok || !applicationsResult.success || !applicationsResult.data) {
          throw new Error(applicationsResult.message || 'No se pudieron cargar tus postulaciones.');
        }

        setProfile(profileResult.data);
        setApplications(applicationsResult.data);
        if (vacanciesResponse.ok) {
          const vacanciesResult = await vacanciesResponse.json() as JobVacancy[];
          if (Array.isArray(vacanciesResult)) setVacancies(vacanciesResult);
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'No se pudo cargar el portal.');
      } finally {
        setLoading(false);
      }
    }

    void fetchPortalData();

    // Refleja cambios hechos por RRHH sin modificar el registro al abrir la página.
    const refreshInterval = window.setInterval(() => void refreshApplications(), 20_000);
    window.addEventListener('focus', refreshApplications);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener('focus', refreshApplications);
    };
  }, [requestedVacancyId, router]);

  const handleLogout = async () => {
    await fetch('/api/postulantes/logout', { method: 'POST' });
    router.replace('/login/usuario-vacantes');
    router.refresh();
  };

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFeedback('');

    try {
      const response = await fetch('/api/postulantes/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const result = (await response.json()) as ApiResponse<CandidateProfile>;

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || 'No se pudo guardar el perfil.');
      }

      setProfile(result.data);
      setFeedback('Perfil actualizado correctamente.');
      setNotice({ title: 'Perfil actualizado', description: 'Tus datos profesionales quedaron guardados correctamente.', variant: 'success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el perfil.';
      setFeedback(message);
      setNotice({ title: 'No fue posible guardar el perfil', description: message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyToSelectedVacancy = async () => {
    if (!selectedVacancy || alreadyApplied) return;
    setApplying(true);
    try {
      const response = await fetch('/api/postulantes/mis-postulaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyId: selectedVacancy.id,
          vacancyTitle: selectedVacancy.title,
          resumeFileName: profile.resumeFileName,
          resumeFileData: profile.resumeFileData,
        }),
      });
      const result = await response.json() as ApiResponse<JobApplication>;
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || 'No fue posible registrar tu postulación.');
      }
      setApplications((current) => [result.data!, ...current]);
      setNotice({ title: 'Postulación recibida', description: `Tu postulación para ${selectedVacancy.title} fue registrada correctamente.`, variant: 'success' });
      router.replace('/servicios/trabaja-con-nosotros/postulante/dashboard');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No fue posible registrar tu postulación.';
      setNotice({ title: 'No fue posible postularte', description: message, variant: 'error' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog open={Boolean(notice)} title={notice?.title ?? ''} description={notice?.description ?? ''} confirmLabel="Entendido" showCancel={false} variant={notice?.variant} onConfirm={() => setNotice(null)} onCancel={() => setNotice(null)} />
      <section className="bg-gradient-to-b from-[#eef5ff] to-white py-12">
        <Container maxWidth="2xl">
          <section className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-[28px] border border-white/80 bg-white/70 p-6 shadow-[0_14px_36px_rgba(35,79,132,0.12)] backdrop-blur-xl"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#7ca5d4] text-2xl font-bold text-white shadow-lg">{profile.photoUrl ? <img src={profile.photoUrl} alt="Foto de perfil" className="h-full w-full object-cover" /> : (profile.fullName || 'P').trim().charAt(0).toUpperCase()}</div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Portal de postulantes</p><h1 className="mt-1 text-2xl font-bold text-text">Hola, {profile.fullName?.split(' ')[0] || 'postulante'}</h1><p className="mt-1 text-sm text-textLight">Mantén tu perfil listo para nuevas oportunidades.</p></div></div><div className="rounded-2xl border border-primary/10 bg-primary/5 px-5 py-3"><p className="text-xs font-semibold text-textLight">Postulaciones</p><p className="mt-1 text-3xl font-bold text-primary">{applications.length}</p></div></section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link href="/servicios/trabaja-con-nosotros">
              <Button variant="secondary">Ver vacantes</Button>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              <LogOut size={16} />
              Cerrar sesion
            </button>
          </div>

          {feedback && (
            <p className="mb-6 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
              {feedback}
            </p>
          )}

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <form
              onSubmit={handleSaveProfile}
              className="rounded-[24px] border border-white/80 bg-white/75 p-6 shadow-[0_14px_36px_rgba(35,79,132,0.12)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between gap-3"><div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"><User className="h-5 w-5 text-primary" /></span>
                <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Información personal</p><h2 className="text-xl font-display text-text">Mi perfil</h2></div></div><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700">Cuenta activa</span>
              </div>

              <div className="space-y-3">
                <details open className="group rounded-2xl border border-primary/10 bg-white/55 p-4"><summary className="cursor-pointer list-none font-bold text-text">Datos de contacto <span className="float-right text-xs font-semibold text-primary">Editar</span></summary><div className="mt-4 space-y-4">
                <Input
                  label="Nombre completo"
                  value={profile.fullName}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, fullName: event.target.value }))
                  }
                  required
                />
                <Input label="Documento" value={profile.documentNumber} disabled />
                <Input label="Correo" type="email" value={profile.email} disabled />
                <Input
                  label="Telefono"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-text">
                    Departamento
                  </label>
                  <select
                    value={profile.department}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, department: event.target.value }))
                    }
                    className="w-full rounded-xl border border-border px-4 py-3 text-text outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
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
                />
                <Input label="Dirección" value={profile.address} onChange={(event) => setProfile((prev) => ({ ...prev, address: event.target.value }))} />
                </div></details>
                <details className="group rounded-2xl border border-primary/10 bg-white/55 p-4"><summary className="cursor-pointer list-none font-bold text-text">Perfil profesional <span className="float-right text-xs font-semibold text-primary">Completar</span></summary><div className="mt-4 space-y-4">
                <Input label="Cargo o profesión" value={profile.professionalTitle} onChange={(event) => setProfile((prev) => ({ ...prev, professionalTitle: event.target.value }))} />
                <div className="grid gap-4 sm:grid-cols-2"><Input label="Años de experiencia" value={profile.yearsExperience} onChange={(event) => setProfile((prev) => ({ ...prev, yearsExperience: event.target.value }))} /><Input label="LinkedIn" value={profile.linkedinUrl} onChange={(event) => setProfile((prev) => ({ ...prev, linkedinUrl: event.target.value }))} /></div>
                <Textarea label="Formación académica" value={profile.education} onChange={(event) => setProfile((prev) => ({ ...prev, education: event.target.value }))} />
                <Textarea label="Perfil profesional" value={profile.about} onChange={(event) => setProfile((prev) => ({ ...prev, about: event.target.value }))} />
                </div></details>
                <details className="group rounded-2xl border border-primary/10 bg-white/55 p-4"><summary className="cursor-pointer list-none font-bold text-text">Hoja de vida <span className="float-right text-xs font-semibold text-primary">{profile.resumeFileName ? 'Cargada' : 'Pendiente'}</span></summary><div className="mt-4">
                <div className="rounded-2xl border border-dashed border-primary/25 bg-primary/[0.03] p-4"><label className="block text-sm font-bold text-text">Hoja de vida / CV</label><p className="mt-1 text-xs text-textLight">PDF o documento de máximo 5 MB.</p><input type="file" accept=".pdf,.doc,.docx" className="mt-3 block w-full text-sm text-textLight file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" onChange={(event) => { const file = event.target.files?.[0]; if (!file || file.size > 5 * 1024 * 1024) return; const reader = new FileReader(); reader.onload = async () => { const fileData = String(reader.result || ''); const response = await fetch('/api/postulantes/cv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName: file.name, fileData }) }); const result = await response.json() as { success?: boolean; data?: { url: string } }; if (response.ok && result.success && result.data) { setProfile((prev) => ({ ...prev, resumeFileName: file.name, resumeFileData: '', cvUrl: result.data!.url })); setFeedback('Hoja de vida cargada y guardada correctamente.'); setNotice({ title: 'Hoja de vida cargada', description: 'Tu CV quedó asociado a tu perfil y estará disponible para el proceso de selección.', variant: 'success' }); } else { setFeedback('No fue posible guardar la hoja de vida.'); setNotice({ title: 'No fue posible cargar la hoja de vida', description: 'Verifica el archivo e intenta nuevamente.', variant: 'error' }); } }; reader.readAsDataURL(file); }} />{profile.resumeFileName && <p className="mt-2 text-xs font-semibold text-emerald-700">CV disponible: {profile.resumeFileName}</p>}</div>
                </div></details></div>

              <Button type="submit" className="mt-6 w-full" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
                {!saving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="space-y-6">
            {selectedVacancy && <section className="rounded-[24px] border border-primary/20 bg-gradient-to-br from-white to-[#eef5ff] p-5 shadow-[0_14px_36px_rgba(35,79,132,0.12)] md:p-6"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm"><Briefcase className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wider text-primary">Vacante seleccionada</p><h2 className="mt-1 text-xl font-display text-text">{selectedVacancy.title}</h2><p className="mt-2 flex items-center gap-2 text-sm text-textLight"><MapPin size={15} />{selectedVacancy.city}, {selectedVacancy.department}</p></div></div><p className="mt-4 text-sm leading-6 text-textLight">{selectedVacancy.summary}</p>{alreadyApplied ? <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Ya registraste una postulación para esta vacante.</div> : <button type="button" onClick={() => void handleApplyToSelectedVacancy()} disabled={applying} className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{applying ? 'Registrando postulación...' : 'Postularme a esta vacante'}</button>}</section>}
            <section className="h-fit rounded-[24px] border border-white/80 bg-white/70 p-5 shadow-[0_14px_36px_rgba(35,79,132,0.12)] backdrop-blur-xl md:p-6">
              <div className="mb-6 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10"><Briefcase className="h-5 w-5 text-primary" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-primary">Seguimiento</p><h2 className="text-xl font-display text-text">Mis postulaciones</h2></div>
              </div>

              {applications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/[0.035] p-6 text-sm text-textLight">
                  Aún no tienes postulaciones activas. Cuando encuentres una vacante de tu interés, tu seguimiento aparecerá aquí.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <article
                      key={application.id}
                      className="rounded-2xl border border-white/80 bg-white/65 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Proceso de selección</p><h3 className="mt-1 font-semibold text-text">{application.vacancyTitle}</h3>
                          <p className="mt-1 flex items-center gap-2 text-sm text-textLight">
                            <Calendar size={14} />
                            {formatDate(application.appliedAt)}
                          </p>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                      <p className="mt-3 border-t border-primary/10 pt-3 text-xs text-textLight">
                        Codigo de seguimiento:{' '}
                        <span className="font-mono text-text">{application.trackingCode}</span>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export default function PostulanteDashboardPage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}><PostulanteDashboardContent /></Suspense>;
}
