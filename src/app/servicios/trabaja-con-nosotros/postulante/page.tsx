'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectToPostulanteDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(`/servicios/trabaja-con-nosotros/postulante/dashboard${query ? `?${query}` : ''}`);
  }, [router, searchParams]);

  return <div className="flex min-h-screen items-center justify-center bg-[#eef5ff] text-sm font-medium text-primary">Abriendo tu portal de postulante...</div>;
}

export default function PostulantePage() {
  return <Suspense fallback={null}><RedirectToPostulanteDashboard /></Suspense>;
}
