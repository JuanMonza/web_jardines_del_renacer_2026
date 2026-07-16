'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, Calendar, Loader2, LogOut, Save, User } from 'lucide-react';
import type { CandidateProfile, JobApplication } from '@/config/candidates';
import { createEmptyCandidateProfile } from '@/config/candidates';
import { VACANCY_DEPARTMENTS } from '@/config/vacancies';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
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

export default function PostulanteDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CandidateProfile>(createEmptyCandidateProfile());
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    async function fetchPortalData() {
      try {
        const [profileResponse, applicationsResponse] = await Promise.all([
          fetch('/api/postulantes/perfil', { cache: 'no-store' }),
          fetch('/api/postulantes/mis-postulaciones', { cache: 'no-store' }),
        ]);

        if (profileResponse.status === 401 || applicationsResponse.status === 401) {
          router.replace(
            '/login/usuario-vacantes?next=/servicios/trabaja-con-nosotros/postulante/dashboard',
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
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : 'No se pudo cargar el portal.');
      } finally {
        setLoading(false);
      }
    }

    void fetchPortalData();
  }, [router]);

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
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
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
      <PageHero
        title={profile.fullName ? `Hola, ${profile.fullName.split(' ')[0]}` : 'Portal de postulantes'}
        subtitle="Consulta tus postulaciones, revisa el estado de cada proceso y mantén tus datos actualizados."
        image="/images/images-baners/trabaja-con-nosotros.webp"
      />

      <section className="py-16">
        <Container maxWidth="2xl">
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
              className="rounded-2xl border border-primary/15 bg-white/75 p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-display text-text">Mi perfil</h2>
              </div>

              <div className="space-y-4">
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
              </div>

              <Button type="submit" className="mt-6 w-full" disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
                {!saving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <section className="rounded-2xl border border-primary/15 bg-white/75 p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-display text-text">Mis postulaciones</h2>
              </div>

              {applications.length === 0 ? (
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-6 text-sm text-textLight">
                  Aun no encontramos postulaciones asociadas a tu documento y correo.
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <article
                      key={application.id}
                      className="rounded-xl border border-primary/10 bg-white p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-text">{application.vacancyTitle}</h3>
                          <p className="mt-1 flex items-center gap-2 text-sm text-textLight">
                            <Calendar size={14} />
                            {formatDate(application.appliedAt)}
                          </p>
                        </div>
                        <StatusBadge status={application.status} />
                      </div>
                      <p className="mt-3 text-xs text-textLight">
                        Codigo de seguimiento:{' '}
                        <span className="font-mono text-text">{application.trackingCode}</span>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </Container>
      </section>
    </>
  );
}
