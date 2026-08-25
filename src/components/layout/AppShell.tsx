'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingButtons from '@/components/ui/FloatingButtons';
import Preloader from '@/components/layout/Preloader';
import MonthlyGiveawayPopup from '@/components/layout/MonthlyGiveawayPopup';
import CookieConsentBanner from '@/components/legal/CookieConsentBanner';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/dashboard-aliados') ||
    pathname?.startsWith('/dashboard-vacantes');
  const isLoginRoute = pathname?.startsWith('/login');
  const hideLayoutChrome = isDashboard || isLoginRoute;
  return (
    <>
      <Preloader />
      {!hideLayoutChrome && <MonthlyGiveawayPopup />}
      {!hideLayoutChrome && <Navbar />}
      <main className={!hideLayoutChrome ? 'pt-16 flex-1' : 'flex-1'}>{children}</main>
      {!hideLayoutChrome && <Footer />}
      {!hideLayoutChrome && <FloatingButtons />}
      {!hideLayoutChrome && <CookieConsentBanner />}
    </>
  );
}
