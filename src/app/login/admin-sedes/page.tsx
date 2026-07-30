import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function AdminSedesLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard-sedes" sectionLabel="Admin Sedes" subtitle="Acceso exclusivo para administrar puntos de atención y cobertura nacional." />;
}
