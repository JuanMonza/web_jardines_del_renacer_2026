"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLoginLayout from "@/components/login/AuthLoginLayout";
import LoginTextField from "@/components/login/LoginTextField";

function resolveNextPath(value: string | null) {
  if (value && value.startsWith("/")) {
    return value;
  }
  return "/servicios/trabaja-con-nosotros/postulante/dashboard";
}

function VacantesUserLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = resolveNextPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [rememberUser, setRememberUser] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedAccess = window.localStorage.getItem(
      "jdr.remember.vacantes.user",
    );
    if (!savedAccess) return;
    try {
      const parsed = JSON.parse(savedAccess) as {
        email?: string;
      };
      if (parsed.email) {
        setEmail(parsed.email);
        setRememberUser(true);
      }
    } catch {
      window.localStorage.removeItem("jdr.remember.vacantes.user");
    }
  }, []);

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setError("Ingresa el correo de tu cuenta.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/postulantes/acceso-correo/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        setError(result.message || "No pudimos enviar el código.");
        return;
      }

      setEmail(normalizedEmail);
      setStep("code");
      setNotice(result.message || "Te enviamos un código temporal a tu correo.");
    } catch {
      setError("No pudimos enviar el código. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim().toLowerCase();
    if (code.replace(/\D/g, "").length !== 6) {
      setError("Ingresa el código de 6 dígitos que enviamos a tu correo.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/postulantes/acceso-correo/verificar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: normalizedEmail, code }) });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) { setError(result.message || "No pudimos validar el código."); return; }
      if (rememberUser) window.localStorage.setItem("jdr.remember.vacantes.user", JSON.stringify({ email: normalizedEmail }));
      else window.localStorage.removeItem("jdr.remember.vacantes.user");
      router.push(nextPath);
      router.refresh();
    } catch { setError("No pudimos validar el código. Intenta nuevamente."); }
    finally { setLoading(false); }
  };

  return (
    <AuthLoginLayout
      title="Portal de postulantes"
      subtitle="Recibe un código temporal en tu correo para ingresar de forma segura."
      sectionLabel="Ingreso Usuarios Vacantes"
    >
      {step === "email" ? <form onSubmit={handleRequestCode} className="space-y-6">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm leading-relaxed text-white/85">
          No necesitas recordar una contraseña. Te enviaremos una clave temporal de un solo uso.
        </div>
        <LoginTextField
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
          }}
          placeholder="tucorreo@ejemplo.com"
          required
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          }
        />

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={rememberUser}
            onChange={(event) => setRememberUser(event.target.checked)}
            className="h-4 w-4 accent-white"
          />
          Recordar mi correo en este dispositivo
        </label>

        {error && (
          <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {notice && <p className="rounded-xl border border-emerald-300/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

        <div className="text-center text-sm">
          <Link
            href={`/login/usuario-vacantes/registro?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-white underline decoration-white/50 underline-offset-4 transition hover:text-white/75"
          >
            Crear cuenta con correo
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black text-white py-3.5 text-lg font-semibold hover:bg-black/85 transition-colors disabled:opacity-60"
        >
          {loading ? "Enviando código..." : "Continuar con correo"}
        </button>

        <div className="text-center text-sm text-white/90 space-y-2">
          <Link
            href="/servicios/trabaja-con-nosotros"
            className="block hover:text-[#2f5bd6] transition-colors"
          >
            Ver vacantes disponibles
          </Link>
          <Link
            href="/"
            className="block hover:text-[#2f5bd6] transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </form> : <form onSubmit={handleVerifyCode} className="space-y-6">
        <div className="rounded-2xl border border-emerald-300/40 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900">
          <p className="font-bold">Código enviado</p><p className="mt-1">Revisa <strong>{email}</strong>. El código vence en 10 minutos.</p>
        </div>
        <LoginTextField label="Código temporal" type="text" value={code} onChange={(event) => { setCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setError(""); }} placeholder="000000" required />
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/80"><input type="checkbox" checked={rememberUser} onChange={(event) => setRememberUser(event.target.checked)} className="h-4 w-4 accent-white" />Recordar mi correo en este dispositivo</label>
        {error && <p className="rounded-xl border border-red-400/40 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-black py-3.5 text-lg font-semibold text-white transition hover:bg-black/85 disabled:opacity-60">{loading ? "Verificando..." : "Ingresar al portal"}</button>
        <div className="flex items-center justify-between gap-3 text-sm"><button type="button" onClick={() => { setStep("email"); setCode(""); setError(""); }} className="font-semibold text-white underline decoration-white/50 underline-offset-4">Cambiar correo</button><button type="button" onClick={() => void handleRequestCode({ preventDefault() {} } as React.FormEvent)} disabled={loading} className="font-semibold text-white underline decoration-white/50 underline-offset-4 disabled:opacity-60">Reenviar código</button></div>
      </form>}
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
