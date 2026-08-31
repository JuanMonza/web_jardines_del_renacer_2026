import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function AdminSorteosLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard-sorteos" sectionLabel="Administración de incentivos" subtitle="Acceso exclusivo para gestionar incentivos, participantes y ganadores." />;
}
