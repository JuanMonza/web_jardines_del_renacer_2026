'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';

/**
 * Componente que representa la página de inicio de sesión exclusiva para Clientes.
 * Permite la validación de credenciales (actualmente hardcodeadas) y maneja el
 * estado de la solicitud y visualización de errores.
 */
export default function ClientLoginPage() {
  const router = useRouter();
  
  // Estado para capturar los datos que ingresa el usuario
  const [formData, setFormData] = useState({
    cedula: '',
    password: '',
  });
  
  // Estado para manejar los mensajes de error mostrados en pantalla
  const [error, setError] = useState('');
  
  // Estado para prevenir múltiples envíos y mostrar indicador de carga
  const [loading, setLoading] = useState(false);

  /**
   * Valida si el formato de la cédula es correcto (entre 6 y 10 números, sin espacios ni guiones)
   */
  const validateCedula = (cedula: string): boolean => {
    const cleanCedula = cedula.replace(/[\s-]/g, '');
    return /^\d{6,10}$/.test(cleanCedula);
  };

  /**
   * Función asíncrona que maneja el envío del formulario.
   * Realiza validaciones locales y luego intenta autenticar al usuario.
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    // Validación de integridad de la cédula
    if (!validateCedula(formData.cedula)) {
      setError('Por favor ingresa una cedula valida (6-10 digitos).');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/iam/client/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ cedula: formData.cedula, password: formData.password }),
      });
      const payload = await response.json() as { message?: string };
      if (!response.ok) {
        setError(payload.message ?? 'Cédula o contraseña incorrectas.');
        return;
      }
      router.push('/cliente/dashboard');
    } catch {
      setError('Error al iniciar sesion. Por favor intenta nuevamente.');
    } finally {
      // Ocultar estado de carga independientemente del resultado
      setLoading(false);
    }
  };

  /**
   * Controla los cambios de cada input de texto, actualizando el estado `formData` correspondiente
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
    // Limpiar errores si el usuario comienza a modificar el campo
    setError('');
  };

  return (
    <AuthLoginLayout
      title="Login"
      subtitle="Ingresa al portal de clientes con tu cedula y contrasena."
      sectionLabel="Ingreso Clientes"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <LoginTextField
          label="Cedula"
          name="cedula"
          type="text"
          value={formData.cedula}
          onChange={handleChange}
          placeholder="Ingresa tu cedula"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <LoginTextField
          label="Contrasena"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••••"
          required
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
            </svg>
          }
        />

        <div className="flex items-center justify-between text-sm text-black/70">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="accent-[#2f5bd6]" />
            Recordarme
          </label>
          <Link href="/contacto" className="hover:text-[#2f5bd6] transition-colors">
            Olvide mi contrasena
          </Link>
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-3.5 text-lg font-semibold hover:bg-black/85 transition-colors disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Login'}
        </button>

        <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
          <p className="font-semibold text-black mb-1">Acceso seguro</p>
          <p>Tu sesión se valida de forma segura con la información registrada en Jardines del Renacer.</p>
        </div>

        <div className="text-center text-sm text-black/70 pt-1">
          <Link href="/" className="hover:text-[#2f5bd6] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}
