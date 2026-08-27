import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function AdminTalleresLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard-talleres" sectionLabel="Administración de talleres" subtitle="Acceso exclusivo para programar talleres de duelo, galerías e imágenes." />;
}
