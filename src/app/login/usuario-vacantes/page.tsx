'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLoginLayout from '@/components/login/AuthLoginLayout';
import LoginTextField from '@/components/login/LoginTextField';
import {
  completeCandidatePasswordReset,
  createCandidatePasswordResetRequest,
  saveVacantesCandidateSession,
  validateCandidatePasswordResetToken,
  verifyVacantesCandidateCredentials,
} from '@/lib/candidateAuth';

type LoginStep = 'credentials' | 'otp';
type LoginView = 'login' | 'recover' | 'reset';

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function normalizeDocumentNumber(value: string) {
  return value.replace(/\D/g, '');
}

function resolveCredentialError(reason: string) {
  if (reason === 'profile_not_found') {
    return 'No encontramos tu perfil. Primero crea/actualiza tu perfil de postulante.';
  }
  if (reason === 'password_not_configured') {
    return 'Tu perfil aun no tiene contrasena. Ingresa a crear/editar perfil y configurala.';
  }
  return 'Documento o contrasena incorrectos.';
}

function VacantesUserLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialResetToken = searchParams.get('reset') ?? '';
  const initialResetDocument = searchParams.get('doc') ?? '';
  const initialView: LoginView = initialResetToken && initialResetDocument ? 'reset' : 'login';

  const [view, setView] = useState<LoginView>(initialView);
  const [step, setStep] = useState<LoginStep>('credentials');
  const [documentNumber, setDocumentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [pendingUser, setPendingUser] = useState<{
    documentNumber: string;
    email: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [recoverDocument, setRecoverDocument] = useState('');
  const [recoverEmail, setRecoverEmail] = useState('');
  const [recoverFeedback, setRecoverFeedback] = useState('');
  const [recoverResetPath, setRecoverResetPath] = useState('');
  const [recoverCodeDemo, setRecoverCodeDemo] = useState('');

  const [resetToken, setResetToken] = useState(initialResetToken);
  const [resetDocument, setResetDocument] = useState(initialResetDocument);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetFeedback, setResetFeedback] = useState('');

  useEffect(() => {
    const nextToken = searchParams.get('reset') ?? '';
    const nextDocument = searchParams.get('doc') ?? '';
    if (nextToken && nextDocument) {
      setView('reset');
      setResetToken(nextToken);
      setResetDocument(nextDocument);
    }
  }, [searchParams]);

  const resetTokenValidation = useMemo(() => {
    if (view !== 'reset' || !resetToken || !resetDocument) {
      return null;
    }
    return validateCandidatePasswordResetToken({
      token: resetToken,
      documentNumber: resetDocument,
    });
  }, [view, resetToken, resetDocument]);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const normalizedDocument = normalizeDocumentNumber(documentNumber);

    if (step === 'credentials') {
      if (normalizedDocument.length < 6 || normalizedDocument.length > 10) {
        setError('Ingresa una cedula valida (6 a 10 digitos).');
        setLoading(false);
        return;
      }

      if (password.trim().length < 8) {
        setError('Ingresa tu contrasena de acceso (minimo 8 caracteres).');
        setLoading(false);
        return;
      }

      const verification = await verifyVacantesCandidateCredentials({
        documentNumber: normalizedDocument,
        password,
      });

      if (!verification.ok) {
        setError(resolveCredentialError(verification.reason));
        setLoading(false);
        return;
      }

      const code = generateOtpCode();
      setPendingUser({
        documentNumber: verification.profile.documentNumber,
        email: verification.profile.email,
        name: verification.profile.fullName,
      });
      setOtpCode(code);
      setOtpInput('');
      setStep('otp');
      setLoading(false);
      return;
    }

    if (otpInput.trim() !== otpCode) {
      setError('Codigo de verificacion incorrecto.');
      setLoading(false);
      return;
    }

    if (!pendingUser) {
      setError('Tu sesion expiro. Vuelve a iniciar el proceso.');
      setStep('credentials');
      setLoading(false);
      return;
    }

    saveVacantesCandidateSession({
      documentNumber: pendingUser.documentNumber,
      email: pendingUser.email,
      name: pendingUser.name || 'Postulante',
      role: 'vacantes_usuario',
    });

    const params = new URLSearchParams({
      cedula: pendingUser.documentNumber,
      correo: pendingUser.email,
    });
    router.push(`/servicios/trabaja-con-nosotros/postulante?${params.toString()}#consulta-proceso`);
  };

  const handleRecoverSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setRecoverFeedback('');
    setRecoverResetPath('');
    setRecoverCodeDemo('');

    const normalizedDocument = normalizeDocumentNumber(recoverDocument);
    const normalizedEmail = recoverEmail.trim().toLowerCase();

    if (normalizedDocument.length < 6 || normalizedDocument.length > 10) {
      setRecoverFeedback('Ingresa una cedula valida para recuperar tu contraseña.');
      return;
    }

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setRecoverFeedback('Ingresa el correo que registraste en tu perfil.');
      return;
    }

    const recovery = createCandidatePasswordResetRequest({
      documentNumber: normalizedDocument,
      email: normalizedEmail,
    });

    if (!recovery.ok) {
      setRecoverFeedback(
        recovery.reason === 'profile_not_found'
          ? 'No encontramos ese perfil para recuperar contraseña.'
          : 'Documento y correo no coinciden con el perfil registrado.',
      );
      return;
    }

    const nextPath = `/login/usuario-vacantes?reset=${recovery.request.token}&doc=${recovery.request.documentNumber}`;
    setRecoverResetPath(nextPath);
    setRecoverCodeDemo(recovery.request.code);
    setRecoverFeedback(
      'Listo. Generamos el enlace seguro. En produccion este enlace y codigo llegan por correo.',
    );
  };

  const handleResetSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResetFeedback('');

    if (!resetTokenValidation?.ok) {
      if (resetTokenValidation?.reason === 'expired') {
        setResetFeedback('El enlace vencio. Solicita una nueva recuperacion.');
      } else {
        setResetFeedback('El enlace de recuperacion no es valido.');
      }
      return;
    }

    if (newPassword.trim().length < 8) {
      setResetFeedback('La nueva contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetFeedback('La confirmacion de contrasena no coincide.');
      return;
    }

    const result = await completeCandidatePasswordReset({
      token: resetToken,
      documentNumber: resetDocument,
      code: resetCode,
      newPassword,
    });

    if (!result.ok) {
      if (result.reason === 'invalid_code') {
        setResetFeedback('El codigo de verificacion es incorrecto.');
        return;
      }
      if (result.reason === 'expired') {
        setResetFeedback('El enlace de recuperacion ya vencio.');
        return;
      }
      if (result.reason === 'weak_password') {
        setResetFeedback('La nueva contraseña debe tener al menos 8 caracteres.');
        return;
      }
      setResetFeedback('No pudimos restablecer la contraseña. Intenta nuevamente.');
      return;
    }

    setResetFeedback('Contraseña actualizada correctamente. Ya puedes iniciar sesion.');
    setView('login');
    setStep('credentials');
    setDocumentNumber(result.profile.documentNumber);
    setPassword('');
    setOtpInput('');
    setOtpCode('');
    setPendingUser(null);
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    router.replace('/login/usuario-vacantes');
  };

  return (
    <AuthLoginLayout
      title="Login"
      subtitle="Ingreso de usuario para revisar tu perfil y estado de postulaciones con doble verificacion."
      sectionLabel="Ingreso Usuarios Vacantes"
    >
      {view === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          {step === 'credentials' ? (
            <>
              <LoginTextField
                label="Cedula"
                type="text"
                value={documentNumber}
                onChange={(event) => {
                  setDocumentNumber(event.target.value);
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
                placeholder="Tu contrasena de postulante"
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
                Segundo paso activo. Ingresa el codigo de verificacion para acceder a tu perfil.
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
            {loading ? 'Procesando...' : step === 'credentials' ? 'Continuar' : 'Validar e ingresar'}
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

          {step === 'credentials' ? (
            <button
              type="button"
              onClick={() => {
                setView('recover');
                setError('');
              }}
              className="w-full text-sm text-[#2f5bd6] hover:text-[#1f48ba] transition-colors"
            >
              Olvide mi contrasena
            </button>
          ) : (
            <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
              <p className="font-semibold text-black mb-1">Validacion temporal (demo)</p>
              <p>
                Codigo 2FA (demo): <span className="font-mono font-semibold text-blue-700">{otpCode}</span>
              </p>
            </div>
          )}

          <div className="text-center text-sm text-black/75">
            <Link href="/" className="block hover:text-[#2f5bd6] transition-colors">
              Volver al inicio
            </Link>
          </div>
        </form>
      )}

      {view === 'recover' && (
        <form onSubmit={handleRecoverSubmit} className="space-y-6">
          <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
            Ingresa cedula y correo del perfil para generar enlace seguro de recuperacion.
          </div>

          <LoginTextField
            label="Cedula"
            type="text"
            value={recoverDocument}
            onChange={(event) => {
              setRecoverDocument(event.target.value);
              setRecoverFeedback('');
            }}
            placeholder="Ingresa tu cedula"
            required
          />

          <LoginTextField
            label="Correo registrado"
            type="email"
            value={recoverEmail}
            onChange={(event) => {
              setRecoverEmail(event.target.value);
              setRecoverFeedback('');
            }}
            placeholder="correo@ejemplo.com"
            required
          />

          {recoverFeedback && (
            <p className="rounded-xl border border-blue-400/40 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {recoverFeedback}
            </p>
          )}

          {recoverResetPath && (
            <div className="rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black/75 space-y-2">
              <p>
                Enlace de recuperacion:
                <br />
                <span className="font-mono text-xs break-all">{recoverResetPath}</span>
              </p>
              <p>
                Codigo de verificacion (demo):{' '}
                <span className="font-mono font-semibold text-blue-700">{recoverCodeDemo}</span>
              </p>
              <Link
                href={recoverResetPath}
                className="inline-block text-[#2f5bd6] hover:text-[#1f48ba] transition-colors"
              >
                Ir a restablecer contrasena
              </Link>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-black text-white py-3.5 text-lg font-semibold hover:bg-black/85 transition-colors"
          >
            Generar enlace seguro
          </button>

          <button
            type="button"
            onClick={() => {
              setView('login');
              setRecoverFeedback('');
              setRecoverResetPath('');
              setRecoverCodeDemo('');
            }}
            className="w-full rounded-xl border border-black/15 bg-white/80 py-3 text-sm font-medium text-black/75 hover:bg-white"
          >
            Volver al login
          </button>
        </form>
      )}

      {view === 'reset' && (
        <form onSubmit={handleResetSubmit} className="space-y-6">
          <div className="rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black/75">
            Restablece tu contrasena validando codigo + enlace seguro.
          </div>

          {!resetTokenValidation?.ok && (
            <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">
              {resetTokenValidation?.reason === 'expired'
                ? 'El enlace de recuperacion vencio. Genera uno nuevo.'
                : 'El enlace no es valido o no existe una solicitud activa.'}
            </p>
          )}

          <LoginTextField
            label="Documento"
            type="text"
            value={resetDocument}
            onChange={(event) => setResetDocument(event.target.value)}
            placeholder="Documento del perfil"
            required
          />

          <LoginTextField
            label="Codigo de verificacion"
            type="text"
            value={resetCode}
            onChange={(event) => {
              setResetCode(event.target.value.replace(/\D/g, '').slice(0, 6));
              setResetFeedback('');
            }}
            placeholder="Codigo de 6 digitos"
            required
          />

          <LoginTextField
            label="Nueva contrasena"
            type="password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              setResetFeedback('');
            }}
            placeholder="Minimo 8 caracteres"
            required
          />

          <LoginTextField
            label="Confirmar nueva contrasena"
            type="password"
            value={confirmNewPassword}
            onChange={(event) => {
              setConfirmNewPassword(event.target.value);
              setResetFeedback('');
            }}
            placeholder="Repite tu nueva contrasena"
            required
          />

          {resetFeedback && (
            <p className="rounded-xl border border-blue-400/40 bg-blue-50 px-3 py-2 text-sm text-blue-800">
              {resetFeedback}
            </p>
          )}

          <button
            type="submit"
            disabled={!resetTokenValidation?.ok}
            className="w-full rounded-xl bg-black text-white py-3.5 text-lg font-semibold hover:bg-black/85 transition-colors disabled:opacity-60"
          >
            Actualizar contrasena
          </button>

          <button
            type="button"
            onClick={() => {
              setView('recover');
              setResetFeedback('');
            }}
            className="w-full rounded-xl border border-black/15 bg-white/80 py-3 text-sm font-medium text-black/75 hover:bg-white"
          >
            Solicitar nuevo enlace
          </button>
        </form>
      )}
    </AuthLoginLayout>
  );
}

export default function VacantesUserLoginPage() {
  return (
    <Suspense fallback={null}>
      <VacantesUserLoginContent />
    </Suspense>
  );
}
