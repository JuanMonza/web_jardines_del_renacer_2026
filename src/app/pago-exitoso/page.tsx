'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import FadeIn from '@/components/animations/FadeIn';
import Link from 'next/link';

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('processing');

  useEffect(() => {
    // Obtener datos de la transacción de la URL
    const id = searchParams.get('id');
    
    setTransactionId(id);

    // En producción, aquí consultarías el estado de la transacción a tu backend
    // Por ahora, simulamos que el pago fue exitoso
    setTimeout(() => {
      setStatus('approved');
    }, 1000);
  }, [searchParams]);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <Container>
        <FadeIn>
          <div className="max-w-2xl mx-auto">
            {status === 'processing' && (
              <div className="glass rounded-3xl p-12 border border-primary/20 text-center">
                <div className="flex justify-center mb-6">
                  <svg className="animate-spin h-16 w-16 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-text mb-3">
                  Procesando tu pago...
                </h1>
                <p className="text-textLight">
                  Por favor espera mientras verificamos tu transacción
                </p>
              </div>
            )}

            {status === 'approved' && (
              <div className="glass rounded-3xl p-12 border border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent text-center">
                {/* Icono de éxito */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                    <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Título */}
                <h1 className="text-4xl font-bold text-text mb-3">
                  ¡Pago Exitoso!
                </h1>
                <p className="text-xl text-textLight mb-8">
                  Tu pago ha sido procesado correctamente
                </p>

                {/* Detalles */}
                <div className="glass rounded-2xl p-6 border border-primary/20 mb-8 text-left">
                  <h2 className="text-lg font-semibold text-text mb-4">
                    Detalles de la Transacción
                  </h2>
                  <div className="space-y-3">
                    {transactionId && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-textLight">ID de Transacción:</span>
                        <span className="font-mono text-sm text-primary">{transactionId}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-textLight">Fecha:</span>
                      <span className="text-text">{new Date().toLocaleDateString('es-CO', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-textLight">Estado:</span>
                      <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Aprobado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mensaje adicional */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-8">
                  <p className="text-sm text-text flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Hemos enviado la confirmación de tu pago a tu correo electrónico. 
                      Si tienes alguna pregunta, no dudes en contactarnos.
                    </span>
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button variant="primary" className="w-full sm:w-auto">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Volver al Inicio
                    </Button>
                  </Link>
                  <Link href="/contacto">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contactar Soporte
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {status === 'declined' && (
              <div className="glass rounded-3xl p-12 border border-red-500/20 bg-gradient-to-br from-red-500/10 to-transparent text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full p-6">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-text mb-3">
                  Pago Rechazado
                </h1>
                <p className="text-xl text-textLight mb-8">
                  No pudimos procesar tu pago
                </p>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
                  <p className="text-sm text-text">
                    Por favor verifica tu información bancaria e intenta nuevamente.
                  </p>
                </div>

                <Link href="/pagar-plan">
                  <Button variant="primary" className="w-full sm:w-auto">
                    Intentar Nuevamente
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense fallback={null}>
      <PagoExitosoContent />
    </Suspense>
  );
}
