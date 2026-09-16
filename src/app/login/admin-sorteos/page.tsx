import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function AdminSorteosLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard-sorteos" sectionLabel="Mercadeo" subtitle="Acceso exclusivo para gestionar incentivos, participantes y ganadores." />;
}
