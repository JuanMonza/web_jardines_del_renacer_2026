'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  ClipboardList,
  BookHeart,
  LogOut,
} from 'lucide-react';

const ADMIN_STORAGE_KEY = 'adminUser';

const navLinks = [
  {
    href: '/dashboard',
    label: 'Principal',
    icon: LayoutDashboard,
  },
  {
    href: '/dashboard/obituarios',
    label: 'Homenajes',
    icon: BookHeart,
  },
  {
    href: '/dashboard/sedes',
    label: 'Sedes',
    icon: Building,
  },
  {
    href: '/dashboard/talleres',
    label: 'Talleres',
    icon: ClipboardList,
  },
];

function NavLink({
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
      className={`relative flex w-full items-center gap-4 rounded-lg px-4 py-3 text-textLight transition-all duration-200 hover:bg-primary/10 hover:text-text ${
        isActive
          ? 'bg-primary/10 font-semibold text-primary'
          : 'hover:bg-primary/5'
      }`}
    >
      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"></div>}
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

interface DashboardSidebarProps {
  user: { name?: string; email?: string } | null;
  greeting: string;
}

export default function DashboardSidebar({ user, greeting }: DashboardSidebarProps) {
  // TODO: Implementar una función de logout real
  const handleLogout = () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    window.location.href = '/login/admin';
  };

  return (
    <aside className="fixed left-0 top-0 z-20 hidden h-screen w-72 flex-col border-r border-border bg-white lg:flex">
      <div className="flex h-full max-h-screen flex-col">
        {/* Profile Section - Mantenemos el diseño original */}
        <div className="p-6 border-b border-border/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-textLight/80 font-medium mb-1">
                Administrador
              </p>
              <h3 className="truncate text-base font-semibold leading-tight text-text">
                {user?.name || 'Admin JDR'}
              </h3>
              <p className="text-xs text-primary mt-1">{greeting}</p>
            </div>
          </div>
        </div>

        {/* Navigation - Usamos el nuevo sistema de enlaces */}
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid items-start px-4 text-sm font-medium gap-1">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
        </div>

        {/* Footer con Logout y versión */}
        <div className="mt-auto p-4 border-t border-border/80">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400/80 transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}