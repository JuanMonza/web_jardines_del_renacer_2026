'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Building2,
  Briefcase,
  Users,
  Globe,
  LogOut,
} from 'lucide-react';

const mainRoutes = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/obituarios', label: 'Obituarios', icon: Newspaper },
  { href: '/dashboard/sedes', label: 'Sedes', icon: Building2 },
  { href: '/dashboard/vacantes', label: 'Vacantes', icon: Briefcase },
  { href: '/dashboard/vacantes?tab=users', label: 'Usuarios Registrados', icon: Users },
];

const secondaryRoutes = [
  { href: '/', label: 'Vista Pública', icon: Globe },
  { href: '/logout', label: 'Cerrar Sesión', icon: LogOut },
];

function SidebarLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-white/10 ${
        isActive ? 'bg-white/20 text-white font-semibold' : ''
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default function AdminSidebar() {
  return (
    <div className="hidden border-r border-white/10 bg-gray-900/50 lg:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
            <Briefcase className="h-6 w-6" />
            <span>Admin Panel</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Gestión
            </p>
            {mainRoutes.map((route) => (
              <SidebarLink key={route.href} {...route} />
            ))}
            <p className="mt-4 px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              General
            </p>
            {secondaryRoutes.map((route) => (
              <SidebarLink key={route.href} {...route} />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}