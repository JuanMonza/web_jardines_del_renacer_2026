'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';
import { findAdminUserByCredentials, type ManagedAdminUser } from '@/lib/adminUsersStorage';

type LoginStep = 'credentials' | 'otp';

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    cedula: '',
    password: '',
  });
  const [step, setStep] = useState<LoginStep>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [pendingUser, setPendingUser] = useState<ManagedAdminUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateCedula = (cedula: string): boolean => {
    const cleanCedula = cedula.replace(/[\s-]/g, '');
    return /^\d{6,10}$/.test(cleanCedula);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 'credentials') {
        if (!validateCedula(formData.cedula)) {
          setError('Por favor ingresa una cedula valida (6-10 digitos).');
          setLoading(false);
          return;
        }

        if (formData.password.length < 4) {
          setError('La contrasena debe tener al menos 4 caracteres.');
          setLoading(false);
          return;
        }

        const adminUser = findAdminUserByCredentials(formData.cedula, formData.password, ['admin']);

        if (adminUser) {
          const code = generateOtpCode();
          setPendingUser(adminUser);
          setOtpCode(code);
          setOtpInput('');
          setStep('otp');
          setLoading(false);
          return;
        }

        setError('Cedula o contrasena incorrectos.');
        setLoading(false);
        return;
      }

      if (otpInput.trim() !== otpCode) {
        setError('Codigo de verificacion incorrecto.');
        setLoading(false);
        return;
      }

      if (!pendingUser) {
        setError('Vuelve a ingresar tus credenciales.');
        setStep('credentials');
        setLoading(false);
        return;
      }

      localStorage.setItem(
        'adminUser',
        JSON.stringify({
          cedula: pendingUser.cedula,
          role: pendingUser.rol,
          name: pendingUser.nombre,
        }),
      );
      localStorage.removeItem('alliesAdminUser');
      localStorage.removeItem('vacanciesAdminUser');
      router.push('/dashboard');
    } catch {
      setError('Error al iniciar sesion. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <AuthLoginLayout
      title="Login"
      subtitle="Acceso administrativo para gestion de obituarios con doble verificacion."
      sectionLabel="Admin Obituarios"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'credentials' ? (
          <>
            <LoginTextField
              label="Cedula administrativa"
              name="cedula"
              type="text"
              value={formData.cedula}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, cedula: event.target.value }));
                setError('');
              }}
              placeholder="Ingresa tu cedula"
              required
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.42 0 4.696.607 6.688 1.68M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            <LoginTextField
              label="Contrasena"
              name="password"
              type="password"
              value={formData.password}
              onChange={(event) => {
                setFormData((prev) => ({ ...prev, password: event.target.value }));
                setError('');
              }}
              placeholder="••••••••••"
              required
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
                </svg>
              }
            />
          </>
        ) : (
          <>
            <div className="rounded-xl border border-blue-400/40 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              Segundo paso activo. Ingresa el codigo de verificacion para continuar.
            </div>

            <LoginTextField
              label="Codigo de verificacion"
              type="text"
              value={otpInput}
              onChange={(event) => {
                setOtpInput(event.target.value.replace(/\D/g, '').slice(0, 6));
                setError('');
              }}
              placeholder="Ingresa el codigo de 6 digitos"
              required
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
          </>
        )}

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
          {loading
            ? 'Procesando...'
            : step === 'credentials'
              ? 'Continuar'
              : 'Validar e ingresar'}
        </button>

        {step === 'otp' && (
          <button
            type="button"
            onClick={() => {
              setStep('credentials');
              setOtpInput('');
              setOtpCode('');
              setPendingUser(null);
              setError('');
            }}
            className="w-full rounded-xl border border-black/15 bg-white/80 py-3 text-sm font-medium text-black/75 hover:bg-white"
          >
            Volver al paso anterior
          </button>
        )}

        <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
          <p className="font-semibold text-black mb-1">Credenciales de prueba</p>
          <p>Usuario inicial del master:</p>
          <p>Cedula: <span className="font-mono">1234567890</span></p>
          <p>Contrasena: <span className="font-mono">admin123</span></p>
          {step === 'otp' && (
            <p className="mt-2 text-blue-700">
              Codigo 2FA (demo): <span className="font-mono font-semibold">{otpCode}</span>
            </p>
          )}
        </div>

        <div className="space-y-1 text-sm text-black/75 text-center">
          <Link href="/login/admin-aliados" className="block hover:text-[#2f5bd6] transition-colors">
            Ir al login de Aliados Comerciales
          </Link>
          <Link href="/login/admin-vacantes" className="block hover:text-[#2f5bd6] transition-colors">
            Ir al login de Vacantes
          </Link>
          <Link href="/" className="block pt-1 hover:text-[#2f5bd6] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}
