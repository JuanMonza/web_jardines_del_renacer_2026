'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('adminUser');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar con perfil */}
      <aside className="fixed left-0 top-0 h-screen w-72 glass border-r border-border shadow-xl">
        {/* Profile Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-textLight font-medium mb-1">
                Administrador
              </p>
              <h3 className="text-text font-semibold text-base leading-tight">
                {user?.name || 'Admin Obituarios Jardines del Renacer'}
              </h3>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-8">
          {/* Principal */}
          <div>
            <p className="text-xs uppercase tracking-wider text-textLight font-semibold mb-4 px-3">
              Principal
            </p>
            <div className="space-y-1">
              <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-text hover:text-primary transition-all group"
              >
                <svg className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Gestión */}
          <div>
            <p className="text-xs uppercase tracking-wider text-textLight font-semibold mb-4 px-3">
              Gestión
            </p>
            <div className="space-y-1">
              <Link 
                href="/dashboard/obituarios" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 text-text hover:text-primary transition-all group"
              >
                <svg className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Obituarios</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Footer Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <div className="glass rounded-xl p-4 border border-primary/20">
            <p className="text-xs text-primary font-medium mb-1">Jardines del Renacer</p>
            <p className="text-[10px] text-textLight">Sistema de Gestión v1.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
