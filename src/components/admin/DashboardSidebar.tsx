'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ElementType } from 'react';
import { LayoutDashboard, Building2, ClipboardList, BookHeart, LogOut, UserCog, ArrowUpRight } from 'lucide-react';

export type AdminNavigationItem = {
  href: string;
  label: string;
  icon: ElementType;
  external?: boolean;
};

const defaultNavigation: AdminNavigationItem[] = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard },
  { href: '/dashboard/obituarios', label: 'Homenajes', icon: BookHeart },
  { href: '/dashboard/sedes', label: 'Sedes', icon: Building2 },
  { href: '/dashboard/talleres', label: 'Talleres', icon: ClipboardList },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: UserCog },
];

interface DashboardSidebarProps {
  user: { name?: string; email?: string } | null;
  greeting: string;
  workspace?: string;
  navigation?: AdminNavigationItem[];
  onLogout: () => void;
}

export default function DashboardSidebar({
  user,
  greeting,
  workspace = 'Administración',
  navigation = defaultNavigation,
  onLogout,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-3 left-3 z-20 hidden w-[17.5rem] flex-col rounded-[28px] border border-white/55 bg-white/58 p-3 shadow-[0_24px_70px_-38px_rgba(8,37,88,0.75)] backdrop-blur-2xl lg:flex">
      <div className="rounded-2xl border border-white/70 bg-white/45 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#244f91] via-[#3867ad] to-[#9ab8df] text-lg font-bold text-white shadow-lg shadow-blue-950/20">
            {user?.name?.charAt(0).toUpperCase() || 'J'}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#486992]">{workspace}</p>
            <h3 className="truncate text-sm font-bold text-[#16345d]">{user?.name || 'Equipo Jardines'}</h3>
            <p className="truncate text-xs text-[#607a9c]">{greeting}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1.5" aria-label={`Navegación ${workspace}`}>
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#6a83a5]">Espacio de trabajo</p>
        {navigation.map(({ href, label, icon: Icon, external }) => {
          const active = !external && (pathname === href || (href !== '/dashboard' && pathname.startsWith(`${href}/`)));
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${active ? 'bg-[#214b86] text-white shadow-lg shadow-blue-950/15' : 'text-[#345477] hover:bg-white/70 hover:text-[#173c70]'}`}
            >
              <Icon className={`h-[18px] w-[18px] ${active ? 'text-white' : 'text-[#5e84b6] group-hover:text-[#204a85]'}`} />
              <span>{label}</span>
              {external && <ArrowUpRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#9fb9da]/35 pt-3">
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#8c3345] transition-colors hover:bg-red-50/80">
          <LogOut className="h-[18px] w-[18px]" /> Cerrar sesión
        </button>
        <p className="px-3 pt-2 text-[10px] text-[#7088a5]">Jardines del Renacer · Plataforma segura</p>
      </div>
    </aside>
  );
}
