'use client';

import '@/styles/globals.css';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingButtons from '@/components/ui/FloatingButtons';
import Preloader from '@/components/layout/Preloader';
import MonthlyGiveawayPopup from '@/components/layout/MonthlyGiveawayPopup';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/dashboard-aliados') ||
    pathname?.startsWith('/dashboard-vacantes');
  const isLoginRoute = pathname?.startsWith('/login');
  const hideLayoutChrome = isDashboard || isLoginRoute;

  return (
    <html lang="es">
      <head>
        <title>Jardines del Renacer - Dignidad y Paz Eterna</title>
        <meta name="description" content="Servicios funerarios y de previsión con dignidad, respeto y paz eterna para tus seres queridos. Planes personalizados, recorrido 360° y homenajes digitales." />
        <link rel="icon" href="/logos_jr_favico.png" />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <Preloader />
        {!hideLayoutChrome && <MonthlyGiveawayPopup />}
        {!hideLayoutChrome && <Navbar />}
        <main className={!hideLayoutChrome ? "pt-16 flex-1" : "flex-1"}>
          {children}
        </main>
        {!hideLayoutChrome && <Footer />}
        {!hideLayoutChrome && <FloatingButtons />}
      </body>
    </html>
  );
}
