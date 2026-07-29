import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function AdminVacantesLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard-vacantes" sectionLabel="Admin Vacantes" subtitle="Acceso administrativo para la gestión de vacantes laborales." />;
}
