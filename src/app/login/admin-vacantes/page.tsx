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

export default function AdminVacantesLoginPage() {
  const router = useRouter();
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<LoginStep>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [pendingUser, setPendingUser] = useState<ManagedAdminUser | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const cleanCedula = cedula.replace(/\D/g, '');

    if (step === 'credentials') {
      const validCedula = cleanCedula.length >= 6 && cleanCedula.length <= 10;
      if (!validCedula) {
        setError('Ingresa una cedula valida.');
        setLoading(false);
        return;
      }

      const adminUser = findAdminUserByCredentials(cleanCedula, password, ['admin_vacantes']);

      if (adminUser) {
        const code = generateOtpCode();
        setPendingUser(adminUser);
        setOtpCode(code);
        setOtpInput('');
        setStep('otp');
        setLoading(false);
        return;
      }

      setError('Cedula o contrasena incorrectos para el panel de vacantes.');
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
      'vacanciesAdminUser',
      JSON.stringify({
        cedula: pendingUser.cedula,
        role: pendingUser.rol,
        name: pendingUser.nombre,
      }),
    );
    localStorage.removeItem('adminUser');
    localStorage.removeItem('alliesAdminUser');
    router.push('/dashboard-vacantes');
  };

  return (
    <AuthLoginLayout
      title="Login"
      subtitle="Acceso administrativo para gestion de vacantes laborales con doble verificacion."
      sectionLabel="Admin Vacantes"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 'credentials' ? (
          <>
            <LoginTextField
              label="Cedula administrativa"
              type="text"
              value={cedula}
              onChange={(event) => {
                setCedula(event.target.value);
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
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
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
              setLoading(false);
            }}
            className="w-full rounded-xl border border-black/15 bg-white/80 py-3 text-sm font-medium text-black/75 hover:bg-white"
          >
            Volver al paso anterior
          </button>
        )}

        <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
          <p className="font-semibold text-black mb-1">Credenciales de prueba</p>
          <p>Usuario inicial del master:</p>
          <p>Cedula: <span className="font-mono">3333333333</span></p>
          <p>Contrasena: <span className="font-mono">vacantes123</span></p>
          {step === 'otp' && (
            <p className="mt-2 text-blue-700">
              Codigo 2FA (demo): <span className="font-mono font-semibold">{otpCode}</span>
            </p>
          )}
        </div>

        <div className="text-center text-sm text-black/75">
          <Link href="/" className="hover:text-[#2f5bd6] transition-colors">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}
