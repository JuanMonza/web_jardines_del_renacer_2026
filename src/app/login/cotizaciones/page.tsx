import AdminDatabaseLoginForm from '@/components/login/AdminDatabaseLoginForm';

export default function CotizacionesLoginPage() {
  return <AdminDatabaseLoginForm destination="/dashboard/cotizaciones" sectionLabel="Cotizaciones" subtitle="Acceso exclusivo para la gestión de cotizaciones." />;
}
