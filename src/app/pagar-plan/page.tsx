'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Image from 'next/image';

export default function PagarPlanPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    cedula: '',
    telefono: '',
    monto: '',
    referencia: '',
  });
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'pse',
      name: 'PSE',
      description: 'Pago seguro con tu banco',
      icon: '',
      color: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
    },
    {
      id: 'card',
      name: 'Tarjeta Débito/Crédito',
      description: 'Visa, Mastercard, American Express',
      icon: '',
      color: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
    },
    {
      id: 'efecty',
      name: 'Efecty',
      description: 'Pago en efectivo en puntos Efecty',
      icon: '',
      color: 'bg-green-500/10 border-green-500/30 hover:border-green-500/60',
    },
    {
      id: 'nequi',
      name: 'Nequi',
      description: 'Pago rápido con tu cuenta Nequi',
      icon: '',
      color: 'bg-pink-500/10 border-pink-500/30 hover:border-pink-500/60',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Aquí iría la integración real con Wompi
    // Ejemplo de configuración Wompi:
    const wompiConfig = {
      public_key: 'pub_test_AQUI_TU_LLAVE_PUBLICA', // Reemplazar con tu llave pública de Wompi
      currency: 'COP',
      amount_in_cents: parseInt(formData.monto) * 100, // Wompi maneja centavos
      reference: formData.referencia || `JR-${Date.now()}`,
      payment_method: {
        type: selectedMethod,
      },
      customer_data: {
        email: formData.email,
        full_name: formData.nombre,
        phone_number: formData.telefono,
        legal_id: formData.cedula,
        legal_id_type: 'CC',
      },
      redirect_url: `${window.location.origin}/pago-exitoso`,
    };

    try {
      // Simulación de llamada a Wompi
      console.log('Iniciando pago con Wompi:', wompiConfig);
      
      // En producción, aquí harías la petición a Wompi
      // const response = await fetch('https://production.wompi.co/v1/transactions', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${wompiConfig.public_key}`,
      //   },
      //   body: JSON.stringify(wompiConfig),
      // });
      
      setTimeout(() => {
        alert('Configuración de pago lista!\n\nEn producción, serás redirigido a Wompi para completar el pago.');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      alert('Error al procesar el pago. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-background via-primary/5 to-background">
      <Container>
        <FadeIn>
          <SectionTitle
            title="Realizar Pago de Plan"
            subtitle="Paga tu plan de manera fácil y segura"
            align="center"
          />

          <div className="mt-12 max-w-4xl mx-auto">
            {/* Wompi Logo & Security Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full border border-primary/20">
                <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-lg font-semibold text-text">
                  Powered by <span className="text-primary">Wompi</span>
                </span>
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-textLight mt-3">
                Transacciones 100% seguras • Encriptación SSL • PCI DSS Compliant
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formulario */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Datos del Cliente */}
                  <div className="glass rounded-2xl p-6 border border-primary/20">
                    <h3 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Datos del Titular
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Nombre Completo *
                        </label>
                        <Input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          required
                          placeholder="Ej: Juan Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Cédula *
                        </label>
                        <Input
                          type="text"
                          name="cedula"
                          value={formData.cedula}
                          onChange={handleChange}
                          required
                          placeholder="Sin puntos ni espacios"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Email *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="correo@ejemplo.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Teléfono *
                        </label>
                        <Input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          required
                          placeholder="3001234567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Monto */}
                  <div className="glass rounded-2xl p-6 border border-primary/20">
                    <h3 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      Monto a Pagar
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Valor (COP) *
                        </label>
                        <Input
                          type="number"
                          name="monto"
                          value={formData.monto}
                          onChange={handleChange}
                          required
                          placeholder="500000"
                          min="10000"
                        />
                        <p className="text-xs text-textLight mt-1">
                          Mínimo: $10,000 COP
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Referencia (Opcional)
                        </label>
                        <Input
                          type="text"
                          name="referencia"
                          value={formData.referencia}
                          onChange={handleChange}
                          placeholder="Ej: Plan-Familiar-001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Métodos de Pago */}
                  <div className="glass rounded-2xl p-6 border border-primary/20">
                    <h3 className="text-xl font-semibold text-text mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Selecciona Método de Pago *
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethod(method.id)}
                          className={`glass rounded-xl p-4 border-2 transition-all cursor-pointer text-left ${
                            selectedMethod === method.id
                              ? 'border-primary bg-primary/10 scale-105'
                              : method.color
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{method.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-text">{method.name}</p>
                              <p className="text-xs text-textLight">{method.description}</p>
                            </div>
                            {selectedMethod === method.id && (
                              <svg className="w-6 h-6 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading || !selectedMethod}
                    className="w-full h-14 text-lg font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Procesando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Continuar al Pago Seguro
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </Button>
                </form>
              </div>

              {/* Información y Seguridad */}
              <div className="space-y-6">
                {/* Resumen */}
                <div className="glass rounded-2xl p-6 border border-primary/20 sticky top-24">
                  <h3 className="text-lg font-semibold text-text mb-4">
                    Resumen del Pago
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-textLight">Monto:</span>
                      <span className="font-semibold text-text">
                        ${formData.monto ? parseInt(formData.monto).toLocaleString('es-CO') : '0'} COP
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-textLight">Método:</span>
                      <span className="font-semibold text-text">
                        {selectedMethod ? paymentMethods.find(m => m.id === selectedMethod)?.name : 'No seleccionado'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-textLight">Estado:</span>
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Seguro
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seguridad */}
                <div className="glass rounded-2xl p-6 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                  <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Pago 100% Seguro
                  </h3>
                  <ul className="space-y-2 text-sm text-textLight">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Certificado SSL activo
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Encriptación de datos
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      PCI DSS Compliant
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Respaldo de Wompi
                    </li>
                  </ul>
                </div>

                {/* Ayuda */}
                <div className="glass rounded-2xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    ¿Necesitas Ayuda?
                  </h3>
                  <p className="text-sm text-textLight mb-3">
                    Nuestro equipo está disponible para asistirte
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Contactar Soporte
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </Container>
    </div>
  );
}
