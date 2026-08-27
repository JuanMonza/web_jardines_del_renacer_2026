"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLoginLayout from "@/components/login/AuthLoginLayout";
import LoginTextField from "@/components/login/LoginTextField";

export default function AliadoLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [email, setEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  useEffect(() => {
    const savedLoginId = window.localStorage.getItem(
      "jdr.remember.ally.login-id",
    );
    if (savedLoginId) {
      setLoginId(savedLoginId);
      setRememberUser(true);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/iam/ally/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ loginId, password }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message);
      if (rememberUser)
        window.localStorage.setItem("jdr.remember.ally.login-id", loginId);
      else window.localStorage.removeItem("jdr.remember.ally.login-id");
      router.replace("/dashboard-aliado");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  };
  const requestRecovery = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/iam/ally/password-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const payload = await response.json();
    setRecoveryMessage(payload.message);
    setLoading(false);
  };

  return (
    <AuthLoginLayout
      title="Login Aliado"
      subtitle="Acceso exclusivo para validar codigos de descuento y registrar consumos."
      sectionLabel="Aliado Comercial"
    >
      {recovering ? (
        <form onSubmit={requestRecovery} className="space-y-6">
          <LoginTextField
            label="Correo registrado"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3.5 text-lg font-semibold text-[#17355f]"
          >
            {loading ? "Enviando…" : "Enviar enlace de recuperación"}
          </button>
          {recoveryMessage && (
            <p className="text-sm text-white/80">{recoveryMessage}</p>
          )}
          <button
            type="button"
            onClick={() => setRecovering(false)}
            className="w-full text-sm text-white/70 hover:text-white"
          >
            Volver al login
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <LoginTextField
            label="ID del aliado"
            type="text"
            value={loginId}
            onChange={(event) => {
              setLoginId(event.target.value.toUpperCase());
              setError("");
            }}
            placeholder="Ej: AMM9198"
            required
          />

          <LoginTextField
            label="Contrasena"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError("");
            }}
            placeholder="Ingresa tu contrasena"
            required
          />

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={rememberUser}
              onChange={(event) => setRememberUser(event.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Recordar mi usuario en este dispositivo
          </label>

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
            {loading ? "Validando..." : "Ingresar al portal aliado"}
          </button>

          <div className="text-center text-sm text-white/75 space-y-3">
            <button
              type="button"
              onClick={() => setRecovering(true)}
              className="block w-full font-semibold text-white hover:text-[#c7ddf5] transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
            <Link href="/" className="block hover:text-white transition-colors">
              Volver al inicio
            </Link>
          </div>
        </form>
      )}
    </AuthLoginLayout>
  );
}
