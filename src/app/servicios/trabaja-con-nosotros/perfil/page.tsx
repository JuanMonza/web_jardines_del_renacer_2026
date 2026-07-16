'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import type { CandidateProfile } from '@/config/candidates';
import { createEmptyCandidateProfile } from '@/config/candidates';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function PerfilPostulantePage() {
  const [profile, setProfile] = useState<CandidateProfile>(createEmptyCandidateProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/postulantes/perfil');
        if (response.status === 401) {
          router.push('/postulantes/dashboard');
          return;
        }
        if (!response.ok) {
          throw new Error('No se pudo cargar tu perfil.');
        }
        const result = await response.json();
        if (result.success) {
          setProfile(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    toast.dismiss();

    try {
      const response = await fetch('/api/postulantes/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Error al guardar el perfil.');
      }

      toast.success('¡Perfil guardado con éxito!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" />
      <PageHero
        title="Mi Perfil de Postulante"
        subtitle="Mantén tu información actualizada para mejorar tus oportunidades."
        image="/images/images-baners/trabaja-con-nosotros.webp"
      />
      <section className="py-24">
        <Container maxWidth="lg">
          <div className="glass rounded-2xl p-8 border border-primary/15">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nombre Completo"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  placeholder="Tu nombre y apellidos"
                  required
                />
                <Input
                  label="Número de Documento"
                  name="documentNumber"
                  value={profile.documentNumber}
                  readOnly
                  disabled
                  placeholder="Tu número de cédula"
                />
                <Input
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="tu@correo.com"
                  required
                />
                <Input
                  label="Teléfono de Contacto"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                />
                <Input
                  label="Departamento"
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  placeholder="Ej: Risaralda"
                />
                <Input
                  label="Ciudad"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="Ej: Pereira"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-primary/10">
                <Link href="/postulantes/dashboard" className="btn btn-secondary">
                  Volver al Dashboard
                </Link>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Guardando...' : 'Guardar Perfil'}
                  {!isSaving && <Save className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </section>
    </>
  );
}