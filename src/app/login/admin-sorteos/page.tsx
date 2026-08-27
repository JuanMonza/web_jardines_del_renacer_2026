import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function AdminSorteosLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard-sorteos" sectionLabel="Administración de sorteos" subtitle="Acceso exclusivo para gestionar sorteos, participantes y ganadores." />;
}
