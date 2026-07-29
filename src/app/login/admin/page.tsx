import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function AdminLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard" sectionLabel="Administración" subtitle="Acceso administrativo seguro." />;
}
