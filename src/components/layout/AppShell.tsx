'use client';

import { useEffect } from 'react';
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
  const enableContentProtection = !hideLayoutChrome;

  useEffect(() => {
    if (!enableContentProtection) {
      document.body.classList.remove('content-protection');
      return;
    }

    document.body.classList.add('content-protection');

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const onCopyCut = (event: ClipboardEvent) => {
      event.preventDefault();
    };

    const onSelectStart = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.closest('input') ||
          target.closest('textarea') ||
          target.closest('[contenteditable="true"]') ||
          target.closest('[data-allow-select="true"]'))
      ) {
        return;
      }
      event.preventDefault();
    };

    const onDragStart = (event: DragEvent) => {
      event.preventDefault();
    };

    const blockedCombos = ['a', 'c', 'x', 's', 'p', 'u', 'i', 'j'];
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const isDevToolsCombo =
        (event.ctrlKey || event.metaKey) && event.shiftKey && (key === 'i' || key === 'j');
      const isBlockedShortcut =
        ((event.ctrlKey || event.metaKey) && blockedCombos.includes(key)) ||
        event.key === 'F12' ||
        isDevToolsCombo;

      if (isBlockedShortcut || event.key === 'PrintScreen') {
        event.preventDefault();
        event.stopPropagation();

        if (event.key === 'PrintScreen' && navigator.clipboard?.writeText) {
          void navigator.clipboard.writeText('');
        }
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'PrintScreen' && navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText('');
      }
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('copy', onCopyCut);
    document.addEventListener('cut', onCopyCut);
    document.addEventListener('selectstart', onSelectStart);
    document.addEventListener('dragstart', onDragStart);
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);

    return () => {
      document.body.classList.remove('content-protection');
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('copy', onCopyCut);
      document.removeEventListener('cut', onCopyCut);
      document.removeEventListener('selectstart', onSelectStart);
      document.removeEventListener('dragstart', onDragStart);
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
    };
  }, [enableContentProtection]);

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
